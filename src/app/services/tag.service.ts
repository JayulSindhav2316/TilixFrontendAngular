import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders,HttpErrorResponse  } from '@angular/common/http';
import { Observable, throwError} from 'rxjs';
import { environment } from '../../environments/environment';
import { retry, catchError } from 'rxjs/operators';
@Injectable({
  providedIn: 'root'
})
export class TagService {
    constructor(private http: HttpClient) { }

    public getTagSelectList(): Observable<any>{
      return this.http.get<any>(`${environment.baseApiUrl}/Tag/GetTagSelectList`)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
    }
    public createTag(tag): Observable<any>
    {
      return this.http.post<any>(`${environment.baseApiUrl}/Tag/CreateTag`, tag)
        .pipe(
          retry(2),
          catchError(this.handleError)
        );
    }
    handleError(error: HttpErrorResponse) {
    if(error.message){
      return throwError(error.message);
    }
    console.log('Tag Service:'+ error);
    return throwError(error);
  }
}
