import { describe, expect, it } from 'vitest';

import {
  CONSTRAINTS_TIMESTAMP_OFFSET,
  MIGRATION_TIMESTAMP_OFFSET,
  changelogChanges,
  changelogDateToTimestamp as toTimestamp,
  changelogMigrations,
  constraintsMigration,
  entityMigration,
  fieldColumns,
  joinTable,
  migrationOfFile,
  typeormCamelCase,
  updatedConstraintsMigration,
  updatedEntityMigration,
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
const region = entity({ name: 'Region', entityClass: 'Region', entityTableName: 'region', changelogDate: '20231215172515', primaryKey });
const gadget = entity({
  name: 'Gadget',
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
  it('should give a column of a TypeScript type without a migration type a String', () => {
    expect(fieldColumns(field({ fieldNameAsDatabaseColumn: 'data', nodejsFieldType: 'any', fieldType: 'AnyBlob' }))[0]).toMatchObject({
      type: 'String',
    });
  });

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
  it('should add a primary key of an entity with a UUID, generated', () => {
    expect(entityMigration(gadget).columns[0]).toEqual({ name: 'id', type: "'uuid'", primary: true, generated: 'uuid' });
  });

  it('should add the table, with the primary key, the fields and the join columns, named like TypeORM', () => {
    const country = entity({
      entityClass: 'Country',
      entityTableName: 'country',
      changelogDate: '20231215172615',
      primaryKey,
      fields: [{ id: true }, field({ fieldNameAsDatabaseColumn: 'name', nodejsFieldType: 'string', fieldType: 'String' })],
      relationships: [
        relationship({ relationshipType: 'many-to-one', relationshipFieldName: 'region', columnRequired: true, otherEntity: region }),
        relationship({ relationshipType: 'one-to-one', ownerSide: true, relationshipFieldName: 'gadget', otherEntity: gadget }),
        relationship({ relationshipType: 'one-to-many', relationshipFieldName: 'countries', otherEntity: region }),
      ],
    });
    const timestamp = Date.UTC(2023, 11, 15, 17, 26, 15);
    expect(entityMigration(country)).toEqual({
      timestamp,
      className: `AddedEntityCountry${timestamp}`,
      fileName: '20231215172615-AddedEntityCountry',
      formerFileName: `${timestamp}-AddedEntityCountry`,
      tableName: 'country',
      columns: [
        { name: 'id', type: 'Number', primary: true, generated: 'increment' },
        { name: 'name', type: 'String', nullable: true, unique: false },
        // Not null, the join column of a required relationship.
        { name: 'regionId', type: 'Number', nullable: false },
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
      fileName: '20231215172615-AddedEntityConstraintsCountry',
      formerFileName: `${timestamp}-AddedEntityConstraintsCountry`,
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
    expect(typeormCamelCase('Region_id')).toBe('regionId');
  });
});

describe('changelogDateToTimestamp', () => {
  it('gives the timestamp of a changelogDate, in UTC like JHipster', () => {
    expect(toTimestamp('20231215172515')).toBe(changelogDateToTimestamp('20231215172515'));
  });

  it('refuses a date of another format', () => {
    expect(() => toTimestamp('2023-12-15')).toThrow('The changelogDate 2023-12-15 is not a date of the yyyyMMddHHmmss format');
  });
});

describe('migrationOfFile', () => {
  it('gives the class of a migration by its file, named by the date of its changelog, its timestamp by its kind', () => {
    const timestamp = changelogDateToTimestamp('20231215172515');
    expect(migrationOfFile('20231215172515-AddedEntityCustomer')).toEqual({
      fileName: '20231215172515-AddedEntityCustomer',
      className: `AddedEntityCustomer${timestamp}`,
    });
    expect(migrationOfFile('20231215172515-AddedEntityConstraintsCustomer').className).toBe(
      `AddedEntityConstraintsCustomer${timestamp + CONSTRAINTS_TIMESTAMP_OFFSET}`,
    );
    expect(migrationOfFile('20231215172515-UpdatedEntityConstraintsCustomer').className).toBe(
      `UpdatedEntityConstraintsCustomer${timestamp + MIGRATION_TIMESTAMP_OFFSET + 1}`,
    );
  });

  it('gives the class of a migration by its file named up to 0.0.2 of the blueprint, the timestamp at the end of its name', () => {
    expect(migrationOfFile('7703274738000-UpdatedEntityCustomer')).toEqual({
      fileName: '7703274738000-UpdatedEntityCustomer',
      className: 'UpdatedEntityCustomer7703274738000',
    });
  });
});

describe('the migrations of an update changelog', () => {
  const status = field({ fieldName: 'status', fieldNameAsDatabaseColumn: 'status', fieldType: 'String', nodejsFieldType: 'string' });
  const country = relationship({
    relationshipType: 'many-to-one',
    relationshipName: 'country',
    relationshipFieldName: 'country',
    otherEntity: region,
  });
  const gadgets = relationship({
    relationshipType: 'many-to-many',
    ownerSide: true,
    relationshipName: 'gadgets',
    relationshipFieldName: 'gadgets',
    columnName: 'gadgets',
    joinTable: { name: 'rel_shop__gadgets' },
    otherEntity: gadget,
  });
  const shop = entity({ entityClass: 'Shop', entityTableName: 'shop', primaryKey, fields: [status], relationships: [country, gadgets] });
  // The entity before the changelog, as the changelog records it.
  const previousEntity = {
    fields: [
      { fieldName: 'legacy', columnName: 'legacy', fieldType: 'String' },
      { fieldName: 'photo', columnName: 'photo', fieldType: 'byte[]', fieldTypeBlobContent: 'image' },
      { fieldName: 'notes', columnName: 'notes', fieldType: 'byte[]', fieldTypeBlobContent: 'text' },
    ],
    relationships: [
      { relationshipName: 'owner', relationshipType: 'many-to-one', otherEntityName: 'region', ownerSide: true },
      {
        relationshipName: 'gifts',
        relationshipType: 'many-to-many',
        otherEntityName: 'gadget',
        ownerSide: true,
        joinTable: { name: 'rel_shop__gifts' },
      },
      { relationshipName: 'buyers', relationshipType: 'one-to-many', otherEntityName: 'region', ownerSide: false },
      { relationshipName: 'country', relationshipType: 'one-to-one', otherEntityName: 'region', ownerSide: true },
    ],
  };
  const changelog = {
    operation: 'update',
    previousEntity,
    addedFields: ['status'],
    removedFields: ['legacy', 'photo', 'notes'],
    addedRelationships: ['gadgets'],
    removedRelationships: ['owner', 'gifts', 'buyers'],
    recreatedRelationships: ['country'],
  };
  const changelogDate = '20231215172515';
  const timestamp = changelogDateToTimestamp(changelogDate) + MIGRATION_TIMESTAMP_OFFSET;
  const changes = { entity: shop, changelogDate, ...changelogChanges(changelog, shop, [region, gadget]) };

  it('adds the columns of the added fields, and drops the ones of the removed fields with the content type of a binary blob', () => {
    const migration = updatedEntityMigration(changes);
    expect(migration).toMatchObject({
      className: `UpdatedEntityShop${timestamp}`,
      fileName: '20231215172515-UpdatedEntityShop',
      tableName: 'shop',
      addedColumns: [{ name: 'status', type: 'String', nullable: true }],
      addedColumnNames: "['status']",
      removedColumnNames: "['legacy', 'photo', 'photo_content_type', 'notes']",
      schemaImports: 'addColumns, dropColumns',
    });
  });

  it('recreates a relationship changed in its type, and adds and drops the join columns and the join tables', () => {
    const migration = updatedConstraintsMigration(changes);
    expect(migration).toMatchObject({
      className: `UpdatedEntityConstraintsShop${timestamp + 1}`,
      fileName: '20231215172515-UpdatedEntityConstraintsShop',
      addedJoinColumnNames: "['countryId']",
      addedForeignKeys: [{ columnName: 'countryId', referencedTableName: 'region', referencedColumnName: 'id' }],
      addedJoinTables: [expect.objectContaining({ name: 'rel_shop__gadgets' })],
      // The join column of the one-to-one relationship before, named by the primary key of its other entity.
      removedJoinColumnNames: "['ownerId', 'countryId']",
      removedJoinTables: ['rel_shop__gifts'],
      schemaImports: 'addColumns, createForeignKeys, createJoinTable, dropColumns',
    });
  });

  it('names the join column of a relationship with an entity removed by the primary key id', () => {
    const { removedRelationships } = changelogChanges(
      {
        ...changelog,
        previousEntity: {
          fields: [],
          relationships: [{ relationshipName: 'Seller', relationshipType: 'many-to-one', otherEntityName: 'vendor', ownerSide: true }],
        },
        removedRelationships: ['Seller'],
        recreatedRelationships: [],
      },
      shop,
      [region, gadget],
    );
    expect(
      updatedConstraintsMigration({ entity: shop, changelogDate, addedRelationships: [], removedRelationships }).removedJoinColumnNames,
    ).toBe("['sellerId']");
  });

  it('gives the migrations of the update, after the constraints of every entity', () => {
    const migrations = changelogMigrations({ ...changelog, changelogDate }, shop, [region, gadget]);
    expect(migrations).toEqual({
      nodejsUpdatedMigration: expect.objectContaining({ className: `UpdatedEntityShop${timestamp}` }),
      nodejsUpdatedConstraintsMigration: expect.objectContaining({ className: `UpdatedEntityConstraintsShop${timestamp + 1}` }),
    });
  });

  it('drops the columns of the removed fields only, without adding one', () => {
    const migration = updatedEntityMigration({ ...changes, addedFields: [] });
    expect(migration).toMatchObject({
      addedColumnNames: undefined,
      removedColumnNames: "['legacy', 'photo', 'photo_content_type', 'notes']",
      schemaImports: 'dropColumns',
    });
  });

  it('gives no migration without a change of a column, a join column or a join table', () => {
    const none = { entity: shop, changelogDate, addedFields: [], removedFields: [], addedRelationships: [], removedRelationships: [] };
    expect(updatedEntityMigration(none)).toBeUndefined();
    expect(updatedConstraintsMigration(none)).toBeUndefined();
  });
});

describe('changelogMigrations', () => {
  it('gives the migrations of a creation at the date of its changelog: the table, then the constraints', () => {
    const timestamp = changelogDateToTimestamp('20240101000000');
    const shop = entity({
      entityClass: 'Shop',
      entityTableName: 'shop',
      primaryKey,
      relationships: [relationship({ relationshipType: 'many-to-one', relationshipFieldName: 'region', otherEntity: region })],
    });
    expect(changelogMigrations({ operation: 'create', changelogDate: '20240101000000' }, shop, [region])).toEqual({
      nodejsMigration: expect.objectContaining({ className: `AddedEntityShop${timestamp}` }),
      nodejsConstraintsMigration: expect.objectContaining({
        className: `AddedEntityConstraintsShop${timestamp + CONSTRAINTS_TIMESTAMP_OFFSET}`,
      }),
    });
  });

  it('gives the migration of a removal after the updates of its generation: its join tables, then its table', () => {
    const timestamp = changelogDateToTimestamp('20240101000000') + MIGRATION_TIMESTAMP_OFFSET;
    const previousEntity = {
      entityTableName: 'store',
      fields: [],
      relationships: [
        { relationshipName: 'owner', relationshipType: 'many-to-one', otherEntityName: 'region', ownerSide: true },
        { relationshipName: 'products', relationshipType: 'many-to-many', ownerSide: true, joinTable: { name: 'rel_store__products' } },
        { relationshipName: 'sellers', relationshipType: 'many-to-many', ownerSide: false },
      ],
    };
    expect(
      changelogMigrations({ operation: 'remove', entityName: 'store', changelogDate: '20240101000000', previousEntity }, undefined, [
        region,
      ]),
    ).toEqual({
      nodejsRemovedMigration: {
        timestamp,
        className: `RemovedEntityStore${timestamp}`,
        fileName: '20240101000000-RemovedEntityStore',
        formerFileName: `${timestamp}-RemovedEntityStore`,
        entityName: 'store',
        tableName: 'store',
        joinTables: ['rel_store__products'],
      },
    });
  });
});
