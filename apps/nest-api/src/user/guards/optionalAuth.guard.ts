import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext): boolean | Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    // Eğer Authorization header yoksa, anonymous kullanıcı olarak devam et
    if (!authHeader) {
      return true; // Token yoksa, işlemi devam ettir
    }

    // Token varsa, normal JWT doğrulaması yap
    return super.canActivate(context) as boolean;
  }

  handleRequest(err, user, info) {
    if (err || !user) {
      // Eğer token yoksa veya doğrulama başarısızsa, işlemi anonim olarak devam ettir
      return null; // Token yoksa kullanıcı anonim olarak kabul edilecek
    }

    // Eğer token geçerliyse, doğrulanmış kullanıcıyı döndür
    return user;
  }
}
