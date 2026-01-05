import { Controller, Get, Post, Body, Param, UseGuards, Request, Query, Patch } from '@nestjs/common';
import { QuestionsService } from './questions.service';
import { AnswersService } from '../answers/answers.service';
import { CreateQuestionDto } from './dto/create-question.dto';
import { CreateAnswerDto } from '../answers/dto/create-answer.dto';
import { VoteDto } from './dto/vote.dto';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags, ApiQuery } from '@nestjs/swagger';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role, ContentStatus } from '@prisma/client';

@ApiTags('questions')
@Controller('aula/questions') // Renamed route
export class QuestionsController {
  constructor(
    private readonly questionsService: QuestionsService,
    private readonly answersService: AnswersService,
  ) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  create(@Request() req: any, @Body() createQuestionDto: CreateQuestionDto) {
    return this.questionsService.create(req.user.userId, createQuestionDto);
  }

  @Get('tags/popular')
  getPopularTags(@Query('q') query?: string) {
    return this.questionsService.getPopularTags(query);
  }

  @Get('suggest')
  suggest(@Query('q') query: string) {
    return this.questionsService.suggestSimilar(query);
  }

  @Get('subjects')
  subjects() {
    return this.questionsService.getSubjects();
  }

  @Get('mine')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  mine(@Request() req: any) {
    return this.questionsService.listByUser(req.user.userId);
  }

  @Get()
  @ApiQuery({ name: 'q', required: false })
  @ApiQuery({ name: 'clubId', required: false })
  @ApiQuery({ name: 'tab', required: false, enum: ['recent', 'unanswered', 'popular'] })
  @ApiQuery({ name: 'subject', required: false })
  @ApiQuery({ name: 'tags', required: false, description: 'CSV de tags' })
  @ApiQuery({ name: 'dateFrom', required: false })
  @ApiQuery({ name: 'authorId', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'pageSize', required: false })
  findAll(
    @Query('q') query?: string,
    @Query('clubId') clubId?: string,
    @Query('tab') tab?: 'recent' | 'unanswered' | 'popular',
    @Query('subject') subject?: string,
    @Query('tags') tags?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('authorId') authorId?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    const tagList = tags ? tags.split(',').map((t) => t.trim()).filter(Boolean) : [];
    return this.questionsService.findAll({
      query,
      clubId,
      tab,
      subject,
      tags: tagList,
      dateFrom,
      authorId,
      page: page ? parseInt(page, 10) : 1,
      pageSize: pageSize ? parseInt(pageSize, 10) : 20,
    });
  }

  @Get(':id')
  @ApiQuery({ name: 'answersSort', required: false, enum: ['helpful', 'recent'] })
  findOne(@Param('id') id: string, @Query('answersSort') answersSort?: 'helpful' | 'recent') {
    return this.questionsService.findOne(id, answersSort);
  }

  @Post(':id/answers')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  createAnswer(
    @Request() req: any,
    @Param('id') questionId: string,
    @Body() createAnswerDto: CreateAnswerDto,
  ) {
    return this.answersService.create(req.user.userId, questionId, createAnswerDto);
  }

  @Post(':id/accept/:answerId')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  acceptAnswer(
    @Request() req: any,
    @Param('id') questionId: string,
    @Param('answerId') answerId: string,
  ) {
    return this.questionsService.acceptAnswer(questionId, answerId, req.user.userId);
  }

  @Patch(':id/status')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  updateStatus(
    @Param('id') questionId: string,
    @Body('status') status: ContentStatus,
  ) {
    const safeStatus = (status || 'ACTIVE').toString().toUpperCase() as ContentStatus;
    return this.questionsService.updateStatus(questionId, safeStatus);
  }
}

@Controller('aula')
export class AulaController {
  constructor(private readonly questionsService: QuestionsService) {}

  @Post('vote')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  vote(@Request() req: any, @Body() voteDto: VoteDto) {
    return this.questionsService.vote(req.user.userId, voteDto);
  }
}
