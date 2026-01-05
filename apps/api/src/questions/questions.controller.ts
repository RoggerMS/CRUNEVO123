import { Controller, Get, Post, Body, Param, UseGuards, Request, Query } from '@nestjs/common';
import { QuestionsService } from './questions.service';
import { AnswersService } from '../answers/answers.service';
import { CreateQuestionDto } from './dto/create-question.dto';
import { CreateAnswerDto } from '../answers/dto/create-answer.dto';
import { VoteDto } from './dto/vote.dto';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags, ApiQuery } from '@nestjs/swagger';

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

  @Get()
  @ApiQuery({ name: 'q', required: false })
  @ApiQuery({ name: 'clubId', required: false })
  @ApiQuery({ name: 'sort', required: false, enum: ['newest', 'top'] })
  findAll(
    @Query('q') query?: string,
    @Query('clubId') clubId?: string,
    @Query('sort') sort?: 'newest' | 'top',
  ) {
    return this.questionsService.findAll(query, clubId, sort);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.questionsService.findOne(id);
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
