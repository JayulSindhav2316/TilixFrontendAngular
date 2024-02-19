import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { retry, catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EventService {

  constructor(private http: HttpClient) { }
  
  public getEventModel(): Observable<any>
  {
    return this.http.get<any>(`${environment.baseApiUrl}/Event/GetEventModel`)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }
  
  public createEvent(body): Observable<any>
  {
    return this.http.post<any>(`${environment.baseApiUrl}/Event/CreateEvent`, body)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }
  
  public updateteEvent(body): Observable<any>
  {
    return this.http.post<any>(`${environment.baseApiUrl}/Event/UpdateEvent`, body)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }
  
  public updateEventSettings(body): Observable<any>
  {
    return this.http.post<any>(`${environment.baseApiUrl}/Event/UpdateEventSettings`, body)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }
  
  public getAllEvents(): Observable<any>
  {
    return this.http.get<any>(`${environment.baseApiUrl}/Event/GetAllEvents`)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }
  
  public getAllActiveEvents(): Observable<any>
  {
    return this.http.get<any>(`${environment.baseApiUrl}/Event/GetAllActiveEvents`)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }

  public getEventsByStatus(params): Observable<any>
  {
    return this.http.get<any>(`${environment.baseApiUrl}/Event/GetEventsByStatus`, params)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }
  
  public getEventsByFilter(params): Observable<any>
  {
    return this.http.get<any>(`${environment.baseApiUrl}/Event/GetEventsByFilter`, params)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }
  
  public getEventDetailsById(params): Observable<any>
  {
    return this.http.get<any>(`${environment.baseApiUrl}/Event/GetEventDetailsById`, params)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }
  
  public getEventBasicDetailsById(params): Observable<any>
  {
    return this.http.get<any>(`${environment.baseApiUrl}/Event/GetEventBasicDetailsById`, params)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }
  
  public getEventSettingsById(params): Observable<any>
  {
    return this.http.get<any>(`${environment.baseApiUrl}/Event/GetEventSettingsById`, params)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }
  
  public uploadEventImage(params): Observable<any>
  {
     return this.http.post(`${environment.baseApiUrl}/Document/UploadEventImage`, params)
     .pipe(
      retry(2),
      catchError(this.handleError)
    );
  }
  
  public uploadCoverImage(params): Observable<any>
  {
     return this.http.post(`${environment.baseApiUrl}/Document/UploadEventBannerImage`, params)
     .pipe(
      retry(2),
      catchError(this.handleError)
    );
  }
  
  public getEventImage(eventId): Observable<any>
  {
    return this.http.get(`${environment.baseApiUrl}/Document/GetEventImage?eventId=` + eventId.toString(), { responseType: 'blob'})
     .pipe(
      retry(2),
      catchError(this.handleError)
     );
  }
  
  public getEventCoverImage(eventId): Observable<any>
  {
    return this.http.get(`${environment.baseApiUrl}/Document/GetEventCoverImage?eventId=` + eventId.toString(), { responseType: 'blob'})
     .pipe(
      retry(2),
      catchError(this.handleError)
     );
  }
  
  public deleteEventImage(eventId): Observable<any>
  {
     return this.http.delete(`${environment.baseApiUrl}/Document/DeleteEventImage/` + eventId)
     .pipe(
      retry(2),
      catchError(this.handleError)
    );
  }
  
  public deleteEventCoverImage(eventId): Observable<any>
  {
     return this.http.delete(`${environment.baseApiUrl}/Document/DeleteEventCoverImage/` + eventId)
     .pipe(
      retry(2),
      catchError(this.handleError)
    );
  }
  
  public deleteEvent(eventId): Observable<any>
  {
     return this.http.delete(`${environment.baseApiUrl}/Event/DeleteEvent/` + eventId)
     .pipe(
      retry(2),
      catchError(this.handleError)
    );
  }
  
   public cloneEvent(params): Observable<any>
  {
    return this.http.get<any>(`${environment.baseApiUrl}/Event/CloneEvent`, params)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }
  
  public createEventRegister(body): Observable<any>
  {
    return this.http.post<any>(`${environment.baseApiUrl}/Event/CreateEventRegister`, body)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }

  public checkEventRegistrationByEventId(value): Observable<any> {
    return this.http.get<any>(`${environment.baseApiUrl}/Event/CheckEventRegistrationByEventId`, value)
    .pipe(
      retry(2),
      catchError(this.handleError)
    )

  }

  handleError(error: HttpErrorResponse) {
    if(error.message){
      return throwError(error.message);
    }
    console.log('Event Service:'+ error);
    return throwError(error);
  }
}
