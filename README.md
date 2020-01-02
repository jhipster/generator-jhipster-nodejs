# generator-jhipster-nodejs
[![NPM version][npm-image]][npm-url] [![Dependency Status][daviddm-image]][daviddm-url] [![Generator Build Status][github-actions-generator-image]][github-actions-url] [![Gitter](https://badges.gitter.im/generator-jhipster-nodejs/community.svg)](https://gitter.im/generator-jhipster-nodejs/community?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge) [![Downloads][npmcharts-image]][npmcharts-url]

> Generator-jhipster-nodejs, the _official NodeJS blueprint_ that uses [NestJS Typescript Framework](https://nestjs.com/) for your **backend**. We encourage you to use it and give us your feedback.

<div align="center">
	<a href="https://github.com/jhipster/generator-jhipster-nodejs">
		<img width="160" height="200" src="https://raw.githubusercontent.com/jhipster/generator-jhipster-nodejs/v1.0.0-beta.1/logo-nhipster.png">
	</a>
</div>

> ## Notes
>
> For the features of the last release refers to [CHANGELOG.md](https://github.com/jhipster/generator-jhipster-nodejs/blob/master/CHANGELOG.md).

# Greetings, nodejs Hipster!

This project adds nodejs for your backend, **all typescript files generation, not JAVA!**, to the [JHipster](https://www.jhipster.tech/) application 😎. It is based on JHipster Blueprint 🔵, that is meant to be used in a JHipster application.

> The generator applies this standard configuration for the nodeJS app:

> * NestJS base app with web controllers, [swagger doc](https://github.com/nestjs/swagger) and [jwt or oauth2 passport auth](https://github.com/nestjs/passport) services

> * The app starts with four seed users (admin, basic user and anonymous roles), as standard jhipster monolithic app, with SQLite for dev and configurable sql db for prod

> * The app uses [typeORM](https://github.com/nestjs/typeorm) and asks you a question if you don't want SQLite database in prod mode but using onother sql db

> * TypeORM is also used for the automatically migration and versioning of the database scripts

> * The app runs also as a full stack app including, for the monolitich choise, the angular/react client with the home page set for NHipster and CRUD operations for entity generated with subgenerator and jdl import

<div align="center">
		<img src="https://raw.githubusercontent.com/jhipster/generator-jhipster-nodejs/v1.0.0-beta.1/nhipster-cli.gif">
</div>


> A **generated example app with JWT auth** is [here](https://github.com/jhipster/jhipster-sample-app-nodejs/tree/v1.0.0-beta.1) 

<div align="center">
		<img src="https://raw.githubusercontent.com/jhipster/generator-jhipster-nodejs/v1.0.0-beta.1/demo-full-app.gif">
</div>


> A **generated example app with Okta Oauth2** is [here](https://github.com/jhipster/jhipster-sample-app-nodejs-oauth2/tree/v1.0.0-beta.1) 

# Prerequisites

As this is a [JHipster](https://www.jhipster.tech/) blueprint, we expect you have JHipster and its related tools already installed:

- [Installing JHipster](https://www.jhipster.tech/installation/)

# 🚀 How to get started

1. Make sure you have followed the [JHipster installation guide](https://www.jhipster.tech/installation) and that both `yeoman` and `jhipster` are installed.
2. Install the package with `npm install -g generator-jhipster-nodejs`
3. And generate the application with `jhipster --blueprints nodejs`


# Installation Details

## With NPM

To install this blueprint:

```bash
npm install -g generator-jhipster-nodejs
```

To update this blueprint:

```bash
npm update -g generator-jhipster-nodejs
```

## With Yarn

To install this blueprint:

```
yarn global add generator-jhipster-nodejs
```

To update this blueprint:

```bash
yarn global upgrade generator-jhipster-nodejs
```

## 🚦 What we have now

✅ General App generation 
   - `jhipster --blueprints nodejs`

✅ Controller generation
   - `jhipster spring-controller <controller-name> --blueprints nodejs`
  
✅ Entity generation
   - `jhipster entity <entity-name> --blueprints nodejs`

✅ JDL Entity model support generation
   - `jhipster import-jdl my_file.jdl --blueprints nodejs`

For the last, in the **test-integration/samples/FOLDER_NAME-jdl** there are some examples of jdl models.

> Please attention that SQLite does not support enum

## 🛠 Steps to develop a generator feature and test it

Shell steps:

- ```git clone https://github.com/jhipster/generator-jhipster-nodejs.git```
- ```cd generator-jhipster-nodejs```
- ```git checkout -b feature/my-feature```
- ```npm install``` 
- ```npm link```
- ```cd ..```
- ```git clone https://github.com/jhipster/generator-jhipster.git```
- ```cd generator-jhipster```
- ```npm install``` 
- ```npm link```
- ```cd ..```
- ```mkdir test-generation```
- ```cd test-generation```
- ```npm link generator-jhipster```
- ```npm link generator-jhipster-nodejs```

Now you will develop under the **generator-jhipster-nodejs** that you have cloned with git.
After finish, to generate the app and check your feature, run in **test-generation** folder:

- ```jhipster --blueprints nodejs```

## ❤️ For community

Found an [issue](https://github.com/jhipster/generator-jhipster-nodejs/issues), check if is already opened or closed, otherwise open a new [feature or bug](https://github.com/jhipster/generator-jhipster-nodejs/issues/new/choose).

Interested in contributing, check out our [contributing guide](https://github.com/jhipster/generator-jhipster-nodejs/blob/master/CONTRIBUTING.md) to get started.

Refer for contribution to [roadmap](https://github.com/jhipster/generator-jhipster-nodejs/blob/master/ROADMAP.md) or to [kanban board](https://github.com/jhipster/generator-jhipster-nodejs/projects/1?fullscreen=true).

Any questions [Angelo Manganiello](mailto:angelo.mang@libero.it).


# Contributors ✨

Thanks goes to these wonderful people:

<table><tr><td align="center"><a href="https://github.com/amanganiello90"><img src="https://avatars3.githubusercontent.com/u/20536757?s=400&v=4" width="100px;" alt="Angelo Manganiello (founder stream lead)"/><br/><sub><b>Angelo Manganiello</b><br/><b>(founder stream lead)</b></sub></a></td><td align="center"><a href="https://github.com/hadirsa"><img src="https://avatars2.githubusercontent.com/u/3942854?s=400&v=4" width="100px;" alt="Hadi Rasouli"/><br /><sub><b>Hadi Rasouli</b></sub></a></td><td align="center"><a href="https://github.com/ivangsa"><img src="https://avatars1.githubusercontent.com/u/1246876?s=400&v=4" width="100px;" alt="Iván García Sainz-Aja"/><br /><sub><b>Iván García Sainz-Aja</b></sub></a></td><td align="center"><a href="https://github.com/DanielFran"><img src="https://avatars1.githubusercontent.com/u/3706415?s=400&v=4" width="100px;" alt="Daniel Franco"/><br /><sub><b>Daniel Franco</b></sub></a></td></tr></table>

# Special Thanks

<div align="left">
		<a href="https://www.jetbrains.com/?from=generator-jhipster-nodejs">
		  <img width="80" height="100" src="https://raw.githubusercontent.com/jhipster/generator-jhipster-nodejs/v1.0.0-beta.1/jetbrains.png">
		</a>
		<a href="https://code.visualstudio.com">
		  <img width="100" height="100" src="https://raw.githubusercontent.com/jhipster/generator-jhipster-nodejs/v1.0.0-beta.1/visualstudio-code.png">
		</a>
		<a href="https://www.jhipster.tech">
		  <img width="160" height="100" src="https://raw.githubusercontent.com/jhipster/generator-jhipster-nodejs/v1.0.0-beta.1/jhipster-logo.png">
		</a>
</div>

# License

Apache-2.0 © [Angelo Manganiello](https://github.com/amanganiello90)


[npm-image]: https://img.shields.io/npm/v/generator-jhipster-nodejs.svg
[npm-url]: https://npmjs.org/package/generator-jhipster-nodejs
[github-actions-generator-image]: https://github.com/jhipster/generator-jhipster-nodejs/workflows/Generator/badge.svg
[github-actions-url]: https://github.com/jhipster/generator-jhipster-nodejs/actions
[daviddm-image]: https://david-dm.org/jhipster/generator-jhipster-nodejs.svg?theme=shields.io
[daviddm-url]: https://david-dm.org/jhipster/generator-jhipster-nodejs
[npmcharts-image]: https://img.shields.io/npm/dm/generator-jhipster-nodejs.svg?label=Downloads&style=flat
[npmcharts-url]: https://npmcharts.com/compare/generator-jhipster-nodejs
