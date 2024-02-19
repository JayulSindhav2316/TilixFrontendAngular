import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ContactRoleService {
  constructor(private http: HttpClient) { }

  public getAllContactRoles(): Observable<any> {
    return this.http.get<any>(`${environment.baseApiUrl}/ContactRole/GetAllContactRoles`)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }
  public getContactRoleSelectList(): Observable<any> {
    return this.http.get<any>(`${environment.baseApiUrl}/ContactRole/GetContactRoleSelectList`)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }

  public  createContactRole(contactRole): Observable<any> {
    return this.http.post<any>(`${environment.baseApiUrl}/ContactRole/CreateContactRole`, contactRole)
    .pipe(
      catchError(this.handleError)
    )
  }

  public  updateContactRole(contactRole): Observable<any> {
    return this.http.post<any>(`${environment.baseApiUrl}/ContactRole/UpdateContactRole`, contactRole)
    .pipe(
      catchError(this.handleError)
    )
  }

 public  deleteContactRole(contactRole): Observable<any> {
    return this.http.post<any>(`${environment.baseApiUrl}/ContactRole/DeleteContactRole`, contactRole)
    .pipe(
      catchError(this.handleError)
    )
  }
  public getContactRoleById(params): Observable<any>
  {
    return this.http.get<any>(`${environment.baseApiUrl}/ContactRole/GetContactRoleById`, params)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }
  handleError(error: HttpErrorResponse) {
    if (error.message) {
      return throwError(error.message);
    }
    console.log('contactRoleService:' + error);
    return throwError(error);
  }
}
