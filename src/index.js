import { generateSidebarsFromConfig } from './onTap.js';
import fs from 'fs';
import path from 'path';

/**
 * Generate Docusaurus sidebars based on directory structure
 * @param {Object} config Configuration options
 * @param {string} config.docsDir Path to docs directory
 * @param {string} config.outputFile Path to output file
 * @param {string[]} config.ignoreDirs Directories to ignore
 * @param {string|null} [config.aliasSidebar] Alias id to add when a single top-level sidebar exists. Use `null` to disable.
 * @returns {Object} Generated sidebar object
 */
export function generateSidebars(config) {
  const sidebar = generateSidebarsFromConfig(config);
  
  // Add a legacy alias if exactly one top-level sidebar exists.
  // Defaults to 'tutorialSidebar' unless `aliasSidebar` is explicitly null/falsey.
  const alias = config.aliasSidebar === undefined ? 'tutorialSidebar' : config.aliasSidebar;
  if (alias) {
    const keys = Object.keys(sidebar);
    if (keys.length === 1) {
      const [onlyKey] = keys;
      if (!sidebar[alias]) {
        sidebar[alias] = sidebar[onlyKey];
      }
    }
  }

  const jsonString = `export default ${JSON.stringify(sidebar, null, 2)};`;
  
  fs.writeFileSync(config.outputFile, jsonString, 'utf-8');
  
  return sidebar;
}

/**
 * Generate Docusaurus sidebars without writing to file
 * @param {Object} config Configuration options
 * @param {string} config.docsDir Path to docs directory
 * @param {string[]} config.ignoreDirs Directories to ignore
 * @param {string|null} [config.aliasSidebar] Alias id to add when a single top-level sidebar exists. Use `null` to disable.
 * @returns {Object} Generated sidebar object
 */
export function generateSidebarsObject(config) {
  // Reuse generateSidebarsFromConfig directly (no file write) and apply alias logic
  const sidebar = generateSidebarsFromConfig(config);

  const alias = config.aliasSidebar === undefined ? 'tutorialSidebar' : config.aliasSidebar;
  if (alias) {
    const keys = Object.keys(sidebar);
    if (keys.length === 1) {
      const [onlyKey] = keys;
      if (!sidebar[alias]) {
        sidebar[alias] = sidebar[onlyKey];
      }
    }
  }

  return sidebar;
}