import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, dirname, join } from 'path';
import { fileURLToPath } from 'url';

(() => {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  const svgDir = join(__dirname, '../', 'svgs');
  const outputDir = join(__dirname, '../../', 'dist/packages/types');
  const fontName = 'sao';
  const kindFolders = ['filtered', 'outlined'];
  const transformToCamelCase = (input) => {
    return input
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join('');
  }
  const kindEnums = {
    filtered: {},
    outlined: {}
  };
  kindFolders.forEach(kindFolder => {
    const kindFolderPath = join(svgDir, kindFolder);
    readdirSync(kindFolderPath).forEach(objectFolder => {
      const childFolderPath = join(kindFolderPath, objectFolder);
      const object = {};
      readdirSync(childFolderPath).forEach((file, index) => {
        const svgFilePath = join(childFolderPath, file);
        const name = basename(svgFilePath, '.svg');
        const key = transformToCamelCase(name.replace(/_/g, '-'));
        object[key] = `${fontName}_icon_${kindFolder}_${objectFolder}_${name}`.replace(/_/g, '-');
      });
      kindEnums[kindFolder][objectFolder] = object;
    });
  });

  let ts = ``;
  let objectNames = ``;
  let iconNames = ``;
  Object.keys(kindEnums).forEach(kindFolder => {
    const kindValue = kindEnums[kindFolder];
    Object.keys(kindValue).forEach(objectFolder => {
      const folderValue = kindValue[objectFolder];
      const name = `SAOIcon${transformToCamelCase(`${kindFolder}-${objectFolder}`)}`;
      objectNames += `\t| ${name}\n`;
      objectNames += `\t| \`\$\{${name}\}\`\n`;

      let enums = ``;
      Object.keys(folderValue).forEach((key, index) => {
        const value = folderValue[key];
        enums += `\t${name}${key} = '${value}'${index < Object.keys(folderValue).length - 1 ? ',\n' : ''}`;
        iconNames += `\t| '${value}'\n`;
      });
      ts += `export enum ${name} {\n${enums}\n}\n\n`;
    });
  });
  ts += `export type SaoIconType =\n${objectNames}${iconNames.replace(/\n$/, ';')}\n`;

  writeFileSync(join(outputDir, 'index.d.ts'), ts);
})();
