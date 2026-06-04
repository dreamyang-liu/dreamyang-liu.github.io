(function () {
  var CFG = window.__AI_CHAT_CONFIG || {};
  var ROOT = (CFG.root || '/').replace(/\/$/, '');
  var MODEL = CFG.model || 'gpt-4o-mini';
  var EMBED_MODEL = CFG.embed_model || 'text-embedding-3-small';
  var TOP_K = CFG.top_k || 5;
  var KEY_STORE = 'ai_chat_openai_key';

  var kb = null;        // loaded embeddings.json
  var loadingKb = null; // promise guard
  var history = [];     // {role, content}

  function el(tag, props, html) {
    var e = document.createElement(tag);
    if (props) Object.keys(props).forEach(function (k) { e.setAttribute(k, props[k]); });
    if (html != null) e.innerHTML = html;
    return e;
  }
  function getKey() { try { return localStorage.getItem(KEY_STORE) || ''; } catch (e) { return ''; } }
  function setKey(v) { try { localStorage.setItem(KEY_STORE, v); } catch (e) { /* storage disabled */ } }

  function escapeHtml(s) {
    return s.replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  // Escape first, then apply a small safe subset of markdown.
  function renderMarkdown(text) {
    var h = escapeHtml(text);
    h = h.replace(/```([\s\S]*?)```/g, function (_, c) { return '<pre><code>' + c + '</code></pre>'; });
    h = h.replace(/`([^`]+)`/g, '<code>$1</code>');
    h = h.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    return h;
  }

  // --- DOM ---------------------------------------------------------------
  var fab = el('button', { id: 'ai-chat-fab', title: 'AI 问答', 'aria-label': 'AI 问答' }, '🤖');
  var panel = el('div', { id: 'ai-chat-panel' });
  panel.innerHTML =
    '<div id="ai-chat-header"><span class="title">博客 AI 问答</span>' +
    '<span><button id="ai-chat-gear" title="设置">⚙</button>' +
    '<button id="ai-chat-close" title="关闭">✕</button></span></div>' +
    '<div id="ai-chat-settings" style="display:none">' +
    '<div class="hint">输入你自己的 OpenAI API Key（仅保存在本地浏览器，只发送给 api.openai.com）：</div>' +
    '<input id="ai-chat-key" type="password" placeholder="sk-..." />' +
    '<button id="ai-chat-save-key">保存</button></div>' +
    '<div id="ai-chat-messages"></div>' +
    '<div id="ai-chat-input-row">' +
    '<textarea id="ai-chat-input" placeholder="问点关于这个博客的问题…"></textarea>' +
    '<button id="ai-chat-send">发送</button></div>';
  document.body.appendChild(fab);
  document.body.appendChild(panel);

  var messagesEl = panel.querySelector('#ai-chat-messages');
  var inputEl = panel.querySelector('#ai-chat-input');
  var sendBtn = panel.querySelector('#ai-chat-send');
  var settingsEl = panel.querySelector('#ai-chat-settings');
  var keyInput = panel.querySelector('#ai-chat-key');

  fab.addEventListener('click', function () {
    panel.classList.toggle('open');
    if (panel.classList.contains('open') && !getKey()) settingsEl.style.display = 'block';
  });
  panel.querySelector('#ai-chat-close').addEventListener('click', function () { panel.classList.remove('open'); });
  panel.querySelector('#ai-chat-gear').addEventListener('click', function () {
    settingsEl.style.display = settingsEl.style.display === 'none' ? 'block' : 'none';
    keyInput.value = getKey();
  });
  panel.querySelector('#ai-chat-save-key').addEventListener('click', function () {
    setKey(keyInput.value.trim()); settingsEl.style.display = 'none';
  });
  sendBtn.addEventListener('click', send);
  inputEl.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  });

  function addMsg(role, html) {
    var wrap = el('div', { class: 'ai-msg ' + role });
    wrap.appendChild(el('div', { class: 'role' }, role === 'user' ? '你' : '助手'));
    var bubble = el('div', { class: 'bubble' }, html);
    wrap.appendChild(bubble);
    messagesEl.appendChild(wrap);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    return bubble;
  }

  // Build a tagged error carrying an explicit numeric status, so the catch
  // handler can branch on fields instead of fragile substring matching.
  function httpError(tag, status) {
    var e = new Error(tag + ' ' + status);
    e.tag = tag; e.status = status;
    return e;
  }

  function loadKb() {
    if (kb) return Promise.resolve(kb);
    if (loadingKb) return loadingKb;
    loadingKb = fetch(ROOT + '/ai/embeddings.json')
      .then(function (r) { if (!r.ok) throw httpError('kb', r.status); return r.json(); })
      .then(function (j) {
        // The query is embedded with EMBED_MODEL; if the shipped KB was built
        // with a different model, the vectors aren't comparable — warn loudly.
        if (j && j.model && j.model !== EMBED_MODEL) {
          console.warn('[ai-chat] embeddings.json model "' + j.model + '" != query model "' + EMBED_MODEL + '"; retrieval may be inaccurate.');
        }
        kb = j; return kb;
      });
    return loadingKb;
  }

  function embedQuery(q, key) {
    return fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + key },
      body: JSON.stringify({ model: EMBED_MODEL, input: q }),
    }).then(function (r) {
      if (!r.ok) throw httpError('embed', r.status);
      return r.json();
    }).then(function (j) { return j.data[0].embedding; });
  }

  function retrieve(queryVec) {
    var getVec = function (c) { return RAG.dequantizeBase64(c.vec, c.scale); };
    return RAG.topK(queryVec, kb.chunks, TOP_K, getVec).map(function (t) { return t.chunk; });
  }

  function streamChat(messages, key, onDelta) {
    return fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + key },
      body: JSON.stringify({ model: MODEL, messages: messages, stream: true, temperature: 0.2 }),
    }).then(function (res) {
      if (!res.ok) throw httpError('chat', res.status);
      if (!res.body) throw new Error('chat no-stream-body');
      var reader = res.body.getReader();
      var decoder = new TextDecoder();
      var buf = '';
      function handleLine(line) {
        line = line.trim();
        if (!line.startsWith('data:')) return;
        var data = line.slice(5).trim();
        if (data === '[DONE]') return;
        try {
          var delta = JSON.parse(data).choices[0].delta.content;
          if (delta) onDelta(delta);
        } catch (e) { /* ignore keepalive/partial */ }
      }
      function pump() {
        return reader.read().then(function (r) {
          if (r.done) {
            buf += decoder.decode(); // flush any trailing multi-byte char
            if (buf.trim()) handleLine(buf);
            return;
          }
          buf += decoder.decode(r.value, { stream: true });
          var lines = buf.split('\n');
          buf = lines.pop();
          lines.forEach(handleLine);
          return pump();
        });
      }
      return pump();
    });
  }

  function send() {
    if (sendBtn.disabled) return; // a request is already in flight (also blocks Enter re-entrancy)
    var q = inputEl.value.trim();
    if (!q) return;
    var key = getKey();
    if (!key) { settingsEl.style.display = 'block'; return; }
    inputEl.value = '';
    addMsg('user', escapeHtml(q));
    sendBtn.disabled = true;
    var bubble = addMsg('assistant', '<span style="color:#888">思考中…</span>');
    var answer = '';
    var sources = [];

    loadKb()
      .then(function () { return embedQuery(q, key); })
      .then(function (qv) {
        sources = retrieve(qv);
        var messages = [].concat(history.slice(-4), RAG.buildMessages(q, sources));
        bubble.innerHTML = '';
        return streamChat(messages, key, function (delta) {
          answer += delta;
          bubble.innerHTML = renderMarkdown(answer);
          messagesEl.scrollTop = messagesEl.scrollHeight;
        });
      })
      .then(function () {
        if (sources.length) {
          var seen = {};
          var links = sources.filter(function (s) { if (seen[s.url]) return false; seen[s.url] = 1; return true; })
            .map(function (s) { return '<a href="' + escapeHtml(s.url) + '">' + escapeHtml(s.title) + '</a>'; }).join('');
          var sdiv = el('div', { class: 'ai-sources' }, '来源：' + links);
          bubble.parentNode.appendChild(sdiv);
        }
        history.push({ role: 'user', content: q });
        history.push({ role: 'assistant', content: answer });
        if (history.length > 20) history = history.slice(-20);
      })
      .catch(function (err) {
        var msg = String((err && err.message) || err);
        if (err && err.tag === 'kb') bubble.innerHTML = '<span class="ai-error">知识库尚未生成（请先运行 build:embeddings）。</span>';
        else if (err && err.status === 401) { bubble.innerHTML = '<span class="ai-error">API Key 无效，请在设置中重新输入。</span>'; settingsEl.style.display = 'block'; }
        else if (err && err.status === 429) bubble.innerHTML = '<span class="ai-error">请求过于频繁或额度不足，请稍后再试。</span>';
        else bubble.innerHTML = '<span class="ai-error">出错了：' + escapeHtml(msg) + '</span>';
      })
      .then(function () { sendBtn.disabled = false; });
  }
})();
