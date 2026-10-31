import { describe, expect, it } from 'vitest';

import { compareModulePaths, insertSortedImport } from './imports.js';

describe('compareModulePaths', () => {
  it('compares segment by segment, like the alphabetize of import-x/order', () => {
    const paths = [
      './users/user.entity.ts',
      './entities/hospital-travel-time/hospital-travel-time.entity.ts',
      './migrations/20200101000200-AddedEntityOrder.ts',
      './entities/hospital/hospital.entity.ts',
      './config.ts',
      './migrations/1570200270081-CreateTables.ts',
    ];
    expect(paths.toSorted(compareModulePaths)).toEqual([
      './config.ts',
      './entities/hospital/hospital.entity.ts',
      './entities/hospital-travel-time/hospital-travel-time.entity.ts',
      './migrations/1570200270081-CreateTables.ts',
      './migrations/20200101000200-AddedEntityOrder.ts',
      './users/user.entity.ts',
    ]);
    expect(compareModulePaths('./a/b', './a')).toBeGreaterThan(0);
    expect(compareModulePaths('./a', './a')).toBe(0);
  });
});

describe('insertSortedImport', () => {
  const content = `import { config } from './config.ts';
import { Hospital } from './entities/hospital/hospital.entity.ts';
import { CreateTables1570200270081 } from './migrations/1570200270081-CreateTables.ts';
// needle
`;

  it('adds an import before the first relative import sorting after it', () => {
    expect(insertSortedImport(content, "import { Block } from './entities/block/block.entity.ts';"))
      .toBe(`import { config } from './config.ts';
import { Block } from './entities/block/block.entity.ts';
import { Hospital } from './entities/hospital/hospital.entity.ts';
import { CreateTables1570200270081 } from './migrations/1570200270081-CreateTables.ts';
// needle
`);
  });

  it('keeps an import the file has, formatted on several lines too', () => {
    expect(insertSortedImport(content, "import { Hospital } from './entities/hospital/hospital.entity.ts';")).toBe(content);
    const formatted = content.replace('import { Hospital }', 'import {\n  Hospital,\n}');
    expect(insertSortedImport(formatted, "import { Hospital } from './entities/hospital/hospital.entity.ts';")).toBe(formatted);
  });

  it('gives none without a relative import sorting after it, the import to add at the needle', () => {
    expect(insertSortedImport(content, "import { User } from './users/user.entity.ts';")).toBeUndefined();
  });
});
