import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from '../services/auth.service';
import { LoaderService } from '../services/loader.service';
import { finalize } from 'rxjs/operators';
@Injectable()

export class JwtInterceptor implements HttpInterceptor {
    constructor(private authService: AuthService,
        private loaderService: LoaderService) { }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        // add auth header with jwt if user is logged in and request is to the api url
        
        const currentUser = this.authService.currentUserValue;
        const isLoggedIn = currentUser && currentUser.token;
        const isApiUrl = request.url.startsWith(environment.baseApiUrl);
        const isReportApiUrl = request.url.startsWith(environment.reportApiUrl);
        const paymentOrganization = this.authService.currentPaymentOrganizationValue;

        console.log('jwt:isloggedin:'+isLoggedIn);

        const isAuthUrl = request.url.startsWith(environment.baseApiUrl+'/Authorization/authenticate');
        const isValidateUrl = request.url.startsWith(environment.baseApiUrl+'/Authorization/GetMultiFactorCode');
        const isVerifyUrl = request.url.startsWith(environment.baseApiUrl+'/Authorization/ValidateMultiFactorCode');
        const isPaymentUrl = request.url.startsWith(environment.baseApiUrl+'/Authorization/ValidatePaymentUrl');
        const isAuthOrganizationUrl = request.url.startsWith(environment.baseApiUrl+'/Authorization/ValidateOrganization');
        const isConfirmResetPasswordUrl = request.url.startsWith(environment.baseApiUrl+'/Authorization/ConfirmResetPassword');
        const isResetPasswordUrl = request.url.startsWith(environment.baseApiUrl+'/Authorization/ResetPassword');
        const isGetHeaderUrl = request.url.startsWith(environment.baseApiUrl+'/Document/GetOrganizationImage');
        const isProcessPaymentUrl = request.url.startsWith(environment.baseApiUrl+'/Authorization/ProcessMemberPayment');
        const isPaymentReceiptUrl = request.url.startsWith(environment.baseApiUrl+'/Document/GetReceiptPdf');
        const isPaymentInvoiceUrl = request.url.startsWith(environment.baseApiUrl+'/Document/GetPaperInvoicePdfByInvoiceId');
        const isSelfReceipteUrl = request.url.startsWith(environment.baseApiUrl+'/Authorization/GetSelfPaymentReceipt');
        const isProcessorInfoUrl = request.url.startsWith(environment.baseApiUrl+'/AuthNet/GetPaymentProcessorInfo');
        this.loaderService.isLoading.next(true);
        if (isLoggedIn && isApiUrl) {
            request = request.clone({
                headers: new HttpHeaders({
                    'Authorization': `Bearer ${currentUser.token}`,
                    'X-Tenant-Id': currentUser.tenantId
                  })
            });
        }        
        else if (isLoggedIn && isReportApiUrl)
        {
            request = request.clone({
                headers: new HttpHeaders({
                    'X-Tenant-Id': currentUser.tenantId,
                    'X-Tenant-CN': currentUser.tenantCN,
                    'X-Tenant-RCN': currentUser.tenantRCN
                    })
            });
        }
        else if (isAuthUrl || isAuthOrganizationUrl || isResetPasswordUrl || isConfirmResetPasswordUrl){
            console.log('request:'+request.url);
            console.log('request body:'+ JSON.stringify(request.body));
            const currentUser = this.authService.currentUserValue;
            console.log('request by user:'+ JSON.stringify(currentUser));
            let user = JSON.parse(JSON.stringify(request.body));
            if(user){
                request = request.clone({
                    headers: new HttpHeaders({
                        'X-Tenant-Name': user.organizationName
                      })
                });
            }
        }
        else if (isValidateUrl){
            console.log('request:'+request.url);
            console.log('request body:'+ JSON.stringify(request.body));
            request = request.clone({
                headers: new HttpHeaders({
                    'X-Tenant-Name': request.body.tenantName
                    })
            });
        }
        else if (isVerifyUrl){
            console.log('request:'+request.url);
            console.log('request body:'+ JSON.stringify(request.body));
            request = request.clone({
                headers: new HttpHeaders({
                    'X-Tenant-Name': request.body.tenantName
                    })
            });
        }
        else if (isPaymentUrl || isGetHeaderUrl || isProcessPaymentUrl || isPaymentReceiptUrl || isPaymentInvoiceUrl || isSelfReceipteUrl || isProcessorInfoUrl){
            console.log('request:'+request.url);
            console.log('request body:'+ JSON.stringify(request.body));
            request = request.clone({
                headers: new HttpHeaders({
                    'X-Tenant-Name': paymentOrganization
                    })
            });
        }
      
        return next.handle(request).pipe(
            finalize(
                () => {
                    this.loaderService.isLoading.next(false);
                }
            )
        );
    }
}