import chalk from 'chalk';

export const getLogo = version => `
${chalk.yellow(' ███╗   ██╗')}${chalk.green(' ██╗   ██╗ ████████╗ ███████╗   ██████╗ ████████╗ ████████╗ ███████╗')}
${chalk.yellow(' ████╗  ██║')}${chalk.green(' ██║   ██║ ╚══██╔══╝ ██╔═══██╗ ██╔════╝ ╚══██╔══╝ ██╔═════╝ ██╔═══██╗')}
${chalk.yellow(' ██╔██╗ ██║')}${chalk.green(' ████████║    ██║    ███████╔╝ ╚█████╗     ██║    ██████╗   ███████╔╝')}
${chalk.yellow(' ██║╚██╗██║')}${chalk.green(' ██╔═══██║    ██║    ██╔════╝   ╚═══██╗    ██║    ██╔═══╝   ██╔══██║')}
${chalk.yellow(' ██║ ╚████║')}${chalk.green(' ██║   ██║ ████████╗ ██║       ██████╔╝    ██║    ████████╗ ██║  ╚██╗')}
${chalk.yellow(' ╚═╝  ╚═══╝')}${chalk.green(' ╚═╝   ╚═╝ ╚═══════╝ ╚═╝       ╚═════╝     ╚═╝    ╚═══════╝ ╚═╝   ╚═╝')}

                            https://www.jhipster.tech

${chalk.white('Welcome to NHipster (Jhipster NodeJS Official Blueprint) ') + chalk.yellow(`v${version}`)}
${chalk.white('This blueprint generates your backend in NodeJS with NestJS framework')}
${chalk.green(' _______________________________________________________________________________________________________________\n')}
${chalk.white(`  For any questions or improvements refer to the stream lead at ${chalk.yellow('https://github.com/amanganiello90')}`)}
${chalk.white(
  `  If you find NHipster useful, support and star the project at ${chalk.yellow('https://github.com/jhipster/generator-jhipster-nodejs')}`,
)}
${chalk.green.bold(' This NodeJS blueprint use these following configurations:')}

${chalk.green.bold(' 1. NestJS Framework with swagger doc')}

${chalk.green.bold(' 2. JWT or OAuth2 Passport security authentication')}

${chalk.green.bold(' 3. TypeORM usage with SQLite development database and versioning/migration')}

${chalk.green.bold(' 4. Initial load data seed with users (using auth roles) integrated with the angular/react client')}

${chalk.green.bold(' 5. Eureka JS client registry')}
`;
