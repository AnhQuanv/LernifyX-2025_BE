import {
  Injectable,
  Inject,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { v2 as Cloudinary } from 'cloudinary';
import { Readable } from 'stream';

@Injectable()
export class CloudinaryService {
  constructor(@Inject('CLOUDINARY') private cloudinary: typeof Cloudinary) {}

  async handleUploadAvatar(file: Express.Multer.File): Promise<string> {
    if (!file?.buffer)
      throw new BadRequestException({
        errorCode: 'INVALID_FILE',
        message: 'Tệp tải lên không hợp lệ hoặc thiếu buffer.',
      });

    const timestamp = Date.now();
    const originalNameWithoutExt = file.originalname.replace(/\.[^/.]+$/, '');
    const publicId = `${originalNameWithoutExt}_${timestamp}`;

    const readablePhotoStream = Readable.from(file.buffer);

    return new Promise((resolve, reject) => {
      const uploadStream = this.cloudinary.uploader.upload_stream(
        {
          folder: 'Avatar',
          resource_type: 'image',
          public_id: publicId,
        },
        (error, result) => {
          if (error)
            return reject(
              new InternalServerErrorException({
                errorCode: 'CLOUDINARY_UPLOAD_FAILED',
                message: error.message || 'Lỗi khi tải ảnh lên Cloudinary.',
              }),
            );
          if (!result)
            return reject(
              new InternalServerErrorException({
                errorCode: 'CLOUDINARY_NO_RESPONSE',
                message: 'Không nhận được phản hồi từ Cloudinary.',
              }),
            );
          resolve(result.secure_url);
        },
      );

      readablePhotoStream.pipe(uploadStream);
    });
  }
}
