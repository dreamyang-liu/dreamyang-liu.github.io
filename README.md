# Personal Blog & Website

A simple, elegant blog and personal website with Markdown and LaTeX support.

## Features

- Markdown support for blog posts
- LaTeX support for mathematical equations
- Responsive design for mobile and desktop
- Simple and clean interface
- Easy to customize and extend

## Getting Started

1. Clone this repository
2. Add your blog posts as Markdown files in the `posts` directory
3. Customize the site settings in `config.js`
4. Deploy to GitHub Pages or your preferred hosting service

## Directory Structure

```
personal-blog/
├── index.html          # Main entry point
├── css/                # Stylesheets
│   └── style.css       # Main stylesheet
├── js/                 # JavaScript files
│   ├── config.js       # Site configuration
│   ├── main.js         # Main application logic
│   └── markdown.js     # Markdown parser
├── posts/              # Blog posts (Markdown files)
│   └── example.md      # Example blog post
└── assets/             # Images and other assets
    └── img/            # Images
```

## Adding Blog Posts

Create a new Markdown file in the `posts` directory with the following format:

```markdown
---
title: Your Post Title
date: YYYY-MM-DD
tags: [tag1, tag2]
---

Your content here...

You can use **Markdown** formatting and $\LaTeX$ equations like:

$$E = mc^2$$
```

## Customization

Edit the `js/config.js` file to customize your site:

```javascript
const config = {
  siteName: "Your Name",
  siteDescription: "Personal Blog & Website",
  authorName: "Your Name",
  authorBio: "Short bio about yourself",
  socialLinks: {
    github: "https://github.com/yourusername",
    twitter: "https://twitter.com/yourusername",
    // Add more social links as needed
  }
};
```

## License

MIT
