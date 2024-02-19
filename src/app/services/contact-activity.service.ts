import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ContactActivityService {

  constructor(private http: HttpClient) { }

  public createContactActivity(activity): Observable<any> {
    return this.http.post<any>(`${environment.baseApiUrl}/ContactActivity/CreateContactActivity`, activity)
      .pipe(
        catchError(this.handleError)
      )
  }

  public getContactActivities(): Observable<any> {
    return this.http.get<any>(`${environment.baseApiUrl}/ContactActivity/GetAllContactActivities`)
      .pipe(
        catchError(this.handleError)
      )
  }
  public getContactActivitiesByEntityId(params): Observable<any> {
    return this.http.get<any>(`${environment.baseApiUrl}/ContactActivity/GetContactActivitiesByEntityId`, params)
      .pipe(
        catchError(this.handleError)
      )
  }

  public getRoleActivitiesByEntityId(params): Observable<any> {
    return this.http.get<any>(`${environment.baseApiUrl}/ContactActivity/GetRoleActivitiesByEntityId`, params)
      .pipe(
        catchError(this.handleError)
      )
  }

  public getContactActivitiesBySearchCondition(params): Observable<any> {
    return this.http.get<any>(`${environment.baseApiUrl}/ContactActivity/GetContactActivityBySearchCondition`, params)
      .pipe(
        catchError(this.handleError)
      )
  }
  public getRoleActivitiesBySearchCondition(params): Observable<any> {
    return this.http.get<any>(`${environment.baseApiUrl}/ContactActivity/GetRoleActivityBySearchCondition`, params)
      .pipe(
        catchError(this.handleError)
      )
  }

  public getContactActivitiesByDate(params): Observable<any> {
    return this.http.get<any>(`${environment.baseApiUrl}/ContactActivity/GetContactActivityByDate`, params)
      .pipe(
        catchError(this.handleError)
      )
  }

  public deleteContactActivity(activity): Observable<any> {
    return this.http.post<any>(`${environment.baseApiUrl}/ContactActivity/DeleteContactActivity`, activity)
      .pipe(
        catchError(this.handleError)
      )
  }
  handleError(error: HttpErrorResponse) {
    if (error.message) {
      return throwError(error.message);
    }
    console.log('contactRoleService:' + error);
    return throwError(error);
  }
}
