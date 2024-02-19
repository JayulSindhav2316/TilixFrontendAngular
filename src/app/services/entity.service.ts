import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { retry, catchError } from 'rxjs/operators';
import { Message } from '@angular/compiler/src/i18n/i18n_ast';

@Injectable({
  providedIn: 'root'
})

@Injectable({
  providedIn: 'root'
})
export class EntityService {

  constructor(private http: HttpClient) { }

  public getEntityProfileById(params): Observable<any>
  {
    return this.http.get<any>(`${environment.baseApiUrl}/Entity/GetEntityProfileById`, params)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }
  public getEntityById(params): Observable<any>
  {
    return this.http.get<any>(`${environment.baseApiUrl}/Entity/GetEntityById`, params)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }
  public getEntitySummaryById(params): Observable<any>
  {
    return this.http.get<any>(`${environment.baseApiUrl}/Entity/GetEntitySummaryById`, params)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }
  public getEntitiesByName(params): Observable<any>
  {
    return this.http.get<any>(`${environment.baseApiUrl}/Entity/GetEntitiesByName`, params)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }
  public getEmployeesByEntityId(params): Observable<any>
  {
    return this.http.get<any>(`${environment.baseApiUrl}/Company/GetCompanyEmployeesById`, params)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }

  public getRelationsByEntityId(params): Observable<any>
  {
    return this.http.get<any>(`${environment.baseApiUrl}/Relation/GetRelationsByEntityId`, params)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }

  public getRelationListByEntityId(params): Observable<any>
  {
    return this.http.get<any>(`${environment.baseApiUrl}/Relation/GetRelationSelectListByEntityId`, params)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }

  public addRelationship(params): Observable<any>
  {
    return this.http.post<any>(`${environment.baseApiUrl}/Relation/CreateRelation`, params)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }

  public addBillableContact(params): Observable<any>
  {
    return this.http.get<any>(`${environment.baseApiUrl}/Entity/AddBillableContact`, params)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }



  public getProfileImage(entityId: number): Observable<Blob>
  {
      const now = new Date();
      const nowIso = now.toISOString();
      const currentTime = Date.parse(nowIso);
      const imageUrl  = `${environment.baseApiUrl}/Document/GetProfileImage` +  '?entityId=' + entityId.toString();
      console.log('Image Url:' + imageUrl );
      return this.http.get(imageUrl, { responseType: 'blob' });
  }
  
  public deleteProfileImage(entityId): Observable<any>
  {
    return this.http.delete(`${environment.baseApiUrl}/Document/DeleteProfileImage/` + entityId)
    .pipe(
      retry(2),
      catchError(this.handleError)
    );
  }

  public uploadImage(params): Observable<any>
  {
     return this.http.post(`${environment.baseApiUrl}/Document/UploadProfileImage`, params)
     .pipe(
      retry(2),
      catchError(this.handleError)
    );
  }

  public getMembershipProfileById(params): Observable<any>
  {
    return this.http.get<any>(`${environment.baseApiUrl}/Entity/GetMembershipProfileByEntityId`, params)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }
  public getMembershipBalanceById(params): Observable<any>
  {
    return this.http.get<any>(`${environment.baseApiUrl}/Invoice/GetMembershipDueByPersonId`, params)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }
  public getMembershipHistoryById(params): Observable<any>
  {
    return this.http.get<any>(`${environment.baseApiUrl}/Entity/GetMembershipHistory`, params)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }
  public getMembershipBillingHistoryById(params): Observable<any>
  {
    return this.http.get<any>(`${environment.baseApiUrl}/Invoice/GetMembershipBillingHistory`, params)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }
  public getScheduledBillingById(params): Observable<any>
  {
    return this.http.get<any>(`${environment.baseApiUrl}/Entity/GetScheduledBillingByEntityId`, params)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }
  public getEntitiesByIds(params): Observable<any>
  {
    return this.http.get<any>(`${environment.baseApiUrl}/Entity/GetEntitiesByIds`, params)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }
  
  public getBillingAddressByEntityId(params): Observable<any>
  {
    return this.http.get<any>(`${environment.baseApiUrl}/Entity/GetBillingAddressByEntityId`, params)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }

  public updateWebLogin(body): Observable<any>
  {
    return this.http.post<any>(`${environment.baseApiUrl}/Entity/UpdateWebLogin`, body)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }
  public updateBillingNotification(body): Observable<any>
  {
    return this.http.post<any>(`${environment.baseApiUrl}/Entity/UpdateBillingNotification`, body)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }

  public getMembershipConnectionsByMembershipId(id): Observable<any>
  {
    return this.http.get<any>(`${environment.baseApiUrl}/MembershipConnection/GetMembershipConnectionsByMembershipId`, id)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }
  public getActiveEntityRolesByEntityId(params): Observable<any>
  {
    return this.http.get<any>(`${environment.baseApiUrl}/EntityRole/GetActiveEntityRolesByEntityId`, params)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }
  public getActiveEntityAccountRolesByEntityId(params): Observable<any>
  {
    return this.http.get<any>(`${environment.baseApiUrl}/EntityRole/GetActiveEntityAccountRolesByEntityId`, params)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }
  public GetActiveEntityRolesByCompanyId(params): Observable<any>
  {
    return this.http.get<any>(`${environment.baseApiUrl}/EntityRole/GetActiveEntityRolesByCompanyId`, params)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }
  public GetActiveContactRolesByEntityId(params): Observable<any>
  {
    return this.http.get<any>(`${environment.baseApiUrl}/EntityRole/GetActiveAccountContactsByEntityId`, params)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }
  
  handleError(error: HttpErrorResponse) {
    if(error.message){
      return throwError(error.message);
    }
    console.log('entityService:'+ error);
    return throwError(error);
  }
}
