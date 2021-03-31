/* eslint-disable consistent-return */
const chalk = require('chalk');
const EntitiesGenerator = require('generator-jhipster/generators/entities');

module.exports = class extends EntitiesGenerator {
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

    get composing() {
        const composePhaseFromJHipster = super._composing();
        composePhaseFromJHipster.databaseChangelog = {};
        return composePhaseFromJHipster;
    }

    get default() {
        // Here we are not overriding this phase and hence its being handled by JHipster
        return super._default();
    }

    get writing() {
        return this._writing();
    }
};
