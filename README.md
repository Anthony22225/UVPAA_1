# UV/PAA and Dissolved Organic Matter

An interactive, browser-only teaching website about how dissolved organic matter (DOM) changes during UV/peracetic acid (PAA) wastewater treatment. The site uses plain HTML, CSS, JavaScript, and the supplied PNG teaching illustrations without modifying their image content; it has no backend or build dependencies.

## Run locally

Open `index.html` in a browser, or serve the repository root over HTTP:

```sh
python3 -m http.server 8000
```

Then visit <http://localhost:8000>. No install or build step is needed. For a production smoke check, verify that `index.html`, `styles.css`, `app.js`, and the `assets/` directory are present and load over HTTP.

## GitHub Pages

The `Deploy to GitHub Pages` workflow publishes the repository root whenever a change is pushed to `main` and can also be run manually. In the repository settings, set **Pages → Build and deployment → Source** to **GitHub Actions**. The site uses relative asset paths, so it works both at a project URL (`/<repository>/`) and at a custom domain.

## Site contents

Six chapters cover wastewater and DOM, PAA chemistry, UV activation, oxidant competition, DOM transformation, and an end-to-end recap. Each includes an interactive activity. The numbered PNGs in `assets/` are displayed unchanged alongside the lesson text. Click any teaching illustration to open its accessible full-screen view.
