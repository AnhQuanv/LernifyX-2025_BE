import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LessonNote } from './entities/lesson_note.entity';
import { LessonProgress } from '../lesson_progress/entities/lesson_progress.entity';

@Injectable()
export class LessonNoteService {
  constructor(
    @InjectRepository(LessonNote)
    private readonly noteRepo: Repository<LessonNote>,

    @InjectRepository(LessonProgress)
    private readonly progressRepo: Repository<LessonProgress>,
  ) {}

  async create(
    progressId: string,
    userId: string,
    text: string,
    videoTimestamp: number,
  ) {
    const progress = await this.progressRepo.findOne({
      where: { id: progressId },
      relations: ['user'],
    });

    if (!progress) throw new NotFoundException('Lesson progress not found');
    if (progress.user.userId !== userId)
      throw new ForbiddenException('Cannot add note to this progress');
    const note = this.noteRepo.create({
      text,
      progress,
      videoTimestamp,
    });
    const savedNote = await this.noteRepo.save(note);

    return {
      id: savedNote.id,
      text: savedNote.text,
      progressId: progress.id,
      videoTimestamp: savedNote.videoTimestamp,
      createdAt: savedNote.createdAt,
      updatedAt: savedNote.updatedAt,
    };
  }

  async update(noteId: string, userId: string, text: string) {
    const note = await this.noteRepo.findOne({
      where: { id: noteId },
      relations: ['progress', 'progress.user'],
    });

    if (!note) throw new NotFoundException('Note not found');
    if (note.progress.user.userId !== userId)
      throw new ForbiddenException('Cannot edit this note');

    note.text = text;
    const savedNote = await this.noteRepo.save(note);
    return {
      id: savedNote.id,
      text: savedNote.text,
      progressId: note.progress.id,
      createdAt: savedNote.createdAt,
      updatedAt: savedNote.updatedAt,
      videoTimestamp: savedNote.videoTimestamp,
    };
  }

  async delete(noteId: string, userId: string) {
    const note = await this.noteRepo.findOne({
      where: { id: noteId },
      relations: ['progress', 'progress.user'],
    });

    if (!note) throw new NotFoundException('Note not found');
    if (note.progress.user.userId !== userId)
      throw new ForbiddenException('Cannot delete this note');

    await this.noteRepo.remove(note);
    return { id: note.id };
  }
}
