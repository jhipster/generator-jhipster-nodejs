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
                'src/web/rest/users.controller.ts',
                'src/web/rest/users.controller.spec.ts',
                'src/repository/user.repository.ts',
                'src/module/users.module.ts',
                'src/config/application-dev.yml',
                'src/config/config.ts',
                'src/config/application-prod.yml',
                'src/config/application.yml',
                'src/domain/base/pagination.entity.ts',
                'src/domain/base/base.entity.ts',
                'src/domain/user.entity.ts',
                'src/security/guards/roles.guard.ts',
                'src/security/guards/auth.guard.ts',
                'src/security/role-type.ts',
                'src/security/decorators/auth-user.decorator.ts',
                'src/security/decorators/roles.decorator.ts',
                'src/security/passport.jwt.strategy.ts',
                'src/security/index.ts',
                'src/client/header-util.ts',
                'src/client/interceptors/logging.interceptor.ts',
                'src/service/README.md',
                'src/main.ts',
                'src/swagger.ts',
                'src/app.module.ts',
                'scripts/copy-resources.ts',
                'tsconfig.build.json',
                'test/app.e2e-spec.ts',
                'test/jest-e2e.json',
                'ormconfig-examples.json',
                'nest-cli.json',
                '.env',
                'tslint.json',
                'package.json',
                'tsconfig.json',
                'README.md'
            ]
        },
        {
            templates: [
                'pom.xml',
                { file: 'source2blueprint.sh', method: 'copy', noEjs: true },
                { file: 'mvnw', method: 'copy', noEjs: true },
                { file: 'mvnw.cmd', method: 'copy', noEjs: true },
                { file: '.mvn/wrapper/maven-wrapper.jar', method: 'copy', noEjs: true },
                { file: '.mvn/wrapper/maven-wrapper.properties', method: 'copy', noEjs: true },
                { file: '.mvn/wrapper/MavenWrapperDownloader.java', method: 'copy', noEjs: true }
            ]
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
