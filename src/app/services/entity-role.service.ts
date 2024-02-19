import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EntityRoleService {

  constructor(private http: HttpClient) { }

  public  createEntityRole(entityRole): Observable<any> {
    return this.http.post<any>(`${environment.baseApiUrl}/EntityRole/CreateEntityRole`, entityRole)
    .pipe(
      catchError(this.handleError)
    )
  }
  public getContactsByFirstAndLastName(params): Observable<any>
  {
    return this.http.get<any>(`${environment.baseApiUrl}/EntityRole/GetContactsByFirstAndLastName`, params)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }
  public getContactsByRoleAndCompanyId(params): Observable<any>
  {
    return this.http.get<any>(`${environment.baseApiUrl}/EntityRole/GetContactsByRoleAndComapnyId`, params)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }
  public getContactsByRoleAndEntityId(params): Observable<any>
  {
    return this.http.get<any>(`${environment.baseApiUrl}/EntityRole/GetContactsByRoleAndEntityId`, params)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }
  public getRolesByEntityId(params): Observable<any>
  {
    return this.http.get<any>(`${environment.baseApiUrl}/EntityRole/GetAllEntityRolesByEntityId`, params)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }
  public getRolesByCompanyId(params): Observable<any>
  {
    return this.http.get<any>(`${environment.baseApiUrl}/EntityRole/GetEntityRolesByCompanyId`, params)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }
  public getContactRoleHistoryByEntityId(params): Observable<any>
  {
    return this.http.get<any>(`${environment.baseApiUrl}/EntityRole/GetContactRoleHistoryEntityId`, params)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }
  public getActiveContactRolesByEntityId(params): Observable<any>
  {
    return this.http.get<any>(`${environment.baseApiUrl}/EntityRole/GetActiveContactRolesByEntityId`, params)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }
  public GetContactsByComapnyId(params): Observable<any>
  {
    return this.http.get<any>(`${environment.baseApiUrl}/EntityRole/GetContactsByComapnyId`, params)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }
  public GetAccountContactsByEntityId(params): Observable<any>
  {
    return this.http.get<any>(`${environment.baseApiUrl}/EntityRole/GetAccountContactsByEntityId`, params)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }

  public unassignEntityRole(entityRole): Observable<any> {
    return this.http.post<any>(`${environment.baseApiUrl}/EntityRole/UnassignEntityRole`, entityRole)
    .pipe(
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
