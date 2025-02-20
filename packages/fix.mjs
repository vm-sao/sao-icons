import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'path';
import { glob } from 'glob';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const svgDir = join(__dirname, 'svgs');

glob(`${svgDir}/**/*.svg`).then(files => {
  files.forEach(file => {
    let data = readFileSync(file, 'utf8');

    data = data.replace(/<defs>[\s\S]*?<\/defs>/g, '')
      .replace(/<clipPath[^>]*>[\s\S]*?<\/clipPath>/g, '')
      .replace(/<g[^>]*clip-path="[^"]*"[^>]*>([\s\S]*?)<\/g>/g, '$1')
      .replace(/<rect[^>]*>/g, ''); // Remove any <rect> elements

    // Remove fill="currentColor" and other fills that could cause backgrounds
    data = data.replace(/<svg([^>]*)\sfill="currentColor"([^>]*)>/, '<svg$1$2>')
      .replace(/<path([^>]*)fill="[^"]*"([^>]*)>/g, '<path$1 fill="none"$2>');

    // Remove inline background styles
    data = data.replace(/<svg([^>]*)\sstyle="[^"]*background[^"]*"([^>]*)>/g, '<svg$1$2>');

    // Trim spaces and unnecessary newlines
    data = data.trim().replace(/\n\s*\n/g, '\n');

    writeFileSync(file, data, 'utf8');
  });
}).catch(error => {
  console.error('Error reading SVG files:', error);
});
