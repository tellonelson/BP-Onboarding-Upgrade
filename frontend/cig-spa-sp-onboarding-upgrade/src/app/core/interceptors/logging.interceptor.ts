import { HttpInterceptorFn } from '@angular/common/http';
import { tap } from 'rxjs/operators';

export const loggingInterceptor: HttpInterceptorFn = (req, next) => {
  console.log('🌐 HTTP Request:', {
    method: req.method,
    url: req.url,
    headers: req.headers.keys().map(key => ({ [key]: req.headers.get(key) }))
  });

  return next(req).pipe(
    tap({
      next: (event: any) => {
        if (event.type === 4) { // HttpResponse
          console.log('✅ HTTP Response:', {
            url: event.url,
            status: event.status,
            statusText: event.statusText,
            headers: {
              'Content-Type': event.headers.get('Content-Type'),
              'Content-Length': event.headers.get('Content-Length')
            },
            body: event.body
          });
        }
      },
      error: (error) => {
        console.error('❌ HTTP Error:', {
          url: error.url,
          status: error.status,
          statusText: error.statusText,
          message: error.message,
          error: error.error
        });
      }
    })
  );
};
