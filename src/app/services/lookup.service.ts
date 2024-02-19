import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { retry, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class LookupService {

  constructor(private http: HttpClient) { }

  public getLookupValues(queryParams): Observable<any>
  {
    return this.http.get<any>(`${environment.baseApiUrl}/Lookup/GetLookupValues`, {params: queryParams})
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }

  public getAnswerTypeLookup(): Observable<any>
  {
    return this.http.get<any>(`${environment.baseApiUrl}/Lookup/GetAnswerTypeLookup`)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }
  
  public getEventTypeLookup(): Observable<any>
  {
    return this.http.get<any>(`${environment.baseApiUrl}/Lookup/GetEventTypeLookup`)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }
  
  public getTimeZonesLookup(): Observable<any>
  {
    return this.http.get<any>(`${environment.baseApiUrl}/Lookup/GetTimeZonesLookup`)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }
  
  public getRegistrationFeeTypes(): Observable<any>
  {
    return this.http.get<any>(`${environment.baseApiUrl}/Lookup/GetRegistrationFeeTypes`)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }
  
  handleError(error: HttpErrorResponse)
  {
    if (error.error instanceof ErrorEvent)
    {
      // A client-side or network error occurred. Handle it accordingly.
      console.error('An error occurred:', error.error.message);
    } else
    {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong,
      console.error(
        `Backend returned code ${error.status}, ` +
        `body was: ${error.error}`);
    }
    // return an observable with a user-facing error message
    return throwError(
      error.error.message);
  }
}

