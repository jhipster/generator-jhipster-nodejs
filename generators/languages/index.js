/* eslint-disable consistent-return */
const chalk = require('chalk');
// const constants = require('generator-jhipster/generators/generator-constants');
const LanguagesGenerator = require('generator-jhipster/generators/languages');

module.exports = class extends LanguagesGenerator {
    constructor(args, opts) {
        super(args, Object.assign({ fromBlueprint: true }, opts)); // fromBlueprint variable is important

        const jhContext = (this.jhipsterContext = this.options.jhipsterContext);

        if (!jhContext) {
            this.error(`This is a JHipster blueprint and should be used only like ${chalk.yellow('jhipster --blueprints nodejs')}`);
        }

        this.configOptions = jhContext.configOptions || {};
    }

    get initializing() {
        // Here we are not overriding this phase and hence its being handled by JHipster
        return super._initializing();
    }

    get prompting() {
        // Here we are not overriding this phase and hence its being handled by JHipster
        return super._prompting();
    }

    get default() {
        // Here we are not overriding this phase and hence its being handled by JHipster
        return super._default();
    }

    get writing() {
        const writePhaseFromJHipster = super._writing();
        const writeNodeLanguagesPhaseSteps = {
            write() {
                if (!this.skipClient) {
                    this.updateLanguagesInLanguagePipe(this.languages);
                    this.updateLanguagesInLanguageConstantNG2(this.languages);
                    this.updateLanguagesInWebpack(this.languages);
                    if (this.clientFramework === 'angularX') {
                        this.updateLanguagesInMomentWebpackNgx(this.languages);
                    }
                    if (this.clientFramework === 'react') {
                        this.updateLanguagesInMomentWebpackReact(this.languages);
                    }
                }
            }
        };
        return Object.assign(writePhaseFromJHipster, writeNodeLanguagesPhaseSteps);

        // Here we are not overriding this phase and hence its being handled by JHipster
        // return writePhaseFromJHipster;
    }
};
