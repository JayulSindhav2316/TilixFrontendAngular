import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CustomFieldService {

  constructor(private http: HttpClient) { }
  public getAllCustomFields(): Observable<any>
  {
    return this.http.get<any>(`${environment.baseApiUrl}/CustomField/GetCustomFieldList`)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }

  public createCustomField(customField): Observable<any>
  {
    return this.http.post<any>(`${environment.baseApiUrl}/CustomField/AddCustomField`, customField)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );

  }
  public updateCustomField(field): Observable<any>
  {
    return this.http.post<any>(`${environment.baseApiUrl}/CustomField/UpdateCustomField`, field)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );

  }
  public getFieldTypes(): Observable<any>
  {
    return this.http.get<any>(`${environment.baseApiUrl}/CustomField/GetCustomFieldTypes`)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }
  public deleteCustomField(field): Observable<any>
  {
    return this.http.post<any>(`${environment.baseApiUrl}/CustomField/DeleteCustomField`, field)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );

  }
  public getCustomFieldByModuleAndTab(module, tab,entityId): Observable<any>
  {
    return this.http.get<any>(`${environment.baseApiUrl}/CustomField/GetCustomFieldByModuleAndTab/` + module + '/' + tab+ '/' + entityId)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }
  public saveCustomFieldData(data): Observable<any>
  {
    return this.http.post<any>(`${environment.baseApiUrl}/CustomField/SaveCustomFieldData`, data)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );

  }

  handleError(error: HttpErrorResponse) {
    if(error.message){
      return throwError(error.message);
    }
    console.log('departmentService:'+ error);
    return throwError(error);
  }
}
