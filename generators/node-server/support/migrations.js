import { existsSync } from 'node:fs';

import { getEntitiesFromDir } from 'generator-jhipster/generators/base-application/support';
import { getJoinTableName } from 'generator-jhipster/generators/server/support';

import { bigDecimalPrecision, columnRules } from './columns.js';
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
 * With incrementalChangelog, like the incremental changelogs of Liquibase, the migrations of an entity are the ones of its
 * changelogs JHipster records (the changelog objects of the .yo-rc.json): its creation, AddedEntity and
 * AddedEntityConstraints, kept once written, then each update at the date of its changelog plus MIGRATION_TIMESTAMP_OFFSET
 * (the incremental section of master.xml, after the constraints): UpdatedEntity adds the columns of the added fields and
 * drops the ones of the removed fields, then UpdatedEntityConstraints, 1 ms after, adds and drops the join columns, their
 * foreign keys and the join tables of the relationships. A generation writes the migrations of its own changelogs only.
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

/** The JavaScript timestamp (milliseconds, UTC) of a changelogDate of JHipster (yyyyMMddHHmmss). */
export const changelogDateToTimestamp = changelogDate => {
  const [, year, month, day, hours, minutes, seconds] = /^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})$/.exec(changelogDate) ?? [];
  if (!year) {
    throw new Error(`The changelogDate ${changelogDate} is not a date of the yyyyMMddHHmmss format`);
  }
  return Date.UTC(Number(year), Number(month) - 1, Number(day), Number(hours), Number(minutes), Number(seconds));
};

/** The TypeScript of the type of a column whose @Column decorator has none: the TypeScript type of its property. */
const typeOfFieldType = {
  string: 'String',
  number: 'Number',
  boolean: 'Boolean',
  Date: 'Date',
};

/** The class and the file of a migration of an entity, by the kind of the migration and its timestamp. */
const migrationName = (kind, entityClass, timestamp) => ({
  timestamp,
  className: `${kind}${entityClass}${timestamp}`,
  fileName: `${timestamp}-${kind}${entityClass}`,
});

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
  const { required, unique, maxlength } = columnRules(field);
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

/** The names of the columns of a field, the ones of fieldColumns. */
const fieldColumnNames = field => [
  field.fieldNameAsDatabaseColumn,
  ...(hasContentTypeColumn(field) ? [`${field.fieldNameAsDatabaseColumn}_content_type`] : []),
];

/**
 * The camelCase of the default naming strategy of TypeORM, the names it gives the join columns and the columns of the join
 * tables: unlike the one of lodash, it keeps the case of the letters it does not join (mainURL_id is mainURLId).
 */
export const typeormCamelCase = text =>
  text.replaceAll(/^([A-Z])|[\s\-_](\w)/g, (_match, first, next) => (next ? next.toUpperCase() : first.toLowerCase()));

/** The join column of a relationship, named like TypeORM names it (the relationship and the primary key of the other entity). */
const joinColumnName = relationship =>
  typeormCamelCase(`${relationship.relationshipFieldName}_${relationship.otherEntity.primaryKey.name}`);

/** The relationships of an entity with a join column: the many-to-one ones, and the one-to-one ones on their owner side. */
const joinColumnRelationships = entity =>
  entity.relationships.filter(
    relationship =>
      relationship.relationshipType === 'many-to-one' || (relationship.relationshipType === 'one-to-one' && relationship.ownerSide),
  );

/**
 * The names of the columns of a join table, like TypeORM names the ones of a @JoinTable: the same names, like the ones of a
 * many-to-many relationship of an entity with itself named like its table, suffixed by _1 and _2.
 */
const junctionColumnNames = (joinColumnName, inverseJoinColumnName) =>
  joinColumnName === inverseJoinColumnName
    ? [`${joinColumnName}_1`, `${inverseJoinColumnName}_2`]
    : [joinColumnName, inverseJoinColumnName];

/** The relationships of an entity with a join table: the many-to-many ones on their owner side. */
const joinTableRelationships = entity =>
  entity.relationships.filter(relationship => relationship.relationshipType === 'many-to-many' && relationship.ownerSide);

/** The join column of a relationship, nullable. */
const joinColumn = relationship => ({ ...referenceColumn(joinColumnName(relationship), relationship.otherEntity), nullable: true });

/** The foreign key of the join column of a relationship. */
const foreignKey = relationship => ({
  columnName: joinColumnName(relationship),
  referencedTableName: relationship.otherEntity.entityTableName,
  referencedColumnName: relationship.otherEntity.primaryKey.name,
});

/** The join table of a many-to-many relationship of an entity, its name and its columns. */
const joinTable = (entity, relationship) => {
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

/** The migration adding the table of an entity, its name, its class and its columns. */
export const entityMigration = entity => {
  const relationships = joinColumnRelationships(entity);
  return {
    ...migrationName('AddedEntity', entity.entityClass, changelogDateToTimestamp(entity.changelogDate)),
    tableName: entity.entityTableName,
    columns: [
      primaryKeyColumn(entity),
      ...entity.fields.filter(field => !field.id).flatMap(fieldColumns),
      ...relationships.map(joinColumn),
    ],
    relationUniques: relationships
      .filter(relationship => relationship.relationshipType === 'one-to-one')
      .map(relationship => joinColumnName(relationship)),
  };
};

/**
 * The migration adding the constraints of an entity, its foreign keys and its join tables, when it has some: run after the
 * migrations of every table, like the constraints changelogs of JHipster run after every table.
 */
export const constraintsMigration = entity => {
  const joinColumns = joinColumnRelationships(entity);
  const joinTables = joinTableRelationships(entity);
  if (joinColumns.length === 0 && joinTables.length === 0) return undefined;
  return {
    ...migrationName(
      'AddedEntityConstraints',
      entity.entityClass,
      changelogDateToTimestamp(entity.changelogDate) + CONSTRAINTS_TIMESTAMP_OFFSET,
    ),
    tableName: entity.entityTableName,
    foreignKeys: joinColumns.map(foreignKey),
    joinTables: joinTables.map(relationship => joinTable(entity, relationship)),
  };
};

/** The migration of a kind of an entity, its class and its file, at the timestamp of its changelogDate. */
export const migrationOf = (kind, entity) => migrationName(kind, entity.entityClass, changelogDateToTimestamp(entity.changelogDate));

/**
 * The changelogs of an entity since its last creation (the changelog objects of JHipster, sorted by date), the ones of
 * its table: none without incrementalChangelog.
 * @param {any[]} changelogs the changelogs of the application
 * @param {string} entityName the name of the entity
 */
export const changelogsSinceCreation = (changelogs, entityName) => {
  const entityChangelogs = changelogs.filter(changelog => changelog.entityName === entityName);
  const creation = entityChangelogs.findLastIndex(changelog => changelog.operation === 'create');
  return creation === -1
    ? []
    : entityChangelogs.slice(creation).filter((changelog, index) => index === 0 || changelog.operation === 'update');
};

/** The changelogDate of the entity a creation changelog creates, the one of its AddedEntity migration. */
export const createdChangelogDate = ({ entity, changelogDate }) =>
  entity.annotations?.incrementalChangelogDate ?? entity.annotations?.changelogDate ?? changelogDate;

/** The name of a changelog object of JHipster. */
const changelogName = ({ changelogDate, entityName }) => `${changelogDate}_${entityName}`;

/**
 * Whether a changelog is of a former generation, read before the generation records its own: a changelog recorded then,
 * or, in a project without changelogs, the creation of an entity its entity files on the disk declare, which JHipster
 * records first (see getEntityChangelogs of JHipster).
 * @param {any} generator the generator
 * @returns {(changelog: any) => boolean}
 */
export const formerChangelogs = generator => {
  const recorded = new Set(generator.findObjects('changelog').map(changelogName));
  const formerEntities =
    recorded.size > 0
      ? []
      : getEntitiesFromDir(generator.getEntitiesConfigPath()).filter(name => existsSync(generator.getEntityConfigPath(name)));
  return changelog =>
    recorded.has(changelogName(changelog)) || (changelog.operation === 'create' && formerEntities.includes(changelog.entityName));
};

/** Whether two relationships of entity files are the same, but their options: the type, the entity and the side. */
const sameRelationship = (relationship1, relationship2) =>
  ['relationshipType', 'otherEntityName', 'relationshipSide'].every(property => relationship1[property] === relationship2[property]);

/**
 * The fields and the relationships an update changelog of an entity adds and removes, by name for the added ones (the
 * entity of the changelog has them), as the entity of the changelog before declares them for the removed ones. A
 * relationship changed in its type, its entity or its side is removed and added again; one changed in its options only
 * (onDelete, onUpdate), which the foreign keys of the server do not declare, is left alone.
 * @param {any} previousEntity the entity of the changelog before
 * @param {any} changelog the update changelog
 */
export const changelogChanges = (previousEntity, changelog) => {
  const previousRelationships = previousEntity.relationships ?? [];
  const relationshipNamed = (relationships, name) => relationships.find(relationship => relationship.relationshipName === name);
  const recreated = (changelog.changedRelationships ?? []).filter(
    name => !sameRelationship(relationshipNamed(previousRelationships, name), relationshipNamed(changelog.entity.relationships, name)),
  );
  return {
    addedFields: changelog.addedFields ?? [],
    removedFields: (changelog.removedFields ?? []).map(name => (previousEntity.fields ?? []).find(field => field.fieldName === name)),
    addedRelationships: [...(changelog.addedRelationships ?? []), ...recreated],
    removedRelationships: [...(changelog.removedRelationships ?? []), ...recreated].map(name =>
      relationshipNamed(previousRelationships, name),
    ),
  };
};

/**
 * The migration of the fields of an entity changed since its former generation, like the updated_entity changelog of
 * Liquibase: the columns of the added fields, and the names of the columns of the removed fields. None without an added
 * or a removed field.
 * @param {{ entity: any, addedFields: any[], removedFields: any[] }} changes the changes of the entity (the entityChanges of JHipster)
 * @param {() => number} nextTimestamp the timestamp of a new migration
 */
export const updatedEntityMigration = ({ entity, addedFields, removedFields }, nextTimestamp) => {
  if (addedFields.length === 0 && removedFields.length === 0) return undefined;
  const addedColumns = addedFields.flatMap(fieldColumns);
  return {
    ...migrationName('UpdatedEntity', entity.entityClass, nextTimestamp()),
    tableName: entity.entityTableName,
    addedColumns,
    // The TypeScript of the names of the columns the migration adds and drops, and of the helpers it imports.
    addedColumnNames: namesLiteral(addedColumns.map(column => column.name)),
    removedColumnNames: namesLiteral(removedFields.flatMap(fieldColumnNames)),
    schemaImports: addedColumns.length > 0 ? 'addColumns, dropColumns' : 'dropColumns',
  };
};

/** The TypeScript of an array of names. */
const namesLiteral = names => (names.length > 0 ? `[${names.map(literal).join(', ')}]` : undefined);

/**
 * The migration of the relationships of an entity changed since its former generation, like the
 * updated_entity_constraints changelog of Liquibase: the join columns with their foreign keys and the join tables of the
 * added relationships, and the ones of the removed relationships. None without a join column or a join table added or
 * removed.
 * @param {{ entity: any, addedRelationships: any[], removedRelationships: any[] }} changes
 * @param {() => number} nextTimestamp the timestamp of a new migration
 */
export const updatedConstraintsMigration = ({ entity, addedRelationships, removedRelationships }, nextTimestamp) => {
  const added = { relationships: addedRelationships };
  const removed = { relationships: removedRelationships };
  const addedJoinColumns = joinColumnRelationships(added);
  const changes = {
    addedJoinColumns: addedJoinColumns.map(joinColumn),
    addedForeignKeys: addedJoinColumns.map(foreignKey),
    addedJoinTables: joinTableRelationships(added).map(relationship => joinTable(entity, relationship)),
    removedJoinColumns: joinColumnRelationships(removed).map(joinColumnName),
    removedJoinTables: joinTableRelationships(removed).map(relationship => relationship.joinTable.name),
  };
  if (Object.values(changes).every(list => list.length === 0)) return undefined;
  return {
    ...migrationName('UpdatedEntityConstraints', entity.entityClass, nextTimestamp()),
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

/** The blob content of the blob types of the entity files, which JHipster gives the fields of the type byte[]. */
const blobContents = { ImageBlob: 'image', AnyBlob: 'any', TextBlob: 'text' };

/**
 * A field of the former generation of an entity, as its entity file declares it, with the type JHipster gives the
 * fields of the entities: a blob type of the entity file is a byte[] of its blob content.
 * @param {any} field the field of the entity file
 */
export const previousField = field =>
  blobContents[field.fieldType] ? { ...field, fieldType: 'byte[]', fieldTypeBlobContent: blobContents[field.fieldType] } : { ...field };

/**
 * A relationship of the former generation of an entity, as its entity file declares it, with the properties JHipster
 * prepares the migrations read: its field, its owner side, its join table, and the entity it references now (the join
 * column is named by its primary key, id when it is no longer).
 * @param {any} entity the entity
 * @param {any} relationship the relationship of its entity file
 * @param {{ otherEntity?: any, prodDatabaseType?: string }} options
 */
export const previousRelationship = (entity, relationship, { otherEntity, prodDatabaseType }) => {
  const { relationshipName, relationshipType, relationshipSide } = relationship;
  // Like the ownerSide of the relationships of JHipster: the other side JHipster adds to the other entity has no side.
  const ownerSide = relationshipType === 'many-to-one' || (relationshipSide === 'left' && relationshipType !== 'one-to-many');
  return {
    ...relationship,
    relationshipFieldName: `${relationshipName.charAt(0).toLowerCase()}${relationshipName.slice(1)}`,
    ownerSide,
    otherEntity: otherEntity ?? { primaryKey: { name: 'id' } },
    joinTable:
      relationshipType === 'many-to-many' && ownerSide
        ? { name: getJoinTableName(entity.entityTableName, relationshipName, { prodDatabaseType }).value }
        : undefined,
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
