import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders,HttpErrorResponse  } from '@angular/common/http';
import { Observable, throwError} from 'rxjs';
import { environment } from '../../environments/environment';
import { retry, catchError } from 'rxjs/operators';
@Injectable({
  providedIn: 'root'
})
export class BillingService {

  constructor(private http: HttpClient) {}

  public createBillingCycle(body): Observable<any>{
    return this.http.post<any>(`${environment.baseApiUrl}/Billing/CreateBillingCycle`,body)
    .pipe(
      catchError(this.handleError)
    );
  }
  public finalizeBillingCycle(body): Observable<any>{
    return this.http.post<any>(`${environment.baseApiUrl}/Billing/FinalizeBillingCycle`,body)
    .pipe(
      catchError(this.handleError)
    );
  }
  public getPreliminaryPaperInvoices(): Observable<any>{
    return this.http.get<any>(`${environment.baseApiUrl}/Billing/GetPreliminaryPaperInvoices`)
    .pipe(
      retry(2),
      catchError(this.handleError)
    );
  }
  public getBillingCycles(): Observable<any>{
    return this.http.get<any>(`${environment.baseApiUrl}/Billing/GetBillingCycles`)
    .pipe(
      retry(2),
      catchError(this.handleError)
    );
  } 
  public getPaperInvoicesByCycleId(body): Observable<any>{
    return this.http.get<any>(`${environment.baseApiUrl}/Billing/GetPaperInvoiceByCycleId`,body)
    .pipe(
      retry(2),
      catchError(this.handleError)
    );
  } 
  
  public deleteCycle(body): Observable<any>{
    return this.http.post<any>(`${environment.baseApiUrl}/Billing/DeleteCycle`,body)
    .pipe(
      retry(2),
      catchError(this.handleError)
    );
  }
  public regenrateCycle(body): Observable<any>{
    return this.http.post<any>(`${environment.baseApiUrl}/Billing/RegenrateCycle`,body)
    .pipe(
      retry(2),
      catchError(this.handleError)
    );
  }
  public getLastManualBillingDrafts(billingCycleId): Observable<any>{
    return this.http.get<any>(`${environment.baseApiUrl}/Billing/GetLastManualBillingDrafts`, billingCycleId)
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
