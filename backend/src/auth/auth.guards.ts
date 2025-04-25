import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';

// JWT HTTP Guard
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}

//Local HTTP Guard
@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {}

// WebSocket JWT Guard
@Injectable()
export class WsJwtGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client: Socket = context.switchToWs().getClient();
    const token = this.extractTokenFromHeader(client);

    if (!token) {
      throw new WsException('Authentication token not found');
    }

    try {
      const payload = this.jwtService.verify(token);
      client['user'] = payload; // attach payload to socket
      return true;
    } catch (error) {
      throw new WsException('Invalid token');
    }
  }

  private extractTokenFromHeader(client: Socket): string | undefined {
    const auth = client.handshake.auth.token || client.handshake.headers.authorization;
    if (!auth) return undefined;

    const parts = auth.split(' ');
    return parts.length > 1 ? parts[1] : auth;
  }
}