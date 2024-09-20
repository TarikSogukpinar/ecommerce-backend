import {
  ExecutionContext,
  UnauthorizedException,
  Injectable,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    let authHeader = request.headers['authorization'];

    // Authorization başlığı yoksa hata fırlatıyoruz
    if (!authHeader) {
      throw new UnauthorizedException('Authorization header missing');
    }

    console.log('authHeader', authHeader);

    // Bearer ön eki yoksa ekliyoruz
    if (!authHeader.startsWith('Bearer ')) {
      authHeader = `Bearer ${authHeader}`;
      request.headers['authorization'] = authHeader; // Başlık güncelleniyor
    }

    // Passport'un default canActivate metodunu çağırıyoruz
    return super.canActivate(context);
  }

  handleRequest(err, user, info) {
    if (err || !user) {
      throw err || new UnauthorizedException();
    }
    return user;
  }
}