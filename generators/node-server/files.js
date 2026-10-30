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
        'src/users/user.controller.ts',
        'e2e/user.e2e-spec.ts',
        'src/mail/mail.service.ts',
        'src/mail/mail.module.ts',
        'src/mail/mail.service.spec.ts',
      ],
    },

    {
      path: SERVER_NODEJS_DIR,
      // The users of the application, synchronized from the identity provider with OAuth2 and syncUserWithIdp.
      condition: ctx => ctx.generateBuiltInUserEntity,
      templates: [
        'src/users/user.entity.ts',
        'src/users/user.mapper.ts',
        'src/users/user.service.ts',
        'src/users/user.module.ts',
        'src/users/public.user.controller.ts',
      ],
    },
    {
      path: SERVER_NODEJS_DIR,
      // The transformers of the columns whose values the SQL drivers do not give as the API exchanges them.
      condition: ctx => ctx.databaseTypeSql,
      templates: ['src/common/database/column-transformers.ts', 'src/common/database/column-transformers.spec.ts'],
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
      templates: ['src/migrations/support/schema.ts', 'src/common/database/column-types.ts', 'src/common/database/column-types.spec.ts'],
    },
    {
      path: SERVER_NODEJS_DIR,
      condition: ctx => ctx.generateBuiltInAuthorityEntity,
      templates: [
        'src/users/authority.entity.ts',
        'src/migrations/1570200490072-SeedUsersRoles.ts',
        'src/users/dto/authority.dto.ts',
        'src/users/authority.controller.ts',
        'e2e/authority.e2e-spec.ts',
      ],
    },
    {
      path: SERVER_NODEJS_DIR,
      templates: [
        'src/users/dto/user.dto.ts',
        'src/auth/account.controller.ts',
        'src/management/management.controller.ts',
        'src/management/health.controller.ts',
        'src/management/health.module.ts',
        'src/management/management.module.ts',
        'src/management/loggers.controller.ts',
        'src/management/metrics.controller.ts',
        'src/management/configuration.controller.ts',
        'src/management/api-docs.controller.ts',
        'src/management/api-docs.service.ts',
        'src/common/metrics.ts',
        'src/common/metrics.spec.ts',
        'src/common/logging.ts',
        'src/common/logging.spec.ts',
        'src/auth/decorators/auth-user.decorator.ts',
        'src/auth/auth.module.ts',
        'src/config/application-dev.yml',
        'src/config/application-test.yml',
        'src/config.ts',
        'src/config/application-prod.yml',
        'src/config/application-secret-samples.yml',
        'src/config/application-tls.yml',
        'src/config/application-tls-samples.yml',
        'src/config/application.yml',
        'src/common/database/pagination.entity.ts',
        'src/common/database/pagination.entity.spec.ts',
        'src/common/database/base.entity.ts',
        'src/auth/guards/roles.guard.ts',
        'src/auth/guards/auth.guard.ts',
        'src/auth/role-type.ts',
        'src/auth/decorators/roles.decorator.ts',
        'src/auth/index.ts',
        'src/common/header-util.ts',
        'src/common/interceptors/logging.interceptor.ts',
        'src/common/request.ts',
        'src/common/errors/error-constants.ts',
        'src/common/errors/problem.exception.ts',
        'src/common/errors/problem-details.filter.ts',
        'src/auth/auth.service.ts',
        'src/common/dto/base.dto.ts',
        'src/main.ts',
        'src/app.config.ts',
        'src/application-config.ts',
        'src/common/common.module.ts',
        'src/swagger.ts',
        'src/tls.ts',
        'src/tls.spec.ts',
        'src/app.module.ts',
        'src/orm.config.ts',
        'tsconfig.build.json',
        'src/management/management.controller.spec.ts',
        'src/management/health.controller.spec.ts',
        'src/common/interceptors/logging.interceptor.spec.ts',
        'src/config.spec.ts',
        'src/app.config.spec.ts',
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
      templates: ['src/registry/eureka.service.ts'],
    },
    {
      path: SERVER_NODEJS_DIR,
      condition: ctx => ctx.serviceDiscoveryConsul,
      templates: ['src/registry/consul.service.ts'],
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
        'src/auth/passport.jwt.strategy.ts',
        'src/auth/payload.interface.ts',
        'src/auth/jwt.config.ts',
        'src/auth/jwt.config.spec.ts',
      ],
    },
    {
      path: SERVER_NODEJS_DIR,
      // The authentication API, without built-in User (a microservice) the application only validates the tokens.
      condition: ctx => ctx.authenticationTypeJwt && ctx.generateBuiltInUserEntity,
      templates: ['src/auth/user.jwt.controller.ts', 'src/auth/dto/user-login.dto.ts'],
    },
  ],
  userManagement: [
    {
      path: SERVER_NODEJS_DIR,
      // The passwords of the users of the user management, the ones of JWT and of the sessions.
      condition: ctx => ctx.generateUserManagement,
      templates: [
        'src/auth/password-util.ts',
        'src/auth/password.service.ts',
        'src/auth/dto/password-change.dto.ts',
        'src/auth/dto/key-and-password.dto.ts',
      ],
    },
  ],
  session: [
    {
      path: SERVER_NODEJS_DIR,
      // The sessions of the server, of the session login and of the OAuth2 login, protected from CSRF.
      condition: ctx => ctx.authenticationUsesCsrf,
      templates: [
        'src/auth/csrf.middleware.ts',
        'src/auth/csrf.middleware.spec.ts',
        'src/auth/session.entity.ts',
        'src/auth/session.store.ts',
        'src/auth/session.store.spec.ts',
      ],
    },
    {
      path: SERVER_NODEJS_DIR,
      condition: ctx => ctx.authenticationUsesCsrf && ctx.databaseTypeSql,
      templates: ['src/migrations/1570200270082-CreateSessions.ts'],
    },
    {
      path: SERVER_NODEJS_DIR,
      condition: ctx => ctx.authenticationTypeSession,
      templates: ['src/auth/user.session.controller.ts', 'src/auth/session-user.middleware.ts', 'e2e/session.e2e-spec.ts'],
    },
  ],
  oauth2: [
    {
      path: SERVER_NODEJS_DIR,
      condition: generator => generator.authenticationTypeOauth2,
      templates: [
        'src/auth/user.oauth2.controller.ts',
        'src/auth/passport.oauth2.strategy.ts',
        'src/auth/oauth2.config.ts',
        'src/auth/oauth2.authorities.ts',
        'src/auth/passport.oauth2-bearer.strategy.ts',
        'src/auth/guards/oauth2-login.guard.ts',
        'src/auth/oauth2.authorities.spec.ts',
        'src/auth/passport.oauth2.strategy.spec.ts',
        'e2e/oauth2-bearer.e2e-spec.ts',
      ],
    },
    {
      path: SERVER_NODEJS_DIR,
      // The login with the identity provider, in a session.
      condition: generator => generator.authenticationTypeOauth2 && generator.authenticationUsesCsrf,
      templates: ['e2e/oauth2-login.e2e-spec.ts'],
    },
  ],
};
