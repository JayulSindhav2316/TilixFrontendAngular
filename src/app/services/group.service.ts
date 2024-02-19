import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class GroupService {

  constructor(private http: HttpClient) { }

  public createGroup(group): Observable<any>
  {
    return this.http.post<any>(`${environment.baseApiUrl}/Group/CreateGroup`, group)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }

  public updateGroup(group): Observable<any>
  {
    return this.http.post<any>(`${environment.baseApiUrl}/Group/UpdateGroup`, group)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }

  public deleteGroup(groupId): Observable<any>
  {
    return this.http.delete<any>(`${environment.baseApiUrl}/Group/DeleteGroup/`+ groupId)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }

  public addGroupRole(groupRole): Observable<any>
  {
    return this.http.post<any>(`${environment.baseApiUrl}/Group/AddGroupRole`, groupRole)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }

  public updateGroupRole(groupRole): Observable<any>
  {
    return this.http.post<any>(`${environment.baseApiUrl}/Group/UpdateGroupRole`, groupRole)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }

  public updateLinkGroupRole(groupRole): Observable<any>
  {
    return this.http.post<any>(`${environment.baseApiUrl}/Group/UpdateLinkGroupRole`, groupRole)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );

  }

  public addLinkGroupRole(linkGroupRole): Observable<any>
  {
    return this.http.post<any>(`${environment.baseApiUrl}/Group/AddLinkGroupRole`, linkGroupRole)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }

  public getDefaultGroupRoles(organizationId: number): Observable<any>
  {
    return this.http.get<any>(`${environment.baseApiUrl}/Group/GetDefaultGroupRoles?organizationId=` +organizationId.toString())
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }

  public getLinkGroupRoleByOrganizationId(organizationId: number): Observable<any>
  {
    return this.http.get<any>(`${environment.baseApiUrl}/Group/GetLinkGroupRoleByOrganizationId?organizationId=` +organizationId.toString())
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }

  public GetLinkedRolesByGroupId(groupId: number, organizationId: number): Observable<any>
  {
    return this.http.get<any>(`${environment.baseApiUrl}/Group/GetLinkedRolesByGroupId?groupId=` +groupId.toString() +`&organizationId=` +organizationId.toString())
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }

  public getAllGroupsByOrganizationId(organizationId: number): Observable<any>
  {
    return this.http.get<any>(`${environment.baseApiUrl}/Group/GetAllGroupsByOrganizationId?organizationId=` + organizationId)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }
  public getAllGroupDetailsByOrganizationId(organizationId: number): Observable<any>
  {
    return this.http.get<any>(`${environment.baseApiUrl}/Group/GetAllGroupDetailsByOrganizationId?organizationId=` + organizationId)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }

 public createLinkGroupRolesOnOrganizationSetUp(organizationId: number): Observable<any>
  {
    return this.http.post<any>(`${environment.baseApiUrl}/Group/CreateLinkGroupRolesOnOrganizationSetUp?organizationId=` + organizationId, null)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }

  public GetRolesSelectListByGroupId(groupId: number): Observable<any>
  {
    return this.http.get<any>(`${environment.baseApiUrl}/Group/GetRolesSelectListByGroupId?groupId=` + groupId)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }

  public getAllGroupMembersByGroupId(groupId: number): Observable<any>
  {
    return this.http.get<any>(`${environment.baseApiUrl}/Group/GetAllGroupMembersByGroupId?groupId=`+ groupId.toString())
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }
  
  public getAllGroupsByEntityId(entityId: number): Observable<any>
  {
    return this.http.get<any>(`${environment.baseApiUrl}/Group/GetAllGroupsByEntityId?entityId=`+ entityId.toString())
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }
  
  public getGroupsByEntityId(entityId: number): Observable<any>
  {
    return this.http.get<any>(`${environment.baseApiUrl}/Group/GetGroupsByEntityId?entityId=`+ entityId.toString())
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }

public GetGroupsForGroupMemberByEntityId(entityId: number): Observable<any>
  {
    return this.http.get<any>(`${environment.baseApiUrl}/Group/GetGroupsForGroupMemberByEntityId?entityId=`+ entityId.toString())
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }

  public addGroupMember(groupMember: any): Observable<any>
  {
    return this.http.post<any>(`${environment.baseApiUrl}/Group/AddGroupMember`, groupMember)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }

  public updateGroupMember(groupMember: any): Observable<any>
  {
    return this.http.post<any>(`${environment.baseApiUrl}/Group/UpdateGroupMember`, groupMember)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }

  public deleteGroupMember(groupMemberId): Observable<any>
  {
    return this.http.delete<any>(`${environment.baseApiUrl}/Group/DeleteGroupMember/` + groupMemberId)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );

  }

  public deleteGroupMemberRole(groupMemberRoleId): Observable<any>
  {
    return this.http.delete<any>(`${environment.baseApiUrl}/Group/DeleteGroupMemberRole/` + groupMemberRoleId)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );

  }

  public updateGroupMemberRole(groupMemberRole): Observable<any>
  {
    return this.http.post<any>(`${environment.baseApiUrl}/Group/UpdateGroupMemberRole`, groupMemberRole)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );

  }
  
  public getRolesByGroupMemberId(groupMemberId: number): Observable<any>
  {
    return this.http.get<any>(`${environment.baseApiUrl}/Group/GetRolesByGroupMemberId?groupMemberId=`+ groupMemberId.toString())
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }

  handleError(error: HttpErrorResponse) {
    if(error.message){
      return throwError(error.message);
    }
    console.log('Group Service:'+ error);
    return throwError(error);
  }
}
