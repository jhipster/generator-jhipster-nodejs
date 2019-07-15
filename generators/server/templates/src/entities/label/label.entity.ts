import { BeforeUpdate, Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { UserEntity } from '../../core/user/user.entity';
import { Comment } from './comment.entity';

@Entity('label')
export class LabelEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    slug: string;

    @Column()
    title: string;

    @Column({default: ''})
    description: string;

    @Column({default: ''})
    body: string;

    @Column({type: 'timestamp', default: () => "CURRENT_TIMESTAMP"})
    created: Date;

    @Column({type: 'timestamp', default: () => "CURRENT_TIMESTAMP"})
    updated: Date;

    @BeforeUpdate()
    updateTimestamp() {
        this.updated = new Date;
    }

    @Column('simple-array')
    tagList: string[];

    @OneToMany(type => Comment, comment => comment.label, {eager: true})
    @JoinColumn()
    comments: Comment[];
}
