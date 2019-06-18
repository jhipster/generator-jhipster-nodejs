module.exports = {
    askForMainServerSideOpts
};

function askForMainServerSideOpts(meta) {
    if (!meta && this.existingProject) return;

    const applicationType = this.applicationType;

    const PROMPT = [
        {
            type: 'input',
            name: 'serverPort',
            when: applicationType === 'monolith',
            message: 'Which *Port* would you like to start your NestJS server?',
            default: '8081'
        },
        {
            type: 'list',
            name: 'serverPackageManager',
            when: applicationType === 'monolith',
            message: 'Which *Package Manager* would you like for server?',
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
    ];

    if (applicationType !== 'monolith') {
        this.log.error('For now only monolithic app type is allowed!');
        process.exit(0);
    }

    if (meta) return PROMPT; // eslint-disable-line consistent-return

    const done = this.async();

    this.prompt(PROMPT).then(prompt => {
        this.serverPort = prompt.serverPort;
        this.serverPackageManager = prompt.serverPackageManager;
        done();
    });
}
