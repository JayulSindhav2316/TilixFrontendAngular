import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class GeneralLedgerService
{
  constructor(private http: HttpClient) { }

  public getGeneralLedgerByDate(params): Observable<any>
  {
    return this.http.get<any>(`${environment.baseApiUrl}/GeneralLedger/GetGeneralLedger`,params)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }
  public getGlAccountList(): Observable<any>{
    return this.http.get<any>(`${environment.baseApiUrl}/GlAccount/GetGlAccountSelectList`)
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
      error.message);
  }
}
