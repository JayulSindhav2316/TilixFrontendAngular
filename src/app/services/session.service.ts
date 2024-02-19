import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { retry, catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SessionService {

  constructor(private http: HttpClient) { }
  
  public createSession(body): Observable<any>
  {
    return this.http.post<any>(`${environment.baseApiUrl}/Session/CreateSession`, body)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }
  
  public updateSession(body): Observable<any>
  {
    return this.http.post<any>(`${environment.baseApiUrl}/Session/UpdateSession`, body)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }
  
  public getSessionsByEventId(params): Observable<any>
  {
    return this.http.get<any>(`${environment.baseApiUrl}/Session/GetAllSessionsByEventId`, params)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }
  
  public getSessionsById(params): Observable<any>
  {
    return this.http.get<any>(`${environment.baseApiUrl}/Session/GetSessionById`, params)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }
  
  public deleteSession(sessionId): Observable<any>
  {
    return this.http.delete<any>(`${environment.baseApiUrl}/Session/DeleteSession/`+ sessionId)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }
  
  public getNewSessionModel(params): Observable<any>
  {
    return this.http.get<any>(`${environment.baseApiUrl}/Session/GetNewSessionModel`, params)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }
  
  public cloneSession(params): Observable<any>
  {
    return this.http.get<any>(`${environment.baseApiUrl}/Session/CloneSession`, params)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }
  
  public getSessionLeadersBySessionId(params): Observable<any>
  {
    return this.http.get<any>(`${environment.baseApiUrl}/Session/GetSessionLeadersBySessionId`, params)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }
  
  public getEventRegistrationSessionGroupAndPricing(params): Observable<any>
  {
    return this.http.get<any>(`${environment.baseApiUrl}/Session/GetEventRegistrationSessionGroupAndPricing`, params)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }

  public getRegisteredSessionsByEntity(params): Observable<any>
  {
    return this.http.get<any>(`${environment.baseApiUrl}/Session/GetRegisteredSessionsByEntity`, params)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }

  handleError(error: HttpErrorResponse) {
    if(error.message){
      return throwError(error.message);
    }
    console.log('Event Service:'+ error);
    return throwError(error);
  }
  
}
