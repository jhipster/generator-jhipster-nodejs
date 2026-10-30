import { bigDecimalPrecision } from './columns.js';
import { serverEnumInfo } from './enums.js';

/**
 * The migrations of the SQL databases, like the Liquibase changelogs of JHipster Spring Boot: the tables of the built-in
 * users (CreateTables), then for each entity the migration adding its table and the one adding its constraints (its
 * foreign keys and its join tables). The tables and the columns are the ones TypeORM maps the entities to, with their
 * names, so a database created by a former version of the application (its schema synchronized from the entities) keeps
 * its schema.
 *
 * TypeORM runs the migrations in the order of the timestamp of the last 13 digits of their class name: the sections of
 * the master.xml of Liquibase are ranges of timestamps. The changelogs of the tables are the migrations of the tables at
 * the timestamp of the changelogDate of their entity, the changelogs of the constraints the ones of the constraints at
 * that timestamp plus CONSTRAINTS_TIMESTAMP_OFFSET, and the changelogs of the developers, at the end of master.xml, the
 * migrations the typeorm:migration scripts create at their time plus MIGRATION_TIMESTAMP_OFFSET.
 *
 * Like the incremental changelogs of Liquibase, the migrations of an entity are the ones of its changelogs JHipster records
 * (jhipster:base-application:database-changelogs, the changelog objects of the .yo-rc.json): its creation, AddedEntity
 * and AddedEntityConstraints, then each update at the date of its changelog plus MIGRATION_TIMESTAMP_OFFSET (after the
 * constraints, like the incremental changelogs at the end of master.xml): UpdatedEntity adds the columns of the added
 * fields and drops the ones of the removed fields, then UpdatedEntityConstraints, 1 ms after, adds and drops the join
 * columns, their foreign keys and the join tables of the relationships. A migration is written once, by the generation
 * recording its changelog.
 */

/**
 * The offset of the timestamps of the constraints migrations, after the ones of every table: the timestamp of the
 * constraints of an entity is the one of its table plus 3000000000000 (4702121677000 for 1702121677000), so its name, like
 * the constraints changelog of Liquibase named by the changelogDate of the entity, never changes, whatever the entities it
 * references. The tables of the entities created up to 95 years after the first one stay before every constraints migration.
 */
export const CONSTRAINTS_TIMESTAMP_OFFSET = 3 * 10 ** 12;

/**
 * The offset of the timestamps of the migrations of the developers, created by the typeorm:migration scripts: their time
 * plus 6000000000000, after the constraints migrations of every entity created before, like the changelogs added at the
 * end of the master.xml of Liquibase; within 13 digits until 2096.
 */
export const MIGRATION_TIMESTAMP_OFFSET = 6 * 10 ** 12;

/** The JavaScript timestamp (milliseconds, UTC) of the changelogDate of an entity, the date JHipster parses it to. */
const entityTimestamp = entity => entity.changelogDateForRecent.getTime();

/** The JavaScript timestamp (milliseconds, UTC) of a changelogDate of JHipster (yyyyMMddHHmmss). */
export const changelogDateToTimestamp = changelogDate => {
  const [, year, month, day, hours, minutes, seconds] = /^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})$/.exec(changelogDate) ?? [];
  if (!year) {
    throw new Error(`The changelogDate ${changelogDate} is not a date of the yyyyMMddHHmmss format`);
  }
  return Date.UTC(Number(year), Number(month) - 1, Number(day), Number(hours), Number(minutes), Number(seconds));
};

/** The class and the file of a migration of an entity, by the kind of the migration and its timestamp. */
const migrationName = (kind, entityClass, timestamp) => ({
  timestamp,
  className: `${kind}${entityClass}${timestamp}`,
  fileName: `${timestamp}-${kind}${entityClass}`,
});

/** The TypeScript of the type of a column whose @Column decorator has none: the TypeScript type of its property. */
const typeOfFieldType = {
  string: 'String',
  number: 'Number',
  boolean: 'Boolean',
  Date: 'Date',
};

/** A string literal of TypeScript. */
const literal = value => `'${String(value).replaceAll('\\', '\\\\').replaceAll("'", "\\'")}'`;

/** The migration column of the primary key of an entity, like its @PrimaryGeneratedColumn. */
export const primaryKeyColumn = entity => ({
  name: entity.primaryKey.name,
  type: entity.primaryKey.typeUUID ? literal('uuid') : 'Number',
  primary: true,
  generated: entity.primaryKey.typeUUID ? 'uuid' : 'increment',
});

/** The migration column referencing the primary key of an entity: a join column, or a column of a join table. */
const referenceColumn = (name, entity) => ({
  name,
  type: entity.primaryKey.typeUUID ? literal('uuid') : 'Number',
});

/** The migration columns of a field, like the @Column decorators of the entity: its column, and the content type of a blob. */
export const fieldColumns = field => {
  const { fieldValidationRequired: required, fieldValidationUnique: unique, fieldValidationMaxlength: maxlength } = field;
  const nullable = !required;
  const type = field.nodejsColumnType ? literal(field.nodejsColumnType) : (typeOfFieldType[field.nodejsFieldType] ?? 'String');
  const column = { name: field.fieldNameAsDatabaseColumn, type, nullable, unique };
  if (field.fieldIsEnum) {
    // The values of the TypeScript enum of the field, the ones of the enum column of the databases having one (MySQL).
    column.enum = `[${serverEnumInfo(field)
      .enumValues.map(({ value }) => literal(value))
      .join(', ')}]`;
  } else if (field.fieldType === 'BigDecimal') {
    Object.assign(column, bigDecimalPrecision);
  } else if (!['Instant', 'ZonedDateTime', 'LocalDate'].includes(field.fieldType) && maxlength) {
    column.length = field.fieldValidateRulesMaxlength;
  }
  const columns = [column];
  if (hasContentTypeColumn(field)) {
    columns.push({ name: `${field.fieldNameAsDatabaseColumn}_content_type`, type: 'String', nullable });
  }
  return columns;
};

/** Whether a field is a binary blob, stored with the column of its content type. */
const hasContentTypeColumn = field => ['byte[]', 'ByteBuffer'].includes(field.fieldType) && field.fieldTypeBlobContent !== 'text';

/**
 * The camelCase of the default naming strategy of TypeORM, the names it gives the join columns and the columns of the join
 * tables: unlike the one of lodash, it keeps the case of the letters it does not join (mainURL_id is mainURLId).
 */
export const typeormCamelCase = text =>
  text.replaceAll(/^([A-Z])|[\s\-_](\w)/g, (_match, first, next) => (next ? next.toUpperCase() : first.toLowerCase()));

/** The join column of a relationship, named like TypeORM names it (the relationship and the primary key of the other entity). */
const joinColumnName = relationship =>
  typeormCamelCase(`${relationship.relationshipFieldName}_${relationship.otherEntity.primaryKey.name}`);

/**
 * The relationships of an entity with a join column, the persistableRelationships of JHipster but the many-to-many ones:
 * the many-to-one ones, and the one-to-one ones on their owner side.
 */
const joinColumnRelationships = entity => entity.persistableRelationships.filter(relationship => !relationship.relationshipManyToMany);

/**
 * The names of the columns of a join table, like TypeORM names the ones of a @JoinTable: the same names, like the ones of a
 * many-to-many relationship of an entity with itself named like its table, suffixed by _1 and _2.
 */
const junctionColumnNames = (joinColumnName, inverseJoinColumnName) =>
  joinColumnName === inverseJoinColumnName
    ? [`${joinColumnName}_1`, `${inverseJoinColumnName}_2`]
    : [joinColumnName, inverseJoinColumnName];

/** The relationships of an entity with a join table, the many-to-many ones on their owner side (shouldWriteJoinTable of JHipster). */
const joinTableRelationships = entity => entity.relationships.filter(relationship => relationship.shouldWriteJoinTable);

/**
 * The join table of a many-to-many relationship on its owner side, the one of its @JoinTable and of its constraints
 * migration: the joinTable of JHipster, its columns named by the table of the entity and the relationship.
 */
export const joinTable = (entity, relationship) => {
  const [joinColumnName, inverseJoinColumnName] = junctionColumnNames(`${entity.entityTableName}_id`, `${relationship.columnName}_id`);
  return {
    name: relationship.joinTable.name,
    joinColumn: {
      ...referenceColumn(joinColumnName, entity),
      referencedTableName: entity.entityTableName,
      referencedColumnName: entity.primaryKey.name,
    },
    inverseJoinColumn: {
      ...referenceColumn(inverseJoinColumnName, relationship.otherEntity),
      referencedTableName: relationship.otherEntity.entityTableName,
      referencedColumnName: relationship.otherEntity.primaryKey.name,
    },
  };
};

/** The migration adding the table of an entity, its name, its class and its columns, at the timestamp of its creation. */
export const entityMigration = (entity, timestamp = entityTimestamp(entity)) => {
  const relationships = joinColumnRelationships(entity);
  return {
    ...migrationName('AddedEntity', entity.entityClass, timestamp),
    tableName: entity.entityTableName,
    columns: [
      primaryKeyColumn(entity),
      ...entity.fields.filter(field => !field.id).flatMap(fieldColumns),
      ...relationships.map(relationship => ({
        ...referenceColumn(joinColumnName(relationship), relationship.otherEntity),
        nullable: true,
      })),
    ],
    relationUniques: relationships
      .filter(relationship => relationship.relationshipOneToOne)
      .map(relationship => joinColumnName(relationship)),
  };
};

/**
 * The migration adding the constraints of an entity, its foreign keys and its join tables, when it has some: run after the
 * migrations of every table, like the constraints changelogs of JHipster run after every table.
 */
export const constraintsMigration = (entity, timestamp = entityTimestamp(entity)) => {
  const joinColumns = joinColumnRelationships(entity);
  const joinTables = joinTableRelationships(entity);
  if (joinColumns.length === 0 && joinTables.length === 0) return undefined;
  return {
    ...migrationName('AddedEntityConstraints', entity.entityClass, timestamp + CONSTRAINTS_TIMESTAMP_OFFSET),
    tableName: entity.entityTableName,
    foreignKeys: joinColumns.map(foreignKey),
    joinTables: joinTables.map(relationship => joinTable(entity, relationship)),
  };
};

/** The foreign key of the join column of a relationship. */
const foreignKey = relationship => ({
  columnName: joinColumnName(relationship),
  referencedTableName: relationship.otherEntity.entityTableName,
  referencedColumnName: relationship.otherEntity.primaryKey.name,
});

/**
 * The migrations of a changelog of an entity, of this generation: for its creation the table of the entity at its date
 * (nodejsMigration), then its constraints (nodejsConstraintsMigration); for an update its fields (nodejsUpdatedMigration),
 * then its relationships (nodejsUpdatedConstraintsMigration), after the constraints of every entity; for its removal its
 * join tables and its table (nodejsRemovedMigration), after the updates of the entities whose relationships referenced it.
 * @param {any} changelog the changelog
 * @param {any} entity the entity, prepared: none for a removal
 * @param {any[]} entities the entities of the application, prepared
 */
export const changelogMigrations = (changelog, entity, entities) => {
  const timestamp = changelogDateToTimestamp(changelog.changelogDate);
  if (changelog.operation === 'create') {
    return { nodejsMigration: entityMigration(entity, timestamp), nodejsConstraintsMigration: constraintsMigration(entity, timestamp) };
  }
  if (changelog.operation === 'update') {
    const changes = { entity, ...changelogChanges(changelog, entity, entities) };
    return {
      nodejsUpdatedMigration: updatedEntityMigration(changes, timestamp + MIGRATION_TIMESTAMP_OFFSET),
      // The relationships after the fields, whose join columns may reference them.
      nodejsUpdatedConstraintsMigration: updatedConstraintsMigration(changes, timestamp + MIGRATION_TIMESTAMP_OFFSET + 1),
    };
  }
  return { nodejsRemovedMigration: removedEntityMigration(changelog, timestamp + MIGRATION_TIMESTAMP_OFFSET) };
};

/**
 * The migration of the removal of an entity, like the dropTable of Liquibase: the join tables it owned, then its table, from
 * the entity before the changelog (its previousEntity). The relationships of the other entities referencing it are removed
 * with it, their join columns and their join tables dropped by their update migrations, dated before.
 * @param {any} changelog the removal changelog of this generation
 * @param {number} timestamp the timestamp of the migration
 */
export const removedEntityMigration = ({ entityName, previousEntity }, timestamp) => ({
  ...migrationName('RemovedEntity', `${entityName.charAt(0).toUpperCase()}${entityName.slice(1)}`, timestamp),
  entityName,
  tableName: previousEntity.entityTableName,
  joinTables: previousEntity.relationships.filter(hasJoinTable).map(relationship => relationship.joinTable.name),
});

/** The class of a migration, by the name of its file (`<timestamp>-<kind><Entity>`, its class `<kind><Entity><timestamp>`). */
export const migrationOfFile = fileName => ({ fileName, className: fileName.replace(/^(\d+)-(\w+)$/, '$2$1') });

/**
 * The fields and the relationships an update changelog of an entity adds and removes: the added ones the entity has,
 * prepared; the removed ones the entity before the changelog has (its previousEntity, of this generation only), by the
 * names of their columns. A relationship changed in its type, its other entity, its side or its join column
 * (recreatedRelationships) is removed and added again; one changed in its options only (onDelete, onUpdate), which the
 * foreign keys of the server do not declare, is left alone. A field changed (its type, its validations) is not migrated.
 * @param {any} changelog the update changelog of this generation
 * @param {any} entity the entity, prepared
 * @param {any[]} entities the entities of the application, prepared
 */
export const changelogChanges = (changelog, entity, entities) => {
  const { previousEntity, recreatedRelationships } = changelog;
  const named = (items, names, key) => items.filter(item => names.includes(item[key]));
  return {
    addedFields: named(entity.fields, changelog.addedFields, 'fieldName'),
    removedFields: named(previousEntity.fields, changelog.removedFields, 'fieldName'),
    addedRelationships: named(entity.relationships, [...changelog.addedRelationships, ...recreatedRelationships], 'relationshipName'),
    removedRelationships: named(
      previousEntity.relationships,
      [...changelog.removedRelationships, ...recreatedRelationships],
      'relationshipName',
    ).map(relationship => removedRelationship(relationship, entities)),
  };
};

/**
 * A relationship of the entity before a changelog, as the changelog records it (its type, its side, its other entity and its
 * join table), with the properties of a relationship the migrations name its join column by: its field, and the primary key
 * of its other entity (id when the other entity is no longer).
 */
const removedRelationship = (relationship, entities) => {
  const otherEntity = entities.find(entity => entity.name.toLowerCase() === relationship.otherEntityName.toLowerCase());
  return {
    ...relationship,
    relationshipFieldName: `${relationship.relationshipName.charAt(0).toLowerCase()}${relationship.relationshipName.slice(1)}`,
    otherEntity: otherEntity ?? { primaryKey: { name: 'id' } },
  };
};

/** The names of the columns of a field of the entity before a changelog, by the column name the changelog records. */
const removedFieldColumnNames = field => [field.columnName, ...(hasContentTypeColumn(field) ? [`${field.columnName}_content_type`] : [])];

/** The TypeScript of an array of names, none without a name. */
const namesLiteral = names => (names.length > 0 ? `[${names.map(literal).join(', ')}]` : undefined);

/**
 * The migration of the fields of an entity an update changelog changes, like the updated_entity changelog of Liquibase: the
 * columns of the added fields, and the names of the columns of the removed fields. None without an added or a removed field.
 * @param {{ entity: any, addedFields: any[], removedFields: any[] }} changes the changes of the changelog (changelogChanges)
 * @param {number} timestamp the timestamp of the migration
 */
export const updatedEntityMigration = ({ entity, addedFields, removedFields }, timestamp) => {
  if (addedFields.length === 0 && removedFields.length === 0) return undefined;
  const addedColumns = addedFields.flatMap(fieldColumns);
  return {
    ...migrationName('UpdatedEntity', entity.entityClass, timestamp),
    tableName: entity.entityTableName,
    addedColumns,
    // The TypeScript of the names of the columns the migration adds and drops, and of the helpers it imports.
    addedColumnNames: namesLiteral(addedColumns.map(column => column.name)),
    removedColumnNames: namesLiteral(removedFields.flatMap(removedFieldColumnNames)),
    schemaImports: addedColumns.length > 0 ? 'addColumns, dropColumns' : 'dropColumns',
  };
};

/** Whether a relationship has a join column: a many-to-one one, or a one-to-one one on its owner side. */
const hasJoinColumn = ({ relationshipType, ownerSide }) =>
  relationshipType === 'many-to-one' || (relationshipType === 'one-to-one' && ownerSide);

/** Whether a relationship has a join table: a many-to-many one on its owner side. */
const hasJoinTable = ({ relationshipType, ownerSide }) => relationshipType === 'many-to-many' && ownerSide;

/**
 * The migration of the relationships of an entity an update changelog changes, like the updated_entity_constraints changelog
 * of Liquibase: the join columns with their foreign keys and the join tables of the added relationships, and the ones of
 * the removed relationships dropped. None without a join column or a join table added or removed.
 * @param {{ entity: any, addedRelationships: any[], removedRelationships: any[] }} changes the changes of the changelog (changelogChanges)
 * @param {number} timestamp the timestamp of the migration
 */
export const updatedConstraintsMigration = ({ entity, addedRelationships, removedRelationships }, timestamp) => {
  const addedJoinColumns = addedRelationships.filter(hasJoinColumn);
  const changes = {
    addedJoinColumns: addedJoinColumns.map(relationship => ({
      ...referenceColumn(joinColumnName(relationship), relationship.otherEntity),
      nullable: true,
    })),
    addedForeignKeys: addedJoinColumns.map(foreignKey),
    addedJoinTables: addedRelationships.filter(hasJoinTable).map(relationship => joinTable(entity, relationship)),
    removedJoinColumns: removedRelationships.filter(hasJoinColumn).map(joinColumnName),
    removedJoinTables: removedRelationships.filter(hasJoinTable).map(relationship => relationship.joinTable.name),
  };
  if (Object.values(changes).every(list => list.length === 0)) return undefined;
  return {
    ...migrationName('UpdatedEntityConstraints', entity.entityClass, timestamp),
    tableName: entity.entityTableName,
    ...changes,
    // The TypeScript of the names of the join columns, of the unique ones of the one-to-one relationships, and of the helpers
    // the migration imports.
    addedJoinColumnNames: namesLiteral(changes.addedJoinColumns.map(column => column.name)),
    relationUniques: namesLiteral(
      addedJoinColumns.filter(relationship => relationship.relationshipType === 'one-to-one').map(joinColumnName),
    ),
    removedJoinColumnNames: namesLiteral(changes.removedJoinColumns),
    schemaImports: [
      addedJoinColumns.length > 0 && 'addColumns, createForeignKeys',
      changes.addedJoinTables.length > 0 && 'createJoinTable',
      (addedJoinColumns.length > 0 || changes.removedJoinColumns.length > 0) && 'dropColumns',
    ]
      .filter(Boolean)
      .join(', '),
  };
};

/**
 * The join table of the authorities of the built-in users, named like TypeORM names the junction table of the @JoinTable()
 * of User.authorities: the tables and the property, its columns the tables and their primary keys.
 */
export const userAuthorityJoinTable = ({ user, authority }) => ({
  name: `${user.entityTableName}_authorities_${authority.entityTableName}`,
  joinColumn: {
    ...referenceColumn(typeormCamelCase(`${user.entityTableName}_${user.primaryKey.name}`), user),
    referencedTableName: user.entityTableName,
    referencedColumnName: user.primaryKey.name,
  },
  inverseJoinColumn: {
    name: typeormCamelCase(`${authority.entityTableName}_name`),
    type: 'String',
    referencedTableName: authority.entityTableName,
    referencedColumnName: 'name',
  },
});
