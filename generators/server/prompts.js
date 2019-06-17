module.exports = {
    askForMainServer,
    askForPackageManager,
    askForMainServerSideOpts
};

function askForMainServer(meta) {
    if (!meta && this.existingProject) return;

    const applicationType = this.applicationType;

    const choices = [
        {
            value: 'node',
            name: 'NodeJS'
        },
        {
            value: 'java',
            name: 'Java'
        }
    ];

    const PROMPT = {
        type: 'list',
        name: 'serverFramework',
        when: applicationType === 'monolith',
        message: 'Which *Framework* would you like to use for the server?',
        choices,
        default: 'node'
    };

    if (meta) return PROMPT; // eslint-disable-line consistent-return

    const done = this.async();

    this.prompt(PROMPT).then(prompt => {
        this.serverFramework = prompt.serverFramework;
        done();
    });
}

function askForPackageManager(meta) {
    if (!meta && this.existingProject) return;
    const defaultPackageManager = 'npm';
    const applicationType = this.applicationType;
    const serverFramework = this.serverFramework;
    const choices = [
        {
            value: 'npm',
            name: 'Npm'
        },
        {
            value: 'yarn',
            name: 'Yarn'
        }
    ];

    const PROMPT = {
        when: serverFramework === 'node' && applicationType === 'monolith',
        type: 'list',
        name: 'packageManager',
        message: 'Which **Package Manager** Would you like to use?',
        choices,
        default: defaultPackageManager
    };

    if (meta) return PROMPT; // eslint-disable-line consistent-return

    const done = this.async();

    this.prompt(PROMPT).then(prompt => {
        this.packageManager = prompt.packageManager;
        done();
    });
}

function askForMainServerSideOpts() {
    if (this.existingProject) return;

    const done = this.async();
    const prompts = [
        {
            type: 'confirm',
            name: 'useSass',
            message: 'Would you like to use the LibSass stylesheet preprocessor for your CSS?',
            default: false
        }
    ];
    this.prompt(prompts).then(props => {
        this.useSass = props.useSass;
        done();
    });
}
