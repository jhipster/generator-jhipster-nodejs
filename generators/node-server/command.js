import chalk from 'chalk';
import { asCommand } from 'generator-jhipster';
import { command as commonCommand } from 'generator-jhipster/generators/common';
import { command as javaSimpleApplicationCommand } from 'generator-jhipster/generators/java-simple-application';
import { command as serverCommand } from 'generator-jhipster/generators/server';
import { command as springBootCommand } from 'generator-jhipster/generators/spring-boot';

const { applicationType } = commonCommand.configs;

/**
 * The JDL definition of an option of JHipster's commands. The server command of the blueprint replaces the one of
 * JHipster, which imports spring-boot: the JDL of the blueprint cli only knows the options of its own commands.
 * Without a jdl definition (generator-jhipster 9.4.0, whose JDL knows every option), nothing is added.
 */
const jdlOf = config => (config?.jdl ? { jdl: config.jdl } : {});

/**
 * The options of the Java server of JHipster the NodeJS server uses, for the JDL only (no cli option, no prompt). The
 * other ones (searchEngine, messageBroker, buildTool, ...) are unknown options of the JDL of the blueprint.
 */
const jdlOptions = Object.fromEntries(
  Object.entries({
    databaseType: serverCommand.configs.databaseType,
    devDatabaseType: serverCommand.configs.devDatabaseType,
    serviceDiscoveryType: springBootCommand.configs.serviceDiscoveryType,
    syncUserWithIdp: springBootCommand.configs.syncUserWithIdp,
    packageName: javaSimpleApplicationCommand.configs.packageName,
  })
    .filter(([, config]) => config?.jdl)
    .map(([name, { description, jdl, choices, scope }]) => [name, { description, jdl, choices, scope }]),
);
if (jdlOptions.devDatabaseType) {
  // SQLite, the embedded development database of the former versions of the blueprint, is still accepted.
  jdlOptions.devDatabaseType.choices = [...jdlOptions.devDatabaseType.choices, 'sqlite'];
}

export default asCommand({
  configs: {
    ...jdlOptions,
    // The secret shared with JHipster's Spring Boot applications, given by the JDL or, like for them, by the hidden
    // --jwt-secret-key option (the one of the samples of a gateway and its microservices).
    jwtSecretKey: springBootCommand.configs.jwtSecretKey,
    applicationType,
    serverPort: {
      ...jdlOf(commonCommand.configs.serverPort),
      prompt: {
        when: answers => answers.applicationType === 'gateway' || answers.applicationType === 'microservice',
        type: 'input',
        validate: input => (/^([0-9]*)$/.test(input) ? true : 'This is not a valid port number.'),
        message:
          'As you are running in a microservice architecture, on which port would like your server to run? It should be unique to avoid port conflicts.',
        default: answers => (answers.applicationType === 'gateway' ? '8080' : '8081'),
      },
      scope: 'storage',
    },
    authenticationType: {
      ...jdlOf(commonCommand.configs.authenticationType),
      cli: {
        type: String,
      },
      prompt: {
        type: 'list',
        message: `Which ${chalk.yellow('*type*')} of authentication would you like to use?`,
      },
      choices: [
        { value: 'jwt', name: 'JWT authentication (stateless, with a token)' },
        { value: 'oauth2', name: 'OAuth 2.0 / OIDC Authentication (stateful, works with Okta)' },
      ],
      scope: 'storage',
    },
    prodDatabaseType: {
      ...jdlOf(serverCommand.configs.prodDatabaseType),
      cli: {
        type: String,
      },
      prompt: {
        type: 'list',
        message: `Which ${chalk.yellow('*production*')} database would you like to use?`,
      },
      choices: [
        { value: 'postgresql', name: 'PostgreSQL' },
        { value: 'mysql', name: 'MySQL' },
        { value: 'mariadb', name: 'MariaDB' },
        { value: 'oracle', name: 'Oracle (Please follow our documentation to use the Oracle proprietary driver)' },
        { value: 'mssql', name: 'Microsoft SQL Server' },
        { value: 'mongodb', name: 'MongoDB' },
      ],
      scope: 'storage',
    },
  },
});
