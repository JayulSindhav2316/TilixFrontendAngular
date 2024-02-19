import { Injectable } from '@angular/core';
import { Menu } from '../models/menu';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';
import { catchError, retry } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class RoleMenuService
{

  constructor(private http: HttpClient) { }

  public getMenuByRoleId(roleid): Observable<any>
  {
    console.log(`${environment.baseApiUrl}/RoleMenu/GetMenuByRoleId?roleId=` + roleid);
    return this.http.get<any>(`${environment.baseApiUrl}/RoleMenu/GetMenuByRoleId?roleId=` + roleid)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }

  public updateRoleMenubyRoleId(roleMenu): Observable<any>
  {
    return this.http.post<any>(`${environment.baseApiUrl}/RoleMenu/UpdateRoleMenubyRoleId`, roleMenu)
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
