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

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'mariadb',
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
          port: config.get<number>('MAIL_PORT'),
          secure: true,
          auth: {
            user: config.get<string>('MAIL_USER'),
            pass: config.get<string>('MAIL_PASS'),
          },
        },
        defaults: {
          from: `"No Reply" <${config.get<string>('MAIL_FROM')}>`,
        },
        preview: true,
        template: {
          dir: process.cwd() + '/src/mail/templates/',
          adapter: new HandlebarsAdapter(), // or new PugAdapter() or new EjsAdapter()
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
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
