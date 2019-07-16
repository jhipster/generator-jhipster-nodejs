/**
 * Copyright 2013-2019 the original author or authors from the JHipster project.
 *
 * This file is part of the JHipster project, see https://www.jhipster.tech/
 * for more information.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const constants = require('generator-jhipster/generators/generator-constants');

const baseServerFiles = require('generator-jhipster/generators/server/files').serverFiles;

const SERVER_MAIN_RES_DIR = constants.SERVER_MAIN_RES_DIR;

const serverFiles = {
    ...baseServerFiles,
    serverResource: [
        {
            path: SERVER_MAIN_RES_DIR,
            // condition: generator => generator.buildTool === 'maven',
            templates: [{file: 'maven/pom', useBluePrint: true}]
        }
    ]
}

/**
 * write the given files using provided config.
 *
 * @param {object} files - files to write
 * @param {object} generator - the generator instance to use
 * @param {boolean} returnFiles - weather to return the generated file list or to write them
 * @param {string} prefix - prefix to add in the path
 */
function writeFilesToDisk(files, generator, returnFiles, prefix) {
    const _this = generator || this;
    const filesOut = [];
    const startTime = new Date();
    // using the fastest method for iterations
    for (let i = 0, blocks = Object.keys(files); i < blocks.length; i++) {
        for (let j = 0, blockTemplates = files[blocks[i]]; j < blockTemplates.length; j++) {
            const blockTemplate = blockTemplates[j];
            if (!blockTemplate.condition || blockTemplate.condition(_this)) {
                const path = blockTemplate.path || '';
                blockTemplate.templates.forEach(templateObj => {
                    let templatePath = path;
                    let method = 'template';
                    let useTemplate = false;
                    let options = {};
                    let templatePathTo;
                    if (typeof templateObj === 'string') {
                        templatePath += templateObj;
                    } else {
                        if (typeof templateObj.file === 'string') {
                            templatePath += templateObj.file;
                        } else if (typeof templateObj.file === 'function') {
                            templatePath += templateObj.file(_this);
                        }
                        method = templateObj.method ? templateObj.method : method;
                        useTemplate = templateObj.template ? templateObj.template : useTemplate;
                        options = templateObj.options ? templateObj.options : options;
                    }
                    if (templateObj && templateObj.renameTo) {
                        templatePathTo = path + templateObj.renameTo(_this);
                    } else {
                        // remove the .ejs suffix
                        templatePathTo = templatePath.replace('.ejs', '');
                    }
                    filesOut.push(templatePathTo);
                    if (!returnFiles) {
                        let templatePathFrom = prefix ? `${prefix}/${templatePath}` : templatePath;

                        if (templateObj.useBluePrint) {
                            templatePathFrom = templatePath;
                        }
                        if (
                            !templateObj.noEjs &&
                            !templatePathFrom.endsWith('.png') &&
                            !templatePathFrom.endsWith('.jpg') &&
                            !templatePathFrom.endsWith('.gif') &&
                            !templatePathFrom.endsWith('.svg') &&
                            !templatePathFrom.endsWith('.ico')
                        ) {
                            templatePathFrom = `${templatePathFrom}.ejs`;
                        }
                        // if (method === 'template')
                        _this[method](templatePathFrom, templatePathTo, _this, options, useTemplate);
                    }
                });
            }
        }
    }
    _this.debug(`Time taken to write files: ${new Date() - startTime}ms`);
    return filesOut;
}


function writeFiles() {
    this.copy('_dummy-server.txt', 'dummy-server.txt');
    writeFilesToDisk(serverFiles, this, false, this.fetchFromInstalledJHipster('server/templates'));
}

module.exports = {
    writeFiles,
    writeFilesToDisk
};
