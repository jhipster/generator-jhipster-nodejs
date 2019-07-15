import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { LabelController } from './label.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LabelEntity } from './label.entity';
import { Comment } from './comment.entity';
import { UserEntity } from '../../core/user/user.entity';
import { LabelService } from './label.service';
import { AuthMiddleware } from '../../core/auth/auth.middleware';
import { UserModule } from '../../core/user/user.module';

@Module({
    imports: [TypeOrmModule.forFeature([LabelEntity, Comment, UserEntity]), UserModule],
    providers: [LabelService],
    controllers: [
        LabelController
    ]
})
export class LabelModule implements NestModule {
    public configure(consumer: MiddlewareConsumer) {
        consumer
            .apply(AuthMiddleware)
            .forRoutes(
                {path: 'labels/feed', method: RequestMethod.GET},
                {path: 'labels', method: RequestMethod.POST},
                {path: 'labels/:slug', method: RequestMethod.DELETE},
                {path: 'labels/:slug', method: RequestMethod.PUT},
                {path: 'labels/:slug/comments', method: RequestMethod.POST},
                {path: 'labels/:slug/comments/:id', method: RequestMethod.DELETE},
                {path: 'labels/:slug/favorite', method: RequestMethod.POST},
                {path: 'labels/:slug/favorite', method: RequestMethod.DELETE});
    }
}
