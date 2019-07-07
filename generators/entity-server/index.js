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
    String: '',
    UUID: 'string',
    LocalDate: 'string',
    Instant: 'Moment',
    ZonedDateTime: 'Moment',
    'byte[]': 'any',
    ByteBuffer: 'any'
};

module.exports = class extends EntityServerGenerator {
    constructor(args, opts) {
        super(args, Object.assign({ fromBlueprint: true }, opts)); // fromBlueprint variable is important

        const jhContext = (this.jhipsterContext = this.options.jhipsterContext);

        if (!jhContext) {
            this.error(`This is a JHipster blueprint and should be used only like ${chalk.yellow('jhipster --blueprint nodejs')}`);
        }

        this.configOptions = jhContext.configOptions || {};
        if (jhContext.databaseType === 'cassandra') {
            this.pkType = 'UUID';
        }
    }

    get writing() {
        return {
            writeAdditionalFile() {
                writeFiles.call(this);
            }
        };
    }

    get end() {
        // Here we are not overriding this phase and hence its being handled by JHipster
        return super._end();
    }

    getTsType(field) {
        return field.fieldTypeBlobContent === 'text' ? 'string' : fieldTypes[field.fieldType] || 'any';
    }
};
