# Sample application generation

To generate test applications, either automatically by the CI or locally on the developer machine, a number of pre-defined configurations have been prepared.

## Application configurations

Those are described in `.yo-rc.json` files which is the descriptor file created by Yeoman to keep track of the choices selected while generating an application.

-   monolith-angular-jwt-18n-dev
-   monolith-react-oauth2-dev

Instead, `-jdl` suffix folders contain `.jdl` files which is the model to create full app and entities:

-   monolith-client-auth-template-jdl
-   monolith-react-oauth2-i18n-jdl
-   microservice-oauth2-jdl

The `monolith-client-auth-template-jdl` will be customized to generate **four applications** changing **client** (`react` or `angular`) and **auth** (`jwt` or `oauth2`) :

-   monolith-react-jwt-jdl
-   monolith-react-oauth2-jdl
-   monolith-angular-jwt-jdl
-   monolith-angular-oauth2-jdl
