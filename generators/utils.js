const jhipsterUtils = require('generator-jhipster/generators/utils');
const _ = require('lodash');
const constants = require('./generator-nodejs-constants');

module.exports = {
    addEntityToAppModuleImport,
    addEntityToAppModule,
    addControllerToAppModuleImport,
    addControllerToAppModule,
    buildEnumInfo
};

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

function addEntityToAppModule(generator, entityClass) {
    jhipsterUtils.rewriteFile(
        {
            file: `${constants.SERVER_NODEJS_SRC_DIR}/src/app.module.ts`,
            needle: 'jhipster-needle-add-entity-module-to-main',
            splicable: [`,${entityClass}Module`]
        },
        generator
    );
}

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
 * Build an enum object
 * @param {any} field : entity field
 * @param {string} angularAppName
 * @param {string} packageName
 */
function buildEnumInfo(field, angularAppName, packageName, clientRootFolder) {
    const fieldType = field.fieldType;
    field.enumInstance = _.lowerFirst(fieldType);
    const enumInfo = {
        enumName: fieldType,
        enumValues: field.fieldValues.split(',').join(', '),
        enumInstance: field.enumInstance,
        enums: field.fieldValues.replace(/\s/g, '').split(','),
        angularAppName,
        packageName,
        clientRootFolder: clientRootFolder ? `${clientRootFolder}-` : ''
    };
    return enumInfo;
}
