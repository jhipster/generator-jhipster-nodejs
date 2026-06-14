import BaseApplicationGenerator from 'generator-jhipster/generators/base-application';

const usePnpmInScript = script => {
  if (typeof script !== 'string') {
    return script;
  }

  return script
    .replace(/\bnpm run\b/g, 'pnpm run')
    .replace(/\bnpm test\b/g, 'pnpm test')
    .replace(/npm:backend:start/g, "'pnpm run backend:start'")
    .replace(/\s+--(?=\s*(?:&&|$))/g, '');
};

const usePnpmInScripts = scripts =>
  Object.fromEntries(Object.entries(scripts ?? {}).map(([scriptName, script]) => [scriptName, usePnpmInScript(script)]));

export default class extends BaseApplicationGenerator {
  constructor(args, opts, features) {
    super(args, opts, { ...features, queueCommandTasks: true, sbsBlueprint: true });
  }

  get [BaseApplicationGenerator.POST_WRITING]() {
    return this.asPostWritingTaskGroup({
      async postWritingTemplateTask({ application }) {
        const rootPackageJson = this.createStorage('package.json');
        const rootScripts = rootPackageJson.get('scripts') ?? {};

        rootPackageJson.set('scripts', {
          ...rootScripts,
          'ci:e2e:prepare': 'pnpm run ci:e2e:prepare:docker',
          'ci:e2e:prepare:docker': 'pnpm run services:up --if-present && docker ps -a',
          'ci:e2e:teardown': 'pnpm run ci:e2e:teardown:docker --if-present',
          'ci:frontend:test': 'pnpm --filter ./client run ci:frontend:test',
          'webapp:build': 'pnpm --filter ./client run webapp:build',
        });

        if (application.clientFrameworkAny) {
          const clientPackageJson = this.createStorage(`${application.clientRootDir}package.json`);
          const clientName = clientPackageJson.get('name');
          if (clientName === application.dasherizedBaseName) {
            clientPackageJson.set('name', `${application.dasherizedBaseName}-client`);
          }

          clientPackageJson.set('scripts', usePnpmInScripts(clientPackageJson.get('scripts')));
        }
      },
    });
  }
}
