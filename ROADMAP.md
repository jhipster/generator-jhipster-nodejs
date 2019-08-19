# This is the Roadmap for development. 🎉🎉🎉 Thank you for whatever contribution to one of these features! 🎉🎉🎉

## Next Features
To contribute for the next featues, fork the repo and open a pull request regarding the [kanban board](https://github.com/jhipster/generator-jhipster-nodejs/projects/1?fullscreen=true) progress issues or to do. 

> The actual goal is to have **the first release (0.0.2)** with these basic features:

* Blueprint to generate monolitich/microservice app with NestJS basic template including, optionally, angular client
* Swagger support
* Entity ORM generation for only a database type and in development
* Preserve liquibase db script orchestration
* Basic security management
* Maven simple orchestration to run server with client part in case of monolithic app with frontend code

> Let it free to give advices or tips!

## Completed list

[x] Running microservice o monolith project
[x] Import jdl: functional entity-server generator with simple options (no dto, no serviceImpl...)
[x] Typeorm mappings for both sql and mongodb (todo: needs way more testing of different relations, combinations..)
[x] Rest API (with headers) compatible with other jhipster implementations
[x] Spring Cloud Configuration client
[x] Eureka client: there are some issues registering zuul routes in jhipster registry app..
[x] JWT authentication and role base method decorators
[x] Swagger documentation (todo: export json/yaml to integrate with jhipster gateway)


## To DO

[ ] Monolithic generation with client generation (need orchestration with pom)
[ ] Delete unuseful java questions not supported 
[ ] Unit tests: both for the blueprint and for generated project
[ ] DTOs based rest api
[ ] Validation
[ ] Different pagination options
[ ] Elastic Search support
[ ] Search api
[ ] User management api
[ ] Other security/authentication options
[ ] Other core/admin jhipster services



