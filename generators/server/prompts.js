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
            name: 'prodDatabaseType',
            message: `Which ${chalk.yellow('*production*')} database would you like to use?`,
            choices: response => {
                const opts = [];
                opts.push({
                    value: 'sqlite',
                    name: 'SQLite'
                });
                opts.push({
                    value: 'mongodb',
                    name: 'MongoDB'
                });
                opts.push({
                    value: 'mysql',
                    name: 'MySQL or MariaDB'
                });
                opts.push({
                    value: 'postgresql',
                    name: 'PostgreSQL or CockroachDB'
                });
                opts.push({
                    value: 'oracle',
                    name: 'Oracle (Please follow our documentation to use the Oracle proprietary driver)'
                });
                opts.push({
                    value: 'mssql',
                    name: 'Microsoft SQL Server'
                });
                return opts;
            },
            default: 0
        }
    ];

    if (meta) return PROMPT; // eslint-disable-line consistent-return

    const done = this.async();

    this.prompt(PROMPT).then(prompt => {
        if (prompt.serverPort) {
            this.serverPort = prompt.serverPort;
        } else {
            this.serverPort = defaultPort;
        }
        this.devDatabaseType = 'sqlite';
        this.prodDatabaseType = prompt.prodDatabaseType;

        if (this.prodDatabaseType === 'mongodb') {
            this.databaseType = 'mongodb';
        } else {
            this.databaseType = 'sql';
        }

        done();
    });
}
