const jhipsterUtils = require('generator-jhipster/generators/utils');
const _ = require('lodash');
const constants = require('./generator-nodejs-constants');

module.exports = {
    addEntityToAppModuleImport,
    addEntityToAppModule,
    addControllerToAppModuleImport,
    addControllerToAppModule,
    addServiceToAppModuleImport,
    addServiceToAppModule,
    buildEnumInfo
};

/**
 * add entity import to app module
 * @param {any} generator
 * @param {string} entityClass
 * @param {string} entityFileName
 */
function addEntityToAppModuleImport(generator, entityClass, entityFileName) {
    jhipsterUtils.rewriteFile(
        {
            file: `${constants.SERVER_NODEJS_SRC_DIR}/src/app.module.ts`,
            needle: 'jhipster-needle-add-entity-module-to-main-import',
            splicable: [`import { ${entityClass}Module } from './module/${entityFileName}.module';`]
        },
        generator
    );
}

/**
 * add entity module to app module
 * @param {any} generator
 * @param {string} entityClass
 */
function addEntityToAppModule(generator, entityClass) {
    jhipsterUtils.rewriteFile(
        {
            file: `${constants.SERVER_NODEJS_SRC_DIR}/src/app.module.ts`,
            needle: 'jhipster-needle-add-entity-module-to-main',
            splicable: [`${entityClass}Module,`]
        },
        generator
    );
}

/**
 * add controller import to app module
 * @param {any} generator
 * @param {string} controllerClass
 * @param {string} controllerFileName
 */
function addControllerToAppModuleImport(generator, controllerClass, controllerFileName) {
    jhipsterUtils.rewriteFile(
        {
            file: `${constants.SERVER_NODEJS_SRC_DIR}/src/app.module.ts`,
            needle: 'jhipster-needle-add-controller-module-to-main-import',
            splicable: [`import { ${controllerClass}Controller } from './web/rest/${controllerFileName}.controller';`]
        },
        generator
    );
}

/**
 * add controller module to app module
 * @param {any} generator
 * @param {string} controllerClass
 */
function addControllerToAppModule(generator, controllerClass) {
    jhipsterUtils.rewriteFile(
        {
            file: `${constants.SERVER_NODEJS_SRC_DIR}/src/app.module.ts`,
            needle: 'jhipster-needle-add-controller-module-to-main',
            splicable: [`${controllerClass}Controller,`]
        },
        generator
    );
}

/**
 * add service import to app module
 * @param {any} generator
 * @param {string} serviceClass
 * @param {string} serviceFileName
 */
function addServiceToAppModuleImport(generator, serviceClass, serviceFileName) {
    jhipsterUtils.rewriteFile(
        {
            file: `${constants.SERVER_NODEJS_SRC_DIR}/src/app.module.ts`,
            needle: 'jhipster-needle-add-service-module-to-main-import',
            splicable: [`import { ${serviceClass}Service } from './service/${serviceFileName}.service';`]
        },
        generator
    );
}

/**
 * add service module to app module
 * @param {any} generator
 * @param {string} serviceClass
 */
function addServiceToAppModule(generator, serviceClass) {
    jhipsterUtils.rewriteFile(
        {
            file: `${constants.SERVER_NODEJS_SRC_DIR}/src/app.module.ts`,
            needle: 'jhipster-needle-add-service-module-to-main',
            splicable: [`${serviceClass}Service,`]
        },
        generator
    );
}

/**
 * Build an enum object
 * @param {any} field : entity field
 * @param {string} angularAppName
 * @param {string} packageName
 * @param {string} clientRootFolder
 */
function buildEnumInfo(field, angularAppName, packageName, clientRootFolder) {
    const fieldType = field.fieldType;
    field.enumInstance = _.lowerFirst(fieldType);

    return {
        enumName: fieldType,
        enumValues: field.fieldValues.split(','),
        enumInstance: field.enumInstance,
        enums: field.fieldValues.replace(/\s/g, '').split(','),
        angularAppName,
        packageName,
        clientRootFolder: clientRootFolder ? `${clientRootFolder}-` : ''
    };
}
