import { UserData } from '../../core/user/user.interface';
import { LabelEntity } from './label.entity';

interface Comment {
    body: string;
}

interface LabelData {
    slug: string;
    title: string;
    description: string;
    body?: string;
    tagList?: string[];
    createdAt?: Date
    updatedAt?: Date
    favorited?: boolean;
    favoritesCount?: number;
    author?: UserData;
}

export interface CommentsRO {
    comments: Comment[];
}

export interface LabelRO {
    label: LabelEntity;
}

export interface LabelsRO {
    labels: LabelEntity[];
    labelsCount: number;
}

