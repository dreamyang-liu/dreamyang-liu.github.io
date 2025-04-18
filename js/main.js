/**
 * Main Application Logic
 * This file handles the core functionality of the blog
 */

// Store application state
const state = {
  posts: [],
  tags: {},
  currentSection: 'home-section',
  currentPost: null
};

// DOM Elements
const elements = {
  sections: document.querySelectorAll('.section'),
  navLinks: document.querySelectorAll('.nav-links a'),
  recentPostsList: document.getElementById('recent-posts-list'),
  postsList: document.getElementById('posts-list'),
  tagsList: document.getElementById('tags-list'),
  postTitle: document.getElementById('post-title'),
  postDate: document.getElementById('post-date'),
  postTags: document.getElementById('post-tags'),
  postContent: document.getElementById('post-content'),
  backToBlog: document.getElementById('back-to-blog'),
  authorBio: document.getElementById('author-bio'),
  socialLinksList: document.getElementById('social-links-list'),
  siteName: document.getElementById('site-name'),
  footerName: document.getElementById('footer-name'),
  currentYear: document.getElementById('current-year')
};

// Initialize the application
function init() {
  // Apply site configuration
  applySiteConfig();
  
  // Set up event listeners
  setupEventListeners();
  
  // Load posts
  loadPosts();
  
  // Set current year in footer
  elements.currentYear.textContent = new Date().getFullYear();
}

// Apply site configuration from config.js
function applySiteConfig() {
  // Set site name
  document.title = config.siteName;
  elements.siteName.textContent = config.siteName;
  elements.footerName.textContent = config.authorName;
  
  // Set author bio
  elements.authorBio.textContent = config.authorBio;
  
  // Set social links
  let socialLinksHTML = '';
  for (const [platform, url] of Object.entries(config.socialLinks)) {
    socialLinksHTML += `<li><a href="${url}" target="_blank" rel="noopener">${platform}</a></li>`;
  }
  elements.socialLinksList.innerHTML = socialLinksHTML;
}

// Set up event listeners
function setupEventListeners() {
  // Navigation links
  elements.navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = e.target.id;
      
      // Remove active class from all links
      elements.navLinks.forEach(link => link.classList.remove('active'));
      
      // Add active class to clicked link
      e.target.classList.add('active');
      
      // Show corresponding section
      const sectionId = targetId.replace('-link', '-section');
      showSection(sectionId);
    });
  });
  
  // Back to blog link
  elements.backToBlog.addEventListener('click', (e) => {
    e.preventDefault();
    showSection('blog-section');
    
    // Update active nav link
    elements.navLinks.forEach(link => link.classList.remove('active'));
    document.getElementById('blog-link').classList.add('active');
  });
}

// Show a specific section
function showSection(sectionId) {
  // Hide all sections
  elements.sections.forEach(section => section.classList.remove('active'));
  
  // Show the target section
  document.getElementById(sectionId).classList.add('active');
  
  // Update state
  state.currentSection = sectionId;
}

// Load posts from the posts directory
async function loadPosts() {
  try {
    // In a real application, this would fetch posts from a server
    // For this demo, we'll use a hardcoded post to avoid CORS issues when running locally
    
    // Simulate loading delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Create a sample post with pre-rendered HTML to avoid Markdown parsing issues
    const samplePost = {
      filename: 'example.md',
      frontmatter: {
        title: 'Getting Started with Markdown and LaTeX',
        date: '2025-04-17',
        tags: ['markdown', 'latex', 'tutorial']
      },
      content: `# Getting Started with Markdown and LaTeX

This is an example blog post that demonstrates the Markdown and LaTeX support in this blog.`,
      html: `<h1>Getting Started with Markdown and LaTeX</h1>
<p>This is an example blog post that demonstrates the Markdown and LaTeX support in this blog.</p>
<h2>Markdown Features</h2>
<p>You can use all standard Markdown features:</p>
<ul>
<li><strong>Bold text</strong> and <em>italic text</em></li>
<li><a href="https://example.com">Links</a></li>
<li>Lists (like this one)</li>
<li>Code blocks:</li>
</ul>
<pre><code class="language-javascript">function hello() {
  console.log("Hello, world!");
}
</code></pre>
<h2>LaTeX Support</h2>
<p>You can include mathematical equations using LaTeX syntax:</p>
<p>Inline equations like \\(E = mc^2\\) are supported.</p>
<p>You can also include display equations:</p>
<p>\\[\\frac{d}{dx}\\left( \\int_{a}^{x} f(u)\\,du\\right)=f(x)\\]</p>
<h2>Images</h2>
<p>You can include images in your posts:</p>
<div style="width: 100%; height: 400px; background-color: #f0f0f0; display: flex; align-items: center; justify-content: center; margin: 20px 0; border-radius: 8px;">
  <span style="color: #666; font-style: italic;">Example Image Placeholder</span>
</div>
<h2>Blockquotes</h2>
<blockquote>
<p>This is a blockquote.</p>
<p>It can span multiple lines.</p>
</blockquote>
<h2>Tables</h2>
<table>
<thead>
<tr>
<th>Header 1</th>
<th>Header 2</th>
<th>Header 3</th>
</tr>
</thead>
<tbody>
<tr>
<td>Cell 1</td>
<td>Cell 2</td>
<td>Cell 3</td>
</tr>
<tr>
<td>Cell 4</td>
<td>Cell 5</td>
<td>Cell 6</td>
</tr>
</tbody>
</table>
<h2>Conclusion</h2>
<p>This blog template makes it easy to write content with both Markdown and LaTeX support!</p>
<p>You can customize this template to fit your needs and add more features as required.</p>`,
      excerpt: 'This is an example blog post that demonstrates the Markdown and LaTeX support in this blog.'
    };
    
    // Add the sample post to the state
    state.posts.push(samplePost);
    
    // Process tags
    processTags();
    
    // Render posts
    renderPosts();
    renderRecentPosts();
    renderTags();
    
  } catch (error) {
    console.error('Error loading posts:', error);
  }
}

// Process tags from posts
function processTags() {
  state.tags = {};
  
  state.posts.forEach(post => {
    if (post.frontmatter.tags) {
      post.frontmatter.tags.forEach(tag => {
        if (!state.tags[tag]) {
          state.tags[tag] = 0;
        }
        state.tags[tag]++;
      });
    }
  });
}

// Render posts in the posts list
function renderPosts() {
  if (state.posts.length === 0) {
    elements.postsList.innerHTML = '<div class="no-posts">No posts found.</div>';
    return;
  }
  
  // Sort posts by date (newest first)
  const sortedPosts = [...state.posts].sort((a, b) => {
    return new Date(b.frontmatter.date) - new Date(a.frontmatter.date);
  });
  
  let postsHTML = '';
  
  sortedPosts.forEach(post => {
    const date = new Date(post.frontmatter.date);
    const formattedDate = date.toLocaleDateString(
      config.dateFormat.locale,
      config.dateFormat.options
    );
    
    let tagsHTML = '';
    if (post.frontmatter.tags) {
      post.frontmatter.tags.forEach(tag => {
        tagsHTML += `<span class="tag">${tag}</span>`;
      });
    }
    
    postsHTML += `
      <div class="post-card" data-filename="${post.filename}">
        <div class="post-card-image" style="background-color: #${Math.floor(Math.random()*16777215).toString(16)}"></div>
        <div class="post-card-content">
          <h3 class="post-card-title">${post.frontmatter.title}</h3>
          <div class="post-card-date">${formattedDate}</div>
          <div class="post-card-excerpt">${post.excerpt}</div>
          <div class="post-card-tags">${tagsHTML}</div>
        </div>
      </div>
    `;
  });
  
  elements.postsList.innerHTML = postsHTML;
  
  // Add event listeners to post cards
  document.querySelectorAll('.post-card').forEach(card => {
    card.addEventListener('click', () => {
      const filename = card.dataset.filename;
      const post = state.posts.find(p => p.filename === filename);
      if (post) {
        showPost(post);
      }
    });
  });
}

// Render recent posts in the home section
function renderRecentPosts() {
  if (state.posts.length === 0) {
    elements.recentPostsList.innerHTML = '<div class="no-posts">No posts found.</div>';
    return;
  }
  
  // Sort posts by date (newest first) and take only the recent ones
  const recentPosts = [...state.posts]
    .sort((a, b) => new Date(b.frontmatter.date) - new Date(a.frontmatter.date))
    .slice(0, config.recentPostsCount);
  
  let postsHTML = '';
  
  recentPosts.forEach(post => {
    const date = new Date(post.frontmatter.date);
    const formattedDate = date.toLocaleDateString(
      config.dateFormat.locale,
      config.dateFormat.options
    );
    
    let tagsHTML = '';
    if (post.frontmatter.tags) {
      post.frontmatter.tags.forEach(tag => {
        tagsHTML += `<span class="tag">${tag}</span>`;
      });
    }
    
    postsHTML += `
      <div class="post-card" data-filename="${post.filename}">
        <div class="post-card-image" style="background-color: #${Math.floor(Math.random()*16777215).toString(16)}"></div>
        <div class="post-card-content">
          <h3 class="post-card-title">${post.frontmatter.title}</h3>
          <div class="post-card-date">${formattedDate}</div>
          <div class="post-card-excerpt">${post.excerpt}</div>
          <div class="post-card-tags">${tagsHTML}</div>
        </div>
      </div>
    `;
  });
  
  elements.recentPostsList.innerHTML = postsHTML;
  
  // Add event listeners to post cards
  document.querySelectorAll('#recent-posts-list .post-card').forEach(card => {
    card.addEventListener('click', () => {
      const filename = card.dataset.filename;
      const post = state.posts.find(p => p.filename === filename);
      if (post) {
        // Show blog section first
        showSection('blog-section');
        
        // Update active nav link
        elements.navLinks.forEach(link => link.classList.remove('active'));
        document.getElementById('blog-link').classList.add('active');
        
        // Then show the post
        setTimeout(() => showPost(post), 100);
      }
    });
  });
}

// Render tags in the sidebar
function renderTags() {
  if (Object.keys(state.tags).length === 0) {
    elements.tagsList.innerHTML = '<div class="no-tags">No tags found.</div>';
    return;
  }
  
  // Sort tags by count (most used first)
  const sortedTags = Object.entries(state.tags)
    .sort((a, b) => b[1] - a[1]);
  
  let tagsHTML = '';
  
  sortedTags.forEach(([tag, count]) => {
    tagsHTML += `<span class="tag">${tag} (${count})</span>`;
  });
  
  elements.tagsList.innerHTML = tagsHTML;
}

// Show a specific post
function showPost(post) {
  // Update state
  state.currentPost = post;
  
  // Set post title
  elements.postTitle.textContent = post.frontmatter.title;
  
  // Set post date
  const date = new Date(post.frontmatter.date);
  const formattedDate = date.toLocaleDateString(
    config.dateFormat.locale,
    config.dateFormat.options
  );
  elements.postDate.textContent = formattedDate;
  
  // Set post tags
  let tagsHTML = '';
  if (post.frontmatter.tags) {
    post.frontmatter.tags.forEach(tag => {
      tagsHTML += `<span class="tag">${tag}</span>`;
    });
  }
  elements.postTags.innerHTML = tagsHTML;
  
  // Set post content
  elements.postContent.innerHTML = post.html;
  
  // Show post section
  showSection('post-section');
  
  // Trigger MathJax to process the new content
  if (window.MathJax) {
    MathJax.typesetPromise();
  }
  
  // Trigger highlight.js to highlight code blocks
  document.querySelectorAll('pre code').forEach(block => {
    hljs.highlightElement(block);
  });
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', init);
