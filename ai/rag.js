/* RAG retrieval math, shared by the browser widget and Node unit tests.
   UMD: sets module.exports in Node, window.RAG in the browser. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.RAG = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  function base64ToInt8(b64) {
    if (typeof Buffer !== 'undefined') {
      const buf = Buffer.from(b64, 'base64');
      return new Int8Array(buf.buffer, buf.byteOffset, buf.byteLength);
    }
    const bin = atob(b64);
    const out = new Int8Array(bin.length);
    for (let i = 0; i < bin.length; i++) out[i] = (bin.charCodeAt(i) << 24) >> 24;
    return out;
  }

  function dequantizeBase64(b64, scale) {
    const ints = base64ToInt8(b64);
    const out = new Float32Array(ints.length);
    for (let i = 0; i < ints.length; i++) out[i] = ints[i] * scale;
    return out;
  }

  function cosineSim(a, b) {
    if (a.length !== b.length) throw new RangeError(`cosineSim: length mismatch ${a.length} vs ${b.length}`);
    let dot = 0, na = 0, nb = 0;
    for (let i = 0; i < a.length; i++) { dot += a[i] * b[i]; na += a[i] * a[i]; nb += b[i] * b[i]; }
    const denom = Math.sqrt(na) * Math.sqrt(nb);
    return denom === 0 ? 0 : dot / denom;
  }

  // getVec(chunk) -> numeric array. Returns [{index, score, chunk}] sorted desc.
  function topK(queryVec, chunks, k, getVec) {
    const scored = chunks.map((chunk, index) => ({
      index, chunk, score: cosineSim(queryVec, getVec(chunk)),
    }));
    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, k);
  }

  function buildMessages(question, sources) {
    const system = [
      '你是这个技术博客的问答助手。',
      '只能依据下面提供的「参考资料」回答问题；不要编造资料中没有的内容。',
      '如果参考资料不足以回答，请直接说「本文未涉及」，并建议使用站内搜索。',
      '回答时请引用相关文章标题。',
      '请使用与用户提问相同的语言回答（中文问题用中文，English question in English）。',
    ].join('\n');
    const refs = sources
      .map((s, i) => `[${i + 1}] ${s.title}\n${s.text}`)
      .join('\n\n');
    const user = `参考资料：\n${refs}\n\n问题：${question}`;
    return [
      { role: 'system', content: system },
      { role: 'user', content: user },
    ];
  }

  return { base64ToInt8, dequantizeBase64, cosineSim, topK, buildMessages };
});
