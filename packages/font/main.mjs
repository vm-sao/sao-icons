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
    const fontName = 'sao-icon';

    const result = await webfont({
      files,
      fontName,
      formats: ['woff', 'ttf', 'svg', 'eot'],
      normalize: true, // Ensures correct scaling
      fontHeight: 1000, // Prevents distortion
      centerHorizontally: true,
      centerVertically: true,
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
    const fontPath = `./fonts/${fontName}`;

    const cssTemplate = `
@font-face {
  font-family: "${fontName}";
  font-weight: normal;
  font-style: normal;
  font-display: block;
  src: url("${fontPath}.eot?${timestamp}");
  src: url("${fontPath}.eot?#iefix") format("embedded-opentype"),
       url("${fontPath}.ttf?${timestamp}") format("truetype"),
       url("${fontPath}.woff?${timestamp}") format("woff"),
       url("${fontPath}.svg?${timestamp}#sao-icon") format("svg");
}

.${fontName} {
  /* use !important to prevent issues with browser extensions that change fonts */
  font-family: '${fontName}' !important;
  speak: never;
  font-style: normal;
  font-weight: normal;
  font-variant: normal;
  text-transform: none;
  line-height: 1;
  font-size: var(--sao-icon-size, 24px);

  /* Better Font Rendering =========== */
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

${result.glyphsData
  .map(
    glyph =>
      `.${fontName}-${glyph.metadata.name.split('_').join('-')}::before { content: "\\${glyph.metadata.unicode[0].codePointAt(0).toString(16)}"; }`
  )
  .join('\n')}
`;

    const mixinsTemplate = `
@mixin use-sao-icon-font() {
  @font-face {
    font-family: "${fontName}";
    font-weight: normal;
    font-style: normal;
    font-display: block;
    src: url("${fontPath}.eot?${timestamp}");
    src: url("${fontPath}.eot?#iefix") format("embedded-opentype"),
         url("${fontPath}.ttf?${timestamp}") format("truetype"),
         url("${fontPath}.woff?${timestamp}") format("woff"),
         url("${fontPath}.svg?${timestamp}#sao-icon") format("svg");
  }
}

@mixin use-sao-icon-font-target() {
  .${fontName} {
    /* use !important to prevent issues with browser extensions that change fonts */
    font-family: '${fontName}' !important;
    speak: never;
    font-style: normal;
    font-weight: normal;
    font-variant: normal;
    text-transform: none;
    line-height: 1;
    font-size: var(--sao-icon-size, 24px);

    /* Better Font Rendering =========== */
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
}

@mixin use-sao-icon-font-collection() {
${result.glyphsData
      .map(
        glyph =>
          `\t\t.${fontName}-${glyph.metadata.name.split('_').join('-')}::before { content: "\\${glyph.metadata.unicode[0].codePointAt(0).toString(16)}"; }`
      )
      .join('\n')}
}

@mixin use-sao-icon() {
  @include use-sao-icon-font();
  @include use-sao-icon-font-target();
  @include use-sao-icon-font-collection();
}
`;

    Object.entries(result).forEach(([ext, content]) => {
      if (['woff', 'ttf', 'svg', 'eot'].includes(ext)) {
        const filePath = join(join(dest, 'fonts'), `${fontName}.${ext}`);
        writeFileSync(filePath, content);
      }
    });

    // 🔽 Write CSS 🔽
    const cssPath = join(dest, 'index.css');
    const cssMixinsPath = join(dest, 'mixins.scss');

    writeFileSync(cssPath, cssTemplate.trim().replace(/\n\s*\n/g, '\n'));
    writeFileSync(cssMixinsPath, mixinsTemplate.trim().replace(/\n\s*\n/g, '\n'));
    console.log(`🎨 Saved CSS: ${cssPath}`);

    console.log('✅ Icon font generated successfully!');
  } catch (error) {
    console.error('❌ Error generating icon font:', error);
  }
})();
