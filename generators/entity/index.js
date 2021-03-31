/* eslint-disable consistent-return */
const chalk = require('chalk');
const EntityGenerator = require('generator-jhipster/generators/entity');

module.exports = class extends EntityGenerator {
    constructor(args, opts) {
        super(args, { fromBlueprint: true, ...opts }); // fromBlueprint variable is important

        if (!this.jhipsterContext) {
            this.error(`This is a JHipster blueprint and should be used only like ${chalk.yellow('jhipster --blueprints nodejs')}`);
        }

        this.options.skipDbChangelog = true;
    }

    get initializing() {
        return super._initializing();
    }

    get prompting() {
        return this._prompting();
    }

    get configuring() {
        const defaultPhaseFromJHipster = super._configuring();
        const defaultNodeClientPhaseSteps = {
            // variables to use in templates
            setupCustomEntityClientConsts() {
                this.context.protractorTests = true;
            }
        };
        return { ...defaultPhaseFromJHipster, ...defaultNodeClientPhaseSteps };
    }

    get composing() {
        return super._composing();
    }

    get loading() {
        return this._loading();
    }

    get preparing() {
        return this._preparing();
    }

    get preparingFields() {
        return this._preparingFields();
    }

    get preparingRelationships() {
        return this._preparingRelationships();
    }

    get default() {
        // Here we are not overriding this phase and hence its being handled by JHipster
        return super._default();
    }

    get writing() {
        return this._writing();
    }

    get install() {
        // Here we are not overriding this phase and hence its being handled by JHipster
        return super._install();
    }

    get end() {
        // Here we are not overriding this phase and hence its being handled by JHipster
        return super._end();
    }
};
