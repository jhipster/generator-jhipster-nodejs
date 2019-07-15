import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Connection } from 'typeorm';
import { CoreModule } from './core/core.module';
import { EntitiesModule } from './entities/entities.module';

@Module({
    imports: [
        TypeOrmModule.forRoot(),
        CoreModule,
        EntitiesModule
    ],
    controllers: [
        AppController
    ],
    providers: [],

})
export class ApplicationModule {
    constructor(private readonly connection: Connection) {
    }
}
