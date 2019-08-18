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

const utils = require('../utils');

/**
 * The default is to use a file path string. It implies use of the template method.
 * For any other config an object { file:.., method:.., template:.. } can be used
 */
const serverFiles = {
    server: [
        {
            templates: [
                {
                    file: 'src/domain/entity.model.ts',
                    renameTo: generator => `src/domain/${generator.entityFileName}.model.ts`
                },
                {
                    file: 'src/module/entity.module.ts',
                    renameTo: generator => `src/modules/${generator.entityFolderName}/${generator.entityFileName}.module.ts`
                },
                {
                    file: 'src/module/entity.repository.ts',
                    renameTo: generator => `src/modules/${generator.entityFolderName}/${generator.entityFileName}.repository.ts`
                },
                {
                    file: 'src/module/entity.controller.ts',
                    renameTo: generator => `src/modules/${generator.entityFolderName}/${generator.entityFileName}.controller.ts`
                },
                {
                    file: 'src/module/entity.controller.spec.ts',
                    renameTo: generator => `src/modules/${generator.entityFolderName}/${generator.entityFileName}.contoller.spec.ts`
                }
            ]
        }
        // ,
        // {
        //     condition: generator => generator.jpaMetamodelFiltering,
        //     path: SERVER_MAIN_SRC_DIR,
        //     templates: [
        //         {
        //             file: 'service/dto/EntityCriteria.ts',
        //             renameTo: generator => `${generator.packageFolder}/service/dto/${generator.entityClass}Criteria.ts`
        //         },
        //         {
        //             file: 'service/EntityQueryService.ts',
        //             renameTo: generator => `${generator.packageFolder}/service/${generator.entityClass}QueryService.ts`
        //         }
        //     ]
        // }
        //     ,
        //     {
        //         condition: generator => generator.searchEngine === 'elasticsearch',
        //         path: SERVER_MAIN_SRC_DIR,
        //         templates: [
        //             {
        //                 file: 'repository/search/EntitySearchRepository.ts',
        //                 renameTo: generator => `${generator.packageFolder}/repository/search/${generator.entityClass}SearchRepository.ts`
        //             }
        //         ]
        //     },
        //     {
        //         condition: generator => generator.reactive && ['mongodb', 'cassandra', 'couchbase'].includes(generator.databaseType),
        //         path: SERVER_MAIN_SRC_DIR,
        //         templates: [
        //             {
        //                 file: 'repository/reactive/EntityReactiveRepository.ts',
        //                 renameTo: generator => `${generator.packageFolder}/repository/reactive/${generator.entityClass}ReactiveRepository.ts`
        //             }
        //         ]
        //     },
        //     {
        //         condition: generator => generator.service === 'serviceImpl',
        //         path: SERVER_MAIN_SRC_DIR,
        //         templates: [
        //             {
        //                 file: 'service/EntityService.ts',
        //                 renameTo: generator => `${generator.packageFolder}/service/${generator.entityClass}Service.ts`
        //             },
        //             {
        //                 file: 'service/impl/EntityServiceImpl.ts',
        //                 renameTo: generator => `${generator.packageFolder}/service/impl/${generator.entityClass}ServiceImpl.ts`
        //             }
        //         ]
        //     },
        //     {
        //         condition: generator => generator.service === 'serviceClass',
        //         path: SERVER_MAIN_SRC_DIR,
        //         templates: [
        //             {
        //                 file: 'service/impl/EntityServiceImpl.ts',
        //                 renameTo: generator => `${generator.packageFolder}/service/${generator.entityClass}Service.ts`
        //             }
        //         ]
        //     },
        //     {
        //         condition: generator => generator.dto === 'mapstruct',
        //         path: SERVER_MAIN_SRC_DIR,
        //         templates: [
        //             {
        //                 file: 'service/dto/EntityDTO.ts',
        //                 renameTo: generator => `${generator.packageFolder}/service/dto/${generator.asDto(generator.entityClass)}.ts`
        //             },
        //             {
        //                 file: 'service/mapper/BaseEntityMapper.ts',
        //                 renameTo: generator => `${generator.packageFolder}/service/mapper/EntityMapper.ts`
        //             },
        //             {
        //                 file: 'service/mapper/EntityMapper.ts',
        //                 renameTo: generator => `${generator.packageFolder}/service/mapper/${generator.entityClass}Mapper.ts`
        //             }
        //         ]
        //     }
    ]
};

module.exports = {
    writeFiles,
    serverFiles
};

function writeFiles() {
    if (this.skipServer) return;

    this.writeFilesToDisk(serverFiles, this, false);

    this.fields.forEach(field => {
        if (field.fieldIsEnum === true) {
            const fieldType = field.fieldType;
            const enumInfo = utils.buildEnumInfo(field, this.angularAppName, this.packageName, this.clientRootFolder);
            this.template('src/domain/enumeration/Enum.ts.ejs', `src/domain/enumeration/${fieldType}.ts`, this, {}, enumInfo);
        }
    });

    utils.addEntityToAppModuleImport(this, this.entityAngularName, this.entityFileName, this.entityFolderName);
    utils.addEntityToAppModule(this, this.entityAngularName, this.entityFileName, this.entityFolderName);
}
