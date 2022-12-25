import { CacheInterceptor, CallHandler, ExecutionContext, Injectable } from "@nestjs/common";
import { Observable, of } from "rxjs";
import { tap } from 'rxjs/operators';
import {
    CACHE_TTL_METADATA,
} from '@nestjs/common/cache/cache.constants';
import { isFunction, isNil } from '@nestjs/common/utils/shared.utils';
@Injectable()
export class HttpCacheInterceptor extends CacheInterceptor {
    trackBy(context: ExecutionContext) {

        const req = context.switchToHttp().getRequest();
        // console.log('req:', req);
        // console.log('req.method:', req.method);
        // console.log('req.url:', req.url);
        // console.log('req.params:', req.params);
        // console.log('req.query:', req.query);
        // console.log('req.body:', req.body);
        let key = {
            method: req.method,
            url: req.url,
            params: req.params,
            query: req.query,
            body: req.body
        }
        let keystr = JSON.stringify(key);
        //console.log('keystr:', keystr); 

        return keystr;
    }

    async intercept(
        context: ExecutionContext,
        next: CallHandler,
    ): Promise<Observable<any>> {
        const key = this.trackBy(context);
        const ttlValueOrFactory =
            this.reflector.get(CACHE_TTL_METADATA, context.getHandler()) ?? null;

        if (!key) {
            return next.handle();
        }
        try {
            const value = await this.cacheManager.get(key);
            if (!isNil(value)) {
                let response = context.switchToHttp().getResponse();
                if (response) {
                    // console.log(response);
                    response.header('x-cache', 'hit-http-cache-interceptor');
                }
                return of(value);
            }
            const ttl = isFunction(ttlValueOrFactory)
                ? await ttlValueOrFactory(context)
                : ttlValueOrFactory;
            return next.handle().pipe(
                tap(response => {
                    const args = isNil(ttl) ? [key, response] : [key, response, { ttl }];
                    this.cacheManager.set(...args);
                }),
            );
        } catch {
            return next.handle();
        }
    }
}