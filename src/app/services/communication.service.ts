import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { retry, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CommunicationService {

  constructor(private http: HttpClient) { }

  public getCommunicationsByEntityId(params): Observable<any>
  {
    return this.http.get<any>(`${environment.baseApiUrl}/communication/GetAllCommunicationsByEntityId`, params)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }
  
  public createCommunication(params): Observable<any>
  {
    return this.http.post<any>(`${environment.baseApiUrl}/Communication/CreateCommunication`, params)
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
    } else if (error.message) {
      return throwError(error.message);
    }
    {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong,
      console.error(
        `Backend returned code ${error.status}, ` +
        `body was: ${error.error}`);
    }
    // return an observable with a user-facing error message
    return throwError(error.error.message);
  }
}

