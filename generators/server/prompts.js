const chalk = require('chalk');

const MONGODB = 'mongodb';

module.exports = {
    askForModuleName,
    askForServerSideOpts,
    askForDatabaseType
};

function askForModuleName() {
    if (this.baseName) return;

    this.askModuleName(this);
}

async function askForServerSideOpts() {
    if (this.existingProject) return;

    const applicationType = this.applicationType;

    const defaultPort = applicationType === 'gateway' ? '8080' : '8081';

    const PROMPT = [
        {
            when: response => applicationType === 'gateway' || applicationType === 'microservice' || applicationType === 'uaa',
            type: 'input',
            name: 'serverPort',
            validate: input => (/^([0-9]*)$/.test(input) ? true : 'This is not a valid port number.'),
            message:
                'As you are running in a microservice architecture, on which port would like your server to run? It should be unique to avoid port conflicts.',
            default: defaultPort
        },
        {
            type: 'list',
            name: 'authenticationType',
            message: `Which ${chalk.yellow('*type*')} of authentication would you like to use?`,
            choices: [
                { value: 'jwt', name: 'JWT authentication (stateless, with a token)' },
                { value: 'oauth2', name: 'OAuth 2.0 / OIDC Authentication (stateful, works with Okta)' }
            ],
            default: 'jwt'
        }
    ];

    const answers = await this.prompt(PROMPT);
    this.serverPort = answers.serverPort;
    this.authenticationType = answers.authenticationType;

    if (this.serverPort === undefined) {
        this.serverPort = defaultPort;
    }
}

async function askForDatabaseType() {
    if (this.existingProject) return;
    const PROMPT = [
        {
            type: 'list',
            name: 'prodDatabaseType',
            message: `Which ${chalk.yellow('*production*')} database would you like to use?`,
            choices: [
                { value: 'mysql', name: 'MySQL or MariaDB' },
                { value: 'postgresql', name: 'PostgreSQL or CockroachDB' },
                { value: 'oracle', name: 'Oracle (Please follow our documentation to use the Oracle proprietary driver)' },
                { value: 'mssql', name: 'Microsoft SQL Server' },
                { value: MONGODB, name: 'MongoDB' }
            ],
            default: 'mysql'
        }
    ];

    const answers = await this.prompt(PROMPT);
    if (answers.prodDatabaseType === MONGODB) {
        this.databaseType = MONGODB;
        this.devDatabaseType = MONGODB;
    } else {
        this.databaseType = 'sql';
        this.devDatabaseType = 'sqlite';
    }
    this.prodDatabaseType = answers.prodDatabaseType;
}
