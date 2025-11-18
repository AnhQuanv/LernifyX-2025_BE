import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { plainToInstance } from 'class-transformer';
import { UserResponseDto } from './dto/user-response.dto';
import { UpdatePasswordDto, UpdateProfileDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}
  async handleGetProfile(user_id: string) {
    const user = await this.userRepo.findOne({
      where: { userId: user_id },
      relations: ['role'],
    });

    if (!user) {
      throw new NotFoundException({
        message: 'Không tìm thấy user',
        errorCode: 'RESOURCE_NOT_FOUND',
      });
    }

    const userDTO = plainToInstance(UserResponseDto, user, {
      excludeExtraneousValues: true,
    });
    return userDTO;
  }

  async handleUpdateProfile(userId: string, dto: UpdateProfileDto) {
    const user = await this.userRepo.findOne({
      where: { userId },
      relations: ['role'],
    });

    if (!user)
      throw new NotFoundException({
        message: 'Không tìm thấy user',
        errorCode: 'RESOURCE_NOT_FOUND',
      });

    if (dto.fullName) user.fullName = dto.fullName;
    if (dto.phone) user.phone = dto.phone;
    if (dto.dateOfBirth) user.dateOfBirth = new Date(dto.dateOfBirth);
    if (dto.address) user.address = dto.address;
    if (dto.avatar) user.avatar = dto.avatar;

    await this.userRepo.save(user);
    const userDTO = plainToInstance(UserResponseDto, user, {
      excludeExtraneousValues: true,
    });
    return userDTO;
  }

  async handleChangePassword(userId: string, dto: UpdatePasswordDto) {
    const user = await this.userRepo.findOne({ where: { userId } });

    if (!user) {
      throw new NotFoundException({
        message: 'Không tìm thấy user',
        errorCode: 'RESOURCE_NOT_FOUND',
      });
    }

    const isMatch = await bcrypt.compare(dto.oldPassword, user.password);
    if (!isMatch) {
      throw new BadRequestException({
        message: 'Mật khẩu cũ không đúng',
        errorCode: 'INVALID_OLD_PASSWORD',
      });
    }

    const isSame = await bcrypt.compare(dto.newPassword, user.password);
    if (isSame)
      throw new BadRequestException({
        message: 'Mật khẩu mới không được giống mật khẩu cũ',
        errorCode: 'PASSWORD_SAME_AS_OLD',
      });

    const hashedPassword = await bcrypt.hash(dto.newPassword, 10);
    user.password = hashedPassword;

    await this.userRepo.save(user);

    return null;
  }
}
