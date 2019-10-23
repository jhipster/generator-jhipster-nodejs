/**
 * Copyright 2019 Angelo Manganiello and the respective JHipster contributors.
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

const SERVER_NODEJS_SRC_DIR = 'server';
const PACKAGE_NAME_NODEJS = 'com.jhipster.node';
const CACHE_PROVIDER_NODEJS = 'no';
const ENABLE_HIBERNATE_CACHE_NODEJS = false;
const WEB_SOCKET_NODEJS = false;
const DATABASE_TYPE_NODEJS = 'sql';
const DEV_DATABASE_TYPE_NODEJS = 'sqlite';
const SEARCH_ENGINE_NODEJS = false;
const MESSAGE_BROKER_NODEJS = false;
const SERVICE_DISCOVERY_TYPE_NODEJS = false;
const ENABLE_SWAGGER_CODEGEN_NODEJS = false;
const BUILD_TOOL_NODEJS = 'maven';

const constants = {
    SERVER_NODEJS_SRC_DIR,
    PACKAGE_NAME_NODEJS,
    CACHE_PROVIDER_NODEJS,
    ENABLE_HIBERNATE_CACHE_NODEJS,
    WEB_SOCKET_NODEJS,
    DATABASE_TYPE_NODEJS,
    DEV_DATABASE_TYPE_NODEJS,
    SEARCH_ENGINE_NODEJS,
    MESSAGE_BROKER_NODEJS,
    SERVICE_DISCOVERY_TYPE_NODEJS,
    ENABLE_SWAGGER_CODEGEN_NODEJS,
    BUILD_TOOL_NODEJS
};

module.exports = constants;
