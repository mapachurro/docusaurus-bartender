# docusaurus-bartender

Automatically generate Docusaurus sidebars based on your directory structure and frontmatter.

## Installation

```bash
npm install docusaurus-bartender --save-dev
```
With options:

```bash
npx docusaurus-bartender --docs ./content --output ./myCustomSidebars.js --ignore temp,drafts
```

### In your package.json scripts

```json
{
  "scripts": {
    "prebuild": "docusaurus-bartender",
    "build": "docusaurus build"
  }
}
```
### Programmatic usage

```javascript
import { generateSidebars } from 'docusaurus-bartender';
const sidebar = generateSidebars({
  docsDir: './docs',
  outputFile: './sidebars.js',
  ignoreDirs: ['modular-content', 'drafts'],
  // Optional: aliasSidebar can be a string id to add when there's a single top-level sidebar,
  // or null to disable the alias.
  // aliasSidebar: 'tutorialSidebar'
});
```

### Alias behavior and CLI option

By default, Bartender generates sidebar IDs based on your top-level ./docs directory names (for example, tutorial-basics). To preserve a friendly developer experience, the package will also add a legacy alias when there is exactly one top-level sidebar:

**Default alias: tutorialSidebar** (added automatically if there is a single top-level sidebar).
Disable the alias via the CLI or programmatic API (see below).

#### CLI usage examples:

Default behavior (alias applied when appropriate):
`npx docusaurus-bartender --docs ./docs --output ./sidebars.js`

Disable the alias:
`npx docusaurus-bartender --docs ./docs --output ./sidebars.js --alias-sidebar none`

Provide a custom alias:
`npx docusaurus-bartender --docs ./docs --output ./sidebars.js --alias-sidebar mySidebarId`

Programmatic option:

`aliasSidebar` (string|null) — when omitted the default is '`tutorialSidebar`'. Set to `null` to disable adding an alias.

### Notes

Bartender does not modify your `docusaurus.config.js`. If you prefer, you can point your docs plugin to the generated sidebar id directly instead of using the alias.

## How It Works

Docusaurus Bartender scans your docs directory and:

1. Creates a category for each top-level directory
2. Uses index.mdx files to define category metadata (title, description)
3. Sorts documents based on `sidebar_position` frontmatter values
4. Generates a clean, structured `sidebars.js` file according to your configuration

## Configuration

| Option | Description | Default |
|--------|-------------|---------|
| `--docs` | Path to docs directory | `./docs` |
| `--output` | Output file path | `./sidebars.js` |
| `--ignore` | Directories to ignore (comma-separated) | `modular-content` |
| `--alias-sidebar` | Alias to add when a single top-level sidebar exists; use `none` to disable | tutorialSidebar |

## License

MIT