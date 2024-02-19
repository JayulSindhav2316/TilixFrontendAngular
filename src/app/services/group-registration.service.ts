import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class GroupRegistrationService {

  constructor(private http: HttpClient) { }

  public getAllGroups(searchText): Observable<any>
  {
    return this.http.get<any>(`${environment.baseApiUrl}/GroupRegistraion/GetAllRegisterGroups?searchText=`+ searchText)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }

   public addGroup(body): Observable<any>
   {
     return this.http.post<any>(`${environment.baseApiUrl}/GroupRegistraion/RegisterGroup`, body)
       .pipe(
         catchError(this.handleError)
       );
   }

   public updateGroup(body): Observable<any>
   {
     return this.http.post<any>(`${environment.baseApiUrl}/GroupRegistraion/UpdateGroup`, body)
       .pipe(
         catchError(this.handleError)
       );
   }
   public linkMembership(body): Observable<any>
   {
     return this.http.post<any>(`${environment.baseApiUrl}/GroupRegistraion/LinkMembership`, body)
       .pipe(
         catchError(this.handleError)
       );
   }

   public deleteGroup(groupId): Observable<any>
   {
     return this.http.delete<any>(`${environment.baseApiUrl}/GroupRegistraion/DeleteGroup?groupId=`+ groupId)
       .pipe(
         catchError(this.handleError)
       );
   }
   public deleteLinkedMembership(linkId): Observable<any>
   {
     return this.http.delete<any>(`${environment.baseApiUrl}/GroupRegistraion/DeleteLink?linkId=`+ linkId)
       .pipe(
         catchError(this.handleError)
       );
  }
  
   public getLinkEventModelForAllRegisterGroups(params): Observable<any>
    {
      return this.http.get<any>(`${environment.baseApiUrl}/GroupRegistraion/GetLinkEventModelForAllRegisterGroups`, params)
        .pipe(
          retry(2),
          catchError(this.handleError)
        );
    }

  handleError(error: HttpErrorResponse) {
    if(error.message){
      return throwError(error.message);
    }
    console.log('Question Bank Service:'+ error);
    return throwError(error);
  }
}
