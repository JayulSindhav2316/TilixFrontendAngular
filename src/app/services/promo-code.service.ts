import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { environment } from 'src/environments/environment';


@Injectable({
  providedIn: 'root'
})
export class PromoCodeService {

  constructor(private http: HttpClient) { }

  public getAllPromoCodes(): Observable<any>
  {
    return this.http.get<any>(`${environment.baseApiUrl}/PromoCode/getAllPromoCodes`)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }

  public getDiscountTypes(): Observable<any>
  {
    return this.http.get<any>(`${environment.baseApiUrl}/PromoCode/getDiscountTypes`)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }

  public getTransactionTypes(): Observable<any>
  {
    return this.http.get<any>(`${environment.baseApiUrl}/PromoCode/getTransactionTypes`)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }

  public createPromoCode(body): Observable<any>
  {
    return this.http.post<any>(`${environment.baseApiUrl}/PromoCode/CreatePromoCode`, body)
      .pipe(
        catchError(this.handleError)
      );
  }

  public updatePromoCode(body): Observable<any>
  {
    return this.http.post<any>(`${environment.baseApiUrl}/PromoCode/UpdatePromoCode`, body)
      .pipe(
        catchError(this.handleError)
      );
  }

  public deletePromoCode(body): Observable<any>
  {
    return this.http.post<any>(`${environment.baseApiUrl}/PromoCode/DeletePromoCode`, body)
      .pipe(
        catchError(this.handleError)
      );
  }

  public getNewPromoCode(): Observable<any>
  {
    return this.http.get<any>(`${environment.baseApiUrl}/PromoCode/GetNewPromoCode`)
      .pipe(
        catchError(this.handleError)
      );
  }
  public getPromoCodeById(): Observable<any>
  {
    return this.http.get<any>(`${environment.baseApiUrl}/PromoCode/GetPromoCodeById`)
      .pipe(
        catchError(this.handleError)
      );
  }
  public getPromoCodeByCode(body): Observable<any>
  {
    return this.http.get<any>(`${environment.baseApiUrl}/PromoCode/GetPromoCodeByCode`, body)
      .pipe(
        catchError(this.handleError)
      );
  }

  handleError(error: HttpErrorResponse) {
    if(error.message){
      return throwError(error.message);
    }
    console.log('PromoCode Service:'+ error);
    return throwError(error);
  }
}