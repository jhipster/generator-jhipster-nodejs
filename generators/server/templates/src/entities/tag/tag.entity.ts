import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

// import { CustomEmail } from './CustomEmail';

@Entity('tag')
export class TagEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    tag: string;

}
