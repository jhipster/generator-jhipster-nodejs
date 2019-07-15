import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from '../../core/user/user.module';
import { TagService } from './tag.service';
import { TagEntity } from './tag.entity';
import { TagController } from './tag.controller';

@Module({
    imports: [TypeOrmModule.forFeature([TagEntity]), UserModule],
    providers: [TagService],
    controllers: [
        TagController
    ],
    exports: []
})
export class TagModule implements NestModule {
    public configure(consumer: MiddlewareConsumer) {
    }
}
