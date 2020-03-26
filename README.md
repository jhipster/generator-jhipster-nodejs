# generator-jhipster-nodejs

[![NPM version][npm-image]][npm-url]
[![Dependency Status][daviddm-image]][daviddm-url]
[![Generator Build Status][github-actions-generator-ci-image]][github-actions-url]
[![Generator Test Status][github-actions-generator-test-image]][github-actions-url]
[![Sonar Cloud Quality Gate][sonar-gate-image]][sonar-url]
[![Sonar Cloud Coverage Rate][sonar-coverage-image]][sonar-coverage-url]
[![Sonar Cloud Reliability Rate][sonar-reliability-image]][sonar-url]
[![Sonar Cloud Security Rate][sonar-security-image]][sonar-url]
[![Sonar Cloud Maintainability Rate][sonar-maintainability-image]][sonar-url]
[![Sonar Cloud Duplicated Code][sonar-duplication-image]][sonar-url]
[![Gitter][gitter-image]][gitter-url]
[![Downloads][npmcharts-image]][npmcharts-url]

> Generator-jhipster-nodejs, the _official NodeJS blueprint_ that uses [NestJS Typescript Framework](https://nestjs.com/) for your **backend**. We encourage you to use it and give us your feedback.

<div align="center">
	<a href="https://github.com/jhipster/generator-jhipster-nodejs">
		<img width="160" height="200" src="https://raw.githubusercontent.com/jhipster/generator-jhipster-nodejs/v1.0.1/logo-nhipster.png">
	</a>
</div>

> ## Notes
>
> For the features of the last release refers to [CHANGELOG.md](https://github.com/jhipster/generator-jhipster-nodejs/blob/master/CHANGELOG.md).

> ## Demo
>
> The UI is inherited from standard jhipster app client. So only backend generation changes.
> For this, a live app running is less useful than the code and the app structure show in:
>
> -   **The sample repo app with** [react client and okta oauth2](https://github.com/jhipster/jhipster-sample-app-nodejs-oauth2/tree/v1.0.1)
> -   **The sample repo app with** [angular client and jwt auth](https://github.com/jhipster/jhipster-sample-app-nodejs/tree/v1.0.1)

<div align="center">
	<a href="https://github.com/jhipster/generator-jhipster-nodejs">
		<img src="https://raw.githubusercontent.com/jhipster/generator-jhipster-nodejs/v1.0.1/nhipster-cli-logo.png">
	</a>
</div>

# Greetings, nodejs Hipster!

This project adds nodejs for your backend, **all typescript files generation, not JAVA!**, to the [JHipster](https://www.jhipster.tech/) application 😎. It is based on JHipster Blueprint 🔵, that is meant to be used in a JHipster application.

> The generator applies this standard configuration for the nodeJS app:

> -   NestJS base app with web controllers, [swagger doc](https://github.com/nestjs/swagger) and [jwt or oauth2 passport auth](https://github.com/nestjs/passport) services

> -   The app starts with four seed users (admin, basic user and anonymous roles), as standard jhipster monolithic app, with SQLite for dev and configurable sql db for prod

> -   The app uses [typeORM](https://github.com/nestjs/typeorm) and asks you a question for onother sql db

> -   TypeORM is also used for the automatically migration and versioning of the database scripts

> -   The app runs also as a full stack app including, for the monolitich choise, the angular/react client with the home page set for NHipster and CRUD operations for entity generated with subgenerator and jdl import

<div align="center">
		<img src="https://raw.githubusercontent.com/jhipster/generator-jhipster-nodejs/v1.0.1/nhipster-cli.gif">
</div>

> A **previous of a jwt auth app:**

<div align="center">
		<img src="https://raw.githubusercontent.com/jhipster/generator-jhipster-nodejs/v1.0.1/demo-full-app.gif">
</div>

# Prerequisites

As this is a [JHipster](https://www.jhipster.tech/) blueprint, we expect you have JHipster and its related tools already installed:

-   [Installing JHipster](https://www.jhipster.tech/installation/)

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

-   `jhipster --blueprints nodejs`

✅ Controller generation

-   `jhipster spring-controller <controller-name> --blueprints nodejs`

✅ Service generation

-   `jhipster spring-service <service-name> --blueprints nodejs`

✅ Entity generation

-   `jhipster entity <entity-name> --blueprints nodejs`

✅ JDL Entity model support generation

-   `jhipster import-jdl my_file.jdl --blueprints nodejs`

For the last, in the **test-integration/samples/FOLDER_NAME-jdl** there are some examples of jdl models.

> **Please attention that SQLite does not support Enum and Instant types**

## 🛠 Steps to develop a generator feature and test it

Shell steps:

-   `git clone https://github.com/jhipster/generator-jhipster-nodejs.git`
-   `cd generator-jhipster-nodejs`
-   `git checkout -b feature/my-feature`
-   `npm install`
-   `npm link`
-   `cd ..`
-   `git clone https://github.com/jhipster/generator-jhipster.git`
-   `cd generator-jhipster`
-   `npm install`
-   `npm link`
-   `cd ..`
-   `mkdir test-generation`
-   `cd test-generation`
-   `npm link generator-jhipster`
-   `npm link generator-jhipster-nodejs`

Now you will develop under the **generator-jhipster-nodejs** that you have cloned with git.
After finish, to generate the app and check your feature, run in **test-generation** folder:

-   `jhipster --blueprints nodejs`

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
		  <img width="80" height="100" src="https://raw.githubusercontent.com/jhipster/generator-jhipster-nodejs/v1.0.1/jetbrains.png">
		</a>
		<a href="https://code.visualstudio.com">
		  <img width="100" height="100" src="https://raw.githubusercontent.com/jhipster/generator-jhipster-nodejs/v1.0.1/visualstudio-code.png">
		</a>
		<a href="https://www.jhipster.tech">
		  <img width="160" height="100" src="https://raw.githubusercontent.com/jhipster/generator-jhipster-nodejs/v1.0.1/jhipster-logo.png">
		</a>
</div>

# License

Apache-2.0 © [Angelo Manganiello](https://github.com/amanganiello90)

[npm-image]: https://img.shields.io/npm/v/generator-jhipster-nodejs.svg
[npm-url]: https://npmjs.org/package/generator-jhipster-nodejs
[github-actions-generator-ci-image]: https://github.com/jhipster/generator-jhipster-nodejs/workflows/Generator%20CI/badge.svg
[github-actions-generator-test-image]: https://github.com/jhipster/generator-jhipster-nodejs/workflows/Test%20Integration/badge.svg
[github-actions-url]: https://github.com/jhipster/generator-jhipster-nodejs/actions
[sonar-url]: https://sonarcloud.io/dashboard?branch=master&id=jhipster_generator-jhipster-nodejs
[sonar-coverage-url]: https://sonarcloud.io/component_measures?branch=master&id=jhipster_generator-jhipster-nodejs&metric=coverage&view=list
[sonar-gate-image]: https://sonarcloud.io/api/project_badges/measure?branch=master&project=jhipster_generator-jhipster-nodejs&metric=alert_status
[sonar-coverage-image]: https://sonarcloud.io/api/project_badges/measure?branch=master&project=jhipster_generator-jhipster-nodejs&metric=coverage
[sonar-reliability-image]: https://sonarcloud.io/api/project_badges/measure?branch=master&project=jhipster_generator-jhipster-nodejs&metric=reliability_rating
[sonar-security-image]: https://sonarcloud.io/api/project_badges/measure?branch=master&project=jhipster_generator-jhipster-nodejs&metric=security_rating
[sonar-maintainability-image]: https://sonarcloud.io/api/project_badges/measure?branch=master&project=jhipster_generator-jhipster-nodejs&metric=sqale_rating
[sonar-duplication-image]: https://sonarcloud.io/api/project_badges/measure?branch=master&project=jhipster_generator-jhipster-nodejs&metric=duplicated_lines_density
[daviddm-image]: https://david-dm.org/jhipster/generator-jhipster-nodejs.svg?theme=shields.io
[daviddm-url]: https://david-dm.org/jhipster/generator-jhipster-nodejs
[npmcharts-image]: https://img.shields.io/npm/dm/generator-jhipster-nodejs.svg?label=Downloads&style=flat
[npmcharts-url]: https://npmcharts.com/compare/generator-jhipster-nodejs
[gitter-image]: https://badges.gitter.im/generator-jhipster-nodejs/community.svg
[gitter-url]: https://gitter.im/generator-jhipster-nodejs/community?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge
