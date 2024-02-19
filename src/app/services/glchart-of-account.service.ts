import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class GLChartOfAccountService
{
  constructor(private http: HttpClient) { }

  public getAllGlChartOfAccounts(): Observable<any>
  {
    return this.http.get<any>(`${environment.baseApiUrl}/GlAccount/GetAllGlaccounts`)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }
  //Returns select list with All options
  public getAllGlChartOfAccountsSelectList(): Observable<any>
  {
    return this.http.get<any>(`${environment.baseApiUrl}/GlAccount/GetSelectList`)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }
  //Returns select list with No All options
  public getGlAccountsSelectList(): Observable<any>
  {
    return this.http.get<any>(`${environment.baseApiUrl}/GlAccount/GetGlAccountSelectList`)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }
  //Returns Active , Inactive GL account select list with All options
  public getAllGLAccountsSelectList(): Observable<any>
  {
    return this.http.get<any>(`${environment.baseApiUrl}/GlAccount/GetAllGLAccountsSelectList`)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }

  public createGLAccount(glaccount): Observable<any>
  {
    return this.http.post<any>(`${environment.baseApiUrl}/GlAccount/CreateGLAccount`, glaccount)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }

  public updateGlAccount(glaccount): Observable<any>
  {
    return this.http.post<any>(`${environment.baseApiUrl}/GlAccount/UpdateGlAccount`, glaccount)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }

  public deleteGlAccount(glaccount): Observable<any>
  {
    return this.http.post<any>(`${environment.baseApiUrl}/GlAccount/DeleteGlAccount`, glaccount)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }

  handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      console.error('An error occurred:', error.error.message);
    } 
    else if (error){ 
      console.error(`body was: ${error}`);
      return throwError(error);}
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong,
    else if (error.message){
        console.error(`Backend returned code ${error.status}, ` + `body was: ${error.error}`);
        return throwError(error.message);
    }
    // return an observable with a user-facing error message

  }

}


