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
                'src/repository/user.repository.ts',
                'src/repository/authority.repository.ts',
                'src/module/user.module.ts',
                'src/module/auth.module.ts',
                'src/config/application-dev.yml',
                'src/config/application-test.yml',
                'src/config.ts',
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
                'e2e/app.e2e-spec.ts',
                'e2e/user.e2e-spec.ts',
                'e2e/jest.e2e.config.json',
                'test/admin/management.controller.spec.ts',
                'nest-cli.json',
                {
                    file: 'env',
                    renameTo: () => '.env'
                },
                {
                    file: 'server.eslintrc.json',
                    renameTo: () => '.server.eslintrc.json'
                },
                {
                    file: 'server.eslintignore',
                    renameTo: () => '.server.eslintignore'
                },
                'package.json',
                'tsconfig.json',
                'README.md',
                'webpack.server.prod.config.js',
                'sonar-project.properties'
            ]
        }
    ],
    other: [
        {
            templates: [
                'package.json',
                'src/main/docker/app.yml',
                'src/main/docker/sonar.yml'
                /*
                    { file: '.mvn/wrapper/maven-wrapper.properties', method: 'copy', noEjs: true },
                */
            ]
        }
    ],
    jwt: [
        {
            path: SERVER_NODEJS_DIR,
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
            path: SERVER_NODEJS_DIR,
            condition: generator => generator.authenticationType === 'oauth2',
            templates: [
                'src/web/rest/user.oauth2.controller.ts',
                'src/security/passport.oauth2.strategy.ts',
                'src/security/oauth2.config.ts'
            ]
        }
    ],
    keycloak: [
        {
            condition: generator => generator.authenticationType === 'oauth2',
            templates: [
                'src/main/docker/keycloak.yml',
                'src/main/docker/realm-config/jhipster-realm.json',
                'src/main/docker/realm-config/jhipster-users-0.json'
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
