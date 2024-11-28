import { SERVER_NODEJS_SRC_DIR } from '../generator-nodejs-constants.js';

const SERVER_NODEJS_DIR = `${SERVER_NODEJS_SRC_DIR}/`;

export const serverFiles = {
  common: [
    {
      templates: ['.dockerignore', 'README.md.jhi.nodejs', '.gitignore.jhi.nodejs', 'Dockerfile'],
    },
    {
      path: SERVER_NODEJS_DIR,
      templates: [
        'src/web/rest/user.controller.ts',
        'src/web/rest/account.controller.ts',
        'src/web/rest/public.user.controller.ts',
        'src/web/rest/management.controller.ts',
        'src/module/user.module.ts',
        'src/module/auth.module.ts',
        'src/config/application-dev.yml',
        'src/config/application-test.yml',
        'src/config.ts',
        'src/config/application-prod.yml',
        'src/config/application.yml',
        'src/domain/base/pagination.entity.ts',
        'src/domain/base/pagination.entity.spec.ts',
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
        'src/client/request.ts',
        'src/service/auth.service.ts',
        'src/service/user.service.ts',
        'src/service/dto/base.dto.ts',
        'src/service/dto/user.dto.ts',
        'src/service/mapper/user.mapper.ts',
        'src/main.ts',
        'src/swagger.ts',
        'src/app.module.ts',
        'src/migrations/1570200270081-CreateTables.ts',
        'src/migrations/1570200490072-SeedUsersRoles.ts',
        'src/orm.config.ts',
        'scripts/copy-resources.ts',
        'scripts/entrypoint.sh',
        'tsconfig.build.json',
        'test/admin/management.controller.spec.ts',
        'nest-cli.json',
        {
          file: 'env',
          renameTo: () => '.env',
        },
        'eslint.config.mjs',
        'package.json',
        'tsconfig.json',
        'README.md',
        'webpack.server.prod.config.js',
        'sonar-project.properties',
        'ormconfig.ts',
      ],
    },
  ],
  e2e: [
    {
      path: SERVER_NODEJS_DIR,
      templates: ['e2e/app.e2e-spec.ts', 'e2e/user.e2e-spec.ts', 'e2e/jest.e2e.config.json', 'e2e/setup.test.js'],
    },
    {
      path: SERVER_NODEJS_DIR,
      condition: generator => !generator.skipUserManagement && generator.authenticationType !== 'oauth2',
      templates: ['e2e/account.e2e-spec.ts'],
    },
  ],
  other: [
    {
      templates: ['package.json'],
    },
  ],
  jwt: [
    {
      path: SERVER_NODEJS_DIR,
      condition: generator => generator.authenticationType === 'jwt',
      templates: [
        'src/web/rest/user.jwt.controller.ts',
        'src/security/password-util.ts',
        'src/security/passport.jwt.strategy.ts',
        'src/security/payload.interface.ts',
        'src/service/dto/password-change.dto.ts',
        'src/service/dto/user-login.dto.ts',
      ],
    },
  ],
  oauth2: [
    {
      path: SERVER_NODEJS_DIR,
      condition: generator => generator.authenticationType === 'oauth2',
      templates: ['src/web/rest/user.oauth2.controller.ts', 'src/security/passport.oauth2.strategy.ts', 'src/security/oauth2.config.ts'],
    },
  ],
};
