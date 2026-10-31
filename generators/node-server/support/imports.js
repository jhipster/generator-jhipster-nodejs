/** A relative import of a single line, its module path captured. */
const relativeImport = /^import .+ from '(\.{1,2}\/[^']+)';$/;

/** Code without its whitespaces nor the trailing commas of its lists: an import the same once formatted on several lines. */
const unformatted = code => code.replaceAll(/\s+/g, '').replaceAll(',}', '}');

/**
 * Compares two module paths like the alphabetize of the import-x/order rule of the eslint transform of JHipster: segment by
 * segment, a path with fewer segments first when one is the start of the other.
 * @param {string} a a module path
 * @param {string} b a module path
 */
export const compareModulePaths = (a, b) => {
  const segmentsA = a.split('/');
  const segmentsB = b.split('/');
  for (let i = 0; i < Math.min(segmentsA.length, segmentsB.length); i++) {
    if (segmentsA[i] !== segmentsB[i]) return segmentsA[i] < segmentsB[i] ? -1 : 1;
  }
  return segmentsA.length - segmentsB.length;
};

/**
 * Adds a relative import to a file at its sorted place, before the first relative import whose path sorts after its own,
 * so the file is written with its imports in the order of the eslint transform of JHipster, whatever the order they are
 * added in: the transform moves few lines a pass, and gives up before sorting a long block of imports added unsorted.
 * @param {string} content the content of the file
 * @param {string} importLine the import, a single line
 * @returns {string | undefined} the content with the import, the same with it already; undefined without a relative import
 * sorting after it, to be added at the needle
 */
export const insertSortedImport = (content, importLine) => {
  if (unformatted(content).includes(unformatted(importLine))) return content;
  const lines = content.split('\n');
  const [, path] = relativeImport.exec(importLine);
  const index = lines.findIndex(line => {
    const [, linePath] = relativeImport.exec(line) ?? [];
    return linePath && compareModulePaths(linePath, path) > 0;
  });
  if (index === -1) return undefined;
  lines.splice(index, 0, importLine);
  return lines.join('\n');
};
