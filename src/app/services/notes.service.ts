import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class NotesService {

  constructor(private http: HttpClient) { }

  public getNotesByEntityId(param): Observable<any>
  {
    return this.http.get<any>(`${environment.baseApiUrl}/Note/GetNotesByEntityId`, param)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }

public createNotes(body): Observable<any>
  {
    return this.http.post<any>(`${environment.baseApiUrl}/Note/CreateNotes`, body)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }
  public updateNotes(body): Observable<any>
  {
    return this.http.post<any>(`${environment.baseApiUrl}/Note/UpdateNotes`, body)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }

  handleError(error: HttpErrorResponse) {
    if(error.message){
      return throwError(error.message);
    }
    console.log('Notes Service:'+ error);
    return throwError(error);
  }
}
