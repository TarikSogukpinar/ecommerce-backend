import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      return true;
    }

    return super.canActivate(context) as boolean;
  }

  handleRequest(err, user, info) {
    if (err || !user) {
      return null;
    }
    return user;
  }
}
