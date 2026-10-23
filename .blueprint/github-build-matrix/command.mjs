/**
 * @type {import('generator-jhipster').JHipsterCommandDefinition}
 */
const command = {
  configs: {
    samplesGroup: {
      description: 'Samples group, the workflow of the matrix or a folder of samples',
      argument: {
        type: String,
      },
      default: 'samples',
      scope: 'generator',
    },
  },
};

export default command;
