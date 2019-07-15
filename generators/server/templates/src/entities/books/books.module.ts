import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { BooksController } from './books.controller';
import { BooksService } from './books.service';
import { AuthMiddleware } from '../../core/auth/auth.middleware';
import { UserModule } from '../../core/user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
    imports: [TypeOrmModule.forFeature([]), UserModule],
    controllers: [BooksController],
    providers: [BooksService],
    exports: []
})
export class BooksModule implements NestModule {
    public configure(consumer: MiddlewareConsumer) {
        consumer
            .apply(AuthMiddleware)
            .forRoutes(
                {path: 'books', method: RequestMethod.POST},
                {path: 'books/:bookID', method: RequestMethod.GET},
                {path: 'books', method: RequestMethod.GET},
                {path: 'books/:bookID', method: RequestMethod.DELETE});
    }
}

