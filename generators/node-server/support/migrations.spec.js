import { describe, expect, it } from 'vitest';

import {
  CONSTRAINTS_TIMESTAMP_OFFSET,
  changelogDateToTimestamp,
  constraintsMigration,
  entityMigration,
  fieldColumns,
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
      { name: 'area', type: "'decimal'", precision: 10, scale: 2, nullable: true, unique: false },
    ]);
  });

  it('should give an enum its values', () => {
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
    expect(column.enum).toBe("['BIG', 'it\\'s small']");
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
