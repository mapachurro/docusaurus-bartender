#!/usr/bin/env node

import { program } from 'commander';
import { generateSidebars } from '../src/index.js';
import path from 'path';
import fs from 'fs';

// Get the current working directory
const cwd = process.cwd();

program
  .name('docusaurus-bartender')
  .description('Generate Docusaurus sidebars based on directory structure')
  .version('0.1.0')
  .option('-d, --docs <path>', 'path to docs directory', './docs')
  .option('-o, --output <path>', 'output file path', './sidebars.js')
  .option('-i, --ignore <dirs>', 'directories to ignore (comma-separated)', 'modular-content')
  .option('--alias-sidebar <id|none>', 'alias to add when a single top-level sidebar exists; use "none" to disable', 'tutorialSidebar')
  .action((options) => {
    try {
      console.log('🍸 Bartender is mixing your sidebar...');
      
      const docsDir = path.resolve(cwd, options.docs);
      const outputFile = path.resolve(cwd, options.output);
      const ignoreDirs = options.ignore.split(',').map(dir => dir.trim());
      const aliasSidebar = options.aliasSidebar === 'none' ? null : options.aliasSidebar;
      
      if (!fs.existsSync(docsDir)) {
        console.error(`Error: Docs directory not found at ${docsDir}`);
        process.exit(1);
      }
      
      const result = generateSidebars({
        docsDir,
        outputFile,
        ignoreDirs,
        aliasSidebar
      });
      
      console.log(`🍹 Sidebar successfully generated at ${outputFile}`);
    } catch (error) {
      console.error('Error generating sidebar:', error.message);
      process.exit(1);
    }
  });

program.parse();