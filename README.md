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
ignoreDirs: ['modular-content', 'drafts']
});
```

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

## License

MIT