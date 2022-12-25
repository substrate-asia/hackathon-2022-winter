import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
@Injectable()
export class LogInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    var handlerName = 'handler： ' + context.getHandler().name;
    console.log(handlerName, 'Before...');
    const now = Date.now();
    return next
      .handle()
      .pipe(
        tap(() => console.log(handlerName, `After... ${Date.now() - now}ms`)),
      );
  }
}
