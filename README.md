# generator-jhipster-nodejs

[![NPM version][npm-image]][npm-url]
[![Generator Build Status][github-actions-generator-image]][github-actions-generator-link]
[![Generator Angular Samples Status][github-actions-angular-samples-image]][github-actions-angular-samples-link]
[![Generator React Samples Status][github-actions-react-samples-image]][github-actions-react-samples-link]
[![Generator Vue Samples Status][github-actions-vue-samples-image]][github-actions-vue-samples-link]
[![Generator Microservice Samples Status][github-actions-microservice-samples-image]][github-actions-microservice-samples-link]
[![Gitter][gitter-image]][gitter-url]
[![Downloads][npmcharts-image]][npmcharts-url]

> generator-jhipster-nodejs, the _official NodeJS blueprint_ that uses [NestJS TypeScript Framework](https://nestjs.com/) for your **backend**. We encourage you to use it and give us your feedback.

<div align="center">
	<a href="https://github.com/jhipster/generator-jhipster-nodejs">
		<img width="160" height="200" src="https://raw.githubusercontent.com/jhipster/generator-jhipster-nodejs/main/logo-nhipster.png">
	</a>
</div>

> ## Notes
>
> For the features of the last release refers to [CHANGELOG.md](https://github.com/jhipster/generator-jhipster-nodejs/blob/main/CHANGELOG.md).

> ## Demo
>
> The UI is inherited from standard JHipster app client. So only backend generation changes.
> For this, a live app running is less useful than the code and the app structure shows in:
>
> - **The sample repo app with** [React client and Okta OAuth2](https://github.com/jhipster/jhipster-sample-app-nodejs-oauth2/tree/v2.0.0)
> - **The sample repo app with** [Angular client and JWT auth](https://github.com/jhipster/jhipster-sample-app-nodejs/tree/v2.0.0)
> - **The sample repo app with** [Vue.js client and mongodb](https://github.com/jhipster/jhipster-sample-app-nodejs-vuejs/tree/v2.0.0)
>
> These sample repos were generated with the blueprint `v2.0.0` (JHipster 7) and are not representative of the current release anymore.
> For up-to-date application configurations, see the [samples built by the CI](https://github.com/jhipster/generator-jhipster-nodejs/tree/main/.blueprint/generate-sample/templates/samples).

<div align="center">
	<a href="https://github.com/jhipster/generator-jhipster-nodejs">
		<img src="https://raw.githubusercontent.com/jhipster/generator-jhipster-nodejs/main/nhipster-cli-logo.png">
	</a>
</div>

# Greetings, nodejs Hipster!

This project adds nodejs for your backend, **all TypeScript files generation, not Java!**, to the [JHipster](https://www.jhipster.tech/) application 😎. It is based on JHipster Blueprint 🔵, that is meant to be used in a JHipster application.

> The generator applies this standard configuration for the NodeJS app:

> - NestJS base app with web controllers, [swagger doc](https://github.com/nestjs/swagger) and [JWT or OAuth2 passport auth](https://github.com/nestjs/passport) services

> - The app starts with four seed users (admin, basic user and anonymous roles), as standard JHipster monolithic app, with SQLite for dev and configurable sql db for prod. MongoDB support is experimental in [TypeORM](https://github.com/typeorm/typeorm/blob/fdbb013d2279264e851dacc4c5c2e94567b65ab7/README.md?plain=1#L255) so is in JHipster NodeJS.

> - The app uses [TypeORM](https://github.com/nestjs/typeorm) and asks you a question for another sql db or for mongodb

> - TypeORM is also used for the automatically migration and versioning of the database scripts

> - The app runs also as a full stack app including, for the monolitich choice, the Angular/React/Vue client with the home page set for NHipster and CRUD operations for entity generated with subgenerator and jdl import

<div align="center">
		<img src="https://raw.githubusercontent.com/jhipster/generator-jhipster-nodejs/main/nhipster-cli.gif">
</div>

> A **previous of a jwt auth app:**

<div align="center">
		<img src="https://raw.githubusercontent.com/jhipster/generator-jhipster-nodejs/main/demo-full-app.gif">
</div>

# Prerequisites

This blueprint bundles the [JHipster](https://www.jhipster.tech/) version it is built against and ships its own `nhipster` CLI, so the only requirement is a supported [Node.js](https://nodejs.org/) version:

- **Node.js `^22.18.0 || >=24.11.0`**

The authoritative values are the `engines` of [package.json](https://github.com/jhipster/generator-jhipster-nodejs/blob/main/package.json), which also pins the supported `generator-jhipster` version.

> A global `jhipster` or `yo` installation is **not** required: `generator-jhipster` is a direct dependency of this blueprint.

# 🚀 How to get started

1. Make sure you run a supported Node.js version (see [Prerequisites](#prerequisites)).
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

`yarn global` is only available in Yarn Classic (1.x); with Yarn 2+ (Berry) install the blueprint with npm.

To install this blueprint:

```bash
yarn global add generator-jhipster-nodejs
```

To update this blueprint:

```bash
yarn global upgrade generator-jhipster-nodejs
```

## 🚦 What we have now

This blueprint ships its own CLI, `nhipster`, which wraps the JHipster CLI with the blueprint already enabled. Both **monolith** and **microservice** application types are supported.

✅ General App generation

- `nhipster`

✅ Entity generation

- `nhipster entity <entity-name>`

✅ JDL model support generation

- `nhipster jdl my_file.jdl`

✅ Ci-cd generation

- `nhipster ci-cd`

For the last, in the [generate-sample samples folder](https://github.com/jhipster/generator-jhipster-nodejs/tree/main/.blueprint/generate-sample/templates/samples) and [jdl-samples](https://github.com/jhipster/jdl-samples) there are some examples of jdl models.

## Using Docker

1. Download the Dockerfile:

```bash
mkdir docker
cd docker
wget https://github.com/jhipster/generator-jhipster-nodejs/raw/main/docker/Dockerfile
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

- Run the generator from image to generate service:

```bash
docker run -it --rm -v $PWD:/home/jhipster/app jhipster-generator-nodejs
```

- Run and attach interactive shell to the generator docker container to work from inside the running container:

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
$ mkdir test-generation
$ cd test-generation
```

Now you will develop under the **generator-jhipster-nodejs** that you have cloned with git.
After finish, to generate the app and check your feature, run in **test-generation** folder:

- `nhipster`

## ❤️ For community

Found an [issue](https://github.com/jhipster/generator-jhipster-nodejs/issues), check if is already opened or closed, otherwise open a new [feature or bug](https://github.com/jhipster/generator-jhipster-nodejs/issues/new/choose).

Interested in contributing, check out our [contributing guide](https://github.com/jhipster/generator-jhipster-nodejs/blob/main/CONTRIBUTING.md) to get started.

Refer for contribution to the [roadmap](https://github.com/jhipster/generator-jhipster-nodejs/blob/main/ROADMAP.md).

Any questions [Angelo Manganiello](mailto:angelo.mang@libero.it).

# Contributors ✨

Thanks goes to these wonderful people:

<table><tr><td align="center"><a href="https://github.com/amanganiello90"><img src="https://avatars3.githubusercontent.com/u/20536757?s=400" width="100px;" alt="Angelo Manganiello (founder stream lead)"/><br/><sub><b>Angelo Manganiello</b><br/><b>(founder stream lead)</b></sub></a></td><td align="center"><a href="https://github.com/hadirsa"><img src="https://avatars2.githubusercontent.com/u/3942854?s=400" width="100px;" alt="Hadi Rasouli"/><br /><sub><b>Hadi Rasouli</b></sub></a></td><td align="center"><a href="https://github.com/ivangsa"><img src="https://avatars1.githubusercontent.com/u/1246876?s=400" width="100px;" alt="Iván García Sainz-Aja"/><br /><sub><b>Iván García Sainz-Aja</b></sub></a></td><td align="center"><a href="https://github.com/DanielFran"><img src="https://avatars1.githubusercontent.com/u/3706415?s=400" width="100px;" alt="Daniel Franco"/><br /><sub><b>Daniel Franco</b></sub></a></td><td align="center"><a href="https://github.com/Aragonbn90"><img src="https://avatars2.githubusercontent.com/u/4463823?s=400" width="100px;" alt="Ed Pham"/><br /><sub><b>Ed Pham</b></sub></a></td><td align="center"><a href="https://github.com/glutengo"><img src="https://avatars.githubusercontent.com/u/14246032?v=4" width="100px;" alt="Markus"/><br /><sub><b>Markus</b></sub></a></td></tr></table>

# Special Thanks

<div align="left">
		<a href="https://www.jetbrains.com/?from=generator-jhipster-nodejs">
		  <img width="80" height="100" src="https://raw.githubusercontent.com/jhipster/generator-jhipster-nodejs/main/jetbrains.png">
		</a>
		<a href="https://code.visualstudio.com">
		  <img width="100" height="100" src="https://raw.githubusercontent.com/jhipster/generator-jhipster-nodejs/main/visualstudio-code.png">
		</a>
		<a href="https://www.jhipster.tech">
		  <img width="160" height="100" src="https://raw.githubusercontent.com/jhipster/generator-jhipster-nodejs/main/jhipster-logo.png">
		</a>
</div>

# License

Apache-2.0 © [Angelo Manganiello](https://github.com/amanganiello90)

[npm-image]: https://img.shields.io/npm/v/generator-jhipster-nodejs.svg
[npm-url]: https://npmjs.org/package/generator-jhipster-nodejs
[github-actions-generator-image]: https://github.com/jhipster/generator-jhipster-nodejs/actions/workflows/generator.yml/badge.svg
[github-actions-generator-link]: https://github.com/jhipster/generator-jhipster-nodejs/actions/workflows/generator.yml
[github-actions-angular-samples-image]: https://github.com/jhipster/generator-jhipster-nodejs/actions/workflows/test-integration-angular.yml/badge.svg
[github-actions-angular-samples-link]: https://github.com/jhipster/generator-jhipster-nodejs/actions/workflows/test-integration-angular.yml
[github-actions-react-samples-image]: https://github.com/jhipster/generator-jhipster-nodejs/actions/workflows/test-integration-react.yml/badge.svg
[github-actions-react-samples-link]: https://github.com/jhipster/generator-jhipster-nodejs/actions/workflows/test-integration-react.yml
[github-actions-vue-samples-image]: https://github.com/jhipster/generator-jhipster-nodejs/actions/workflows/test-integration-vue.yml/badge.svg
[github-actions-vue-samples-link]: https://github.com/jhipster/generator-jhipster-nodejs/actions/workflows/test-integration-vue.yml
[github-actions-microservice-samples-image]: https://github.com/jhipster/generator-jhipster-nodejs/actions/workflows/test-integration-microservice.yml/badge.svg
[github-actions-microservice-samples-link]: https://github.com/jhipster/generator-jhipster-nodejs/actions/workflows/test-integration-microservice.yml
[npmcharts-image]: https://img.shields.io/npm/dm/generator-jhipster-nodejs.svg?label=Downloads&style=flat
[npmcharts-url]: https://npmcharts.com/compare/generator-jhipster-nodejs
[gitter-image]: https://badges.gitter.im/generator-jhipster-nodejs/community.svg
[gitter-url]: https://gitter.im/generator-jhipster-nodejs/community?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge
