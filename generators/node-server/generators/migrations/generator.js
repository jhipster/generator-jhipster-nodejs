import BaseApplicationGenerator from 'generator-jhipster/generators/base-application';
import {
  CHANGELOGS_CUSTOM_OBJECT,
  changelogsCustomObject,
  getEntityChangelogs,
  isNewEntityChangelog,
} from 'generator-jhipster/generators/base-application/generators/database-changelogs/support';
import { CONTEXT_DATA_APPLICATION_ENTITIES_KEY } from 'generator-jhipster/generators/base-application/support';

import { SERVER_NODEJS_SRC_DIR } from '../../../generator-nodejs-constants.js';
import { changelogMigrations, migrationOfFile } from '../../support/index.js';

import { migrationFiles } from './files.js';

/**
 * The migrations of the entities of a SQL server, like the incremental Liquibase changelogs of JHipster Spring Boot: the
 * migrations of the changelogs of the entities JHipster records (jhipster:base-application:database-changelogs, the
 * changelogs custom object), a creation AddedEntity and AddedEntityConstraints, an update UpdatedEntity and
 * UpdatedEntityConstraints (see support/migrations.js). A generation writes the migrations of its own changelogs, recorded
 * in them, and registers every one: the ones of the former changelogs as they record them, written once.
 */
export default class extends BaseApplicationGenerator {
  /** The migrations of the changelogs of this generation, with their entity. */
  #migrations = [];

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
        // The last changelog of each entity, the changelogs being sorted by date.
        const lastChangelogs = new Map(changelogs.map(changelog => [changelog.entityName, changelog]));
        for (const changelog of changelogs.filter(changelog => this.#writesMigrations(changelog, lastChangelogs))) {
          // The entity of a creation or an update; a removal has none, its migration written from the entity before it.
          const entity = entities.find(entity => entity.name === changelog.entityName);
          if (!(entity ?? changelog.previousEntity).skipServer) {
            this.#prepareMigrations(changelog, entity, entities);
          }
        }
      },
    };
  }

  get [BaseApplicationGenerator.WRITING_OBJECTS]() {
    return this.asWritingObjectsTaskGroup({
      async writeMigrations({ application }) {
        for (const { entity, migrations, formerFileNames } of this.#migrations) {
          await this.writeFiles({ sections: migrationFiles, context: { ...application, ...entity, ...migrations } });
          for (const formerFileName of formerFileNames) {
            this.removeFile(`${SERVER_NODEJS_SRC_DIR}/src/migrations/${formerFileName}.ts`);
          }
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
   * Whether the migrations of a changelog are written: the ones of a changelog of this generation, and the ones of the
   * creation of an entity, its last changelog, generated again from the entity, which has not changed since (a project
   * whose changelogs JHipster records for the first time, its entities as they are, included). The migrations of an
   * update recorded before are kept: the entity before it is only known to the generation recording it.
   */
  #writesMigrations(changelog, lastChangelogs) {
    return (
      isNewEntityChangelog(this, changelog) || (changelog.operation === 'create' && lastChangelogs.get(changelog.entityName) === changelog)
    );
  }

  /**
   * The migrations of a changelog of this generation (support/migrations.js), written with its entity, and recorded in its
   * object (nodejsMigrations), which the next generations register.
   */
  #prepareMigrations(changelog, entity, entities) {
    const migrations = changelogMigrations(changelog, entity, entities);
    const name = changelogName(changelog);
    const recorded = this.getObjectConfig(name)?.nodejsMigrations ?? [];
    const written = Object.values(migrations).filter(Boolean);
    this.#migrations.push({
      entity,
      migrations,
      // The files of the creation of an entity generated again, named by their timestamp up to 0.0.2 of the blueprint (its
      // changelog recording them so, or none), now by the date of its changelog.
      formerFileNames: written.filter(migration => !recorded.includes(migration.fileName)).map(migration => migration.formerFileName),
    });
    this.setObjectConfig(name, { ...this.getObjectConfig(name), nodejsMigrations: written.map(migration => migration.fileName) });
  }
}

/** The name of the object of a changelog, like JHipster names it. */
const changelogName = ({ changelogDate, entityName }) => `${changelogDate}_${entityName}`;
