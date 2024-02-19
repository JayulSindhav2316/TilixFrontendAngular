import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class StateService {
  constructor(private http: HttpClient) { }

  public getStateByCountry(params): Observable<any> {
    return this.http.get<any>(`${environment.baseApiUrl}/State/GetStatesByCountryId`, { params: params })
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }

  handleError(error: HttpErrorResponse) {
    if (error.message) {
      return throwError(error.message);
    }
    console.log('stateService:' + error);
    return throwError(error);
  }
}
