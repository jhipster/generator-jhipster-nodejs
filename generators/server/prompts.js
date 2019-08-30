// const chalk = require('chalk');

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
            name: 'mongoProdDatabase',
            message: 'Would you like to use mongodb in prod?',
            choices: response => {
                const opts = [];

                opts.push({
                    value: false,
                    name: 'No'
                });

                opts.push({
                    value: true,
                    name: 'Yes'
                });

                return opts;
            },
            default: 0
        }
    ];

    if (meta) return PROMPT; // eslint-disable-line consistent-return

    const done = this.async();

    this.prompt(PROMPT).then(prompt => {
        this.serverPort = prompt.serverPort;
        this.mongoProdDatabase = prompt.mongoProdDatabase;

        done();
    });
}
