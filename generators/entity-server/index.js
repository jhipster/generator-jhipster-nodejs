/* eslint-disable consistent-return */
const chalk = require('chalk');
const EntityServerGenerator = require('generator-jhipster/generators/entity-server');
const writeFiles = require('./files').writeFiles;

const fieldTypes = {
    Boolean: 'boolean',
    Integer: 'number',
    Long: 'number',
    Float: 'number',
    Double: 'number',
    BigDecimal: 'number',
    String: 'string',
    UUID: 'string'
};

const dbTypes = {
    Boolean: 'boolean',
    Integer: 'integer',
    Long: 'long',
    Float: 'float',
    Double: 'double',
    BigDecimal: 'decimal',
    LocalDate: 'date',
    Instant: 'timestamp',
    ZonedDateTime: 'datetime',
    AnyBlob: 'blob',
    ImageBlob: 'blob',
    Blob: 'blob',
    TextBlob: 'blob',
    'byte[]': 'blob'
};

function sanitizeDbType(fieldType, dbType) {
    if (dbType === 'sqlite') {
        if (fieldType === 'timestamp') {
            return 'datetime';
        }
    }
    return fieldType;
}

module.exports = class extends EntityServerGenerator {
    constructor(args, opts) {
        super(args, { fromBlueprint: true, ...opts }); // fromBlueprint variable is important

        if (!this.jhipsterContext) {
            this.error(`This is a JHipster blueprint and should be used only like ${chalk.yellow('jhipster --blueprints nodejs')}`);
        }
    }

    get initializing() {
        return this._initializing();
    }

    get preparingFields() {
        return this._preparingFields();
    }

    get default() {
        return this._default();
    }

    get writing() {
        return writeFiles();
    }

    get postWriting() {
        return null;
    }

    getTsType(fieldType) {
        return fieldTypes[fieldType] || 'any';
    }

    addDbType(fieldType) {
        return sanitizeDbType(dbTypes[fieldType], this.devDatabaseType);
    }
};
