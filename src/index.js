import { generateSidebarsFromConfig } from './onTap.js';
import fs from 'fs';
import path from 'path';

/**
 * Generate Docusaurus sidebars based on directory structure
 * @param {Object} config Configuration options
 * @param {string} config.docsDir Path to docs directory
 * @param {string} config.outputFile Path to output file
 * @param {string[]} config.ignoreDirs Directories to ignore
 * @returns {Object} Generated sidebar object
 */
export function generateSidebars(config) {
  const sidebar = generateSidebarsFromConfig(config);
  
  // Generate the sidebar string without replacing quotes
  const jsonString = `export default ${JSON.stringify(sidebar, null, 2)};`;
  
  fs.writeFileSync(config.outputFile, jsonString, 'utf-8');
  
  return sidebar;
}

/**
 * Generate Docusaurus sidebars without writing to file
 * @param {Object} config Configuration options
 * @param {string} config.docsDir Path to docs directory
 * @param {string[]} config.ignoreDirs Directories to ignore
 * @returns {Object} Generated sidebar object
 */
export function generateSidebarsObject(config) {
  return generateSidebarsFromConfig(config);
}