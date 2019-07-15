import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { LabelService } from './label.service';
import { CreateLabelDto, CreateCommentDto } from './dto';
import { LabelRO, LabelsRO, CommentsRO } from './label.interface';
import { User } from '../../core/user/user.decorator';

import { ApiBearerAuth, ApiOperation, ApiResponse, ApiUseTags, } from '@nestjs/swagger';

@ApiBearerAuth()
@ApiUseTags('labels')
@Controller('labels')
export class LabelController {

    constructor(private readonly labelService: LabelService) {
    }

    @ApiOperation({title: 'Get all labels'})
    @ApiResponse({status: 200, description: 'Return all labels.'})
    @Get()
    async findAll(@Query() query): Promise<LabelsRO> {
        return await this.labelService.findAll(query);
    }

    @Get(':slug')
    async findOne(@Param('slug') slug): Promise<LabelRO> {
        return await this.labelService.findOne({slug});
    }

    @Get(':slug/comments')
    async findComments(@Param('slug') slug): Promise<CommentsRO> {
        return await this.labelService.findComments(slug);
    }

    @ApiOperation({title: 'Create label'})
    @ApiResponse({status: 201, description: 'The label has been successfully created.'})
    @ApiResponse({status: 403, description: 'Forbidden.'})
    @Post()
    async create(@User('id') userId: number, @Body('label') labelData: CreateLabelDto) {
        return this.labelService.create(userId, labelData);
    }

    @ApiOperation({title: 'Update label'})
    @ApiResponse({status: 201, description: 'The label has been successfully updated.'})
    @ApiResponse({status: 403, description: 'Forbidden.'})
    @Put(':slug')
    async update(@Param() params, @Body('label') labelData: CreateLabelDto) {
        // Todo: update slug also when title gets changed
        return this.labelService.update(params.slug, labelData);
    }

    @ApiOperation({title: 'Delete label'})
    @ApiResponse({status: 201, description: 'The label has been successfully deleted.'})
    @ApiResponse({status: 403, description: 'Forbidden.'})
    @Delete(':slug')
    async delete(@Param() params) {
        return this.labelService.delete(params.slug);
    }

    @ApiOperation({title: 'Create comment'})
    @ApiResponse({status: 201, description: 'The comment has been successfully created.'})
    @ApiResponse({status: 403, description: 'Forbidden.'})
    @Post(':slug/comments')
    async createComment(@Param('slug') slug, @Body('comment') commentData: CreateCommentDto) {
        return await this.labelService.addComment(slug, commentData);
    }

    @ApiOperation({title: 'Delete comment'})
    @ApiResponse({status: 201, description: 'The label has been successfully deleted.'})
    @ApiResponse({status: 403, description: 'Forbidden.'})
    @Delete(':slug/comments/:id')
    async deleteComment(@Param() params) {
        const {slug, id} = params;
        return await this.labelService.deleteComment(slug, id);
    }
}
