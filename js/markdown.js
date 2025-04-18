/**
 * Markdown Parser with LaTeX Support
 * This file handles parsing Markdown content and extracting frontmatter
 */

class MarkdownParser {
  constructor() {
    // Configure marked options
    marked.setOptions({
      renderer: new marked.Renderer(),
      highlight: function(code, lang) {
        if (hljs.getLanguage(lang)) {
          return hljs.highlight(code, { language: lang }).value;
        } else {
          return hljs.highlightAuto(code).value;
        }
      },
      langPrefix: 'hljs language-',
      pedantic: false,
      gfm: true,
      breaks: false,
      sanitize: false,
      smartypants: true,
      xhtml: false
    });
    
    // Extend renderer to handle LaTeX
    const renderer = new marked.Renderer();
    const originalParagraph = renderer.paragraph.bind(renderer);
    
    // Process inline LaTeX: $...$ and display LaTeX: $$...$$
    renderer.paragraph = (text) => {
      // Process LaTeX before passing to the original renderer
      const processedText = this.processLaTeX(text);
      return originalParagraph(processedText);
    };
    
    marked.use({ renderer });
  }
  
  /**
   * Process LaTeX expressions in text
   * @param {string} text - Text that may contain LaTeX expressions
   * @returns {string} - Text with LaTeX expressions processed for MathJax
   */
  processLaTeX(text) {
    // Replace display LaTeX: $$...$$
    text = text.replace(/\$\$(.*?)\$\$/g, (match, latex) => {
      return `\\[${latex}\\]`;
    });
    
    // Replace inline LaTeX: $...$
    text = text.replace(/\$([^\$]+)\$/g, (match, latex) => {
      return `\\(${latex}\\)`;
    });
    
    return text;
  }
  
  /**
   * Parse Markdown content with frontmatter
   * @param {string} content - Raw Markdown content
   * @returns {Object} - Object with frontmatter and HTML content
   */
  parse(content) {
    const result = {
      frontmatter: {},
      content: ''
    };
    
    // Extract frontmatter
    const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---\n/);
    
    if (frontmatterMatch) {
      const frontmatterRaw = frontmatterMatch[1];
      result.content = content.slice(frontmatterMatch[0].length);
      
      // Parse frontmatter
      frontmatterRaw.split('\n').forEach(line => {
        const [key, ...valueParts] = line.split(':');
        if (key && valueParts.length) {
          let value = valueParts.join(':').trim();
          
          // Handle arrays in frontmatter (e.g., tags: [tag1, tag2])
          if (value.startsWith('[') && value.endsWith(']')) {
            value = value.slice(1, -1).split(',').map(item => item.trim());
          }
          
          result.frontmatter[key.trim()] = value;
        }
      });
    } else {
      result.content = content;
    }
    
    // Convert Markdown to HTML
    result.html = marked.parse(result.content);
    
    return result;
  }
  
  /**
   * Generate excerpt from HTML content
   * @param {string} html - HTML content
   * @param {number} length - Maximum length of excerpt
   * @returns {string} - Plain text excerpt
   */
  generateExcerpt(html, length = 150) {
    // Remove HTML tags
    const text = html.replace(/<[^>]*>/g, '');
    
    // Truncate to length
    if (text.length <= length) {
      return text;
    }
    
    return text.substring(0, length).trim() + '...';
  }
}

// Create global instance
const markdownParser = new MarkdownParser();
