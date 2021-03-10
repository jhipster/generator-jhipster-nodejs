/**
 * Modified from:
 *  https://github.com/jhipster/generator-jhipster/blob/v6.8.0/generators/app/prompts.js
 */
const chalk = require('chalk');
const generatorDefaults = require('generator-jhipster/generators/generator-defaults').defaultConfig;

module.exports = {
    askForApplicationType
};

async function askForApplicationType() {
    if (this.existingProject) return;

    const applicationTypeChoices = [
        {
            value: 'monolith',
            name: 'Monolithic application (recommended for simple projects)'
        },
        {
            value: 'gateway',
            name: 'Gateway application'
        },
        {
            value: 'microservice',
            name: 'Microservice application'
        },
        {
            value: 'uaa',
            name: 'JHipster UAA server'
        }
    ];

    const answers = await this.prompt([
        {
            type: 'list',
            name: 'applicationType',
            message: `Which ${chalk.yellow('*type*')} of application would you like to create?`,
            choices: applicationTypeChoices,
            default: generatorDefaults.applicationType
        }
    ]);
    this.applicationType = this.jhipsterConfig.applicationType = answers.applicationType;
}
