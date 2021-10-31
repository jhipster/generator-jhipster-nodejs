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

> generator-jhipster-nodejs, the _official NodeJS blueprint_ that uses [NestJS TypeScript Framework](https://nestjs.com/) for your **backend**. We encourage you to use it and give us your feedback.

<div align="center">
	<a href="https://github.com/jhipster/generator-jhipster-nodejs">
		<img width="160" height="200" src="https://raw.githubusercontent.com/jhipster/generator-jhipster-nodejs/v2.0.0/logo-nhipster.png">
	</a>
</div>

> ## Notes
>
> For the features of the last release refers to [CHANGELOG.md](https://github.com/jhipster/generator-jhipster-nodejs/tree/v2.0.0/CHANGELOG.md).

> ## Demo
>
> The UI is inherited from standard JHipster app client. So only backend generation changes.
> For this, a live app running is less useful than the code and the app structure shows in:
>
> -   **The sample repo app with** [React client and Okta OAuth2](https://github.com/jhipster/jhipster-sample-app-nodejs-oauth2/tree/v2.0.0)
> -   **The sample repo app with** [Angular client and JWT auth](https://github.com/jhipster/jhipster-sample-app-nodejs/tree/v2.0.0)
> -   **The sample repo app with** [Vue.js client and mongodb](https://github.com/jhipster/jhipster-sample-app-nodejs-vuejs/tree/v2.0.0)

<div align="center">
	<a href="https://github.com/jhipster/generator-jhipster-nodejs">
		<img src="https://raw.githubusercontent.com/jhipster/generator-jhipster-nodejs/v2.0.0/nhipster-cli-logo.png">
	</a>
</div>

# Greetings, nodejs Hipster!

This project adds nodejs for your backend, **all TypeScript files generation, not Java!**, to the [JHipster](https://www.jhipster.tech/) application 😎. It is based on JHipster Blueprint 🔵, that is meant to be used in a JHipster application.

> The generator applies this standard configuration for the NodeJS app:

> -   NestJS base app with web controllers, [swagger doc](https://github.com/nestjs/swagger) and [JWT or OAuth2 passport auth](https://github.com/nestjs/passport) services

> -   The app starts with four seed users (admin, basic user and anonymous roles), as standard JHipster monolithic app, with SQLite for dev and configurable sql db for prod. But from the 1.5.0 release you can choose mongodb that uses a memory version for dev/test

> -   The app uses [TypeORM](https://github.com/nestjs/typeorm) and asks you a question for another sql db or for mongodb

> -   TypeORM is also used for the automatically migration and versioning of the database scripts

> -   The app runs also as a full stack app including, for the monolitich choice, the Angular/React client with the home page set for NHipster and CRUD operations for entity generated with subgenerator and jdl import

<div align="center">
		<img src="https://raw.githubusercontent.com/jhipster/generator-jhipster-nodejs/v2.0.0/nhipster-cli.gif">
</div>

> A **previous of a jwt auth app:**

<div align="center">
		<img src="https://raw.githubusercontent.com/jhipster/generator-jhipster-nodejs/v2.0.0/demo-full-app.gif">
</div>

# Prerequisites

As this is a [JHipster](https://www.jhipster.tech/) blueprint, we expect you have JHipster and its related tools already installed:

-   [Installing JHipster](https://www.jhipster.tech/installation/)
-   [node.js 14.16.0](https://nodejs.org/de/blog/release/v14.16.0/)

**Please attention to install that node.js version!!**

# 🚀 How to get started

1. Make sure you have followed the [JHipster installation guide](https://www.jhipster.tech/installation) and that both `yeoman` and `jhipster` are installed.
2. Install the package with `npm install -g generator-jhipster-nodejs`
3. And generate the application with `nhipster`

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

This is a blueprint that is runnable by:

```bash
jhipster --blueprints nodejs
```

However, it also ships with an `nhipster` CLI that you can use as a shortcut.

✅ General App generation

-   `nhipster`

✅ Controller generation

-   `nhipster spring-controller <controller-name>`

✅ Service generation

-   `nhipster spring-service <service-name>`

✅ Entity generation

-   `nhipster entity <entity-name>`

✅ JDL Entity model support generation

-   `nhipster import-jdl my_file.jdl`

✅ Ci-cd generation

-   `nhipster ci-cd`

For the last, in the **test-integration/samples/FOLDER_NAME-jdl** there are some examples of jdl models.

## Using Docker

1. Download the Dockerfile:

```bash
mkdir docker
cd docker
wget https://github.com/jhipster/generator-jhipster-nodejs/raw/master/docker/Dockerfile
```

2. Build the Docker images:

```bash
docker build -t jhipster-generator-nodejs:latest .
```

3. Make a folder where you want to generate the Application:

```bash
mkdir app
cd app
```

4. Run the generator image in one of the two following options.

-   Run the generator from image to generate service:

```bash
docker run -it --rm -v $PWD:/home/jhipster/app jhipster-generator-nodejs
```

-   Run and attach interactive shell to the generator docker container to work from inside the running container:

```bash
docker run -it --rm -v $PWD:/home/jhipster/app jhipster-generator-nodejs /bin/bash
```

## 🛠 Steps to develop a generator feature and test it

Shell steps:

```console
$ git clone https://github.com/jhipster/generator-jhipster-nodejs.git
$ cd generator-jhipster-nodejs
$ git checkout -b feature/my-feature
$ npm install
$ npm link
$ cd ..
$ git clone https://github.com/jhipster/generator-jhipster.git
$ cd generator-jhipster
$ git checkout v7.0.0
$ npm install
$ npm link
$ cd ..
$ mkdir test-generation
$ cd test-generation
$ npm link generator-jhipster
$ npm link generator-jhipster-nodejs
```

Now you will develop under the **generator-jhipster-nodejs** that you have cloned with git.
After finish, to generate the app and check your feature, run in **test-generation** folder:

-   `nhipster`

## ❤️ For community

Found an [issue](https://github.com/jhipster/generator-jhipster-nodejs/issues), check if is already opened or closed, otherwise open a new [feature or bug](https://github.com/jhipster/generator-jhipster-nodejs/issues/new/choose).

Interested in contributing, check out our [contributing guide](https://github.com/jhipster/generator-jhipster-nodejs/blob/master/CONTRIBUTING.md) to get started.

Refer for contribution to [roadmap](https://github.com/jhipster/generator-jhipster-nodejs/blob/master/ROADMAP.md) or to [kanban board](https://github.com/jhipster/generator-jhipster-nodejs/projects/1?fullscreen=true).

Any questions [Angelo Manganiello](mailto:angelo.mang@libero.it).

# Contributors ✨

Thanks goes to these wonderful people:

<table><tr><td align="center"><a href="https://github.com/amanganiello90"><img src="https://avatars3.githubusercontent.com/u/20536757?s=400" width="100px;" alt="Angelo Manganiello (founder stream lead)"/><br/><sub><b>Angelo Manganiello</b><br/><b>(founder stream lead)</b></sub></a></td><td align="center"><a href="https://github.com/hadirsa"><img src="https://avatars2.githubusercontent.com/u/3942854?s=400" width="100px;" alt="Hadi Rasouli"/><br /><sub><b>Hadi Rasouli</b></sub></a></td><td align="center"><a href="https://github.com/ivangsa"><img src="https://avatars1.githubusercontent.com/u/1246876?s=400" width="100px;" alt="Iván García Sainz-Aja"/><br /><sub><b>Iván García Sainz-Aja</b></sub></a></td><td align="center"><a href="https://github.com/DanielFran"><img src="https://avatars1.githubusercontent.com/u/3706415?s=400" width="100px;" alt="Daniel Franco"/><br /><sub><b>Daniel Franco</b></sub></a></td><td align="center"><a href="https://github.com/Aragonbn90"><img src="https://avatars2.githubusercontent.com/u/4463823?s=400" width="100px;" alt="Ed Pham"/><br /><sub><b>Ed Pham</b></sub></a></td><td align="center"><a href="https://github.com/glutengo"><img src="https://avatars.githubusercontent.com/u/14246032?v=4" width="100px;" alt="Markus"/><br /><sub><b>Markus</b></sub></a></td></tr></table>

# Special Thanks

<div align="left">
		<a href="https://www.jetbrains.com/?from=generator-jhipster-nodejs">
		  <img width="80" height="100" src="https://raw.githubusercontent.com/jhipster/generator-jhipster-nodejs/v2.0.0/jetbrains.png">
		</a>
		<a href="https://code.visualstudio.com">
		  <img width="100" height="100" src="https://raw.githubusercontent.com/jhipster/generator-jhipster-nodejs/v2.0.0/visualstudio-code.png">
		</a>
		<a href="https://www.jhipster.tech">
		  <img width="160" height="100" src="https://raw.githubusercontent.com/jhipster/generator-jhipster-nodejs/v2.0.0/jhipster-logo.png">
		</a>
</div>

# License

Apache-2.0 © [Angelo Manganiello](https://github.com/amanganiello90)

[npm-image]: https://img.shields.io/npm/v/generator-jhipster-nodejs.svg
[npm-url]: https://npmjs.org/package/generator-jhipster-nodejs
[github-actions-generator-ci-image]: https://github.com/jhipster/generator-jhipster-nodejs/workflows/Generator%20CI/badge.svg
[github-actions-generator-test-image]: https://github.com/jhipster/generator-jhipster-nodejs/workflows/Test%20Integration/badge.svg
[github-actions-url]: https://github.com/jhipster/generator-jhipster-nodejs/actions
[sonar-url]: https://sonarcloud.io/dashboard?branch=main&id=jhipster_generator-jhipster-nodejs
[sonar-coverage-url]: https://sonarcloud.io/component_measures?branch=main&id=jhipster_generator-jhipster-nodejs&metric=coverage&view=list
[sonar-gate-image]: https://sonarcloud.io/api/project_badges/measure?branch=main&project=jhipster_generator-jhipster-nodejs&metric=alert_status
[sonar-coverage-image]: https://sonarcloud.io/api/project_badges/measure?branch=main&project=jhipster_generator-jhipster-nodejs&metric=coverage
[sonar-reliability-image]: https://sonarcloud.io/api/project_badges/measure?branch=main&project=jhipster_generator-jhipster-nodejs&metric=reliability_rating
[sonar-security-image]: https://sonarcloud.io/api/project_badges/measure?branch=main&project=jhipster_generator-jhipster-nodejs&metric=security_rating
[sonar-maintainability-image]: https://sonarcloud.io/api/project_badges/measure?branch=main&project=jhipster_generator-jhipster-nodejs&metric=sqale_rating
[sonar-duplication-image]: https://sonarcloud.io/api/project_badges/measure?branch=main&project=jhipster_generator-jhipster-nodejs&metric=duplicated_lines_density
[daviddm-image]: https://david-dm.org/jhipster/generator-jhipster-nodejs.svg?theme=shields.io
[daviddm-url]: https://david-dm.org/jhipster/generator-jhipster-nodejs
[npmcharts-image]: https://img.shields.io/npm/dm/generator-jhipster-nodejs.svg?label=Downloads&style=flat
[npmcharts-url]: https://npmcharts.com/compare/generator-jhipster-nodejs
[gitter-image]: https://badges.gitter.im/generator-jhipster-nodejs/community.svg
[gitter-url]: https://gitter.im/generator-jhipster-nodejs/community?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge
