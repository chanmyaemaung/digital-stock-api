import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public } from '@shared/decorators/public.decorator';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@ApiTags('Authentication')
@Controller('auth')
@UseGuards(JwtAuthGuard)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Register new user' })
  @ApiResponse({ status: 201, description: 'User successfully registered' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async register(@Body() registerDto: RegisterDto, @Request() req) {
    try {
      const deviceInfo = {
        userAgent: req.headers['user-agent'] || 'Unknown',
        platform: req.headers['sec-ch-ua-platform'] || 'Unknown',
        registeredFrom: 'web',
        ip: req.ip || '0.0.0.0',
      };

      const result = await this.authService.register({
        ...registerDto,
        deviceInfo,
        ipAddress: req.ip || '0.0.0.0',
      });

      return {
        message: 'Registration successful',
        user: result,
      };
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'User login' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async login(@Body() loginDto: LoginDto, @Request() req) {
    const result = await this.authService.login(loginDto);
    // Store device info from request
    if (req.headers['user-agent']) {
      await this.authService.updateUserDeviceInfo(result.user.id, {
        userAgent: req.headers['user-agent'],
        ip: req.ip,
      });
    }
    return result;
  }
}
