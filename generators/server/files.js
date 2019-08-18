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
                'README.md',
                'src/core/users/users.controller.ts',
                'src/core/users/user.repository.ts',
                'src/core/users/users.module.ts',
                'src/core/users/users.controller.spec.ts',
                'src/config/application-dev.yml',
                'src/config/config.ts',
                'src/config/application-prod.yml',
                'src/config/application.yml',
                'src/domain/base/pagination.model.ts',
                'src/domain/base/base.model.ts',
                'src/domain/user.model.ts',
                'src/domain/product-category.model.ts',
                'src/domain/product.model.ts',
                'src/common/security/guards/roles.guard.ts',
                'src/common/security/guards/auth.guard.ts',
                'src/common/security/role-type.ts',
                'src/common/security/decorators/auth-user.decorator.ts',
                'src/common/security/decorators/roles.decorator.ts',
                'src/common/security/passport.jwt.strategy.ts',
                'src/common/security/index.ts',
                'src/common/header-util.ts',
                'src/common/interceptors/logging.interceptor.ts',
                'src/main.ts',
                'src/app.module.ts',
                'source2blueprint.sh',
                'scripts/copy-resources.ts',
                'tsconfig.build.json',
                'test/app.e2e-spec.ts',
                'test/jest-e2e.json',
                'ormconfig.json',
                'pom.xml',
                'nest-cli.json',
                '.env',
                'tslint.json',
                'package-lock.json',
                'package.json',
                'tsconfig.json',

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

