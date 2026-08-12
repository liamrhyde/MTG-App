# Agent Guidelines for Frontend

## Architecture: View-Based

App uses **views** — bundles of components and logic in JSX files.

- **Simple view**: single `.jsx` file
- **Complex view**: folder with `index.jsx` + supporting files

Keep related logic and components together in the view.

## Component Storage

Custom components live in `src/components/` folder only. Build as needed — don't pre-create.
