// This script runs on build, as a prebuild script, with node scripts/bartender.mjs.
// It generates ./sidebars.js, based on our ./docs directory.
// For every directory, **except modular-content**, it makes a separate sidebar object.
// That top-level directory is a category, and every directory under it is a category.
// The information for that category is pulled from the index.mdx file in that directory.
// For any other .mdx files in a directory, it makes a doc object.

import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

/**
 * Sanitize a file name for use as an ID
 * @param {string} name File name to sanitize
 * @returns {string} Sanitized file name
 */
function sanitizeFileName(name) {
  return name
    .replace(/[^a-zA-Z0-9-_./]/g, '') // Remove invalid characters
    .replace(/\/+/g, '/') // Ensure single slashes
    .replace(/^\//, ''); // Remove leading slash
}

/**
 * Generate an ID for a file path
 * @param {string} filePath File path
 * @param {string} docsDir Docs directory
 * @returns {string} Generated ID
 */
function generateId(filePath, docsDir) {
  return sanitizeFileName(
    filePath.replace(`${docsDir}/`, '').replace(/\.mdx$/, ''), // Generate sanitized ID
  );
}

/**
 * Process a directory to generate sidebar items
 * @param {string} dir Directory to process
 * @param {string} docsDir Docs directory
 * @returns {Object|null} Sidebar category or null
 */
function processDirectory(dir, docsDir) {
  try {
    const files = fs.readdirSync(dir, { withFileTypes: true });
    const itemsWithPosition = [];
    const itemsWithoutPosition = [];
    let category = null;
    let categoryLabel = path.basename(dir);

    files.forEach(file => {
      const filePath = path.join(dir, file.name);
      if (file.isDirectory()) {
        try {
          const subCategory = processDirectory(filePath, docsDir);
          if (subCategory) {
            itemsWithPosition.push(subCategory);
          }
        } catch (err) {
          console.warn(`Error processing subdirectory ${filePath}:`, err.message);
        }
      } else if (file.isFile() && file.name.endsWith('.mdx')) {
        const fileNameWithoutExt = path.parse(file.name).name;

        if (fileNameWithoutExt === 'index') {
          try {
            // Read frontmatter for index.mdx (description and title only)
            const frontmatter = matter(fs.readFileSync(filePath, 'utf-8')).data;
            const indexDocId = generateId(filePath, docsDir);
            categoryLabel = frontmatter.title || categoryLabel;
            category = {
              type: 'category',
              label: categoryLabel,
              link: { type: 'doc', id: indexDocId },
            };
            if (frontmatter.description) {
              category.description = frontmatter.description.trim();
            }
          } catch (err) {
            console.warn(`Error reading frontmatter for ${filePath}:`, err.message);
          }
        } else {
          try {
            const docId = generateId(filePath, docsDir);
            const frontmatter = matter(fs.readFileSync(filePath, 'utf-8')).data;

            // Use frontmatter for sorting but never modify it
            const sidebarItem = { type: 'doc', id: docId };

            if (frontmatter.sidebar_position !== undefined) {
              itemsWithPosition.push({
                ...sidebarItem,
                _sidebar_position: frontmatter.sidebar_position,
              });
            } else {
              itemsWithoutPosition.push(sidebarItem);
            }
          } catch (err) {
            console.warn(`Error processing file ${filePath}:`, err.message);
          }
        }
      }
    });

    itemsWithPosition.sort((a, b) => a._sidebar_position - b._sidebar_position);
    const combinedItems = [
      ...itemsWithPosition.map(({ _sidebar_position, ...rest }) => rest),
      ...itemsWithoutPosition,
    ];

    if (category) {
      category.items = combinedItems;
      return category;
    } else if (combinedItems.length > 0) {
      console.warn(`Missing index.mdx in ${dir}, creating loose items array.`);
      return { type: 'category', label: categoryLabel, items: combinedItems };
    }
    return null;
  } catch (err) {
    console.error(`Error in processDirectory for ${dir}:`, err.message);
    throw err;
  }
}

/**
 * Generate sidebars from configuration
 * @param {Object} config Configuration options
 * @param {string} config.docsDir Path to docs directory
 * @param {string[]} config.ignoreDirs Directories to ignore
 * @returns {Object} Generated sidebar object
 */
export function generateSidebarsFromConfig({ docsDir, ignoreDirs }) {
  try {
    const sidebar = {};
    const topLevelDirs = fs.readdirSync(docsDir, { withFileTypes: true });

    topLevelDirs.forEach(dir => {
      if (dir.isDirectory() && !ignoreDirs.includes(dir.name)) {
        try {
          const section = processDirectory(path.join(docsDir, dir.name), docsDir);
          if (section) {
            sidebar[dir.name] = [section];
          }
        } catch (err) {
          console.error(`Error processing directory ${dir.name}:`, err.message);
        }
      }
    });

    return sidebar;
  } catch (err) {
    console.error("Error generating sidebars:", err.message);
    throw err;
  }
}