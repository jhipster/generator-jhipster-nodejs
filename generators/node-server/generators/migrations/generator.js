import BaseApplicationGenerator from 'generator-jhipster/generators/base-application';
import {
  CHANGELOGS_CUSTOM_OBJECT,
  changelogsCustomObject,
  getEntityChangelogs,
  hasFormerEntityChangelogs,
  isNewEntityChangelog,
} from 'generator-jhipster/generators/base-application/generators/database-changelogs/support';
import { CONTEXT_DATA_APPLICATION_ENTITIES_KEY } from 'generator-jhipster/generators/base-application/support';

import { SERVER_NODEJS_SRC_DIR } from '../../../generator-nodejs-constants.js';
import {
  MIGRATION_TIMESTAMP_OFFSET,
  changelogChanges,
  changelogDateToTimestamp,
  changelogMigrationNames,
  constraintsMigration,
  entityMigration,
  updatedConstraintsMigration,
  updatedEntityMigration,
} from '../../support/index.js';

import { migrationFiles } from './files.js';

/**
 * The migrations of the entities of a SQL server, like the incremental Liquibase changelogs of JHipster Spring Boot: the
 * migrations of the changelogs of the entities JHipster records (jhipster:base-application:database-changelogs, the
 * changelogs custom object), a creation AddedEntity and AddedEntityConstraints, an update UpdatedEntity and
 * UpdatedEntityConstraints (see support/migrations.js). A generation writes the migrations of its own changelogs, and
 * registers every one: the ones of the former changelogs are their files, written once.
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
        for (const entity of entities.filter(entity => !entity.skipServer && !entity.builtIn)) {
          this.#prepareEntityMigrations(
            entity,
            entities,
            changelogs.filter(changelog => changelog.entityName === entity.name),
          );
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
        for (const entity of this.#entities.filter(entity => !entity.skipServer && !entity.builtIn)) {
          for (const migration of entity.nodejsMigrations) {
            source.addMigrationToNodeConfig(migration);
          }
        }
      },
    });
  }

  /**
   * The migrations a former generation wrote for a changelog: the ones the changelog records (nodejsMigrations), else the
   * files of its migrations the project has (a changelog recorded before they were).
   */
  #keptMigrations(changelog, entityClass) {
    const names = changelogMigrationNames(changelog, entityClass);
    if (changelog.nodejsMigrations) {
      return names.filter(migration => changelog.nodejsMigrations.includes(migration.fileName));
    }
    return names.filter(migration => this.existsDestination(`${SERVER_NODEJS_SRC_DIR}/src/migrations/${migration.fileName}.ts`));
  }

  /**
   * Records the migrations written for a changelog in its object (nodejsMigrations): the migrations of a former changelog
   * are registered from it, a generation of the configuration of a project, without its files, included.
   */
  #recordMigrations(changelog, migrations) {
    const name = `${changelog.changelogDate}_${changelog.entityName}`;
    this.setObjectConfig(name, { ...this.getObjectConfig(name), nodejsMigrations: migrations.map(migration => migration.fileName) });
  }

  /**
   * The migrations of an entity, from its changelogs since its last creation: the ones of a changelog of this generation
   * written, the ones of a former changelog kept (written by its generation). A project without changelogs before gets the
   * migrations of the tables of its entities as they are, which create a table unless it exists.
   */
  #prepareEntityMigrations(entity, entities, entityChangelogs) {
    const creationIndex = entityChangelogs.findLastIndex(changelog => changelog.operation === 'create');
    const creation = entityChangelogs[creationIndex];
    const updates = entityChangelogs.slice(creationIndex + 1).filter(changelog => changelog.operation === 'update');
    entity.nodejsMigrations = [];
    if (!creation || isNewEntityChangelog(this, creation) || !hasFormerEntityChangelogs(this)) {
      // The migrations of the entity as it is now.
      const timestamp = creation ? changelogDateToTimestamp(creation.changelogDate) : undefined;
      entity.nodejsMigration = entityMigration(entity, timestamp);
      entity.nodejsConstraintsMigration = constraintsMigration(entity, timestamp);
      const migrations = [entity.nodejsMigration, entity.nodejsConstraintsMigration].filter(Boolean);
      if (creation) {
        this.#recordMigrations(creation, migrations);
      }
      entity.nodejsMigrations.push(...migrations);
    } else {
      // The migrations of its creation, written by a former generation.
      entity.nodejsMigrationsKept = true;
      entity.nodejsMigrations.push(...this.#keptMigrations(creation, entity.entityClass));
    }
    for (const changelog of updates) {
      if (!isNewEntityChangelog(this, changelog)) {
        entity.nodejsMigrations.push(...this.#keptMigrations(changelog, entity.entityClass));
        continue;
      }
      const changes = { entity, ...changelogChanges(changelog, entity, entities) };
      const timestamp = changelogDateToTimestamp(changelog.changelogDate) + MIGRATION_TIMESTAMP_OFFSET;
      entity.nodejsUpdatedMigration = updatedEntityMigration(changes, timestamp);
      // The relationships after the fields, whose join columns may reference them.
      entity.nodejsUpdatedConstraintsMigration = updatedConstraintsMigration(changes, timestamp + 1);
      const migrations = [entity.nodejsUpdatedMigration, entity.nodejsUpdatedConstraintsMigration].filter(Boolean);
      this.#recordMigrations(changelog, migrations);
      entity.nodejsMigrations.push(...migrations);
    }
  }
}
