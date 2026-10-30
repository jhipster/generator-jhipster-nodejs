import BaseApplicationGenerator from 'generator-jhipster/generators/base-application';
import {
  CHANGELOGS_CUSTOM_OBJECT,
  changelogsCustomObject,
  getEntityChangelogs,
  isNewEntityChangelog,
} from 'generator-jhipster/generators/base-application/generators/database-changelogs/support';
import { CONTEXT_DATA_APPLICATION_ENTITIES_KEY } from 'generator-jhipster/generators/base-application/support';

import {
  MIGRATION_TIMESTAMP_OFFSET,
  changelogChanges,
  changelogDateToTimestamp,
  constraintsMigration,
  entityMigration,
  migrationOfFile,
  updatedConstraintsMigration,
  updatedEntityMigration,
} from '../../support/index.js';

import { migrationFiles } from './files.js';

/**
 * The migrations of the entities of a SQL server, like the incremental Liquibase changelogs of JHipster Spring Boot: the
 * migrations of the changelogs of the entities JHipster records (jhipster:base-application:database-changelogs, the
 * changelogs custom object), a creation AddedEntity and AddedEntityConstraints, an update UpdatedEntity and
 * UpdatedEntityConstraints (see support/migrations.js). A generation writes the migrations of its own changelogs, recorded
 * in them, and registers every one: the ones of the former changelogs as they record them, written once.
 */
export default class extends BaseApplicationGenerator {
  constructor(args, options, features) {
    // The changelogs once the entities are prepared: their migrations are written from the entities and their fields.
    super(args, options, { ...features, customObjects: [changelogsCustomObject] });
  }

  async beforeQueue() {
    await this.dependsOnJHipster('jhipster-nodejs:node-server:bootstrap');
  }

  /** The changelogs of the entities, the ones of this generation recorded (see getEntityChangelogs of JHipster). */
  get changelogs() {
    return getEntityChangelogs(this);
  }

  /** The entities of the application with a table of the server, as JHipster prepares them. */
  get #entities() {
    return [...this.getContextData(CONTEXT_DATA_APPLICATION_ENTITIES_KEY, { factory: () => new Map() }).values()];
  }

  get [BaseApplicationGenerator.COMPOSING]() {
    return this.asComposingTaskGroup({
      async composeChangelogs() {
        await this.composeWithJHipster('jhipster:base-application:database-changelogs');
      },
    });
  }

  get [BaseApplicationGenerator.objectPriority(CHANGELOGS_CUSTOM_OBJECT, 'postPreparing')]() {
    return {
      prepareMigrations: ({ changelogs }) => {
        const entities = this.#entities;
        for (const changelog of changelogs.filter(changelog => isNewEntityChangelog(this, changelog))) {
          const entity = entities.find(entity => entity.name === changelog.entityName && !entity.skipServer);
          if (entity) {
            this.#prepareMigrations(changelog, entity, entities);
          }
        }
      },
    };
  }

  get [BaseApplicationGenerator.WRITING_OBJECTS]() {
    return this.asWritingObjectsTaskGroup({
      async writeMigrations({ application }) {
        for (const entity of this.#entities.filter(entity => !entity.skipServer && !entity.builtIn)) {
          await this.writeFiles({ sections: migrationFiles, context: { ...application, ...entity } });
        }
      },
    });
  }

  get [BaseApplicationGenerator.POST_WRITING_OBJECTS]() {
    return this.asPostWritingObjectsTaskGroup({
      registerMigrations({ source }) {
        // The migrations every changelog records, the ones of this generation included.
        for (const changelog of this.changelogs) {
          for (const fileName of this.getObjectConfig(changelogName(changelog))?.nodejsMigrations ?? []) {
            source.addMigrationToNodeConfig(migrationOfFile(fileName));
          }
        }
      },
    });
  }

  /**
   * The migrations of a changelog of this generation, recorded in its object (nodejsMigrations), which the next generations
   * register: for a creation AddedEntity and AddedEntityConstraints at its date, for an update UpdatedEntity and
   * UpdatedEntityConstraints after the constraints of every entity.
   */
  #prepareMigrations(changelog, entity, entities) {
    const timestamp = changelogDateToTimestamp(changelog.changelogDate);
    if (changelog.operation === 'create') {
      entity.nodejsMigration = entityMigration(entity, timestamp);
      entity.nodejsConstraintsMigration = constraintsMigration(entity, timestamp);
    } else if (changelog.operation === 'update') {
      const changes = { entity, ...changelogChanges(changelog, entity, entities) };
      entity.nodejsUpdatedMigration = updatedEntityMigration(changes, timestamp + MIGRATION_TIMESTAMP_OFFSET);
      // The relationships after the fields, whose join columns may reference them.
      entity.nodejsUpdatedConstraintsMigration = updatedConstraintsMigration(changes, timestamp + MIGRATION_TIMESTAMP_OFFSET + 1);
    }
    const migrations = [
      entity.nodejsMigration,
      entity.nodejsConstraintsMigration,
      entity.nodejsUpdatedMigration,
      entity.nodejsUpdatedConstraintsMigration,
    ].filter(Boolean);
    const name = changelogName(changelog);
    this.setObjectConfig(name, { ...this.getObjectConfig(name), nodejsMigrations: migrations.map(migration => migration.fileName) });
  }
}

/** The name of the object of a changelog, like JHipster names it. */
const changelogName = ({ changelogDate, entityName }) => `${changelogDate}_${entityName}`;
