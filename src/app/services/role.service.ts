import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { retry, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class RoleService
{

  constructor(private http: HttpClient) { }

  public getRoles(): Observable<any>
  {
    return this.http.get<any>(`${environment.baseApiUrl}/Role/GetAllRoles`)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }

  public getActiveRoles(): Observable<any>
  {
    return this.http.get<any>(`${environment.baseApiUrl}/Role/GetActiveRoles`)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }

  public createRole(role): Observable<any>
  {
    return this.http.post<any>(`${environment.baseApiUrl}/Role/CreateRole`, role)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );

  }

  public deleteRole(role): Observable<any>
  {
    return this.http.post<any>(`${environment.baseApiUrl}/Role/DeleteRole`, role)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );

  }

  public updateRole(role): Observable<any>
  {
    return this.http.post<any>(`${environment.baseApiUrl}/Role/UpdateRole`, role)
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
