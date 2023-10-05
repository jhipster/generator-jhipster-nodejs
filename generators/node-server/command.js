import { command } from 'generator-jhipster/generators/server';

const { applicationType } = command.configs;

/**
 * @type {import('generator-jhipster').JHipsterCommandDefinition}
 */
const command = {
  options: {},
  configs: {
    applicationType,
    serverPort: {
      prompt: {
        when: answers => answers.applicationType === 'gateway' || answers.applicationType === 'microservice',
        type: 'input',
        validate: input => (/^([0-9]*)$/.test(input) ? true : 'This is not a valid port number.'),
        message:
          'As you are running in a microservice architecture, on which port would like your server to run? It should be unique to avoid port conflicts.',
        default: answers => (answers.applicationType === 'gateway' ? '8080' : '8081'),
      },
    },
    authenticationType: {
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
    },
    prodDatabaseType: {
      cli: {
        type: String,
      },
      prompt: {
        type: 'list',
        message: `Which ${chalk.yellow('*production*')} database would you like to use?`,
      },
      choices: [
        { value: 'postgresql', name: 'PostgreSQL' },
        { value: 'mysql', name: 'MySQL or MariaDB' },
        { value: 'oracle', name: 'Oracle (Please follow our documentation to use the Oracle proprietary driver)' },
        { value: 'mssql', name: 'Microsoft SQL Server' },
        { value: 'mongodb', name: 'MongoDB' },
      ],
    },
  },
};

export default command;
