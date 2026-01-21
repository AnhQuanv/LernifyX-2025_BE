import {
  Body,
  Controller,
  Delete,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { LessonNoteService } from './lesson_note.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RequestWithUser } from '../user/user.controller';
import { CreateLessonNoteDto } from './dto/create-lesson_note.dto';
import { UpdateLessonNoteDto } from './dto/update-lesson_note.dto';
import { ApiResponse } from 'src/common/bases/api-response';
import { RolesGuard } from '../auth/roles.guard';

@Controller('v1/lesson-note')
@UseGuards(JwtAuthGuard)
@Roles('student')
export class LessonNoteController {
  constructor(private readonly lessonNoteService: LessonNoteService) {}

  @Post('/create')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('student')
  async createNote(
    @Req() req: RequestWithUser,
    @Body() dto: CreateLessonNoteDto,
  ) {
    const newNote = await this.lessonNoteService.create(
      dto.progressId,
      req.user.sub,
      dto.text,
      dto.videoTimestamp,
    );
    return ApiResponse.success(newNote, 'Note created successfully');
  }

  @Patch('/update')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('student')
  async updateNote(
    @Req() req: RequestWithUser,
    @Body() dto: UpdateLessonNoteDto,
  ) {
    const updatedNote = await this.lessonNoteService.update(
      dto.noteId,
      req.user.sub,
      dto.text,
    );
    return ApiResponse.success(updatedNote, 'Note updated successfully');
  }

  @Delete('/delete')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('student')
  async deleteNote(
    @Req() req: RequestWithUser,
    @Body('noteId') noteId: string,
  ) {
    const id = await this.lessonNoteService.delete(noteId, req.user.sub);
    return ApiResponse.success(id, 'Note deleted successfully');
  }
}
