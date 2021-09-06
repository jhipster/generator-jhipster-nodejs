const jhipsterConstants = require('generator-jhipster/generators/generator-constants');

const ANGULAR_DIR = jhipsterConstants.ANGULAR_DIR;
const REACT_DIR = jhipsterConstants.REACT_DIR;
const VUE_DIR = jhipsterConstants.VUE_DIR;
const TEST_DIR = jhipsterConstants.CLIENT_TEST_SRC_DIR;

const clientFiles = {
    common: [
        {
            condition: generator => generator.clientFramework === 'angularX',
            templates: [
                { file: 'angular/tsconfig.json', renameTo: () => 'tsconfig.json' },
                { file: 'angular/package.json', renameTo: () => 'package.json' },
                { file: 'angular/eslintignore', renameTo: () => '.eslintignore' }
            ]
        },
        {
            condition: generator => generator.clientFramework === 'react',
            templates: [
                { file: 'react/tsconfig.json', renameTo: () => 'tsconfig.json' },
                { file: 'react/package.json', renameTo: () => 'package.json' },
                { file: 'react/eslintignore', renameTo: () => '.eslintignore' }
            ]
        },
        {
            condition: generator => generator.clientFramework === 'vue',
            templates: [
                { file: 'vue/tsconfig.json', renameTo: () => 'tsconfig.json' },
                { file: 'vue/package.json', renameTo: () => 'package.json' },
                { file: 'vue/eslintignore', renameTo: () => '.eslintignore' }
            ]
        }
    ],
    angularMain: [
        {
            condition: generator => generator.clientFramework === 'angularX',
            templates: [
                {
                    file: 'angular/home/home.component.html',
                    method: 'processHtml',
                    renameTo: () => `${ANGULAR_DIR}home/home.component.html`
                },
                {
                    file: 'angular/docs/docs.component.html',
                    method: 'processHtml',
                    renameTo: () => `${ANGULAR_DIR}admin/docs/docs.component.html`
                },
                {
                    file: 'angular/layouts/navbar/navbar.component.html',
                    method: 'processHtml',
                    renameTo: () => `${ANGULAR_DIR}layouts/navbar/navbar.component.html`
                }
            ]
        }
    ],
    reactMain: [
        {
            condition: generator => generator.clientFramework === 'react',
            templates: [
                {
                    file: 'react/home/home.tsx',
                    method: 'processJsx',
                    renameTo: () => `${REACT_DIR}modules/home/home.tsx`
                },
                {
                    file: 'react/docs/docs.tsx',
                    method: 'processJsx',
                    renameTo: () => `${REACT_DIR}modules/administration/docs/docs.tsx`
                },
                {
                    file: 'react/shared/layout/header/header.tsx',
                    method: 'processJsx',
                    renameTo: () => `${REACT_DIR}shared/layout/header/header.tsx`
                },
                {
                    file: 'react/shared/layout/menus/admin.tsx',
                    method: 'processJsx',
                    renameTo: () => `${REACT_DIR}shared/layout/menus/admin.tsx`
                }
            ]
        }
    ],
    vueMain: [
        {
            condition: generator => generator.clientFramework === 'vue',
            templates: [
                {
                    file: 'vue/home/home.vue',
                    renameTo: () => `${VUE_DIR}core/home/home.vue`
                },
                {
                    file: 'vue/docs/docs.vue',
                    renameTo: () => `${VUE_DIR}admin/docs/docs.vue`
                },
                {
                    file: 'vue/jhi-navbar/jhi-navbar.vue',
                    renameTo: () => `${VUE_DIR}core/jhi-navbar/jhi-navbar.vue`
                },
                {
                    file: 'vue/account/account.service.ts',
                    renameTo: () => `${VUE_DIR}account/account.service.ts`
                },
                {
                    file: 'vue/account/account.service.spec.ts',
                    renameTo: () => `${TEST_DIR}spec/app/account/account.service.spec.ts`
                }
            ]
        },
        {
            condition: generator => generator.clientFramework === 'vue' && !generator.skipUserManagement,
            templates: [
                {
                    file: 'vue/user-management/user-management.component.ts',
                    renameTo: () => `${VUE_DIR}admin/user-management/user-management.component.ts`
                }
            ]
        }
    ],
    testE2EWithMain: [
        {
            condition: generator => generator.clientFramework === 'react',
            templates: [
                {
                    file: 'react/test/protractor.conf.js',
                    renameTo: () => `${TEST_DIR}protractor.conf.js`
                },
                {
                    file: 'react/test/e2e/administration.spec.ts',
                    renameTo: () => `${TEST_DIR}e2e/modules/administration/administration.spec.ts`
                },
                {
                    file: 'react/test/e2e/account.spec.ts',
                    renameTo: () => `${TEST_DIR}e2e/modules/account/account.spec.ts`
                }
            ]
        },
        {
            condition: generator => generator.clientFramework === 'angularX',
            templates: [
                {
                    file: 'angular/test/protractor.conf.js',
                    renameTo: () => `${TEST_DIR}protractor.conf.js`
                },
                {
                    file: 'angular/test/e2e/administration.spec.ts',
                    renameTo: () => `${TEST_DIR}e2e/admin/administration.spec.ts`
                }
            ]
        },
        {
            condition: generator => generator.clientFramework === 'vue',
            templates: [
                {
                    file: 'vue/test/protractor.conf.js',
                    renameTo: () => `${TEST_DIR}protractor.conf.js`
                },
                {
                    file: 'vue/test/e2e/administration.spec.ts',
                    renameTo: () => `${TEST_DIR}e2e/modules/administration/administration.spec.ts`
                },
                {
                    file: 'vue/test/e2e/account.spec.ts',
                    renameTo: () => `${TEST_DIR}e2e/modules/account/account.spec.ts`
                }
            ]
        }
    ]
};

function writeFiles() {
    return {
        overrideFiles() {
            // TODO: remove override of workbox-webpack-plugin once generator-jhipster is updated (see https://stackoverflow.com/questions/68895709/jhipster-7-1-0-reactjs-building-jar/68903314#68903314)
            this.dependabotPackageJson.devDependencies['workbox-webpack-plugin'] = '6.2.4';
            this.writeFilesToDisk(clientFiles, this, false);
        }
    };
}

module.exports = {
    writeFiles
};
