const path = require('path');
const fse = require('fs-extra');
const assert = require('yeoman-assert');
const helpers = require('yeoman-test');
const constants = require('../generators/generator-nodejs-constants');

const SERVER_NODEJS_DIR = `${constants.SERVER_NODEJS_SRC_DIR}/`;

// initial precondition for all tests
function getPreCondition() {
    return helpers
        .run('generator-jhipster/generators/entity')
        .inTmpDir(dir => {
            fse.copySync(path.join(__dirname, '../test/templates/ngx-blueprint'), dir);
            fse.copySync(path.join(__dirname, '../test/templates/.jhipster'), `${dir}/.jhipster`);
            fse.copySync(path.join(__dirname, '../test/templates/server'), `${dir}/server`);
        })
        .withOptions({
            'from-cli': true,
            skipInstall: true,
            blueprints: 'nodejs',
            skipChecks: true,
            regenerate: true,
            force: true
        })
        .withGenerators([
            [
                require('../generators/entity/index.js'), // eslint-disable-line global-require
                'jhipster-nodejs:entity',
                path.join(__dirname, '../generators/entity/index.js')
            ],
            [
                require('../generators/entity-server/index.js'), // eslint-disable-line global-require
                'jhipster-nodejs:entity-server',
                path.join(__dirname, '../generators/entity-server/index.js')
            ]
        ]);
}

describe('Subgenerator entity of nodejs JHipster blueprint', () => {
    describe('1-foo entity without fields test', () => {
        before(done => {
            getPreCondition()
                .withArguments(['foo'])
                .withPrompts({
                    fieldAdd: false,
                    relationshipAdd: false,
                    dto: 'no',
                    service: 'no',
                    pagination: 'infinite-scroll'
                })
                .on('end', done);
        });

        it('does creates entity files', () => {
            // Adds your tests here
            assert.file('.jhipster/Foo.json');
            assert.file(`${SERVER_NODEJS_DIR}src/domain/foo.entity.ts`);
            assert.file(`${SERVER_NODEJS_DIR}src/repository/foo.repository.ts`);
            assert.file(`${SERVER_NODEJS_DIR}src/service/foo.service.ts`);
            assert.file(`${SERVER_NODEJS_DIR}src/web/rest/foo.controller.ts`);

            const testControllerPath = `${SERVER_NODEJS_DIR}e2e/foo.e2e-spec.ts`;
            assert.file(testControllerPath);
            assert.fileContent(testControllerPath, 'FooService');
        });
    });

    describe('2-GreatEntity json entity with fields test', () => {
        before(done => {
            getPreCondition()
                .withArguments(['GreatEntity'])
                .withPrompts({})
                .on('end', done);
        });

        it('does creates entity file with enum and fields validated', () => {
            // Adds your tests here
            assert.file('.jhipster/GreatEntity.json');

            const genderEnumPath = `${SERVER_NODEJS_DIR}src/domain/enumeration/gender.ts`;
            const greatEntityPath = `${SERVER_NODEJS_DIR}src/domain/great-entity.entity.ts`;

            assert.file(genderEnumPath);
            assert.file(greatEntityPath);

            // Gender enum class
            assert.fileContent(genderEnumPath, 'export enum Gender');

            // import enum in entity
            assert.fileContent(greatEntityPath, "import { Gender } from './enumeration/gender';");

            // name UUID unique field
            assert.fileContent(greatEntityPath, "@Column({ name: 'name', nullable: true, unique: true })");
            assert.fileContent(greatEntityPath, 'name: string;');

            // Gender enum field
            assert.fileContent(greatEntityPath, "@Column({ type: 'simple-enum', name: 'gender', enum: Gender })");
            assert.fileContent(greatEntityPath, 'gender: Gender;');

            // address String required field
            assert.fileContent(greatEntityPath, "@Column({ name: 'address' })");
            assert.fileContent(greatEntityPath, 'address: string;');

            // istrue Boolean required field
            assert.fileContent(greatEntityPath, "@Column({ type: 'boolean', name: 'istrue', nullable: true })");
            assert.fileContent(greatEntityPath, 'istrue: boolean;');

            // borndate LocalDate required field
            assert.fileContent(greatEntityPath, "@Column({ type: 'date', name: 'borndate' })");
            assert.fileContent(greatEntityPath, 'borndate: any;');

            // profileimage Blob field
            assert.fileContent(greatEntityPath, "@Column({ type: 'blob', name: 'profileimage', nullable: true })");
            assert.fileContent(greatEntityPath, 'profileimage: any;');

            // storage AnyBlob field
            assert.fileContent(greatEntityPath, "@Column({ type: 'blob', name: 'storage', nullable: true })");
            assert.fileContent(greatEntityPath, 'storage: any;');

            // datafile TextBlob field
            assert.fileContent(greatEntityPath, "@Column({ type: 'blob', name: 'datafile', nullable: true })");
            assert.fileContent(greatEntityPath, 'datafile: any;');

            // image Blob field
            assert.fileContent(greatEntityPath, "@Column({ type: 'blob', name: 'image', nullable: true })");
            assert.fileContent(greatEntityPath, 'image: any;');

            // amount BigDecimal field
            assert.fileContent(greatEntityPath, "@Column({ type: 'decimal', name: 'amount', precision: 10, scale: 2, nullable: true })");
            assert.fileContent(greatEntityPath, 'amount: number;');

            // cfu Integer field
            assert.fileContent(greatEntityPath, "@Column({ type: 'integer', name: 'cfu', nullable: true })");
            assert.fileContent(greatEntityPath, 'cfu: number;');

            // mynumber Double field
            assert.fileContent(greatEntityPath, "@Column({ type: 'double', name: 'mynumber', nullable: true })");
            assert.fileContent(greatEntityPath, 'mynumber: number;');

            // count Long field
            assert.fileContent(greatEntityPath, "@Column({ type: 'long', name: 'count', nullable: true })");
            assert.fileContent(greatEntityPath, 'count: number;');

            // cent Float field
            assert.fileContent(greatEntityPath, "@Column({ type: 'float', name: 'cent', nullable: true })");
            assert.fileContent(greatEntityPath, 'cent: number;');

            // creationtime Instant field
            assert.fileContent(greatEntityPath, "@Column({ type: 'timestamp', name: 'creationtime', nullable: true })");
            assert.fileContent(greatEntityPath, 'creationtime: any;');

            // deathtime ZonedDateTime field
            assert.fileContent(greatEntityPath, "@Column({ type: 'datetime', name: 'deathtime', nullable: true })");
            assert.fileContent(greatEntityPath, 'deathtime: any;');
        });
    });
});
