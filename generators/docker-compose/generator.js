import { readFileSync } from 'node:fs';
import { Transform } from 'node:stream';

import BaseWorkspacesGenerator from 'generator-jhipster/generators/base-workspaces';
import { parseDocument } from 'yaml';

const BLUEPRINT_NAME = 'generator-jhipster-nodejs';
// The folder JHipster's docker-compose generator reads the Docker Compose files of each application from.
const JHIPSTER_DOCKER_DIR = 'src/main/docker';

/**
 * JHipster's docker-compose generator reads the Docker Compose files of every application from src/main/docker, while
 * a NodeJS application has them in docker/. Before it reads them, a transform adds to the in-memory file system a copy
 * of the files of each NodeJS application at the path it reads, adapted to the deployment. The copies have no state,
 * so they are never written to the disk.
 */
export default class extends BaseWorkspacesGenerator {
  constructor(args, opts, features) {
    super(args, opts, { ...features, sbsBlueprint: true });
  }

  get [BaseWorkspacesGenerator.PREPARING_WORKSPACES]() {
    return this.asPreparingWorkspacesTaskGroup({
      keepApplicationsConfig({ applications }) {
        // The deployment passes its blueprints to the bootstrap of every application, which stores them in the
        // .yo-rc.json of the application: a Spring Boot application would get this blueprint. The deployment does not
        // change the applications, their .yo-rc.json are left out of the commit.
        const configs = new Set(applications.map(application => this.workspacePath(application.appFolder, '.yo-rc.json')));
        this.queueTransformStream(
          { name: 'keeping the .yo-rc.json of the applications', filter: file => configs.has(file.path) },
          new Transform({
            objectMode: true,
            transform(_file, _encoding, callback) {
              callback();
            },
          }),
        );
      },
      dockerServicesDir({ applications }) {
        // JHipster's docker-compose generator reads the Docker Compose files of each application from its
        // dockerServicesDir. The deployment bootstraps every application with its blueprints, so a Spring Boot
        // application would get the docker/ folder of the NodeJS ones: every application is read from src/main/docker,
        // where the NodeJS ones get the copies below.
        // TODO read the docker/ folder of the NodeJS applications without the copies, once the blueprints of an
        // application of the deployment are the ones of its .yo-rc.json.
        for (const application of applications) {
          application.dockerServicesDir = `${JHIPSTER_DOCKER_DIR}/`;
        }
      },
      async nodejsDockerFiles({ applications }) {
        const copies = new Map();
        for (const application of applications) {
          const appPath = this.workspacePath(application.appFolder);
          // The deployment passes its blueprints to the bootstrap of every application, which adds them to the
          // configuration in memory: read the blueprints of the application from the disk.
          const { blueprints = [] } = JSON.parse(readFileSync(`${appPath}/.yo-rc.json`, 'utf8'))['generator-jhipster'] ?? {};
          if (!blueprints.some(blueprint => blueprint.name === BLUEPRINT_NAME)) continue;

          const lowercaseBaseName = application.baseName.toLowerCase();
          const database = application.databaseTypeSql ? application.prodDatabaseType : application.databaseType;
          const files = { 'app.yml': content => this.adaptAppYaml(content, { lowercaseBaseName, database }) };
          if (database) {
            files[`${database}.yml`] = content => content;
          }
          for (const [file, adapt] of Object.entries(files)) {
            const source = `${appPath}/docker/${file}`;
            // Loads the file in the in-memory file system, the transform only sees loaded files.
            this.fs.read(source);
            copies.set(source, { destination: `${appPath}/${JHIPSTER_DOCKER_DIR}/${file}`, adapt });
          }
        }
        if (copies.size === 0) return;

        await this.pipeline(
          {
            name: 'copying the Docker Compose files of the NodeJS applications',
            pendingFiles: false,
            filter: file => copies.has(file.path),
          },
          new Transform({
            objectMode: true,
            transform(file, _encoding, callback) {
              const { destination, adapt } = copies.get(file.path);
              const copy = file.clone({ contents: false });
              copy.path = destination;
              copy.contents = Buffer.from(adapt(file.contents.toString()));
              // Without a state, mem-fs-editor never commits the copy.
              delete copy.state;
              this.push(file);
              callback(null, copy);
            },
          }),
        );
      },
    });
  }

  /**
   * The application of the deployment runs its Docker image, and reaches its database by the name the deployment
   * gives to the service (`<app>-<database>`). JHipster renames the hosts of the SPRING_* variables only.
   */
  adaptAppYaml(content, { lowercaseBaseName, database }) {
    const document = parseDocument(content);
    document.deleteIn(['services', 'app', 'build']);
    const environment = document.getIn(['services', 'app', 'environment']);
    if (database && environment) {
      for (const [index, item] of environment.items.entries()) {
        const value = String(item.value ?? item);
        if (value === `DATABASE_HOST=${database}`) {
          environment.set(index, `DATABASE_HOST=${lowercaseBaseName}-${database}`);
        }
      }
    }
    return document.toString();
  }
}
