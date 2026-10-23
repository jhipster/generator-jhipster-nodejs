import { SERVER_NODEJS_SRC_DIR } from '../generator-nodejs-constants.js';

const SERVER_NODEJS_DIR = `${SERVER_NODEJS_SRC_DIR}/`;

export const serverFiles = {
  common: [
    {
      templates: ['.dockerignore', 'README.md.jhi.nodejs', '.gitignore.jhi.nodejs', 'Dockerfile'],
    },
    {
      path: SERVER_NODEJS_DIR,
      // The users administration API, not generated with OAuth2 (users come from the identity provider).
      condition: ctx => ctx.generateUserManagement,
      templates: [
        'src/web/rest/user.controller.ts',
        'e2e/user.e2e-spec.ts',
        'src/service/mail.service.ts',
        'src/module/mail.module.ts',
        'test/mail.service.spec.ts',
      ],
    },

    {
      path: SERVER_NODEJS_DIR,
      // The users of the application, synchronized from the identity provider with OAuth2 and syncUserWithIdp.
      condition: ctx => ctx.generateBuiltInUserEntity,
      templates: [
        'src/domain/user.entity.ts',
        'src/service/mapper/user.mapper.ts',
        'src/service/user.service.ts',
        'src/module/user.module.ts',
        'src/web/rest/public.user.controller.ts',
      ],
    },
    {
      path: SERVER_NODEJS_DIR,
      // The transformers of the columns whose values the SQL drivers do not give as the API exchanges them.
      condition: ctx => ctx.databaseTypeSql,
      templates: ['src/domain/base/column-transformers.ts', 'test/domain/column-transformers.spec.ts'],
    },
    {
      path: SERVER_NODEJS_DIR,
      // The tables of the built-in users (SQL), the schema synchronized from the entities (MongoDB, its indices).
      condition: ctx => ctx.databaseTypeMongodb || ctx.generateBuiltInUserEntity || ctx.generateBuiltInAuthorityEntity,
      templates: ['src/migrations/1570200270081-CreateTables.ts'],
    },
    {
      path: SERVER_NODEJS_DIR,
      condition: ctx => ctx.databaseTypeSql,
      // The column types of the database of the active profiles, given to the entities and to the migrations.
      templates: ['src/migrations/support/schema.ts', 'src/domain/base/column-types.ts', 'test/domain/column-types.spec.ts'],
    },
    {
      path: SERVER_NODEJS_DIR,
      condition: ctx => ctx.generateBuiltInAuthorityEntity,
      templates: [
        'src/domain/authority.entity.ts',
        'src/migrations/1570200490072-SeedUsersRoles.ts',
        'src/service/dto/authority.dto.ts',
        'src/web/rest/authority.controller.ts',
        'e2e/authority.e2e-spec.ts',
      ],
    },
    {
      path: SERVER_NODEJS_DIR,
      templates: [
        'src/service/dto/user.dto.ts',
        'src/web/rest/account.controller.ts',
        'src/web/rest/management.controller.ts',
        'src/web/rest/health.controller.ts',
        'src/module/health.module.ts',
        'src/module/management.module.ts',
        'src/web/rest/loggers.controller.ts',
        'src/web/rest/metrics.controller.ts',
        'src/web/rest/configuration.controller.ts',
        'src/web/rest/api-docs.controller.ts',
        'src/service/api-docs.service.ts',
        'src/common/metrics.ts',
        'test/common/metrics.spec.ts',
        'src/common/logging.ts',
        'test/common/logging.spec.ts',
        'src/security/decorators/auth-user.decorator.ts',
        'src/module/auth.module.ts',
        'src/config/application-dev.yml',
        'src/config/application-test.yml',
        'src/config.ts',
        'src/config/application-prod.yml',
        'src/config/application-secret-samples.yml',
        'src/config/application-tls.yml',
        'src/config/application-tls-samples.yml',
        'src/config/application.yml',
        'src/domain/base/pagination.entity.ts',
        'src/domain/base/pagination.entity.spec.ts',
        'src/domain/base/base.entity.ts',
        'src/security/guards/roles.guard.ts',
        'src/security/guards/auth.guard.ts',
        'src/security/role-type.ts',
        'src/security/decorators/roles.decorator.ts',
        'src/security/index.ts',
        'src/common/header-util.ts',
        'src/common/interceptors/logging.interceptor.ts',
        'src/common/request.ts',
        'src/web/rest/errors/error-constants.ts',
        'src/web/rest/errors/problem.exception.ts',
        'src/web/rest/errors/problem-details.filter.ts',
        'src/common/reference-by-id.ts',
        'src/service/auth.service.ts',
        'src/service/dto/base.dto.ts',
        'src/main.ts',
        'src/app.config.ts',
        'src/application-config.ts',
        'src/module/common.module.ts',
        'src/swagger.ts',
        'src/tls.ts',
        'src/app.module.ts',
        'src/orm.config.ts',
        'tsconfig.build.json',
        'test/admin/management.controller.spec.ts',
        'test/admin/health.controller.spec.ts',
        'test/common/logging.interceptor.spec.ts',
        'test/config.spec.ts',
        'nest-cli.json',
        {
          // The profile of the development scripts (nest start --env-file .env.dev), not of the built application.
          file: 'env',
          renameTo: () => '.env.dev',
        },
        'eslint.config.mjs',
        'package.json',
        'tsconfig.json',
        'vitest.config.ts',
        'vitest.config.e2e.ts',
        'README.md',
        'sonar-project.properties',
        'ormconfig.ts',
      ],
    },
    {
      path: SERVER_NODEJS_DIR,
      // The migrations of the developers, created after the constraints migrations of the entities (SQL).
      condition: ctx => ctx.databaseTypeSql,
      templates: ['typeorm-migration.ts'],
    },
    {
      path: SERVER_NODEJS_DIR,
      condition: ctx => ctx.serviceDiscoveryEureka,
      templates: ['src/service/eureka.service.ts'],
    },
    {
      path: SERVER_NODEJS_DIR,
      condition: ctx => ctx.serviceDiscoveryConsul,
      templates: ['src/service/consul.service.ts'],
    },
    {
      path: SERVER_NODEJS_DIR,
      // Helper of the MongoDB updates: the MongoDB driver of TypeORM ignores the update: false option.
      condition: ctx => ctx.databaseTypeMongodb,
      templates: ['src/common/updatable-properties.ts'],
    },
    {
      path: SERVER_NODEJS_DIR,
      // Validates the sort of the entity lists by introspection of the TypeORM metadata.
      templates: ['src/common/sortable-properties.ts'],
    },
  ],
  e2e: [
    {
      path: SERVER_NODEJS_DIR,
      templates: ['e2e/app.e2e-spec.ts', 'e2e/cors.e2e-spec.ts', 'e2e/management.e2e-spec.ts', 'e2e/setup.test.js'],
    },
    {
      path: SERVER_NODEJS_DIR,
      condition: generator => generator.generateUserManagement,
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
      condition: ctx => ctx.authenticationTypeJwt,
      templates: [
        'src/security/passport.jwt.strategy.ts',
        'src/security/payload.interface.ts',
        'src/security/jwt.config.ts',
        'test/security/jwt.config.spec.ts',
      ],
    },
    {
      path: SERVER_NODEJS_DIR,
      // The authentication API, without built-in User (a microservice) the application only validates the tokens.
      condition: ctx => ctx.authenticationTypeJwt && ctx.generateBuiltInUserEntity,
      templates: [
        'src/web/rest/user.jwt.controller.ts',
        'src/security/password-util.ts',
        'src/security/password.service.ts',
        'src/service/dto/password-change.dto.ts',
        'src/service/dto/key-and-password.dto.ts',
        'src/service/dto/user-login.dto.ts',
      ],
    },
  ],
  oauth2: [
    {
      path: SERVER_NODEJS_DIR,
      condition: generator => generator.authenticationTypeOauth2,
      templates: [
        'src/web/rest/user.oauth2.controller.ts',
        'src/security/passport.oauth2.strategy.ts',
        'src/security/oauth2.config.ts',
        'src/security/oauth2.authorities.ts',
        'test/security/oauth2.authorities.spec.ts',
      ],
    },
  ],
};
