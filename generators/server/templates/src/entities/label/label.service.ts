import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, getRepository, Repository } from 'typeorm';
import { LabelEntity } from './label.entity';
import { Comment } from './comment.entity';
import { UserEntity } from '../../core/user/user.entity';
import { CreateLabelDto } from './dto';

import { CommentsRO, LabelRO, LabelsRO } from './label.interface';

const slug = require('slug');

@Injectable()
export class LabelService {
    private readonly logger = new Logger(UserEntity.name);
    constructor(
        @InjectRepository(LabelEntity)
        private readonly labelRepository: Repository<LabelEntity>,
        @InjectRepository(Comment)
        private readonly commentRepository: Repository<Comment>,
        @InjectRepository(UserEntity)
        private readonly userRepository: Repository<UserEntity>
    ) {
    }

    async findAll(query): Promise<LabelsRO> {

        const qb = await getRepository(LabelEntity)
            .createQueryBuilder('label')
            /*.leftJoinAndSelect('label.author', 'author');*/

        qb.where("1 = 1");

        if ('tag' in query) {
            qb.andWhere("label.tagList LIKE :tag", {tag: `%${query.tag}%`});
        }

        qb.orderBy('label.created', 'DESC');

        const labelsCount = await qb.getCount();

        if ('limit' in query) {
            qb.limit(query.limit);
        }

        if ('offset' in query) {
            qb.offset(query.offset);
        }

        const labels = await qb.getMany();

        return {labels, labelsCount};
    }

    async findOne(where): Promise<LabelRO> {
        const label = await this.labelRepository.findOne(where);
        return {label};
    }

    async addComment(slug: string, commentData): Promise<LabelRO> {
        let label = await this.labelRepository.findOne({slug});

        const comment = new Comment();
        comment.body = commentData.body;

        label.comments.push(comment);

        await this.commentRepository.save(comment);
        label = await this.labelRepository.save(label);
        return {label}
    }

    async deleteComment(slug: string, id: string): Promise<LabelRO> {
        let label = await this.labelRepository.findOne({slug});

        const comment = await this.commentRepository.findOne(id);
        const deleteIndex = label.comments.findIndex(_comment => _comment.id === comment.id);

        if (deleteIndex >= 0) {
            const deleteComments = label.comments.splice(deleteIndex, 1);
            await this.commentRepository.delete(deleteComments[0].id);
            label = await this.labelRepository.save(label);
            return {label};
        } else {
            return {label};
        }

    }

    async findComments(slug: string): Promise<CommentsRO> {
        const label = await this.labelRepository.findOne({slug});
        return {comments: label.comments};
    }

    async create(userId: number, labelData: CreateLabelDto): Promise<LabelEntity> {

        let label = new LabelEntity();
        label.title = labelData.title;
        label.description = labelData.description;
        label.slug = this.slugify(labelData.title);
        label.tagList = labelData.tagList || [];
        label.comments = [];

        const newLabel = await this.labelRepository.save(label);
        return newLabel;
    }

    async update(slug: string, labelData: any): Promise<LabelRO> {
        let toUpdate = await this.labelRepository.findOne({slug: slug});
        let updated = Object.assign(toUpdate, labelData);
        const label = await this.labelRepository.save(updated);
        return {label};
    }

    async delete(slug: string): Promise<DeleteResult> {
        return await this.labelRepository.delete({slug: slug});
    }

    slugify(title: string) {
        return slug(title, {lower: true}) + '-' + (Math.random() * Math.pow(36, 6) | 0).toString(36)
    }
}
