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
  if (['byte[]', 'ByteBuffer'].includes(field.fieldType) && field.fieldTypeBlobContent !== 'text') {
    columns.push({ name: `${field.fieldNameAsDatabaseColumn}_content_type`, type: 'String', nullable });
  }
  return columns;
};

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

/** The migration adding the table of an entity, its name, its class and its columns. */
export const entityMigration = entity => {
  const timestamp = changelogDateToTimestamp(entity.changelogDate);
  const relationships = joinColumnRelationships(entity);
  return {
    timestamp,
    className: `AddedEntity${entity.entityClass}${timestamp}`,
    fileName: `${timestamp}-AddedEntity${entity.entityClass}`,
    tableName: entity.entityTableName,
    columns: [
      primaryKeyColumn(entity),
      ...entity.fields.filter(field => !field.id).flatMap(fieldColumns),
      ...relationships.map(relationship => ({
        ...referenceColumn(joinColumnName(relationship), relationship.otherEntity),
        // Like the join column of a required relationship of JHipster Spring Boot, not null.
        nullable: !relationship.columnRequired,
      })),
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
  const timestamp = changelogDateToTimestamp(entity.changelogDate) + CONSTRAINTS_TIMESTAMP_OFFSET;
  return {
    timestamp,
    className: `AddedEntityConstraints${entity.entityClass}${timestamp}`,
    fileName: `${timestamp}-AddedEntityConstraints${entity.entityClass}`,
    tableName: entity.entityTableName,
    foreignKeys: joinColumns.map(relationship => ({
      columnName: joinColumnName(relationship),
      referencedTableName: relationship.otherEntity.entityTableName,
      referencedColumnName: relationship.otherEntity.primaryKey.name,
    })),
    joinTables: joinTables.map(relationship => {
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
    }),
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
