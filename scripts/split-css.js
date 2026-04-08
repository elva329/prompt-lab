const fs = require('fs');
const path = require('path');

const cssFile = fs.readFileSync('src/styles.css', 'utf-8');
const lines = cssFile.split('\n');

// Define sections based on CSS selector patterns
const sections = {
  'landing': { pattern: /^\.landing-/, content: [] },
  'prompts': { pattern: /^\.prompts-|^\.prompt-|^\.page-/, content: [] },
  'dashboard': { pattern: /^\.dashboard-|^\.metric-|^\.analytics-/, content: [] },
  'components': { pattern: /^\.modal-|^\.badge-|^\.favorite-|^\.experiment-|^\.response-|^\.tooltip-|^\.login-/, content: [] },
  'loading': { pattern: /^\.loading-/, content: [] },
  'other': { pattern: /./, content: [] }
};

let currentSection = null;
let inMediaQuery = false;
let bracketCount = 0;
let sectionContent = [];

lines.forEach((line, i) => {
  // Determine section
  if (line.match(/^\.landing-/)) currentSection = 'landing';
  else if (line.match(/^\.prompts-|^\.prompt-|^\.page-|^\.favorites-|^\.experiments-/)) currentSection = 'prompts';
  else if (line.match(/^\.dashboard-|^\.metric-|^\.analytics-/)) currentSection = 'dashboard';
  else if (line.match(/^\.modal-|^\.badge-|^\.favorite-|^\.experiment-|^\.response-|^\.tooltip-|^\.login-/)) currentSection = 'components';
  else if (line.match(/^\.loading-|@keyframes loading/)) currentSection = 'loading';
  else if (line.match(/^@keyframes|^\/\*|^@media|^[^.]/) && !line.trim().startsWith('*')) currentSection = 'other';

  if (currentSection && sections[currentSection]) {
    sections[currentSection].content.push(line);
  }
});

console.log('CSS Split Analysis:');
Object.entries(sections).forEach(([name, data]) => {
  console.log(`${name}: ${data.content.length} lines`);
});
