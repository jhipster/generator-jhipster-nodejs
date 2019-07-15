import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { LabelEntity } from './label.entity';

@Entity()
export class Comment {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    body: string;

    @ManyToOne(type => LabelEntity, label => label.comments)
    label: LabelEntity;
}
