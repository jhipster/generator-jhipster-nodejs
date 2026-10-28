import { describe, expect, it } from 'vitest';

import {
  CONSTRAINTS_TIMESTAMP_OFFSET,
  MIGRATION_TIMESTAMP_OFFSET,
  constraintsMigration,
  entityMigration,
  fieldColumns,
  joinTable,
  typeormCamelCase,
  userAuthorityJoinTable,
} from './migrations.js';

/** The timestamp of a changelogDate (yyyyMMddHHmmss), in UTC like the changelogDateForRecent of JHipster. */
const changelogDateToTimestamp = changelogDate =>
  Date.parse(changelogDate.replace(/^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})$/, '$1-$2-$3T$4:$5:$6Z'));

/** An entity with the properties JHipster prepares: the date of its changelogDate and its persistable relationships. */
const entity = ({ fields = [], relationships = [], ...properties }) => ({
  ...properties,
  fields,
  relationships,
  persistableRelationships: relationships.filter(relationship => relationship.persistableRelationship),
  changelogDateForRecent: properties.changelogDate ? new Date(changelogDateToTimestamp(properties.changelogDate)) : undefined,
});

/** A relationship with the properties JHipster prepares: its type flags, its owner side and whether it has a join table. */
const relationship = ({ relationshipType, ownerSide = relationshipType === 'many-to-one', ...properties }) => ({
  relationshipType,
  relationshipManyToOne: relationshipType === 'many-to-one',
  relationshipOneToOne: relationshipType === 'one-to-one',
  relationshipManyToMany: relationshipType === 'many-to-many',
  ownerSide,
  persistableRelationship: ownerSide,
  shouldWriteJoinTable: relationshipType === 'many-to-many' && ownerSide,
  ...properties,
});

const primaryKey = { name: 'id', typeUUID: false };
const region = entity({ entityClass: 'Region', entityTableName: 'region', changelogDate: '20231215172515', primaryKey });
const gadget = entity({
  entityClass: 'Gadget',
  entityTableName: 'gadget',
  changelogDate: '20231215172915',
  primaryKey: { name: 'id', typeUUID: true },
});
const user = entity({ entityClass: 'User', entityTableName: 'jhi_user', builtIn: true, primaryKey });

/** A field with the validation flags JHipster prepares from its rules. */
const field = ({ fieldValidateRules = [], ...properties }) => ({
  fieldValidate: fieldValidateRules.length > 0,
  fieldValidateRules,
  fieldValidationRequired: fieldValidateRules.includes('required'),
  fieldValidationUnique: fieldValidateRules.includes('unique'),
  fieldValidationMaxlength: fieldValidateRules.includes('maxlength'),
  ...properties,
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
    const country = entity({
      entityClass: 'Country',
      entityTableName: 'country',
      changelogDate: '20231215172615',
      primaryKey,
      fields: [{ id: true }, field({ fieldNameAsDatabaseColumn: 'name', nodejsFieldType: 'string', fieldType: 'String' })],
      relationships: [
        relationship({ relationshipType: 'many-to-one', relationshipFieldName: 'region', otherEntity: region }),
        relationship({ relationshipType: 'one-to-one', ownerSide: true, relationshipFieldName: 'gadget', otherEntity: gadget }),
        relationship({ relationshipType: 'one-to-many', relationshipFieldName: 'countries', otherEntity: region }),
      ],
    });
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
    const person = entity({ ...region, entityClass: 'Person', entityTableName: 'person' });
    const people = relationship({
      relationshipType: 'many-to-many',
      ownerSide: true,
      relationshipFieldName: 'person',
      columnName: 'person',
      joinTable: { name: 'rel_person__person' },
      otherEntity: person,
    });
    person.relationships = [people];
    person.persistableRelationships = [people];
    const [migrationJoinTable] = constraintsMigration(person).joinTables;
    expect([migrationJoinTable.joinColumn.name, migrationJoinTable.inverseJoinColumn.name]).toEqual(['person_id_1', 'person_id_2']);
    // The @JoinTable of the entity has the columns of its migration.
    expect(joinTable(person, people)).toEqual(migrationJoinTable);
  });

  it('should run after the migrations of the tables it references, the latest one', () => {
    const country = entity({
      entityClass: 'Country',
      entityTableName: 'country',
      changelogDate: '20231215172615',
      primaryKey,
      relationships: [
        relationship({ relationshipType: 'many-to-one', relationshipFieldName: 'owner', otherEntity: user }),
        relationship({ relationshipType: 'many-to-one', relationshipFieldName: 'region', otherEntity: region }),
        relationship({
          relationshipType: 'many-to-many',
          ownerSide: true,
          relationshipFieldName: 'gadgets',
          columnName: 'gadgets',
          joinTable: { name: 'rel_country__gadgets' },
          otherEntity: gadget,
        }),
      ],
    });
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
    const owner = relationship({ relationshipType: 'many-to-one', relationshipFieldName: 'owner', otherEntity: user });
    const later = entity({ ...gadget, changelogDate: '21001231235959' });
    const country = entity({ ...region, relationships: [owner] });
    const { timestamp } = constraintsMigration(country);
    expect(
      constraintsMigration(
        entity({
          ...region,
          relationships: [owner, relationship({ relationshipType: 'many-to-one', relationshipFieldName: 'later', otherEntity: later })],
        }),
      ).timestamp,
    ).toBe(timestamp);
    expect(timestamp).toBeGreaterThan(changelogDateToTimestamp(later.changelogDate));
    // TypeORM reads the timestamp of the last 13 digits of the class name.
    expect(String(timestamp)).toHaveLength(13);
    // Before the migrations of the developers, created after the entity.
    expect(timestamp).toBeLessThan(changelogDateToTimestamp(region.changelogDate) + MIGRATION_TIMESTAMP_OFFSET);
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
