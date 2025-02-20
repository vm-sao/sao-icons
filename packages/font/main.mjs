import { glob } from 'glob';
import { writeFileSync } from 'node:fs';
import { dirname, join, sep } from 'path';
import { fileURLToPath } from 'url';
import { webfont } from 'webfont';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function getAllSvgFiles() {
  return glob(join(__dirname, '../', 'svgs/{outlined,filtered}/**/*.svg'));
}

(async () => {
  try {
    const files = await getAllSvgFiles();
    const dest = join(__dirname, '../../', 'dist/packages/font');

    const result = await webfont({
      files,
      fontName: 'sao-icon',
      formats: ['woff2', 'woff', 'ttf', 'svg', 'eot'],
      glyphTransformFn: obj => {
        // Extract folder structure: svgs/{outlined|filled}/(category)/icon.svg
        const parts = obj['path']
          .replace(join(__dirname, '../', 'svgs'), '')
          .split(sep);
        const type = parts[1]; // "outlined" or "filled"
        const category = parts[2]; // Category name
        obj.name = `${type}-${category}-${obj.name}`; // e.g., "outlined-user-home"

        return obj;
      },
    });

    const timestamp = Date.now(); // Add a timestamp to prevent caching
    const fontPath = './fonts/sao';

    const cssTemplate = `
@font-face {
  font-display: auto;
  font-family: "sao";
  font-style: normal;
  font-weight: 400;
  src: url("${fontPath}.eot?${timestamp}");
  src: url("${fontPath}.eot?#iefix") format("embedded-opentype"),
       url("${fontPath}.woff2?${timestamp}") format("woff2"),
       url("${fontPath}.woff?${timestamp}") format("woff"),
       url("${fontPath}.ttf?${timestamp}") format("truetype"),
       url("${fontPath}.svg?${timestamp}#sao") format("svg");
}

:root {
 ${result.glyphsData
        .map(
          glyph =>
            `\t--sao-icon-${glyph.metadata.name.split('_').join('-')}: "\\${glyph.metadata.unicode[0].codePointAt(0).toString(16)}";`
        )
        .join('\n')}
}

.sao-icon {
  display: inline-block;
  font-family: "sao";
  font-weight: 400;
  font-style: normal;
  font-variant: normal;
  text-rendering: auto;
  line-height: 1;
  font-size: var(--sao-icon-size, 24px);
  -moz-osx-font-smoothing: grayscale;
  -webkit-font-smoothing: antialiased;
}

${result.glyphsData
  .map(
    glyph =>
    {
      const name = `sao-icon-${glyph.metadata.name.split('_').join('-')}`;
      return `.${name}::before { content: var(--${name}); }`;
    }
  )
  .join('\n')}
`;

    Object.entries(result).forEach(([ext, content]) => {
      if (['woff', 'woff2', 'ttf', 'svg', 'eot'].includes(ext)) {
        const filePath = join(join(dest, 'fonts'), `sao.${ext}`);
        writeFileSync(filePath, content);
        console.log(`📄 Saved: ${filePath}`);
      }
    });

    // 🔽 Write CSS 🔽
    const cssPath = join(dest, 'index.css');
    writeFileSync(cssPath, cssTemplate.trim());
    console.log(`🎨 Saved CSS: ${cssPath}`);

    console.log('✅ Icon font generated successfully!');
  } catch (error) {
    console.error('❌ Error generating icon font:', error);
  }
})();
