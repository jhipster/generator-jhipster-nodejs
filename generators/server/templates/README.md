 
 
> ### NestJS (Express + Postgres) sample api (CRUD, auth, advanced patterns, etc) with JWT and typeorm.


----------

# Getting started

## Installation

Clone the repository

    git clone ...
Switch to the repo folder

    cd ..
    
Install dependencies
    
    npm install

Copy config file and set JsonWebToken secret key

    cp src/config/config.ts.example src/config/config.ts
    
----------

## Database

The example codebase uses [Typeorm](http://typeorm.io/) with a postgres database.

Create a new postgres database with the name `nestjshadirsa` (or the name you specified in the ormconfig.json)

Copy Typeorm config example file for database settings

    cp ormconfig.json.example ``
    
Set postgres database settings in ormconfig.json

    {
      "type": "postgres",
      "host": "localhost",
      "port": 5432,
      "username": "your-postgres-username",
      "password": "your-postgres-password",
      "database": "nestjshadirsa",
      "entities": ["src/**/**.entity{.ts,.js}"],
      "synchronize": true
    }
    
Start local postgres server and create new database 'nestjshadirsa'

On application start, tables for all entities will be created.

----------

## NPM scripts

- `npm start` - Start application
- `npm run start:watch` - Start application in watch mode
- `npm run test` - run Jest test runner 
- `npm run start:prod` - Build application

----------

## Start application

- `npm start`
- Test api with `http://localhost:3000/api/books` in your favourite browser

----------

# Authentication
 
This applications uses JSON Web Token (JWT) to handle authentication. The token is passed with each request using the `Authorization` header with `Token` scheme. The JWT authentication middleware handles the validation and authentication of the token. Please check the following sources to learn more about JWT.

----------
 
# Swagger API docs

This example repo uses the NestJS swagger module for API documentation. [NestJS Swagger](https://github.com/nestjs/swagger) - [www.swagger.io](https://swagger.io/)        
