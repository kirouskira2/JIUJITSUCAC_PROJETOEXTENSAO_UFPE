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

  // Replace background colors with bg-surface-container
  newContent = newContent.replace(/bg-white dark:bg-\[\#111111\]/g, 'bg-surface-container');
  newContent = newContent.replace(/bg-neutral-50 dark:bg-\[\#1C1C1E\]/g, 'bg-surface-container');
  newContent = newContent.replace(/bg-white dark:bg-\[\#1C1C1E\]/g, 'bg-surface-container');
  newContent = newContent.replace(/bg-white dark:bg-\[\#0a0a0a\]/g, 'bg-surface-container');
  newContent = newContent.replace(/bg-card/g, 'bg-surface-container');

  // Replace borders with border-border
  newContent = newContent.replace(/border-neutral-200 dark:border-\[\#2C2C2E\]/g, 'border-border');
  newContent = newContent.replace(/border-neutral-300 dark:border-\[\#2C2C2E\]/g, 'border-border');
  
  // Upgrade border radius for cards
  // Only replace rounded-2xl if it's adjacent to card classes, or just replace all rounded-2xl to rounded-3xl?
  // Let's just do a blanket replacement of 'rounded-2xl border' -> 'rounded-3xl border'
  newContent = newContent.replace(/rounded-2xl border/g, 'rounded-3xl border');

  // Also replace cases where rounded-2xl is separated
  newContent = newContent.replace(/rounded-2xl([\s\S]{1,50}?)bg-surface-container/g, 'rounded-3xl$1bg-surface-container');
  newContent = newContent.replace(/bg-surface-container([\s\S]{1,50}?)rounded-2xl/g, 'bg-surface-container$1rounded-3xl');

  if (content !== newContent) {
    fs.writeFileSync(file, newContent, 'utf8');
    changedFiles++;
    console.log('Updated:', file);
  }
});

console.log('Total files updated:', changedFiles);
