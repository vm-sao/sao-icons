import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, dirname, join } from 'path';
import { fileURLToPath } from 'url';

(() => {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  const svgDir = join(__dirname, '../', 'svgs');
  const outputDir = join(__dirname, '../../', 'dist/packages/styles');
  const fontName = 'sao';
  const kindFolders = ['filtered', 'outlined'];

  let css = `.sao-icon {
  display: inline-block;
  width: var(--sao-icon-size, 24px);
  height: var(--sao-icon-size, 24px);
  background-size: contain;
  background-repeat: no-repeat;
  -webkit-mask-image: var(--sao-icon-mask);
  mask-image: var(--sao-icon-mask);
  mask-size: contain;
  -webkit-mask-repeat: no-repeat;
  mask-repeat: no-repeat;
  -webkit-mask-position: center;
  mask-position: center;
  background-color: var(--sao-icon-color, black);
}
    `;

  kindFolders.forEach(kindFolder => {
    const kindFolderPath = join(svgDir, kindFolder);
    readdirSync(kindFolderPath).forEach(objectFolder => {
      const childFolderPath = join(kindFolderPath, objectFolder);
      readdirSync(childFolderPath).forEach((file, index) => {
        const svgFilePath = join(childFolderPath, file);
        const name = `${fontName}_${kindFolder}_${objectFolder}_${basename(
          svgFilePath,
          '.svg'
        )}`.replace(/_/g, '-');
        const content = readFileSync(svgFilePath, 'utf8');

        // Minify the SVG content by removing line breaks and extra spaces
        const minified = content
          .replace(/\r?\n|\r/g, '') // Remove newlines
          .replace(/\s+/g, ' ') // Remove extra spaces
          .replace(/>\s+</g, '><') // Remove spaces between tags
          .replace(/"/g, "'"); // Replace double quotes with single quotes for CSS compatibility
        css += `
.sao-icon.${name} {
  --sao-icon-mask: url("data:image/svg+xml,${encodeURIComponent(minified)}");
}
          `;
      });
    });
  });

  writeFileSync(join(outputDir, 'index.css'), css);
  writeFileSync(join(outputDir, 'index.scss'), css);
})();
