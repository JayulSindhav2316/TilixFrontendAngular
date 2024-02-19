import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders,HttpErrorResponse  } from '@angular/common/http';
import { Observable, throwError} from 'rxjs';
import { environment } from '../../environments/environment';
import { retry, catchError } from 'rxjs/operators';
@Injectable({
  providedIn: 'root'
})
export class AuthNetService {

  constructor(private http: HttpClient) {}

  public processPaymentProfile(body): Observable<any>
  {
    return this.http.post<any>(`${environment.baseApiUrl}/AuthNet/ProcessPaymentProfile`, body)
      .pipe(
        catchError(this.handleError)
      );
  }

  public getPaymentProfile(body): Observable<any>
  {
    return this.http.get<any>(`${environment.baseApiUrl}/AuthNet/GetPaymentProfile`, body)
      .pipe(
        catchError(this.handleError)
      );
  }
  public deletePaymentProfile(body): Observable<any>
  {
    return this.http.post<any>(`${environment.baseApiUrl}/AuthNet/DeletePaymentProfile`, body)
      .pipe(
        catchError(this.handleError)
      );
  }
  public setPreferredPaymentProfile(body): Observable<any>
  {
    return this.http.post<any>(`${environment.baseApiUrl}/AuthNet/SetpreferredPaymentProfile`, body)
      .pipe(
        catchError(this.handleError)
      );
  }
  public setAutobillingPaymentProfile(body): Observable<any>
  {
    return this.http.post<any>(`${environment.baseApiUrl}/AuthNet/SetAutoBillingPaymentProfile`, body)
      .pipe(
        catchError(this.handleError)
      );
  }
  
  handleError(error: HttpErrorResponse) {
    if(error.message){
      return throwError(error.message);
    }
    console.log('Auth.Net:'+ error);
    return throwError(error);
  }
}
