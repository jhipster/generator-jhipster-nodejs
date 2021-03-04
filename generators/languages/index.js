/* eslint-disable consistent-return */
const chalk = require('chalk');
const jhipsterConstants = require('generator-jhipster/generators/generator-constants');
const LanguagesGenerator = require('generator-jhipster/generators/languages');

module.exports = class extends LanguagesGenerator {
    constructor(args, opts) {
        super(args, { fromBlueprint: true, ...opts }); // fromBlueprint variable is important

        const jhLanguagesContext = (this.jhipsterContext = this.options.jhipsterContext);

        if (!jhLanguagesContext) {
            this.error(`This is a JHipster blueprint and should be used only like ${chalk.yellow('jhipster --blueprints nodejs')}`);
        }

        this.configOptions = jhLanguagesContext.configOptions || {};
    }

    get initializing() {
        const initPhaseFromJHipster = super._initializing();
        const initNodeLanguagesPhaseSteps = {
            // avoid logging languages in server side
            validateFromCli() {
                this.checkInvocationFromCLI();
                this.skipServer = true;
            }
        };
        return Object.assign(initPhaseFromJHipster, initNodeLanguagesPhaseSteps);

        // Here we are not overriding this phase and hence its being handled by JHipster
        // return super._initializing();
    }

    get composing() {
        return this._composing();
    }

    get loading() {
        return this._loading();
    }

    get preparing() {
        return this._preparing();
    }

    get default() {
        const defaultPhaseFromJHipster = super._default();
        const defaultNodeLanguagesPhaseSteps = {
            // disable languages translation in server side
            disableLanguagesForJHipsterServer() {
                this.skipServer = true;
                this.skipUserManagement = true;
            }
        };
        return Object.assign(defaultPhaseFromJHipster, defaultNodeLanguagesPhaseSteps);

        // Here we are not overriding this phase and hence its being handled by JHipster
        // return super._default();
    }

    get writing() {
        const phaseFromJHipster = super._writing();
        const jhipsterNodeLanguagesPhaseSteps = {
            // overwrite home.json file
            writeHomeJSON() {
                this.languagesToApply.forEach(language => {
                    const path = `${jhipsterConstants.CLIENT_MAIN_SRC_DIR}i18n/${language}/home.json`;
                    this.template(path, path);
                });
            }
        };
        return Object.assign(phaseFromJHipster, jhipsterNodeLanguagesPhaseSteps);
    }

    get postWriting() {
        return this._postWriting();
    }
};
