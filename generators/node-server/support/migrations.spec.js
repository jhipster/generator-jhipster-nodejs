import { describe, expect, it } from 'vitest';

import {
  CONSTRAINTS_TIMESTAMP_OFFSET,
  MIGRATION_TIMESTAMP_OFFSET,
  changelogChanges,
  changelogDateToTimestamp,
  changelogsSinceCreation,
  constraintsMigration,
  createdChangelogDate,
  entityMigration,
  fieldColumns,
  previousField,
  previousRelationship,
  typeormCamelCase,
  updatedConstraintsMigration,
  updatedEntityMigration,
  userAuthorityJoinTable,
} from './migrations.js';

const primaryKey = { name: 'id', typeUUID: false };
const region = {
  entityClass: 'Region',
  entityTableName: 'region',
  changelogDate: '20231215172515',
  primaryKey,
  fields: [],
  relationships: [],
};
const gadget = {
  entityClass: 'Gadget',
  entityTableName: 'gadget',
  changelogDate: '20231215172915',
  primaryKey: { name: 'id', typeUUID: true },
  fields: [],
  relationships: [],
};
const user = { entityClass: 'User', entityTableName: 'jhi_user', builtIn: true, primaryKey, fields: [], relationships: [] };

const field = properties => ({
  fieldValidate: false,
  fieldValidateRules: [],
  ...properties,
});

describe('changelogDateToTimestamp', () => {
  it('should give the JavaScript timestamp of a changelogDate, in UTC', () => {
    expect(changelogDateToTimestamp('20231215172615')).toBe(Date.UTC(2023, 11, 15, 17, 26, 15));
  });

  it('should refuse a changelogDate of another format', () => {
    expect(() => changelogDateToTimestamp('2023-12-15')).toThrow('yyyyMMddHHmmss');
  });
});

describe('fieldColumns', () => {
  it('should give the column of a field without column type the type of its TypeScript property', () => {
    expect(fieldColumns(field({ fieldNameAsDatabaseColumn: 'name', nodejsFieldType: 'string', fieldType: 'String' }))).toEqual([
      { name: 'name', type: 'String', nullable: true, unique: false },
    ]);
  });

  it('should give the column type, the length of maxlength, required and unique', () => {
    expect(
      fieldColumns(
        field({
          fieldNameAsDatabaseColumn: 'code',
          nodejsColumnType: 'varchar',
          fieldType: 'String',
          fieldValidate: true,
          fieldValidateRules: ['required', 'unique', 'maxlength'],
          fieldValidateRulesMaxlength: 3,
        }),
      ),
    ).toEqual([{ name: 'code', type: "'varchar'", length: 3, nullable: false, unique: true }]);
  });

  it('should give a BigDecimal the precision and the scale of its @Column', () => {
    expect(fieldColumns(field({ fieldNameAsDatabaseColumn: 'area', nodejsColumnType: 'decimal', fieldType: 'BigDecimal' }))).toEqual([
      { name: 'area', type: "'decimal'", precision: 21, scale: 2, nullable: true, unique: false },
    ]);
  });

  it('should give an enum the names of its values, like the column of a Java enum', () => {
    const [column] = fieldColumns(
      field({
        fieldName: 'kind',
        fieldNameAsDatabaseColumn: 'kind',
        nodejsColumnType: 'enum',
        fieldType: 'Kind',
        fieldIsEnum: true,
        fieldValues: "BIG,SMALL (it's small)",
      }),
    );
    expect(column.enum).toBe("['BIG', 'SMALL']");
  });

  it('should add the content type column of a binary blob', () => {
    expect(
      fieldColumns(
        field({ fieldNameAsDatabaseColumn: 'flag', nodejsColumnType: 'blob', fieldType: 'byte[]', fieldTypeBlobContent: 'image' }),
      ),
    ).toEqual([
      { name: 'flag', type: "'blob'", nullable: true, unique: false },
      { name: 'flag_content_type', type: 'String', nullable: true },
    ]);
  });
});

describe('entityMigration', () => {
  it('should add the table, with the primary key, the fields and the join columns, named like TypeORM', () => {
    const country = {
      entityClass: 'Country',
      entityTableName: 'country',
      changelogDate: '20231215172615',
      primaryKey,
      fields: [{ id: true }, field({ fieldNameAsDatabaseColumn: 'name', nodejsFieldType: 'string', fieldType: 'String' })],
      relationships: [
        { relationshipType: 'many-to-one', relationshipFieldName: 'region', otherEntity: region },
        { relationshipType: 'one-to-one', ownerSide: true, relationshipFieldName: 'gadget', otherEntity: gadget },
        { relationshipType: 'one-to-many', relationshipFieldName: 'countries', otherEntity: region },
      ],
    };
    const timestamp = Date.UTC(2023, 11, 15, 17, 26, 15);
    expect(entityMigration(country)).toEqual({
      timestamp,
      className: `AddedEntityCountry${timestamp}`,
      fileName: `${timestamp}-AddedEntityCountry`,
      tableName: 'country',
      columns: [
        { name: 'id', type: 'Number', primary: true, generated: 'increment' },
        { name: 'name', type: 'String', nullable: true, unique: false },
        { name: 'regionId', type: 'Number', nullable: true },
        { name: 'gadgetId', type: "'uuid'", nullable: true },
      ],
      relationUniques: ['gadgetId'],
    });
  });
});

describe('constraintsMigration', () => {
  it('should be none for an entity without join column nor join table', () => {
    expect(constraintsMigration(region)).toBeUndefined();
  });

  it('should suffix the columns of a join table named the same, like TypeORM', () => {
    const person = { ...region, entityClass: 'Person', entityTableName: 'person' };
    person.relationships = [
      {
        relationshipType: 'many-to-many',
        ownerSide: true,
        relationshipFieldName: 'person',
        columnName: 'person',
        joinTable: { name: 'rel_person__person' },
        otherEntity: person,
      },
    ];
    const [joinTable] = constraintsMigration(person).joinTables;
    expect([joinTable.joinColumn.name, joinTable.inverseJoinColumn.name]).toEqual(['person_id_1', 'person_id_2']);
  });

  it('should run after the migrations of the tables it references, the latest one', () => {
    const country = {
      entityClass: 'Country',
      entityTableName: 'country',
      changelogDate: '20231215172615',
      primaryKey,
      fields: [],
      relationships: [
        { relationshipType: 'many-to-one', relationshipFieldName: 'owner', otherEntity: user },
        { relationshipType: 'many-to-one', relationshipFieldName: 'region', otherEntity: region },
        {
          relationshipType: 'many-to-many',
          ownerSide: true,
          relationshipFieldName: 'gadgets',
          columnName: 'gadgets',
          joinTable: { name: 'rel_country__gadgets' },
          otherEntity: gadget,
        },
      ],
    };
    const timestamp = changelogDateToTimestamp(country.changelogDate) + CONSTRAINTS_TIMESTAMP_OFFSET;
    expect(constraintsMigration(country)).toEqual({
      timestamp,
      className: `AddedEntityConstraintsCountry${timestamp}`,
      fileName: `${timestamp}-AddedEntityConstraintsCountry`,
      tableName: 'country',
      foreignKeys: [
        { columnName: 'ownerId', referencedTableName: 'jhi_user', referencedColumnName: 'id' },
        { columnName: 'regionId', referencedTableName: 'region', referencedColumnName: 'id' },
      ],
      joinTables: [
        {
          name: 'rel_country__gadgets',
          joinColumn: { name: 'country_id', type: 'Number', referencedTableName: 'country', referencedColumnName: 'id' },
          inverseJoinColumn: { name: 'gadgets_id', type: "'uuid'", referencedTableName: 'gadget', referencedColumnName: 'id' },
        },
      ],
    });
  });

  it('should keep the timestamp of the entity, whatever the entities it references, after the tables of every entity', () => {
    const owner = { relationshipType: 'many-to-one', relationshipFieldName: 'owner', otherEntity: user };
    const later = { ...gadget, changelogDate: '21001231235959' };
    const country = { ...region, relationships: [owner] };
    const { timestamp } = constraintsMigration(country);
    expect(
      constraintsMigration({
        ...country,
        relationships: [owner, { relationshipType: 'many-to-one', relationshipFieldName: 'later', otherEntity: later }],
      }).timestamp,
    ).toBe(timestamp);
    expect(timestamp).toBeGreaterThan(changelogDateToTimestamp(later.changelogDate));
    // TypeORM reads the timestamp of the last 13 digits of the class name.
    expect(String(timestamp)).toHaveLength(13);
    // Before the migrations of the developers, created after the entity.
    expect(timestamp).toBeLessThan(changelogDateToTimestamp(region.changelogDate) + MIGRATION_TIMESTAMP_OFFSET);
  });
});

describe('changelogsSinceCreation', () => {
  const changelog = (changelogDate, entityName, operation) => ({ changelogDate, entityName, operation });

  it('should give the changelogs of the table of an entity: its last creation, then its updates', () => {
    const changelogs = [
      changelog('20200101000000', 'Region', 'create'),
      changelog('20200101000100', 'Country', 'create'),
      changelog('20200102000000', 'Region', 'remove'),
      changelog('20200103000000', 'Region', 'create'),
      changelog('20200104000000', 'Region', 'update'),
    ];
    expect(changelogsSinceCreation(changelogs, 'Region').map(({ changelogDate }) => changelogDate)).toEqual([
      '20200103000000',
      '20200104000000',
    ]);
  });

  it('should be none without changelogs, without incrementalChangelog', () => {
    expect(changelogsSinceCreation([], 'Region')).toEqual([]);
  });
});

describe('createdChangelogDate', () => {
  it('should give the changelogDate of the entity a creation creates, the one of its AddedEntity migration', () => {
    expect(
      createdChangelogDate({ changelogDate: '20200105000000', entity: { annotations: { incrementalChangelogDate: '20200103000000' } } }),
    ).toBe('20200103000000');
    expect(createdChangelogDate({ changelogDate: '20200105000000', entity: { annotations: { changelogDate: '20200101000000' } } })).toBe(
      '20200101000000',
    );
    expect(createdChangelogDate({ changelogDate: '20200105000000', entity: {} })).toBe('20200105000000');
  });
});

describe('changelogChanges', () => {
  const owner = { relationshipName: 'owner', otherEntityName: 'user', relationshipType: 'many-to-one', relationshipSide: 'left' };
  const previousEntity = {
    fields: [
      { fieldName: 'name', fieldType: 'String' },
      { fieldName: 'photo', fieldType: 'ImageBlob' },
    ],
    relationships: [
      owner,
      { relationshipName: 'tags', otherEntityName: 'tag', relationshipType: 'many-to-many', relationshipSide: 'left' },
    ],
  };

  it('should give the added fields and relationships by name, the removed ones as the entity before declares them', () => {
    const changelog = {
      entity: { relationships: [owner] },
      addedFields: ['code'],
      removedFields: ['photo'],
      addedRelationships: ['country'],
      removedRelationships: ['tags'],
      changedRelationships: [],
    };
    expect(changelogChanges(previousEntity, changelog)).toEqual({
      addedFields: ['code'],
      removedFields: [{ fieldName: 'photo', fieldType: 'ImageBlob' }],
      addedRelationships: ['country'],
      removedRelationships: [previousEntity.relationships[1]],
    });
  });

  it('should remove and add again a relationship changed in its type, not one changed in its options only', () => {
    const changed = { ...owner, relationshipType: 'one-to-one' };
    expect(changelogChanges(previousEntity, { entity: { relationships: [changed] }, changedRelationships: ['owner'] })).toMatchObject({
      addedRelationships: ['owner'],
      removedRelationships: [owner],
    });
    expect(
      changelogChanges(previousEntity, {
        entity: { relationships: [{ ...owner, options: { onDelete: 'CASCADE' } }] },
        changedRelationships: ['owner'],
      }),
    ).toMatchObject({ addedRelationships: [], removedRelationships: [] });
  });
});

describe('updatedEntityMigration', () => {
  const nextTimestamp = () => 7577923200000;

  it('should be none without an added or a removed field', () => {
    expect(updatedEntityMigration({ entity: region, addedFields: [], removedFields: [] }, nextTimestamp)).toBeUndefined();
  });

  it('should add the columns of the added fields and drop the ones of the removed fields', () => {
    expect(
      updatedEntityMigration(
        {
          entity: region,
          addedFields: [field({ fieldNameAsDatabaseColumn: 'status', nodejsFieldType: 'string', fieldType: 'String' })],
          removedFields: [{ fieldNameAsDatabaseColumn: 'photo', fieldType: 'byte[]', fieldTypeBlobContent: 'image' }],
        },
        nextTimestamp,
      ),
    ).toEqual({
      timestamp: 7577923200000,
      className: 'UpdatedEntityRegion7577923200000',
      fileName: '7577923200000-UpdatedEntityRegion',
      tableName: 'region',
      addedColumns: [{ name: 'status', type: 'String', nullable: true, unique: false }],
      addedColumnNames: "['status']",
      removedColumnNames: "['photo', 'photo_content_type']",
      schemaImports: 'addColumns, dropColumns',
    });
  });
});

describe('updatedConstraintsMigration', () => {
  const nextTimestamp = () => 7577923260000;
  const changes = properties => ({
    entity: region,
    addedRelationships: [],
    removedRelationships: [],
    ...properties,
  });

  it('should be none without a join column or a join table added or removed', () => {
    const countries = { relationshipName: 'countries', relationshipType: 'one-to-many', relationshipFieldName: 'countries' };
    expect(updatedConstraintsMigration(changes({ addedRelationships: [countries] }), nextTimestamp)).toBeUndefined();
  });

  it('should drop the join columns and the join tables of the removed relationships, then add the ones of the added relationships', () => {
    const migration = updatedConstraintsMigration(
      changes({
        addedRelationships: [
          { relationshipType: 'one-to-one', ownerSide: true, relationshipFieldName: 'gadget', otherEntity: gadget },
          {
            relationshipType: 'many-to-many',
            ownerSide: true,
            relationshipFieldName: 'gadgets',
            columnName: 'gadgets',
            joinTable: { name: 'rel_region__gadgets' },
            otherEntity: gadget,
          },
        ],
        removedRelationships: [
          previousRelationship(
            region,
            { relationshipName: 'owner', relationshipType: 'many-to-one', relationshipSide: 'left' },
            { otherEntity: user },
          ),
          previousRelationship(region, { relationshipName: 'tags', relationshipType: 'many-to-many', relationshipSide: 'left' }, {}),
        ],
      }),
      nextTimestamp,
    );
    expect(migration).toMatchObject({
      className: 'UpdatedEntityConstraintsRegion7577923260000',
      tableName: 'region',
      addedJoinColumns: [{ name: 'gadgetId', type: "'uuid'", nullable: true }],
      addedForeignKeys: [{ columnName: 'gadgetId', referencedTableName: 'gadget', referencedColumnName: 'id' }],
      addedJoinTables: [{ name: 'rel_region__gadgets', joinColumn: { name: 'region_id' }, inverseJoinColumn: { name: 'gadgets_id' } }],
      removedJoinColumnNames: "['ownerId']",
      removedJoinTables: ['rel_region__tags'],
      relationUniques: "['gadgetId']",
      schemaImports: 'addColumns, createForeignKeys, createJoinTable, dropColumns',
    });
  });
});

describe('previousField', () => {
  it('should give a blob type of an entity file the type byte[] of its blob content, like JHipster', () => {
    expect(previousField({ fieldName: 'photo', fieldType: 'ImageBlob' })).toEqual({
      fieldName: 'photo',
      fieldType: 'byte[]',
      fieldTypeBlobContent: 'image',
    });
    expect(previousField({ fieldName: 'notes', fieldType: 'TextBlob' })).toMatchObject({
      fieldType: 'byte[]',
      fieldTypeBlobContent: 'text',
    });
    expect(previousField({ fieldName: 'name', fieldType: 'String' })).toEqual({ fieldName: 'name', fieldType: 'String' });
  });
});

describe('previousRelationship', () => {
  it('should prepare a relationship of an entity file like JHipster, its join column named by the entity it references now', () => {
    const relationship = {
      relationshipName: 'Seller',
      otherEntityName: 'gadget',
      relationshipType: 'many-to-one',
      relationshipSide: 'left',
    };
    expect(previousRelationship(region, relationship, { otherEntity: gadget })).toMatchObject({
      relationshipFieldName: 'seller',
      ownerSide: true,
      otherEntity: gadget,
      joinTable: undefined,
    });
    expect(previousRelationship(region, relationship, {}).otherEntity).toEqual({ primaryKey: { name: 'id' } });
  });

  it('should give the join table of the owner side of a many-to-many relationship, like JHipster names it', () => {
    const tags = { relationshipName: 'tags', relationshipType: 'many-to-many' };
    expect(previousRelationship(region, { ...tags, relationshipSide: 'left' }, {}).joinTable).toEqual({ name: 'rel_region__tags' });
    // The other side JHipster adds to the entity a relationship references, without a side.
    expect(previousRelationship(region, tags, {})).toMatchObject({ ownerSide: false, joinTable: undefined });
    expect(previousRelationship(region, { ...tags, relationshipSide: 'right' }, {})).toMatchObject({
      ownerSide: false,
      joinTable: undefined,
    });
  });
});

describe('userAuthorityJoinTable', () => {
  it('should name the join table of the authorities like TypeORM names the one of @JoinTable()', () => {
    expect(userAuthorityJoinTable({ user, authority: { entityTableName: 'jhi_authority' } })).toEqual({
      name: 'jhi_user_authorities_jhi_authority',
      joinColumn: { name: 'jhiUserId', type: 'Number', referencedTableName: 'jhi_user', referencedColumnName: 'id' },
      inverseJoinColumn: { name: 'jhiAuthorityName', type: 'String', referencedTableName: 'jhi_authority', referencedColumnName: 'name' },
    });
  });
});

describe('typeormCamelCase', () => {
  it('should name like the default naming strategy of TypeORM, keeping the case of the letters it does not join', () => {
    expect(typeormCamelCase('mainURL_id')).toBe('mainURLId');
    expect(typeormCamelCase('x2y_id')).toBe('x2yId');
    expect(typeormCamelCase('region_id')).toBe('regionId');
    expect(typeormCamelCase('jhi_user_id')).toBe('jhiUserId');
  });
});
