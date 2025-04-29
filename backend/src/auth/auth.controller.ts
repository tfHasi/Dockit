import { Controller, Post, Body, UseGuards, Request, Res, HttpCode, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './auth.guards';
import { RegisterDto, LoginDto } from './auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(
    @Body() registerDto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    try {
      const result = await this.authService.register(registerDto);
      return { 
        message: 'Registration successful', 
        user: {
          email: result.email,
          nickname: result.nickname,
          userId: result._id,
        }
      };
    } catch (error) {
      throw error;
    }
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Request() req,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { access_token, user } = await this.authService.login(req.user);
    res.cookie('jwt', access_token, { /* ... */ });
    return { message: 'Login successful', user, token: access_token };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('jwt');
    return { message: 'Logged out successfully' };
  }
}