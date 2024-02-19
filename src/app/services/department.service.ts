import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DepartmentService
{

  constructor(private http: HttpClient) { }

  public getAllDepartments(): Observable<any>
  {
    return this.http.get<any>(`${environment.baseApiUrl}/Department/GetAllDepartments`)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }

  public getAllDepartmentsSelectList(): Observable<any>
  {
    return this.http.get<any>(`${environment.baseApiUrl}/Department/GetSelectList`)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }

  public createDepartment(department): Observable<any>
  {
    return this.http.post<any>(`${environment.baseApiUrl}/Department/CreateDepartment`, department)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );

  }

  public deleteDepartment(department): Observable<any>
  {
    return this.http.post<any>(`${environment.baseApiUrl}/Department/DeleteDepartment`, department)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );

  }

  public updateDepartment(department): Observable<any>
  {
    return this.http.post<any>(`${environment.baseApiUrl}/Department/UpdateDepartment`, department)
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
