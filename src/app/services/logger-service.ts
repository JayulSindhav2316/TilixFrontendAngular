import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { retry, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class LoggerService {

  constructor(private http: HttpClient) { }

  public CreateLog(body): Observable<any>
  {
    return this.http.post<any>(`${environment.baseApiUrl}/ClientLog/CreateLog`,body)
      .pipe(
        retry(2)
      );
  }
  
}

