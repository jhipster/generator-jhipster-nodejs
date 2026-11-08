import ClientSpringBootGenerator from 'generator-jhipster/generators/client/generators/spring-boot';
import { clientApplicationTemplatesBlock } from 'generator-jhipster/generators/client/support';

/**
 * The client code bound to the NodeJS backend: what converts the responses of its management endpoints to the models of
 * the admin screens of JHipster. It keeps the replacement of the texts of JHipster's backend generator, with its own files.
 */
export default class extends ClientSpringBootGenerator {
  // The priorities a generator runs are the ones of its own class.
  get [ClientSpringBootGenerator.DEFAULT]() {
    return this.default;
  }

  get [ClientSpringBootGenerator.WRITING]() {
    return this.writing;
  }

  get writing() {
    return this.asWritingTaskGroup({
      async writing({ application }) {
        await this.writeFiles({
          blocks: [
            clientApplicationTemplatesBlock({
              condition: ctx => ctx.withAdminUi,
              templates: [
                'shared/jhipster/configuration.ts',
                'shared/jhipster/health.ts',
                'shared/jhipster/logs.ts',
                'shared/jhipster/metrics.ts',
              ],
            }),
            clientApplicationTemplatesBlock({
              condition: ctx => ctx.withAdminUi && ctx.clientTestFrameworkVitest,
              templates: [
                'shared/jhipster/admin.samples.ts',
                'shared/jhipster/configuration.spec.ts',
                'shared/jhipster/health.spec.ts',
                'shared/jhipster/logs.spec.ts',
                'shared/jhipster/metrics.spec.ts',
              ],
            }),
          ],
          context: application,
        });
      },
    });
  }
}
