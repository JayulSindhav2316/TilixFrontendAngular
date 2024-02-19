import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders,HttpErrorResponse  } from '@angular/common/http';
import { Observable, throwError} from 'rxjs';
import { environment } from '../../environments/environment';
import { retry, catchError } from 'rxjs/operators';
@Injectable({
  providedIn: 'root'
})
export class StaffService {
  menuItems;

    constructor(private http: HttpClient) { }
    setMeuItems(val)
{
  this.menuItems=val;
}
getMenuItems()
{
  return this.menuItems;
}

    public getStaff(): Observable<any>{
      return this.http.get<any>(`${environment.baseApiUrl}/StaffUser/GetAllStaffUsers`)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
    }

    public  createStaff(staffUser): Observable<any> {
      return this.http.post<any>(`${environment.baseApiUrl}/StaffUser/CreateStaffUser`, staffUser)
      .pipe(
        catchError(this.handleError)
      )

    }
    public  updateStaff(staffUser): Observable<any> {
      return this.http.post<any>(`${environment.baseApiUrl}/StaffUser/UpdateStaffUser`, staffUser)
      .pipe(
        catchError(this.handleError)
      )

    }

   public  deleteStaff(staffUser): Observable<any> {
      return this.http.post<any>(`${environment.baseApiUrl}/StaffUser/DeleteStaffUser`, staffUser)
      .pipe(
        catchError(this.handleError)
      )

    }
    public  resetPassword(staffUser): Observable<any> {
      return this.http.post<any>(`${environment.baseApiUrl}/StaffUser/ResetPassword`, staffUser)
      .pipe(
        retry(2),
        catchError(this.handleError)
      )

  }
  
   public  getStaffByNameAndEmail(value): Observable<any> {
      return this.http.get<any>(`${environment.baseApiUrl}/StaffUser/GetAllStaffUsersByNameAndEmail`, value)
      .pipe(
        retry(2),
        catchError(this.handleError)
      )

    }

    public getStaffMenu(userId): Observable<any>{
      return this.http.get<any>(`${environment.baseApiUrl}/StaffUser/GetStaffMenu`, userId)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
    }

    public getHeaderImage(params): Observable<any>{
      return this.http.get<any>(`${environment.baseApiUrl}/Document/GetOrganizationImage`, params)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
    }

    public getStaffImage(userId): Observable<any>{
      return this.http.get<any>(`${environment.baseApiUrl}/StaffUser/GetStaffImage`, userId)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
    }

    public getProfileImage(staffId: number): Observable<Blob>
    {
        const imageUrl  = `${environment.baseApiUrl}/Document/GetStaffProfileImage` +  '?staffId=' + staffId.toString();
        console.log('Image Url:' + imageUrl );
        return this.http.get(imageUrl, { responseType: 'blob' });
    }

    public deleteProfileImage(staffId): Observable<any>
    {
      return this.http.delete(`${environment.baseApiUrl}/Document/DeleteStaffProfileImage/`+ staffId)
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

    handleError(error: HttpErrorResponse) {
    if(error.message){
      return throwError(error.message);
    }
    console.log('Staff Service:'+ error);
    return throwError(error);
  }
}
