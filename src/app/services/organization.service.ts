import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class OrganizationService {

  constructor(private http: HttpClient) { }

  public getAllOrganizations(): Observable<any>
  {
    return this.http.get<any>(`${environment.baseApiUrl}/Organization/GetAllOrganizations`)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }
  public getOrganizationById(param): Observable<any>
  {
    return this.http.get<any>(`${environment.baseApiUrl}/Organization/getOrganizationById`, param)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }
  public createOrganization(body): Observable<any>
  {
    return this.http.post<any>(`${environment.baseApiUrl}/Organization/CreateOrganization`, body)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }
  public updateOrganization(body): Observable<any>
  {
    return this.http.post<any>(`${environment.baseApiUrl}/Organization/UpdateOrganization`, body)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }

  public getOrganizationImage(organizationId: number, title: string): Observable<Blob>
  {
      const now = new Date();
      const nowIso = now.toISOString();
      const currentTime = Date.parse(nowIso);
      const imageUrl  = `${environment.baseApiUrl}/Document/GetOrganizationImage` +  '?organizationId=' + organizationId.toString() + '&title=' +title;
      console.log('Image Url:' + imageUrl );
      return this.http.get(imageUrl, { responseType: 'blob' });
  }
  public getOrganizationImageInBase64(organizationId: number, title: string): Observable<string>
  {
    const imageUrl  = `${environment.baseApiUrl}/Document/GetOrganizationImageInBase64` +  '?organizationId=' + organizationId.toString() + '&title=' +title;
    return this.http.get(imageUrl, { responseType: 'text' });
  }    

  public uploadImage(params): Observable<any>
  {
     return this.http.post(`${environment.baseApiUrl}/Document/UploadProfileImage`, params)
     .pipe(
      retry(2),
      catchError(this.handleError)
    );
  }

  public uploadOrganizationImage(params): Observable<any>
  {
     return this.http.post(`${environment.baseApiUrl}/Document/UploadOrganizationImage`, params)
     .pipe(
      retry(2),
      catchError(this.handleError)
    );
  }

  handleError(error: HttpErrorResponse) {
    if(error.message){
      return throwError(error.message);
    }
    console.log('Organization Service:'+ error);
    return throwError(error);
  }
}
