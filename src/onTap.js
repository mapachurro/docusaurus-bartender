// This script runs on build, as a prebuild script, with node scripts/bartender.mjs.
// It generates ./sidebars.js, based on our ./docs directory.
// For every directory, **except modular-content**, it makes a separate sidebar object.
// That top-level directory is a category, and every directory under it is a category.
// The information for that category is pulled from the index.mdx file in that directory.
// For any other .mdx files in a directory, it makes a doc object.

import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const docsDir = path.resolve('./docs') // Absolute path to the docs directory
const outputFile = path.resolve('./sidebars.js') // Absolute path for the output file
const ignoreDirs = ['modular-content'] // Directories to ignore

function sanitizeFileName(name) {
  return name
    .replace(/[^a-zA-Z0-9-_./]/g, '') // Remove invalid characters
    .replace(/\/+/g, '/') // Ensure single slashes
    .replace(/^\//, '') // Remove leading slash
}

function generateId(filePath) {
  return sanitizeFileName(
    filePath.replace(`${docsDir}/`, '').replace(/\.mdx$/, ''), // Generate sanitized ID
  )
}

function processDirectory(dir) {
  const files = fs.readdirSync(dir, { withFileTypes: true })
  const itemsWithPosition = []
  const itemsWithoutPosition = []
  let category = null
  let categoryLabel = path.basename(dir)

  files.forEach(file => {
    const filePath = path.join(dir, file.name)
    if (file.isDirectory()) {
      const subCategory = processDirectory(filePath)
      if (subCategory) {
        itemsWithPosition.push(subCategory)
      }
    } else if (file.isFile() && file.name.endsWith('.mdx')) {
      const fileNameWithoutExt = path.parse(file.name).name

      if (fileNameWithoutExt === 'index') {
        try {
          // Read frontmatter for index.mdx (description and title only)
          const frontmatter = matter(fs.readFileSync(filePath, 'utf-8')).data
          const indexDocId = generateId(filePath) // Generate sanitized ID
          categoryLabel = frontmatter.title || categoryLabel
          category = {
            type: 'category',
            label: categoryLabel,
            link: { type: 'doc', id: indexDocId },
          }
          if (frontmatter.description) {
            category.description = frontmatter.description.trim()
          }
        } catch (err) {
          console.warn(`Error reading frontmatter for ${filePath}:`, err.message)
        }
      } else {
        const docId = generateId(filePath) // Use the sanitized file name directly as ID
        const frontmatter = matter(fs.readFileSync(filePath, 'utf-8')).data // Read frontmatter

        // Use frontmatter for sorting but never modify it
        const sidebarItem = { type: 'doc', id: docId }

        if (frontmatter.sidebar_position !== undefined) {
          itemsWithPosition.push({
            ...sidebarItem,
            _sidebar_position: frontmatter.sidebar_position, // Temporary key for sorting
          })
        } else {
          itemsWithoutPosition.push(sidebarItem)
        }
      }
    }
  })

  itemsWithPosition.sort((a, b) => a._sidebar_position - b._sidebar_position)
  const combinedItems = [
    ...itemsWithPosition.map(({ _sidebar_position, ...rest }) => rest), // Remove temp key
    ...itemsWithoutPosition,
  ]

  if (category) {
    category.items = combinedItems
    return category
  } else if (combinedItems.length > 0) {
    console.warn(`Missing index.mdx in ${dir}, creating loose items array.`)
    return { type: 'category', label: categoryLabel, items: combinedItems }
  }
  return null
}

function generateSidebars() {
  const sidebar = {}
  const topLevelDirs = fs.readdirSync(docsDir, { withFileTypes: true })

  topLevelDirs.forEach(dir => {
    if (dir.isDirectory() && !ignoreDirs.includes(dir.name)) {
      const section = processDirectory(path.join(docsDir, dir.name))
      if (section) {
        sidebar[dir.name] = [section]
      }
    }
  })

  // Generate the sidebar string without replacing quotes
  const jsonString = `export default ${JSON.stringify(sidebar, null, 2)};`

  fs.writeFileSync(outputFile, jsonString, 'utf-8')
  console.log(`Sidebar generated successfully at ${outputFile}`)
}

generateSidebars()
