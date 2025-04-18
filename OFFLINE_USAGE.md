# Offline Usage Guide

This blog template is designed to work both online and offline. However, when used offline or with limited network connectivity, you might encounter some issues with external resources. This guide explains how to handle these situations.

## Common Network-Related Issues

When running the blog locally without internet access, you might see errors or warnings like:

```
GET https://polyfill.io/v3/polyfill.min.js?features=es6 net::ERR_NAME_NOT_RESOLVED
Could not load polyfill from CDN. LaTeX rendering may be limited.
GET https://via.placeholder.com/800x400 net::ERR_NAME_NOT_RESOLVED
```

These messages occur because the blog is trying to load resources from external CDNs or websites. **These warnings are expected when running offline** and don't indicate a problem with the blog itself. The fallback mechanisms will ensure the blog still functions properly, though some features like LaTeX rendering might have limited functionality.

## Built-in Fallbacks

The blog includes fallback mechanisms for most external resources:

1. **JavaScript Libraries**: The blog will attempt to load libraries like MathJax, Marked.js, and Highlight.js from CDNs, but has basic fallbacks if they fail to load.

2. **Images**: External images in blog posts are replaced with placeholder divs when offline.

## Best Practices for Offline Usage

1. **Local Images**: Store images in the `assets/img/` directory and reference them with relative paths:
   ```markdown
   ![Image Description](../../assets/img/your-image.jpg)
   ```

2. **Self-hosted Libraries**: For completely offline usage, you can download and include local copies of the libraries:
   - Download MathJax, Marked.js, and Highlight.js
   - Place them in a `lib/` directory
   - Update the script references in `index.html`

3. **Testing**: Always test your blog both online and offline to ensure it works in all environments.

## Deploying to GitHub Pages

When deploying to GitHub Pages, all the network-related issues will be resolved as long as the external CDNs are accessible. GitHub Pages provides reliable hosting for your static blog.

To deploy to GitHub Pages:

1. Push your repository to GitHub
2. Go to repository Settings > Pages
3. Select the branch you want to deploy (usually `main` or `master`)
4. Your blog will be available at `https://yourusername.github.io/repository-name/`

## Additional Resources

- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [MathJax Documentation](https://docs.mathjax.org/)
- [Marked.js Documentation](https://marked.js.org/)
