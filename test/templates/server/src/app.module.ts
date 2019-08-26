import { Module, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtStrategy } from './security/passport.jwt.strategy';
import { UsersModule } from './module/users.module';
// jhipster-needle-add-entity-module-to-main-import - JHipster will import entity modules here
// jhipster-needle-add-controller-module-to-main-import - JHipster will import controller modules here

@Module({
  imports: [
    TypeOrmModule.forRoot({
      name: 'default',
      type: 'sqlite',
      database: '../target/sqlite-dev-db.sql',
      synchronize: true,
      logging: false,
      entities: [__dirname + '/domain/*.entity{.ts,.js}']
    }),
    UsersModule
    // jhipster-needle-add-entity-module-to-main - JHipster will add entity modules here
  ],
  controllers: [
  // jhipster-needle-add-controller-module-to-main - JHipster will add controller modules here
  ],
  providers: [JwtStrategy]
})
export class AppModule  {

}
