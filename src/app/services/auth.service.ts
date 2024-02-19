import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, JsonpClientBackend } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { User } from '../models/user';
import { PaymentUser } from '../models/payment-user';
import { retry, catchError } from 'rxjs/operators';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { MerchantInfo } from '../models/auth-net/merchant-info';
@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private currentUserSubject: BehaviorSubject<User>;
  public currentUser: Observable<User>;

  //user for Member Portal
  private currentPaymentOrganizationSubject: BehaviorSubject<string>;
  public currentPaymentOrganization: Observable<string>;

  //user for Merchant Info
  private currentMerchantInfoSubject: BehaviorSubject<MerchantInfo>;
  public currentMerchantInfo: Observable<MerchantInfo>;

  private refreshTokenTimeout;

  constructor(private http: HttpClient, private router: Router) {
    this.currentUserSubject = new BehaviorSubject<User>(JSON.parse(localStorage.getItem('currentUser')));
    this.currentUser = this.currentUserSubject.asObservable();

    this.currentPaymentOrganizationSubject = new BehaviorSubject<string>(JSON.parse(localStorage.getItem('currentPaymentOrganization')));
    this.currentPaymentOrganization = this.currentPaymentOrganizationSubject.asObservable();
    
    this.currentMerchantInfoSubject = new BehaviorSubject<MerchantInfo>(JSON.parse(localStorage.getItem('currentMerchantInfo')));
    this.currentMerchantInfo = this.currentMerchantInfoSubject.asObservable();
   }

   public get currentUserValue(): User {
    return this.currentUserSubject.value;
  }

  public get currentPaymentOrganizationValue(): string {
    return this.currentPaymentOrganizationSubject.value;
  }

  public get merchantInfo(): MerchantInfo {
    return this.currentMerchantInfoSubject.value;
  }

  public login(body) {
        console.log('User:'+ JSON.stringify(body) );
    console.log('LoginInfo:'+ JSON.stringify(body));
    return this.http.post<any>(`${environment.baseApiUrl}/Authorization/authenticate`, body)
          .pipe(map(response => {
            // checkif user has been authenticated
             console.log('login response->'+JSON.stringify(response));
              //Check if response is valid
              if(response.id){
                if(response.id >0 ){
                  let user = response;
                  localStorage.setItem('currentUser', JSON.stringify(user));
                  localStorage.setItem('currentUserId', JSON.stringify(user.id));
                  this.currentUserSubject.next(user);
                  console.log('Starting Refresh Timer--->');
                  this.startRefreshTokenTimer();
                  console.log('Read Merchant Info --->');
                  return user;
                }
              }
              // store user verification Request
              localStorage.setItem('userVerification', JSON.stringify(response));
              return response;
          }),catchError(this.handleError));
  }
  public ValidateOrganization(body): Observable<any>
  {
    return this.http.post<any>(`${environment.baseApiUrl}/Authorization/ValidateOrganization`, body)
      .pipe(
        catchError(this.handleError)
      );
  }
  public confirmResetPassword(body): Observable<any>
  {
    return this.http.post<any>(`${environment.baseApiUrl}/Authorization/ConfirmResetPassword`, body)
      .pipe(
        catchError(this.handleError)
      );
  }
  public resetPassword(body): Observable<any>
  {
    return this.http.post<any>(`${environment.baseApiUrl}/Authorization/ResetPassword`, body)
      .pipe(
        catchError(this.handleError)
      );
  }
  public validateResetPasswordLink(body): Observable<any>
  {
    return this.http.post<any>(`${environment.baseApiUrl}/Authorization/ResetPasswordLink`, body)
      .pipe(
        catchError(this.handleError)
      );
  }
  
  public ValidateUser(body): Observable<any>
  {
    return this.http.post<any>(`${environment.baseApiUrl}/Authorization/GetMultiFactorCode`, body)
      .pipe(
        catchError(this.handleError)
      );
  }

  public ValidateCode(body): Observable<any>
  {
    return this.http.post<any>(`${environment.baseApiUrl}/Authorization/ValidateMultiFactorCode`, body)
      .pipe(map(response => {
        // store user verification Request
        if(response.statusCode=="401" || response.statusCode=="403"){
          return response
        }
        //Check if response is valid
        if(response.id >0 ){
          let user = response;
          localStorage.setItem('currentUser', JSON.stringify(user));
          this.currentUserSubject.next(user);
          console.log('Starting Refresh Timer--->');
          this.startRefreshTokenTimer();
          return user;
        }
    }),
    catchError(this.handleError));
  }
  setPaymentOrganization(organization:string){
    localStorage.setItem('currentPaymentOrganization', JSON.stringify(organization));
    this.currentPaymentOrganizationSubject.next(organization);
  }
  logout(url) {
    // remove user from local storage to log user out
    this. reokeToken();
    localStorage.setItem('lastLogoutUserId',JSON.parse(localStorage.getItem('currentUserId')));
    localStorage.removeItem('currentUserId');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('userVerification');
    localStorage.removeItem('cmsUser');
    localStorage.removeItem('currentMerchantInfo');
    this.currentUserSubject.next(null);
    if(url)
    {
      
      this.router.navigate(['/login'], { queryParams: { returnUrl: url } });
    }
    else
    {
      this.router.navigate(['/login']);
    }
    
  }

  addCart(cartId){
    let user = JSON.parse(localStorage.getItem('currentUser'));
    user.cartId = cartId;
    localStorage.setItem('currentUser', JSON.stringify(user));
    this.currentUserSubject.next(user);
    console.log('User:' + JSON.stringify(user));
    return user;
  }

  clearCart(){
    let user = JSON.parse(localStorage.getItem('currentUser'));
    user.cartId = 0;
    localStorage.setItem('currentUser', JSON.stringify(user));
    this.currentUserSubject.next(user);
    console.log('User:' + JSON.stringify(user));
    return user;
  }

  refreshToken() {
    return this.http.post<any>(`${environment.baseApiUrl}/Authorization/RefreshToken`, {
      'refreshToken': this.currentUserValue.refreshToken, 'userId':this.currentUserValue.id,'ipAddress': this.currentUserValue.ipAddress
    }).pipe(map((response) => {
      console.log('Refereshed Token:'+JSON.stringify(response))
      let user = JSON.parse(localStorage.getItem('currentUser'));
      user.token = response.token;
      user.refreshToken = response.refreshToken;
      console.log('Refereshed CurrentUser:'+JSON.stringify(user))
      localStorage.setItem('currentUser', JSON.stringify(user));
      this.currentUserSubject.next(user);
      this.startRefreshTokenTimer();
      return user;
  }));
  }

  reokeToken() {
    return this.http.post<any>(`${environment.baseApiUrl}/Authorization/RevokeToken`, {
      'refreshToken': this.currentUserValue.refreshToken, 'userId':this.currentUserValue.id,'ipAddress': this.currentUserValue.ipAddress
    }).subscribe();
  }

  validateToken() {
    return this.http.post<any>(`${environment.baseApiUrl}/Authorization/ValidateToken`, {
      'token': this.currentUserValue.token,'refreshToken': this.currentUserValue.refreshToken, 'userId':this.currentUserValue.id,'ipAddress': this.currentUserValue.ipAddress
    }).pipe(
        catchError(this.handleError)
  );
  }

  public getMerchantProfile(organizationName: string)
  {
    return this.http.get<any>(`${environment.baseApiUrl}/AuthNet/GetPaymentProcessorInfo?organizationName=`+organizationName)
      .pipe(
        catchError(this.handleError)
      );
  }

  private startRefreshTokenTimer() {
    // parse json object from base64 encoded jwt token
    const token = JSON.parse(atob(this.currentUserValue.token.split('.')[1]));

    // set a timeout to refresh the token a minute before it expires
    const expires = new Date(token.exp * 1000);
    console.log('Token expiration:'+ expires);
    const timeout = 5 * 60 * 1000;
    this.refreshTokenTimeout = setTimeout(() => this.refreshToken().subscribe(), timeout);
    console.log('Refresh Token timeout:'+timeout );
}

private stopRefreshTokenTimer() {
  clearTimeout(this.refreshTokenTimeout);
}
 
public ValidatePaymentUrl(body): Observable<any>{
    return this.http.post<any>(`${environment.baseApiUrl}/Authorization/ValidatePaymentUrl`, body)
      .pipe(
        catchError(this.handleError)
      );
  }
  public getSelfPaymentReceipt(body): Observable<any>{
    return this.http.post<any>(`${environment.baseApiUrl}/Authorization/GetSelfPaymentReceipt`, body)
      .pipe(
        catchError(this.handleError)
      );
  }
handleError(error: HttpErrorResponse) {
    if(error.message){
      return throwError(error.message);
    }
    console.log('authservice:'+ error);
    return throwError(error);
  }
}
