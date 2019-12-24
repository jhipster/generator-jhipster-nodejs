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

const constants = require('../generator-nodejs-constants');

const SERVER_NODEJS_DIR = `${constants.SERVER_NODEJS_SRC_DIR}/`;
const utils = require('../utils');

/**
 * The default is to use a file path string. It implies use of the template method.
 * For any other config an object { file:.., method:.., template:.. } can be used
 */
const serverFiles = {
    server: [
        {
            path: SERVER_NODEJS_DIR,
            templates: [
                {
                    file: 'src/domain/entity.ts',
                    renameTo: generator => `src/domain/${generator.entityFileName}.entity.ts`
                },
                {
                    file: 'src/module/entity.module.ts',
                    renameTo: generator => `src/module/${generator.entityFileName}.module.ts`
                },
                {
                    file: 'src/repository/entity.repository.ts',
                    renameTo: generator => `src/repository/${generator.entityFileName}.repository.ts`
                },
                {
                    file: 'src/web/rest/entity.controller.ts',
                    renameTo: generator => `src/web/rest/${generator.entityFileName}.controller.ts`
                },
                {
                    file: 'src/web/rest/entity.controller.spec.ts',
                    renameTo: generator => `src/web/rest/${generator.entityFileName}.controller.spec.ts`
                }
            ]
        }
    ]
};

module.exports = {
    writeFiles
};

function writeFiles() {
    return {
        customEntityServerFiles() {
            if (this.skipServer) return;

            this.writeFilesToDisk(serverFiles, this, false);

            this.fields.forEach(field => {
                if (field.fieldIsEnum === true) {
                    const fieldType = field.fieldType;
                    const enumInfo = utils.buildEnumInfo(field, this.angularAppName, this.packageName, this.clientRootFolder);
                    this.template(
                        `${SERVER_NODEJS_DIR}src/domain/enumeration/Enum.ts.ejs`,
                        `${SERVER_NODEJS_DIR}src/domain/enumeration/${fieldType}.ts`,
                        this,
                        {},
                        enumInfo
                    );
                }
            });

            utils.addEntityToAppModuleImport(this, this.entityClass, this.entityFileName);
            utils.addEntityToAppModule(this, this.entityClass);
        }
    };
}
