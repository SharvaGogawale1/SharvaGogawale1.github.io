# Additional CSS Styles

This directory is for any additional custom CSS files you might need.

## Current Setup

The website currently uses:
- Tailwind CSS (loaded via CDN)
- Minimal custom styles (embedded in HTML `<style>` tag)

## When to Use This Directory

Add custom CSS files here if you need:
- Complex animations or transitions
- Custom component styles not covered by Tailwind
- Print stylesheets
- Theme variations

## Example Usage

If you create a `custom.css` file here, add it to your HTML:

```html
<link rel="stylesheet" href="./assets/css/custom.css">
```

## Best Practices

- Try to use Tailwind utility classes first
- Keep custom CSS minimal and well-commented
- Use meaningful file names
- Consider CSS organization and maintainability