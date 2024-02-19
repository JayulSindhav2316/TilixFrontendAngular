import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ConfigurationService {

  constructor(private http: HttpClient) { }

  public getConfigurationByOrganizationId(organizationId): Observable<any>
  {
    return this.http.get<any>(`${environment.baseApiUrl}/Configuration/GetConfigurationByOrganizationId?organizationId=` + organizationId)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }

  handleError(error: HttpErrorResponse) {
    if(error.message){
      return throwError(error.message);
    }
    console.log('ConfigurationService:'+ error);
    return throwError(error);
  }
}
