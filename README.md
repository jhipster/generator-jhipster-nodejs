# generator-jhipster-nodejs
[![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Dependency Status][daviddm-image]][daviddm-url]

> ## 🛠 Mode: Development
>
> Generator-jhipster-nodejs, that uses [NestJS Fremework](https://nestjs.com/), is currently in development. We encourage you to use it and give us your feedback.

<div align="center">
	<a href="https://github.com/jhipster/generator-jhipster-nodejs">
		<img width="160" height="200" src="https://github.com/jhipster/generator-jhipster-nodejs/blob/master/logo-nhipster.png">
	</a>
</div>


# Greetings, nodejs Hipster!

This project adds nodejs to the [JHipster](https://www.jhipster.tech/) application 😎. It is based on JHipster Blueprint 🔵, that is meant to be used in a JHipster application.


# Prerequisites

As this is a [JHipster](https://www.jhipster.tech/) blueprint, we expect you have JHipster and its related tools already installed:

- [Installing JHipster](https://www.jhipster.tech/installation/)

## 🚀 How to get started

Install the package with `npm install -g generator-jhipster-nodejs`
1. Make sure you have `yo` installed with `npm install -g yo`
2. Install the package with `npm install -g generator-jhipster-nodejs`
3. Generate the application with `nhipster`

(or)

If you also have JHipster available locally Use the following:

1. Make sure you have followed the [JHipster installation guide](https://www.jhipster.tech/installation) and that both `yeoman` and `jhipster` are installed.
2. Install the package with `npm install -g generator-jhipster-nodejs`
3. And generate the application with `jhipster --blueprint nodejs`


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

```bash
yarn global add generator-jhipster-nodejs
```

To update this blueprint:

```bash
yarn global upgrade generator-jhipster-nodejs
```

# Usage

To use this blueprint, run the below command

```bash
jhipster --blueprint nodejs
```


## Running local Blueprint version for development

During development of blueprint, please note the below steps. They are very important.

1. Link your blueprint globally 

Note: If you do not want to link the blueprint(step 3) to each project being created, use NPM instead of Yarn as yeoman doesn't seem to fetch globally linked Yarn modules. On the other hand, this means you have to use NPM in all the below steps as well.

```bash
cd nodejs
npm link
```

2. Link a development version of JHipster to your blueprint (optional: required only if you want to use a non-released JHipster version, like the master branch or your own custom fork)

You could also use Yarn for this if you prefer

```bash
cd generator-jhipster
npm link

cd nodejs
npm link generator-jhipster
```

3. Create a new folder for the app to be generated and link JHipster and your blueprint there

```bash
mkdir my-app && cd my-app

npm link generator-jhipster-nodejs
npm link generator-jhipster (Optional: Needed only if you are using a non-released JHipster version)

jhipster -d --blueprint nodejs

```

## 🚦 What we have now

✅ General App generation (WIP)
    - `nhipster`

✅ Entity generation (WIP)
    - `nhipster entity <entity-name>`

## ❤️ for community

Found an issue, let us know [here](https://github.com/jhipster/generator-jhipster-nodejs/issues).

Interested in contributing, check out our [contributing guide](https://github.com/jhipster/generator-jhipster-nodejs/blob/master/CONTRIBUTING.md) to get started.

Any questions [amanganiello90](mailto:angelo.mang@libero.it)

# License

Apache-2.0 © [Angelo Manganiello](https://github.com/amanganiello90)


[npm-image]: https://img.shields.io/npm/v/generator-jhipster-nodejs.svg
[npm-url]: https://npmjs.org/package/generator-jhipster-nodejs
[travis-image]: https://travis-ci.org/amanganiello90/generator-jhipster-nodejs.svg?branch=master
[travis-url]: https://travis-ci.org/amanganiello90/generator-jhipster-nodejs
[daviddm-image]: https://david-dm.org/amanganiello90/generator-jhipster-nodejs.svg?theme=shields.io
[daviddm-url]: https://david-dm.org/amanganiello90/generator-jhipster-nodejs
