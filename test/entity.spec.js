const path = require('path');
const fse = require('fs-extra');
const assert = require('yeoman-assert');
const helpers = require('yeoman-test');
const REACT_DIR = require('generator-jhipster/generators/generator-constants').REACT_DIR;

const constants = require('../generators/generator-nodejs-constants');

const SERVER_NODEJS_DIR = `${constants.SERVER_NODEJS_SRC_DIR}/`;

// initial precondition for all tests
function getPreCondition() {
    return helpers
        .run('generator-jhipster/generators/entity')
        .inTmpDir(dir => {
            fse.copySync(path.join(__dirname, '../test/templates/react-blueprint'), dir);
            fse.copySync(path.join(__dirname, '../test/templates/src'), `${dir}/src`);
            fse.copySync(path.join(__dirname, '../test/templates/.jhipster'), `${dir}/.jhipster`);
            fse.copySync(path.join(__dirname, '../test/templates/server'), `${dir}/server`);
        })
        .withOptions({
            fromCli: true,
            skipInstall: true,
            blueprints: 'nodejs',
            skipChecks: true,
            regenerate: true,
            force: true
        })
        .withGenerators([
            [
                require('../generators/entities/index.js'), // eslint-disable-line global-require
                'jhipster-nodejs:entities',
                path.join(__dirname, '../generators/entities/index.js')
            ],
            [
                require('../generators/entity/index.js'), // eslint-disable-line global-require
                'jhipster-nodejs:entity',
                path.join(__dirname, '../generators/entity/index.js')
            ],
            [
                require('../generators/entity-server/index.js'), // eslint-disable-line global-require
                'jhipster-nodejs:entity-server',
                path.join(__dirname, '../generators/entity-server/index.js')
            ],
            [
                require('../generators/entity-client/index.js'), // eslint-disable-line global-require
                'jhipster-nodejs:entity-client',
                path.join(__dirname, '../generators/entity-client/index.js')
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
            assert.file(`${SERVER_NODEJS_DIR}src/service/dto/foo.dto.ts`);
            assert.file(`${SERVER_NODEJS_DIR}src/service/mapper/foo.mapper.ts`);
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

            // test entity-client removed id primary key
            const entityReactPath = `${REACT_DIR}entities/great-entity/great-entity.tsx`;
            assert.file(entityReactPath);
            assert.fileContent(entityReactPath, '// removed th id primary key');

            const genderEnumPath = `${SERVER_NODEJS_DIR}src/domain/enumeration/gender.ts`;
            const greatEntityPath = `${SERVER_NODEJS_DIR}src/domain/great-entity.entity.ts`;

            const greatEntityDTOPath = `${SERVER_NODEJS_DIR}src/service/dto/great-entity.dto.ts`;

            assert.file(genderEnumPath);
            assert.file(greatEntityPath);
            assert.file(greatEntityDTOPath);

            // Gender enum class
            assert.fileContent(genderEnumPath, 'export enum Gender');

            // import enum in entity
            assert.fileContent(greatEntityPath, 'import { Gender } from "./enumeration/gender";');

            // import enum in entity dto
            assert.fileContent(greatEntityDTOPath, 'import { Gender } from "../../domain/enumeration/gender";');

            // name UUID unique field
            assert.fileContent(greatEntityPath, '@Column({ name: "name", nullable: true, unique: true })');
            assert.fileContent(greatEntityPath, 'name: string;');

            // name UUID with validation and swagger annotation
            assert.fileContent(greatEntityDTOPath, 'name: string;');
            assert.fileContent(greatEntityDTOPath, '@MinLength(5)');
            assert.fileContent(greatEntityDTOPath, '@ApiProperty({ description: "name field", required: false })');

            // Gender enum field with swagger annotation
            assert.fileContent(greatEntityPath, '@Column({ type: "simple-enum", name: "gender", enum: Gender })');
            assert.fileContent(greatEntityPath, 'gender: Gender;');
            assert.fileContent(greatEntityDTOPath, 'gender: Gender;');
            assert.fileContent(greatEntityDTOPath, '@ApiProperty({ enum: Gender, description: "gender enum field" })');

            // address string required field
            assert.fileContent(greatEntityPath, '@Column({ name: "address", length: 100 })');
            assert.fileContent(greatEntityPath, 'address: string;');

            // address string with validation and swagger annotation
            assert.fileContent(greatEntityDTOPath, 'address: string;');
            assert.fileContent(greatEntityDTOPath, '@IsNotEmpty()');
            assert.fileContent(greatEntityDTOPath, '@Length(1, 100)');
            assert.fileContent(greatEntityDTOPath, '@ApiProperty({ description: "address field" })');

            // description string field
            assert.fileContent(greatEntityPath, '@Column({ name: "description", nullable: true })');
            assert.fileContent(greatEntityPath, 'description: string;');

            // description string with validation and swagger annotation
            assert.fileContent(greatEntityDTOPath, 'description: string;');
            assert.fileContent(greatEntityDTOPath, '@Matches("^[A-Z]$")');
            assert.fileContent(greatEntityDTOPath, '@ApiProperty({ description: "description field", required: false })');

            // istrue Boolean field with swagger annotation
            assert.fileContent(greatEntityPath, '@Column({ type: "boolean", name: "istrue", nullable: true })');
            assert.fileContent(greatEntityPath, 'istrue: boolean;');
            assert.fileContent(greatEntityDTOPath, 'istrue: boolean;');
            assert.fileContent(greatEntityDTOPath, '@ApiProperty({ description: "istrue field", required: false })');

            // borndate LocalDate required field
            assert.fileContent(greatEntityPath, '@Column({ type: "date", name: "borndate" })');
            assert.fileContent(greatEntityPath, 'borndate: any;');

            assert.fileContent(greatEntityDTOPath, '@ApiProperty({ description: "borndate field" })');

            // profileimage Blob field
            assert.fileContent(greatEntityPath, '@Column({ type: "blob", name: "profileimage", nullable: true })');
            assert.fileContent(greatEntityPath, 'profileimage: any;');

            // storage AnyBlob field
            assert.fileContent(greatEntityPath, '@Column({ type: "blob", name: "storage", nullable: true })');
            assert.fileContent(greatEntityPath, 'storage: any;');

            // datafile TextBlob field
            assert.fileContent(greatEntityPath, '@Column({ type: "blob", name: "datafile", nullable: true })');
            assert.fileContent(greatEntityPath, 'datafile: any;');

            // image Blob field
            assert.fileContent(greatEntityPath, '@Column({ type: "blob", name: "image", nullable: true })');
            assert.fileContent(greatEntityPath, 'image: any;');

            // amount BigDecimal field
            assert.fileContent(greatEntityPath, '  type: "decimal",');
            assert.fileContent(greatEntityPath, '  name: "amount",');
            assert.fileContent(greatEntityPath, '  precision: 10,');
            assert.fileContent(greatEntityPath, '  scale: 2,');
            assert.fileContent(greatEntityPath, 'amount: number;');

            // cfu Integer field
            assert.fileContent(greatEntityPath, '@Column({ type: "integer", name: "cfu", nullable: true })');
            assert.fileContent(greatEntityPath, 'cfu: number;');

            // mynumber Double field
            assert.fileContent(greatEntityPath, '@Column({ type: "double", name: "mynumber", nullable: true })');
            assert.fileContent(greatEntityPath, 'mynumber: number;');

            // mynumber with validation and swagger annotation
            assert.fileContent(greatEntityDTOPath, 'mynumber: number;');
            assert.fileContent(greatEntityDTOPath, '@Min(1)');
            assert.fileContent(greatEntityDTOPath, '@Max(100)');
            assert.fileContent(greatEntityDTOPath, '@ApiProperty({ description: "mynumber field", required: false })');

            // count Long field
            assert.fileContent(greatEntityPath, '@Column({ type: "long", name: "count", nullable: true })');
            assert.fileContent(greatEntityPath, 'count: number;');

            // cent Float field
            assert.fileContent(greatEntityPath, '@Column({ type: "float", name: "cent", nullable: true })');
            assert.fileContent(greatEntityPath, 'cent: number;');

            // creationtime Instant field
            assert.fileContent(greatEntityPath, '@Column({ type: "datetime", name: "creationtime", nullable: true })');
            assert.fileContent(greatEntityPath, 'creationtime: any;');

            // deathtime ZonedDateTime field
            assert.fileContent(greatEntityPath, '@Column({ type: "datetime", name: "deathtime", nullable: true })');
            assert.fileContent(greatEntityPath, 'deathtime: any;');
        });
    });
});
