import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, filter, switchMap, take } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { AuthService } from '../services/auth.service';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
    private isRefreshing = false;
    private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);
    constructor(private authService: AuthService, private router: Router) { }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
      return next.handle(request).pipe(catchError(err => {
          console.log('err.status:'+err.status)
          console.log('current user:'+ JSON.stringify(this.authService.currentUserValue));
          if ([401, 403].includes(err.status) && this.authService.currentUserValue) {
              // auto logout if 401 or 403 response returned from api
              console.log('Calling logout');
              let url=this.router.url;
              this.authService.logout(url);
              return;
          }
          if (err.status === 0) {
            this.router.navigate(['/']);
            return throwError('The server is not avilable. Please contact support team.');
          }
          if (err.status == 400)
          {
            if (err.error.Errors)
            {
              var er = err.error.Errors.join(",");
              return throwError(er.replaceAll(',','<br/>'))
            }
          }
          if(err.error){
            return throwError(err.error.message);
          }
          if(err.message){return throwError(err.message);
          }
          console.error(err);
          return throwError('An unknown server error has occured. Please contact support team.');
      }))
  }
} 