import { NotificationType } from '@app/core/domain/enums/notification-type.enum';
import { Role } from '@app/core/domain/enums/role.enum';
import { IUserRepository } from '@app/core/interfaces/repositories/user.repository.interface';
import { NotificationService } from '@modules/notification/notification.service';
import {
  BadRequestException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly notificationService: NotificationService,
  ) {}

  async register(registerDto: RegisterDto) {
    try {
      const existingUser = await this.userRepository.findByEmailOrPhone(
        registerDto.email,
        registerDto.phone,
      );

      if (existingUser) {
        throw new BadRequestException('User already exists');
      }

      const hashedPassword = await bcrypt.hash(registerDto.password, 10);

      const user = await this.userRepository.create({
        ...registerDto,
        password: hashedPassword,
        role: Role.USER,
        deviceInfo: registerDto.deviceInfo || {
          userAgent: 'Unknown',
          platform: 'Unknown',
          registeredFrom: 'web',
        },
        ipAddress: registerDto.ipAddress || '0.0.0.0',
        lastLoginAt: new Date(),
      });

      await this.notificationService.createNotification(
        user.id,
        NotificationType.ACCOUNT_UPDATED,
        'Welcome!',
        'Your account has been created successfully.',
      );

      delete user.password;
      return user;
    } catch (error) {
      console.error('Registration service error:', error);
      throw error;
    }
  }

  async login(loginDto: LoginDto) {
    const user = await this.userRepository.findByEmailOrPhone(
      loginDto.email,
      loginDto.phone,
    );

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.get('JWT_REFRESH_EXPIRATION'),
    });

    delete user.password;
    return {
      user,
      accessToken,
      refreshToken,
    };
  }

  async updateUserDeviceInfo(userId: string, deviceInfo: any) {
    await this.userRepository.update(userId, {
      deviceInfo,
      lastLoginAt: new Date(),
    });
  }

  async refreshToken(refreshToken: string) {
    try {
      const decoded = this.jwtService.verify(refreshToken);
      const user = await this.userRepository.findById(decoded.sub);

      if (!user) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const payload = { sub: user.id, email: user.email, role: user.role };
      const newAccessToken = this.jwtService.sign(payload);
      const newRefreshToken = this.jwtService.sign(payload, {
        expiresIn: this.configService.get('JWT_REFRESH_EXPIRATION'),
      });

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}
