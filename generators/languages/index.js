/* eslint-disable consistent-return */
const chalk = require('chalk');
// const path = require('path');
const LanguagesGenerator = require('generator-jhipster/generators/languages');
// const constants = require('generator-jhipster/generators/generator-constants');
// const statistics = require('generator-jhipster/generators/statistics');
// const writeFiles = require('./files1').writeFiles;

module.exports = class extends LanguagesGenerator {
    constructor(args, opts) {
        super(args, { fromBlueprint: true, ...opts }); // fromBlueprint variable is important

        // this.error(`asfafd`);
        const jhContext = (this.jhipsterContext = this.options.jhipsterContext);

        if (!jhContext) {
            this.error(`This is a JHipster blueprint and should be used only like ${chalk.yellow('jhipster --blueprint myown')}`);
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

    get configuring() {
        // Here we are not overriding this phase and hence its being handled by JHipster
        return super._configuring();
    }

    get default() {
        // Here we are not overriding this phase and hence its being handled by JHipster
        return super._default();
    }

    get writing() {
        const phaseFromJHipster = super._writing();
        const myCustomPhaseSteps = writeFiles();
        return Object.assign(phaseFromJHipster, myCustomPhaseSteps);
    }

    // installI18nClientFilesByLanguage(_this, webappDir, lang) {
    //     const generator = _this || this;
    //     // const prefix = this.fetchFromInstalledNHipster('languages/templates');
    //     const prefix = this.fetchFromInstalledNHipster('templates');
    //     // this.error(`prefix: ${prefix}`);
    //     // if ((generator.databaseType !== 'no' || generator.authenticationType === 'uaa') && generator.databaseType !== 'cassandra') {
    //     //     generator.copyI18nFilesByName(generator, webappDir, 'audits.json', lang);
    //     // }
    //     // if (generator.applicationType === 'gateway' && generator.serviceDiscoveryType) {
    //     //     generator.copyI18nFilesByName(generator, webappDir, 'gateway.json', lang);
    //     // }
    //     // generator.copyI18nFilesByName(generator, webappDir, 'configuration.json', lang);
    //     // generator.copyI18nFilesByName(generator, webappDir, 'error.json', lang);
    //     // generator.copyI18nFilesByName(generator, webappDir, 'login.json', lang);
    //     generator.copyI18nFilesByName(generator, webappDir, 'home.json', lang);
    //     // generator.copyI18nFilesByName(generator, webappDir, 'metrics.json', lang);
    //     // generator.copyI18nFilesByName(generator, webappDir, 'logs.json', lang);
    //     // generator.copyI18nFilesByName(generator, webappDir, 'password.json', lang);
    //     // generator.copyI18nFilesByName(generator, webappDir, 'register.json', lang);
    //     // generator.copyI18nFilesByName(generator, webappDir, 'sessions.json', lang);
    //     // generator.copyI18nFilesByName(generator, webappDir, 'settings.json', lang);
    //     // generator.copyI18nFilesByName(generator, webappDir, 'user-management.json', lang);

    //     // tracker.json for Websocket
    //     if (this.websocket === 'spring-websocket') {
    //         generator.copyI18nFilesByName(generator, webappDir, 'tracker.json', lang);
    //     }

    //     // Templates
    //     // generator.template(`${prefix}/${webappDir}i18n/${lang}/activate.json.ejs`, `${webappDir}i18n/${lang}/activate.json`);
    //     generator.template(`${prefix}/${webappDir}i18n/${lang}/global.json.ejs`, `${webappDir}i18n/${lang}/global.json`);
    //     // generator.template(`${prefix}/${webappDir}i18n/${lang}/health.json.ejs`, `${webappDir}i18n/${lang}/health.json`);
    //     // generator.template(`${prefix}/${webappDir}i18n/${lang}/reset.json.ejs`, `${webappDir}i18n/${lang}/reset.json`);
    // }

    /**
     * Fetch files from the generator-jhipster instance installed
     * @param {string} subpath : the path to fetch from
     */
    // fetchFromInstalledNHipster(subpath) {
    //     return path.join(__dirname, subpath);
    // }

    get install() {
        // Here we are not overriding this phase and hence its being handled by JHipster
        return super._install();
    }

    get end() {
        // Here we are not overriding this phase and hence its being handled by JHipster
        return super._end();
    }
};

const clientFiles = {
    common: [
        {
            condition: generator => true,
            templates: ['src/main/webapp/i18n/al/home.json']
        }
    ]
    // angularMain: [
    //     {
    //         condition: generator => generator.clientFramework === 'angularX',
    //         templates: [
    //             {
    //                 file: 'angular/home/home.component.html',
    //                 method: 'processHtml',
    //                 renameTo: () => `${ANGULAR_DIR}home/home.component.html`
    //             }
    //         ]
    //     }
    // ],
    // reactMain: [
    //     {
    //         condition: generator => generator.clientFramework === 'react',
    //         templates: [
    //             {
    //                 file: 'react/home/home.tsx',
    //                 method: 'processJsx',
    //                 renameTo: () => `${REACT_DIR}modules/home/home.tsx`
    //             }
    //         ]
    //     }
    // ]
};

function writeFiles() {
    return {
        overrideFiles() {
            this.writeFilesToDisk(clientFiles, this, false);
        }
    };
}
