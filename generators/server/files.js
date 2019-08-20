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

module.exports = {
    writeFiles
};

const serverFiles = {
    common: [
        {
            templates: [
                'server/README.md',
                'server/src/core/users/users.controller.ts',
                'server/src/core/users/user.repository.ts',
                'server/src/core/users/users.module.ts',
                'server/src/core/users/users.controller.spec.ts',
                'server/src/config/application-dev.yml',
                'server/src/config/config.ts',
                'server/src/config/application-prod.yml',
                'server/src/config/application.yml',
                'server/src/domain/base/pagination.model.ts',
                'server/src/domain/base/base.model.ts',
                'server/src/domain/user.model.ts',
                'server/src/domain/product-category.model.ts',
                'server/src/domain/product.model.ts',
                'server/src/common/security/guards/roles.guard.ts',
                'server/src/common/security/guards/auth.guard.ts',
                'server/src/common/security/role-type.ts',
                'server/src/common/security/decorators/auth-user.decorator.ts',
                'server/src/common/security/decorators/roles.decorator.ts',
                'server/src/common/security/passport.jwt.strategy.ts',
                'server/src/common/security/index.ts',
                'server/src/common/header-util.ts',
                'server/src/common/interceptors/logging.interceptor.ts',
                'server/src/main.ts',
                'server/src/app.module.ts',
                'server/scripts/copy-resources.ts',
                'server/tsconfig.build.json',
                'server/test/app.e2e-spec.ts',
                'server/test/jest-e2e.json',
                'server/ormconfig.json',
                'server/nest-cli.json',
                'server/.env',
                'server/tslint.json',
                'server/package.json',
                'server/tsconfig.json',
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
