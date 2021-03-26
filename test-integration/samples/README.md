# Sample application generation

To generate test applications, either automatically by the CI or locally on the developer machine, a number of pre-defined configurations have been prepared.

## Application configurations

Those are described in `.yo-rc.json` files which is the descriptor file created by Yeoman to keep track of the choices selected while generating an application.

-   monolith-angular-jwt-18n-dev
-   monolith-react-oauth2-dev

Instead, `-jdl` suffix folders contain `.jdl` files which is the model to create full app and entities:

-   monolith-client-auth-template-jdl
-   monolith-angular-auth-mongodb-template-jdl
-   monolith-client-auth-i18n-template-jdl
-   monolith-client-database-prod-template-jdl
-   microservice-oauth2-jdl

Every `*template-jdl` app will be customized to generate **five applications** changing **client** (`react`, `vue` or `angular`) and **auth** (`jwt` or `oauth2`) :

-   monolith-react-jwt-jdl
-   monolith-react-oauth2-jdl
-   monolith-angular-jwt-jdl
-   monolith-angular-oauth2-jdl
-   monolith-angular-oauth2-mongodb-jdl
-   monolith-angular-jwt-mongodb-jdl
-   monolith-react-jwt-i18n-jdl
-   monolith-react-oauth2-i18n-jdl
-   monolith-angular-jwt-i18n-jdl
-   monolith-angular-oauth2-i18n-jdl
-   monolith-vue-jwt-i18n-jdl
-   monolith-vue-oauth2-i18n-jdl

In case of **database** (`mssql`, `mongodb`, `mysql` and `postgresql`) will be generated:

-   monolith-angular-mssql-prod-jdl
-   monolith-react-mysql-prod-jdl
-   monolith-angular-mongodb-prod-jdl
-   monolith-angular-postgresql-prod-jdl
-   monolith-vue-mongodb-prod-jdl
