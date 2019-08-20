const chalk = require('chalk');

module.exports = {
    askForMainServerSideOpts
};

function askForMainServerSideOpts(meta) {
    if (!meta && this.existingProject) return;

    const applicationType = this.applicationType;

    const PROMPT = [
        /* {
            type: 'input',
            name: 'baseName',
            when: applicationType === 'monolith',
            validate(text) {
                return text ? true : 'The base application port cannot be empty!';
            },
            message: `What is ${chalk.yellow('*base name*')} of your node application?`
        },
        {
            type: 'input',
            name: 'serverPort',
            when: applicationType === 'monolith',
            validate(text) {
                return text ? true : 'The base application port cannot be empty!';
            },
            message: `Which ${chalk.yellow('*port*')} would you like to start your NestJS server?`,
            default: '8081'
        },
        {
            type: 'list',
            name: 'serverPackageManager',
            when: applicationType === 'monolith',
            message: `Which ${chalk.yellow('*package manager*')} would you like for server?`,
            choices: [
                {
                    value: 'npm',
                    name: 'Npm'
                },
                {
                    value: 'yarn',
                    name: 'Yarn'
                }
            ],
            default: 'npm'
        }
        */
    ];

    if (applicationType !== 'monolith') {
        this.log.error(`For now ${chalk.red('only monolitich app type')} is allowed!`);
        process.exit(0);
    }

    if (meta) return PROMPT; // eslint-disable-line consistent-return

    const done = this.async();

    this.prompt(PROMPT).then(prompt => {
        this.serverPort = prompt.serverPort;
        this.serverPackageManager = prompt.serverPackageManager;
        this.baseName = prompt.baseName;
        done();
    });
}
