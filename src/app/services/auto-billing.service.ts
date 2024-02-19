import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders,HttpErrorResponse  } from '@angular/common/http';
import { Observable, throwError} from 'rxjs';
import { environment } from '../../environments/environment';
import { retry, catchError } from 'rxjs/operators';
@Injectable({
  providedIn: 'root'
})
export class AutoBillingService {

  constructor(private http: HttpClient) {}

  public getAutoBillingSetup(): Observable<any>{
    return this.http.get<any>(`${environment.baseApiUrl}/AutoBilling/GetAutoBillingConfiguration`)
    .pipe(
      retry(2),
      catchError(this.handleError)
    );
  }

  public updateSetting(body): Observable<any>{
    return this.http.post<any>(`${environment.baseApiUrl}/AutoBilling/UpdateAutoBillingConfiguration`,body)
    .pipe(
      retry(2),
      catchError(this.handleError)
    );
  }
  public getAutobillingCurrentDraft(): Observable<any>{
    return this.http.get<any>(`${environment.baseApiUrl}/AutoBilling/GetAutobillingCurrentDraft`)
    .pipe(
      retry(2),
      catchError(this.handleError)
    );
  }
  public getCategorySummaryByBillingDocumentId(id): Observable<any>{
    return this.http.get<any>(`${environment.baseApiUrl}/AutoBilling/GetCategorySummaryByBillingDocumentId`, id)
    .pipe(
     retry(2),
     catchError(this.handleError)
   );
 }

  public getAutoBillingDocuments(): Observable<any>{
    return this.http.get<any>(`${environment.baseApiUrl}/AutoBilling/GetAutoBillingDocuments`)
    .pipe(
      retry(2),
      catchError(this.handleError)
    );
  }

  public getAutobillingDraftByDocumentId(opts): Observable<any>{
    return this.http.get<any>(`${environment.baseApiUrl}/AutoBilling/GetAutobillingDraftsByBillingDocumentId`,opts)
    .pipe(
      retry(2),
      catchError(this.handleError)
    );
  }
  public getLastAutobillingDraftsAmountCreated(id): Observable<any>{
    return this.http.get<any>(`${environment.baseApiUrl}/AutoBilling/GetLastAutobillingDraftsAmountCreated`, id)
    .pipe(
      retry(2),
      catchError(this.handleError)
    );
  }
  public getLastAutobillingDraftsAmountApproved(id): Observable<any>{
    return this.http.get<any>(`${environment.baseApiUrl}/AutoBilling/GetLastAutobillingDraftsAmountApproved`, id)
    .pipe(
      retry(2),
      catchError(this.handleError)
    );
  }
  public getLastAutoBillingDraftsAmountDeclined(id): Observable<any>{
    return this.http.get<any>(`${environment.baseApiUrl}/AutoBilling/GetLastAutoBillingDraftsAmountDeclined`, id)
    .pipe(
      retry(2),
      catchError(this.handleError)
    );
  }
public getLastBillingChartInvoiceChartData(): Observable<any>{
    return this.http.get<any>(`${environment.baseApiUrl}/AutoBilling/GetLastBillingChartInvoiceChartData`)
    .pipe(
      retry(2),
      catchError(this.handleError)
    );
  }
  public regenrateAutobillingDraft(opts): Observable<any>{
    return this.http.get<any>(`${environment.baseApiUrl}/AutoBilling/RegenrateAutobillingDraft`,opts)
    .pipe(
      retry(2),
      catchError(this.handleError)
    );
  }
  public setAutoPayOnHold(body): Observable<any>{
    return this.http.post<any>(`${environment.baseApiUrl}/AutoBilling/SetAutoPayOnHold`,body)
    .pipe(
      catchError(this.handleError)
    );
  }
  public clearAutoPayOnHold(body): Observable<any>{
    return this.http.post<any>(`${environment.baseApiUrl}/AutoBilling/ClearAutoPayOnHold`,body)
    .pipe(
      catchError(this.handleError)
    );
  }

  handleError(error: HttpErrorResponse) {
    if(error.message){
      return throwError(error.message);
    }
    console.log('invoiceService:'+ error);
    return throwError(error);
  }
}
