# This is the Roadmap for development. 🎉🎉🎉 Thank you for whatever contribution to one of these features! 🎉🎉🎉

## Next Features
To contribute for the next featues, fork the repo and open a pull request regarding the [kanban board](https://github.com/jhipster/generator-jhipster-nodejs/projects/1?fullscreen=true) progress issues or to do. 

> The actual goal is to have **the first release (1.0.0)** with these basic features:

* Blueprint to generate monolitich/microservice app with NestJS basic templates
* Swagger support
* Entity ORM generation for prod database (mongodb) and dev database (default db is sqlite already configured)
* Basic security management with jwt
* Maven simple orchestration to run server with client part in case of monolithic app with frontend code
* All subgenerators (without services)

> Let it free to give advices or tips!

## Completed list

- [x] Running microservice or monolith project
- [x] Default sqlite support already configured
- [x] Import jdl: functional entity-server generator with simple options (no dto, no serviceImpl)
- [x] Typeorm mappings for both sql and mongodb 
- [x] Rest API (with headers) compatible with other jhipster implementations
- [x] Spring Cloud Configuration client
- [x] Eureka client (but there are some issues registering zuul routes in jhipster registry app)
- [x] JWT authentication and role base method decorators
- [x] Swagger documentation
- [x] Monolithic generation with client generation (orchestration with dev and prod maven profile)
- [x] Overwrite standard README.md (for every application type) with new instructions for project structure
- [x] Added controller generator (jhipster spring-controller _name_ command)
- [x] Delete unuseful java questions not supported 
- [x] Entity generator
- [x] Automatic config in dev profile sqlite db and in prod another sql db
- [x] All user and auth api with jwt integrated in angular ui
- [x] Replaced mongoProdDatabase question with standard jhipster databaseType and with all db typeORM support
- [x] Remove maven with option JAVA requirement
- [x] Add package.json when no client
- [x] Avoid reinsert seed db in restart app using typeORM migration


## To DO for next release


- [ ] Test prod database and update doc with react client
- [ ] Encrypt user password in db
- [ ] Languages subgenerator support i18n: translate home page for NHipster and remove spring boot resources message 
- [ ] OAuth2 feature
- [ ] Unit tests: both for the blueprint and for generated project
- [ ] DTOs based rest api
- [ ] Validation
- [ ] Export json/yaml for swagger to integrate with jhipster gateway
- [ ] Needs way more testing of different relations, combinations for entity
- [ ] Different pagination options
- [ ] Elastic Search support
- [ ] Search api
- [ ] Other core/admin jhipster management api and services with sending email
