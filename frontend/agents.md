# Agent Guidelines for Frontend

## Architecture: View-Based

App uses **views** — bundles of components and logic in JSX files.

- **Simple view**: single `.jsx` file
- **Complex view**: folder with `index.jsx` + supporting files

Keep related logic and components together in the view.

## shadcn Components

shadcn provides pre-built, unstyled React components for UI patterns. Available components at [ui.shadcn.com](https://ui.shadcn.com/).

### Adding a Component

Install via npx command:

```bash
npx shadcn@latest add accordion
```

If component doesn't exist in codebase, must add it manually before use.

### Using Components

Component source installed to `src/components/ui/{component-name}`. Import using:

```tsx
import { Accordion, AccordionItem } from '@components/ui/accordion'
```

Component files can be customized directly if necessary - confirm with the user as this has wide impact on the component used.
