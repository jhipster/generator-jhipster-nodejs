const chalk = require('chalk');

module.exports = {
    askForModuleName,
    askForMainServerSideOpts
};

function askForModuleName() {
    if (this.baseName) return;

    this.askModuleName(this);
}

function askForMainServerSideOpts(meta) {
    if (!meta && this.existingProject) return;

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
        },
        {
            type: 'list',
            name: 'prodDatabaseType',
            message: `Which ${chalk.yellow('*production*')} database would you like to use?`,
            choices: [
                /* {   value: 'mongodb',
                name: 'MongoDB' }, */
                { value: 'mysql', name: 'MySQL or MariaDB' },
                { value: 'postgres', name: 'PostgreSQL or CockroachDB' },
                { value: 'oracle', name: 'Oracle (Please follow our documentation to use the Oracle proprietary driver)' },
                { value: 'mssql', name: 'Microsoft SQL Server' }
            ],
            default: 'mysql'
        }
    ];

    if (meta) return PROMPT; // eslint-disable-line consistent-return

    const done = this.async();

    this.prompt(PROMPT).then(prompt => {
        this.databaseType = 'sql';
        this.devDatabaseType = 'sqlite';
        this.prodDatabaseType = prompt.prodDatabaseType;
        this.serverPort = prompt.serverPort;
        this.authenticationType = prompt.authenticationType;

        if (this.serverPort === undefined) {
            this.serverPort = defaultPort;
        }

        /*
        if (this.prodDatabaseType === 'mongodb') {
            this.databaseType = 'mongodb';
        }
        */

        done();
    });
}
