import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders,HttpErrorResponse  } from '@angular/common/http';
import { Observable, throwError} from 'rxjs';
import { environment } from '../../environments/environment';
import { retry, catchError } from 'rxjs/operators';
@Injectable({
  providedIn: 'root'
})
export class ReportService {

  constructor(private http: HttpClient) {}

  public getReportFieldsByCategoryId(opts): Observable<any>{
    return this.http.get<any>(`${environment.baseApiUrl}/Report/GetReportTableFieldsByCategoryId`,opts)
    .pipe(
      retry(2),
      catchError(this.handleError)
    );
  }

  public getSortableReportFieldsByCategoryId(opts): Observable<any>{
    return this.http.get<any>(`${environment.baseApiUrl}/Report/GetSortableFieldsByCategoryId`,opts)
    .pipe(
      retry(2),
      catchError(this.handleError)
    );
  }

  public getReportParametersByCategoryId(opts): Observable<any>{
    return this.http.get<any>(`${environment.baseApiUrl}/Report/GetReportParametersByCategoryId`,opts)
    .pipe(
      retry(2),
      catchError(this.handleError)
    );
  }
  public createMembershipReport(opts): Observable<any>{
    return this.http.post<any>(`${environment.baseApiUrl}/Report/CreateMembershipReport`,opts)
    .pipe(
      catchError(this.handleError)
    );
  }
  public updateMembershipReport(opts): Observable<any>{
    return this.http.post<any>(`${environment.baseApiUrl}/Report/UpdateMembershipReport`,opts)
    .pipe(
      catchError(this.handleError)
    );
  }
  public getMembershipReport(opts): Observable<any>{
    return this.http.get<any>(`${environment.baseApiUrl}/Report/GetMembershipReport`,opts)
    .pipe(
      retry(2),
      catchError(this.handleError)
    );
  }
  public getMembershipReportConfiguration(opts): Observable<any>{
    return this.http.get<any>(`${environment.baseApiUrl}/Report/GetMembershipReportConfiguration`,opts)
    .pipe(
      retry(2),
      catchError(this.handleError)
    );
  }
  public getMembershipReportsByUserId(opts): Observable<any>{
    return this.http.get<any>(`${environment.baseApiUrl}/Report/GetMembershipReportsByUserId`,opts)
    .pipe(
      retry(2),
      catchError(this.handleError)
    );
  }
  public getMembershipSharedReportsByUserId(opts): Observable<any>{
    return this.http.get<any>(`${environment.baseApiUrl}/Report/GetMembershipSharedReportsByUserId`,opts)
    .pipe(
      retry(2),
      catchError(this.handleError)
    );
  }
  public deleteMembershipReport(opts): Observable<any>{
    return this.http.post<any>(`${environment.baseApiUrl}/Report/DeleteMembershipReport`,opts)
    .pipe(
      retry(2),
      catchError(this.handleError)
    );
  }
  public cloneMembershipReport(opts): Observable<any>{
    return this.http.post<any>(`${environment.baseApiUrl}/Report/CloneMembershipReport`,opts)
    .pipe(
      retry(2),
      catchError(this.handleError)
    );
  }
  handleError(error: HttpErrorResponse) {
    if(error.message){
      return throwError(error.message);
    }
    console.log('Report Service:'+ error);
    return throwError(error);
  }
}
