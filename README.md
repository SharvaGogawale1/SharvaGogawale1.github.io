# SharvaGogawale1.github.io

Personal research website, built with React, Vite, and Tailwind CSS. Design adapted from [Nishant Balepur's site](https://nbalepur.github.io/).

## Editing content

- `src/config/site.js`: name, tagline, email, social links, CV path
- `src/components/About.jsx`: bio text
- `src/data/collaborations.js`: organizations shown with hover tooltips in the bio
- `src/data/news.json`: news items (`date` as `YYYY-MM-DD`; `paperLinks` maps a phrase in the text to a paper title)
- `src/data/papers.jsonl`: publications, separated by blank lines (`rqs` drives the filter tabs, `bibtex` adds a [BibTeX] toggle)
- `public/assets/`: photo, icons, CV

## Development

```bash
npm install
npm run dev      # local dev server
npm run build    # production build into dist/
```

## Deployment

Pushing to `master` runs `.github/workflows/deploy.yml`, which builds the site and publishes it to GitHub Pages.
In the repository settings, **Pages → Source** must be set to **GitHub Actions**.
