import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ContainerService {

  constructor(private http: HttpClient) { }

  public createContainer(body): Observable<any> {
    return this.http.post<any>(`${environment.baseApiUrl}/DocumentContainer/CreateContainer`, body)
      .pipe(
        catchError(this.handleError)
      );

  }

  public createFolder(body): Observable<any> {
    return this.http.post<any>(`${environment.baseApiUrl}/DocumentContainer/CreateFolder`, body)
      .pipe(
        catchError(this.handleError)
      );
  }

  public uploadDocument(body): Observable<any> {
    return this.http.post<any>(`${environment.baseApiUrl}/DocumentContainer/uploadDocument`, body)
      .pipe(
        catchError(this.handleError)
      );
  }
  public downloadDocument(documentId: number,userId: number, organizationId:number,tenantId:string): Observable<any> 
  {
    const url  = `${environment.baseApiUrl}/DocumentContainer/DownloadDocument` + '?documentObjectId='+ documentId.toString()+ '&staffUserId=' + userId.toString() + '&organizationId='+organizationId.toString()+ '&tenantId='+tenantId;
    console.log('documentObject Url:' + url );
    return this.http.get(url, { responseType: 'blob' }).pipe(
      catchError(this.handleError)
    );
  }
  public GetDocumentUrl(documentId: number,userId: number, organizationId:number,tenantId:string): Observable<any> 
  {
    const url  = `${environment.baseApiUrl}/DocumentContainer/GetDocumentUrl` + '?documentObjectId='+ documentId.toString()+ '&staffUserId=' + userId.toString() + '&organizationId='+organizationId.toString()+ '&tenantId='+tenantId;
    console.log('documentObject Url:' + url );
    return this.http.get(url);
  }
  public updateContainer(body): Observable<any> {
    return this.http.post<any>(`${environment.baseApiUrl}/DocumentContainer/UpdateContainer`, body)
      .pipe(
        catchError(this.handleError)
      );

  }

  public updateFolder(body): Observable<any> {
    return this.http.post<any>(`${environment.baseApiUrl}/DocumentContainer/UpdateFolder`, body)
      .pipe(
        catchError(this.handleError)
      );

  }

  public deleteContainer(body): Observable<any> {
    return this.http.post<any>(`${environment.baseApiUrl}/DocumentContainer/DeleteContainer`, body)
      .pipe(
        catchError(this.handleError)
      );

  }
  public deleteFolder(body): Observable<any> {
    return this.http.post<any>(`${environment.baseApiUrl}/DocumentContainer/DeleteFolder`, body)
      .pipe(
        catchError(this.handleError)
      );

  }
  public deleteDocument(body): Observable<any> {
    return this.http.post<any>(`${environment.baseApiUrl}/DocumentContainer/DeleteDocument`, body)
      .pipe(
        catchError(this.handleError)
      );
  }
  public getDocumentContainers(): Observable<any> {
    return this.http.get<any>(`${environment.baseApiUrl}/DocumentContainer/GetContainerList`)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );

  }

  public getDocumentContainerById(id): Observable<any> {
    return this.http.get<any>(`${environment.baseApiUrl}/DocumentContainer/GetContainerById?containerId=` + id)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );

  }
  public getDocumentContainerByKey(key): Observable<any> {
    return this.http.get<any>(`${environment.baseApiUrl}/DocumentContainer/GetContainerByFolderKey?key=` + key)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );

  }
  public getDocumentsByText(params): Observable<any> {
    return this.http.get<any>(`${environment.baseApiUrl}/DocumentContainer/GetDocumentsByText`, params)
      .pipe(
        catchError(this.handleError)
      );

  }
  public getDocumentContainerAccessListByContainerId(id): Observable<any> {
    return this.http.get<any>(`${environment.baseApiUrl}/DocumentContainer/GetContainerAccessListByContainerId?containerId=` + id)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );

  }
  public getDocumentsByContainerAndPath(id, path): Observable<any> {
    return this.http.get<any>(`${environment.baseApiUrl}/DocumentContainer/GetDocumentsByContainerAndPath?id=` + id+'&path='+path)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );

  }
  public getRootContainerTree(path): Observable<any> {
    return this.http.get<any>(`${environment.baseApiUrl}/DocumentContainer/GetRootContainerTree?selectedNode=`+ path)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );

  }

  public getAuditTrail(startDate, endDate): Observable<any> {
    return this.http.get<any>(`${environment.baseApiUrl}/DocumentContainer/GetAuditTrail?startDate=`+ startDate + '&endDate='+endDate)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );

  }
  public getAuditTrailByDocumentId(documentId): Observable<any> {
    return this.http.get<any>(`${environment.baseApiUrl}/DocumentContainer/GetAuditTrailByDocumentId?documentObjectId=`+ documentId)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );

  }
  public getAccessControlListByDocumentId(documentId): Observable<any> {
    return this.http.get<any>(`${environment.baseApiUrl}/DocumentContainer/GetDocumentAccessListById?documentObjectId=`+ documentId)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );

  }
  public getTagListtByDocumentId(documentId): Observable<any> {
    return this.http.get<any>(`${environment.baseApiUrl}/DocumentContainer/GetDocumentTagListById?documentObjectId=`+ documentId)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );

  }
  public updateAccessControl(body): Observable<any> {
    return this.http.post<any>(`${environment.baseApiUrl}/DocumentContainer/UpdateDocumentAccessControl`, body)
      .pipe(
        catchError(this.handleError)
      );

  }

  public updateTags(body): Observable<any> {
    return this.http.post<any>(`${environment.baseApiUrl}/DocumentContainer/UpdateDocumentTags`, body)
      .pipe(
        catchError(this.handleError)
      );

  }
  
  public getDocumentSearchChart(): Observable<any> {
    return this.http.get<any>(`${environment.baseApiUrl}/Dashboard/GetDocumentSearchByDocument`)
      .pipe(
        catchError(this.handleError)
      );

  }
  public getActiveUserChart(): Observable<any> {
    return this.http.get<any>(`${environment.baseApiUrl}/Dashboard/GetMemberPortalActiveUsers`)
      .pipe(
        catchError(this.handleError)
      );

  }
  public exportDocuments(userName): Observable<any> {
    return this.http.get<any>(`${environment.baseApiUrl}/DocumentContainer/ExportDocuments?userName=`+ userName)
      .pipe(
        catchError(this.handleError)
      );

  }
  handleError(error: HttpErrorResponse) {
    if (error.message) {
      return throwError(error.message);
    }
    console.log('ContainerService:' + error);
    return throwError(error);
  }
}
