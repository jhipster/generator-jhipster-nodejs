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
    }

    get initializing() {
        const initPhaseFromJHipster = super._initializing();
        const initNodeLanguagesPhaseSteps = {
            // avoid logging languages in server side
            avoidLogging() {
                this.skipServer = true;
            }
        };
        return { ...initPhaseFromJHipster, ...initNodeLanguagesPhaseSteps };

        // Here we are not overriding this phase and hence its being handled by JHipster
        // return super._initializing();
    }

    get prompting() {
        return super._prompting();
    }

    get configuring() {
        let defaultPhaseFromJHipster = this._configuring();
        if (this.options.languages) {
            defaultPhaseFromJHipster = {};
        }
        return defaultPhaseFromJHipster;
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
        return { ...defaultPhaseFromJHipster, ...defaultNodeLanguagesPhaseSteps };

        // Here we are not overriding this phase and hence its being handled by JHipster
        // return super._default();
    }

    get writing() {
        const phaseFromJHipster = super._writing();
        const jhipsterNodeLanguagesPhaseSteps = {
            // overwrite home.json file
            writeHomeJSON() {
                if (!this.skipClient) {
                    this.languagesToApply.forEach(language => {
                        if (language === 'en' || language === 'it' || language === 'es') {
                            const path = `${jhipsterConstants.CLIENT_MAIN_SRC_DIR}i18n/${language}/home.json`;
                            this.template(path, path);
                        }
                    });
                }
            }
        };
        return { ...phaseFromJHipster, ...jhipsterNodeLanguagesPhaseSteps };
    }
};
