const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else { 
      if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk('./src/app').concat(walk('./src/components'));

let changedFiles = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let newContent = content;

  // Replace transparent red backgrounds
  newContent = newContent.replace(/bg-red-500\/5/g, 'bg-surface-container');
  // Replace transparent neutral backgrounds used in empty states
  newContent = newContent.replace(/bg-neutral-50\/50 dark:bg-black\/20/g, 'bg-surface-container');
  newContent = newContent.replace(/bg-white\/50 dark:bg-black\/20/g, 'bg-surface-container');
  newContent = newContent.replace(/bg-white\/50 dark:bg-\[\#111111\]\/50/g, 'bg-surface-container');

  // Ensure border dashed is border-border unless it's the red warning
  // Actually, keeping the red dashed border is fine since it's a warning, just no transparent bg!

  if (content !== newContent) {
    fs.writeFileSync(file, newContent, 'utf8');
    changedFiles++;
    console.log('Updated:', file);
  }
});

console.log('Total files updated:', changedFiles);
