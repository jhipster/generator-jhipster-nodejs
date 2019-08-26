/**
 * Copyright 2013-2019 the original author or authors from the JHipster project.
 *
 * This file is part of the JHipster project, see https://www.jhipster.tech/
 * for more information.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const jhipsterUtils = require('generator-jhipster/generators/utils');
const constants = require('../generator-nodejs-constants');


module.exports = {
    addEntityToAppModuleImport,
    addEntityToAppModule
};

function addEntityToAppModuleImport(generator, entityName, fileName) {
    jhipsterUtils.rewriteFile(
        {
            file: `${constants.SERVER_NODEJS_SRC_DIR}/src/app.module.ts`,
            needle: 'jhipster-needle-add-entity-module-to-main-import',
            splicable: [`import { ${entityName}Module } from './module/${fileName}.module';`]
        },
        generator
    );
}

function addEntityToAppModule(generator, entityName, fileName) {
    jhipsterUtils.rewriteFile(
        {
            file: `${constants.SERVER_NODEJS_SRC_DIR}/src/app.module.ts`,
            needle: 'jhipster-needle-add-entity-module-to-main',
            splicable: [`${entityName}Module,`]
        },
        generator
    );
}

// NEED TEST

function addControllerToAppModuleImport(generator, controllerName, fileName) {
    jhipsterUtils.rewriteFile(
        {
            file: `${constants.SERVER_NODEJS_SRC_DIR}/src/app.module.ts`,
            needle: 'jhipster-needle-add-controller-module-to-main-import',
            splicable: [`import { ${controllerName}Module } from './web/rest/${fileName}.module';`]
        },
        generator
    );
}

function addControllerToAppModule(generator, controllerName, fileName) {
    jhipsterUtils.rewriteFile(
        {
            file: `${constants.SERVER_NODEJS_SRC_DIR}/src/app.module.ts`,
            needle: 'jhipster-needle-add-controller-module-to-main',
            splicable: [`${controllerName}Module,`]
        },
        generator
    );
}
