import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CompanyService {

  constructor(private http: HttpClient) { }

  public getCompaniesByName(params): Observable<any>
  {
    return this.http.get<any>(`${environment.baseApiUrl}/Company/GetCompaniesByName`, params)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }
  public getCompanyProfileById(params): Observable<any>
  {
    return this.http.get<any>(`${environment.baseApiUrl}/Company/GetCompanyProfileById`, params)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }
  public getCompanyById(params): Observable<any>
  {
    return this.http.get<any>(`${environment.baseApiUrl}/Company/GetCompanyById`, params)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }

  public createCompany(company): Observable<any>
  {
    return this.http.post<any>(`${environment.baseApiUrl}/Company/CreateCompany`, company)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );

  }

  public deleteCompany(company): Observable<any>
  {
    return this.http.post<any>(`${environment.baseApiUrl}/Company/DeleteCompany`, company)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );

  }

  public updateCompany(company): Observable<any>
  {
    return this.http.post<any>(`${environment.baseApiUrl}/Company/UpdateCompany`, company)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );

  }

public getCompaniesList(): Observable<any>
  {
    return this.http.get<any>(`${environment.baseApiUrl}/Company/GetAllCompanies`)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );

  }
  handleError(error: HttpErrorResponse) {
    if(error.message){
      return throwError(error.message);
    }
    console.log('companyService:'+ error);
    return throwError(error);
  }
}
