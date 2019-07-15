import { Module } from '@nestjs/common';
import { LabelModule } from './label/label.module';
import { TagModule } from './tag/tag.module';
import { BooksModule } from './books/books.module';

@Module({
    imports: [LabelModule, TagModule, BooksModule],
    providers: [],
    controllers: [],
    exports: []
})
export class EntitiesModule {
}
