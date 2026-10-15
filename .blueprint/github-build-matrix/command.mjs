/**
 * @type {import('generator-jhipster').JHipsterCommandDefinition}
 */
const command = {
  configs: {
    samplesGroup: {
      description: 'The samples group, the workflow, to build the matrix of',
      argument: {
        type: String,
      },
      scope: 'generator',
    },
  },
};

export default command;
