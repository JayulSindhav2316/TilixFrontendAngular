import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders,HttpErrorResponse  } from '@angular/common/http';
import { Observable, throwError} from 'rxjs';
import { environment } from '../../environments/environment';
import { retry, catchError } from 'rxjs/operators';
@Injectable({
  providedIn: 'root'
})
export class MembershipService {

  constructor(private http: HttpClient) {}

  public getMembershipType(): Observable<any>{
    return this.http.get<any>(`${environment.baseApiUrl}/MembershipType/GetAllMembershipTypes`)
    .pipe(
      retry(2),
      catchError(this.handleError)
    );
  }

  public getMembershipTypeById(opts): Observable<any>{
    return this.http.get<any>(`${environment.baseApiUrl}/MembershipType/GetMembershipTypeById`, opts)
    .pipe(
      retry(2),
      catchError(this.handleError)
    );
  }

  public getMembershipFeeByType(opts): Observable<any>{
    return this.http.get<any>(`${environment.baseApiUrl}/MembershipFee/GetMembershipFeesByMembershipType`,opts)
    .pipe(
      retry(2),
      catchError(this.handleError)
    );
  }

  public getMembershipTypeByCategories(opts): Observable<any>{
    return this.http.get<any>(`${environment.baseApiUrl}/MembershipType/GetMembershipTypesByCategories`,opts)
    .pipe(
      retry(2),
      catchError(this.handleError)
    );
  }
  public getMembershipTypeSelectListByCategories(opts): Observable<any>{
    return this.http.get<any>(`${environment.baseApiUrl}/MembershipType/GetMembershipTypeSelectListByCategories`,opts)
    .pipe(
      retry(2),
      catchError(this.handleError)
    );
  }
  public getMembershipFeeByIds(opts): Observable<any>{
    return this.http.get<any>(`${environment.baseApiUrl}/MembershipFee/GetMembershipFeesByIds`,opts)
    .pipe(
      retry(2),
      catchError(this.handleError)
    );
  }
  public getBillingFeeByMembershipId(opts): Observable<any>{
    return this.http.get<any>(`${environment.baseApiUrl}/MembershipFee/GetBillingFeeByMembershipId`,opts)
    .pipe(
      retry(2),
      catchError(this.handleError)
    );
  }
  public getMembershipPeriodList(): Observable<any>{
    return this.http.get<any>(`${environment.baseApiUrl}/MembershipPeriod/GetSelectList`)
    .pipe(
      retry(2),
      catchError(this.handleError)
    );
  }
  public getMembershipCategoryList(): Observable<any>{
    return this.http.get<any>(`${environment.baseApiUrl}/MembershipCategory/GetSelectList`)
    .pipe(
      retry(2),
      catchError(this.handleError)
    );
  }
  public getMembershipGlAccountList(): Observable<any>{
    return this.http.get<any>(`${environment.baseApiUrl}/GlAccount/GetGlAccountSelectList`)
    .pipe(
      retry(2),
      catchError(this.handleError)
    );
  }
  public getMembershipBillingFrequencyList(): Observable<any>{
    return this.http.get<any>(`${environment.baseApiUrl}/MembershipFee/GetBillingFrequency`)
    .pipe(
      retry(2),
      catchError(this.handleError)
    );
  }
  public  createMembershipType(membershipType): Observable<any> {
    console.log('Servicec:'+   JSON.stringify(membershipType));
    return this.http.post<any>(`${environment.baseApiUrl}/MembershipType/CreateMembershipType`, membershipType)
    .pipe(
      catchError(this.handleError)
    )
  }
  
  public getMembershipPaymentFrequencyList(opts): Observable<any>{
    return this.http.get<any>(`${environment.baseApiUrl}/MembershipPeriod/GetPaymentFrequencySelectList`, opts)
    .pipe(
      retry(2),
      catchError(this.handleError)
    );
  }
  public  updateMembershipType(membershipType): Observable<any> {
    console.log('Servicec:'+   JSON.stringify(membershipType));
    return this.http.post<any>(`${environment.baseApiUrl}/MembershipType/UpdateMembershipType`, membershipType)
    .pipe(
      catchError(this.handleError)
    )

  }

  public  deleteMembershipType(membershipType): Observable<any> {
    console.log('Servicec:'+   JSON.stringify(membershipType));
    return this.http.post<any>(`${environment.baseApiUrl}/MembershipType/DeleteMembershipType`, membershipType)
    .pipe(
      catchError(this.handleError)
    )

  }

  public  deleteMembershpFee(membershipFee): Observable<any> {
    console.log('Service  Deleting:'+   JSON.stringify(membershipFee));
    return this.http.post<any>(`${environment.baseApiUrl}/MembershipFee/DeleteMembershipFee`, membershipFee)
    .pipe(
      catchError(this.handleError)
    )

  }

  public  createMembership(body): Observable<any> {
    console.log('Service Create Membership:'+   JSON.stringify(body));
    return this.http.post<any>(`${environment.baseApiUrl}/Membership/CreateNewMembership`, body)
    .pipe(
      catchError(this.handleError)
    )

  }

  public  getMembershipEndDate(body): Observable<any> {
    console.log('Get Membership end date:'+   JSON.stringify(body));
    return this.http.get<any>(`${environment.baseApiUrl}/Membership/GetMembershipEndDate`, body)
    .pipe(
      catchError(this.handleError)
    )

  }
  
  public  getMembershipTypeChart(): Observable<any> {
    return this.http.get<any>(`${environment.baseApiUrl}/Dashboard/GetMembershipsByType`)
    .pipe(
      catchError(this.handleError)
    )

  }
  
  public  getMembershipExpirationChart(): Observable<any> {
    return this.http.get<any>(`${environment.baseApiUrl}/Dashboard/GetMembershipExpirationDetails`)
    .pipe(
      catchError(this.handleError)
    )

  }
  public  getMembershipTerminationChart(): Observable<any> {
    return this.http.get<any>(`${environment.baseApiUrl}/Dashboard/GetMembershipTerminationsByType`)
    .pipe(
      catchError(this.handleError)
    )

  }

  public  CancelNewMembership(body): Observable<any> {
    console.log('Service Cancel new Membership:'+   JSON.stringify(body));
    return this.http.post<any>(`${environment.baseApiUrl}/Membership/CancelNewMembership`, body)
    .pipe(
      catchError(this.handleError)
    )

  }
  public  updateMembershipDetails(body): Observable<any> {
    console.log('Servicec:'+   JSON.stringify(body));
    return this.http.post<any>(`${environment.baseApiUrl}/Membership/UpdateMembershipDetails`, body)
    .pipe(
      catchError(this.handleError)
    )

  }

  public  updateBillingFee(body): Observable<any> {
    console.log('Servicec:'+   JSON.stringify(body));
    return this.http.post<any>(`${environment.baseApiUrl}/Billing/UpdateBillingFee`, body)
    .pipe(
      catchError(this.handleError)
    )

  }
  handleError(error: HttpErrorResponse) {
    console.error('membership.service: An error occurred:', error||error.message);
    if (error.message) {
      return throwError(
        error.message);
    } 
    // return an observable with a user-facing error message
    return throwError(
      error);
  }
}
