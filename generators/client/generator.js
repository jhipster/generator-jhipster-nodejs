import { relative } from 'node:path';

import BaseApplicationGenerator from 'generator-jhipster/generators/base-application';

export default class extends BaseApplicationGenerator {
  constructor(args, opts, features) {
    super(args, opts, { ...features, sbsBlueprint: true });
  }

  get [BaseApplicationGenerator.POST_WRITING]() {
    return this.asPostWritingTaskGroup({
      async postWritingTemplateTask({ application }) {
        if (application.clientFrameworkAny) {
          const clientPackageJson = this.createStorage(`${application.clientRootDir}package.json`);
          const clientName = clientPackageJson.get('name');
          if (clientName === application.dasherizedBaseName) {
            clientPackageJson.set('name', `${application.dasherizedBaseName}-client`);
          }
          const rootDir = relative(this.destinationPath(application.clientRootDir), this.destinationPath());
          if (!application.skipServer && rootDir) {
            // The watch and build-watch scripts of the client workspace run npm:backend:start, a script of the root
            // package.json: the client workspace runs it there.
            clientPackageJson.merge({ scripts: { 'backend:start': `npm --prefix ${rootDir} run backend:start` } });
          }
        }
      },
    });
  }
}
