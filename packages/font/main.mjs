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
      formats: ['woff', 'ttf', 'svg', 'eot'],
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
  font-family: "sao";
  font-weight: normal;
  font-style: normal;
  font-display: block;
  src: url("${fontPath}.eot?${timestamp}");
  src: url("${fontPath}.eot?#iefix") format("embedded-opentype"),
       url("${fontPath}.ttf?${timestamp}") format("truetype"),
       url("${fontPath}.woff?${timestamp}") format("woff"),
       url("${fontPath}.svg?${timestamp}#sao") format("svg");
}

.sao-icon {
  /* use !important to prevent issues with browser extensions that change fonts */
  font-family: 'sao' !important;
  speak: never;
  font-style: normal;
  font-weight: normal;
  font-variant: normal;
  text-transform: none;
  line-height: 1;

  /* Better Font Rendering =========== */
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

${result.glyphsData
  .map(
    glyph =>
      `.sao-icon-${glyph.metadata.name.split('_').join('-')}::before { content: "\\${glyph.metadata.unicode[0].codePointAt(0).toString(16)}"; }`
  )
  .join('\n')}
`;

    Object.entries(result).forEach(([ext, content]) => {
      if (['woff', 'ttf', 'svg', 'eot'].includes(ext)) {
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
