import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './modules/user/user.module';
import { RoleModule } from './modules/role/role.module';
import { User } from './modules/user/entities/user.entity';
import { Role } from './modules/role/entities/role.entity';
import { AuthModule } from './modules/auth/auth.module';
import { RefreshTokenModule } from './modules/refresh-token/refresh-token.module';
import { RefreshToken } from './modules/refresh-token/entities/refresh-token.entity';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { CategoryModule } from './modules/category/category.module';
import { CourseModule } from './modules/course/course.module';
import { Category } from './modules/category/entities/category.entity';
import { Course } from './modules/course/entities/course.entity';
import { WishlistModule } from './modules/wishlist/wishlist.module';
import { CartItemModule } from './modules/cart_item/cart_item.module';
import { Wishlist } from './modules/wishlist/entities/wishlist.entity';
import { CartItem } from './modules/cart_item/entities/cart_item.entity';
import { ChapterModule } from './modules/chapter/chapter.module';
import { LessonModule } from './modules/lesson/lesson.module';
import { CommentModule } from './modules/comment/comment.module';
import { Chapter } from './modules/chapter/entities/chapter.entity';
import { Lesson } from './modules/lesson/entities/lesson.entity';
import { Comment } from './modules/comment/entities/comment.entity';
import { CloudinaryModule } from './modules/cloudinary/cloudinary.module';
import { PaymentModule } from './modules/payment/payment.module';
import { PaymentItemsModule } from './modules/payment_items/payment_items.module';
import { Payment } from './modules/payment/entities/payment.entity';
import { PaymentItem } from './modules/payment_items/entities/payment_item.entity';
import { LessonProgressModule } from './modules/lesson_progress/lesson_progress.module';
import { LessonProgress } from './modules/lesson_progress/entities/lesson_progress.entity';
import { QuizQuestionModule } from './modules/quiz_question/quiz_question.module';
import { QuizOptionModule } from './modules/quiz_option/quiz_option.module';
import { QuizQuestion } from './modules/quiz_question/entities/quiz_question.entity';
import { QuizOption } from './modules/quiz_option/entities/quiz_option.entity';
import { LessonNoteModule } from './modules/lesson_note/lesson_note.module';
import { LessonNote } from './modules/lesson_note/entities/lesson_note.entity';
import { UserPreferencesModule } from './modules/user_preferences/user_preferences.module';
import { UserPreference } from './modules/user_preferences/entities/user_preference.entity';
import { LessonVideoModule } from './modules/lesson_video/lesson_video.module';
import { LessonVideo } from './modules/lesson_video/entities/lesson_video.entity';
import { MuxModule } from './modules/mux/mux.module';
import { join } from 'path';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT) || 3306,
      username: process.env.DB_USER || 'root',
      password: process.env.DB_PASS || '',
      database: process.env.DB_NAME || '',
      entities: [
        User,
        Role,
        RefreshToken,
        Category,
        Course,
        Wishlist,
        CartItem,
        Chapter,
        Lesson,
        Comment,
        Payment,
        PaymentItem,
        LessonProgress,
        LessonNote,
        QuizQuestion,
        QuizOption,
        UserPreference,
        LessonVideo,
      ],
      synchronize: false,
      logging: false,
      migrationsRun: false,
    }),
    UserModule,
    RoleModule,
    AuthModule,
    CourseModule,
    CategoryModule,
    RefreshTokenModule,
    CommentModule,
    MailerModule.forRootAsync({
      useFactory: (config: ConfigService) => ({
        transport: {
          host: config.get<string>('MAIL_HOST'),
          port: config.get<string>('MAIL_PORT'),
          secure: false,
          auth: {
            user: config.get<string>('MAIL_USER'),
            pass: config.get<string>('MAIL_PASS'),
          },
          tls: {
            rejectUnauthorized: false,
          },
          debug: true,
          logger: true,
        },
        defaults: {
          from: '"LearnifyX" <banhkute200@gmail.com>',
        },
        preview: config.get<string>('NODE_ENV') !== 'production',
        template: {
          dir: join(__dirname, 'mail', 'templates'),
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true,
          },
        },
      }),
      inject: [ConfigService],
    }),
    CourseModule,
    CategoryModule,
    WishlistModule,
    CartItemModule,
    ChapterModule,
    LessonModule,
    CommentModule,
    CloudinaryModule,
    PaymentModule,
    PaymentItemsModule,
    LessonProgressModule,
    QuizQuestionModule,
    QuizOptionModule,
    LessonNoteModule,
    UserPreferencesModule,
    LessonVideoModule,
    MuxModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
