/**
 * Copyright 2013-2019 the original author or authors from the JHipster project.
 *
 * This file is part of the JHipster project, see https://www.jhipster.tech/
 * for more information.
 *
 * Licensed under the Apache License, Version 2.0 (the License);
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

module.exports = {
    writeFiles
};

const serverFiles = {
    common: [
        {
            path: SERVER_NODEJS_DIR,
            templates: [
                'src/web/rest/user.controller.ts',
                'src/web/rest/account.controller.ts',
                'src/web/rest/auth.controller.ts',
                'src/web/rest/management.controller.ts',
                'src/web/rest/management.controller.spec.ts',
                'src/repository/user.repository.ts',
                'src/repository/authority.repository.ts',
                'src/module/user.module.ts',
                'src/module/auth.module.ts',
                'src/config/application-dev.yml',
                'src/config/application-test.yml',
                'src/config/config.ts',
                'src/config/application-prod.yml',
                'src/config/application.yml',
                'src/domain/base/pagination.entity.ts',
                'src/domain/base/base.entity.ts',
                'src/domain/user.entity.ts',
                'src/domain/authority.entity.ts',
                'src/security/guards/roles.guard.ts',
                'src/security/guards/auth.guard.ts',
                'src/security/role-type.ts',
                'src/security/decorators/auth-user.decorator.ts',
                'src/security/decorators/roles.decorator.ts',
                'src/security/index.ts',
                'src/client/header-util.ts',
                'src/client/interceptors/logging.interceptor.ts',
                'src/service/auth.service.ts',
                'src/service/user.service.ts',
                'src/main.ts',
                'src/swagger.ts',
                'src/app.module.ts',
                'src/migrations/1570200270081-CreateTables.ts',
                'src/migrations/1570200490072-SeedUsersRoles.ts',
                'src/orm.config.ts',
                'scripts/copy-resources.ts',
                'tsconfig.build.json',
                'test/app.e2e-spec.ts',
                'test/jest-e2e.json',
                'nest-cli.json',
                '.env',
                'tslint.json',
                'package.json',
                'tsconfig.json',
                'README.md'
            ]
        }
    ],
    other: [
        {
            templates: [
                'package.json'
                /*
                    { file: '.mvn/wrapper/maven-wrapper.properties', method: 'copy', noEjs: true },
                */
            ]
        }
    ],
    jwt: [
        {
            condition: generator => generator.authenticationType === 'jwt',
            templates: [
                'src/web/rest/user.jwt.controller.ts',
                'src/security/passport.jwt.strategy.ts',
                'src/security/payload.interface.ts',
                'src/service/dto/user-login.dto.ts'
            ]
        }
    ],
    oauth2: [
        {
            condition: generator => generator.authenticationType === 'oauth2',
            templates: ['src/web/rest/user.oauth2.controller.ts', 'src/security/passport.oauth2.strategy.ts']
        }
    ]
};

function writeFiles() {
    return {
        writeSameFiles() {
            this.writeFilesToDisk(serverFiles, this, false);
        }
    };
}
