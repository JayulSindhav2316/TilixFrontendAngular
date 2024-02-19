import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders,HttpErrorResponse  } from '@angular/common/http';
import { Observable, throwError} from 'rxjs';
import { environment } from '../../environments/environment';
import { retry, catchError } from 'rxjs/operators';
@Injectable({
  providedIn: 'root'
})
export class InvoiceService {

  constructor(private http: HttpClient) {}

  public getInvoiceDetail(opts): Observable<any>{
    return this.http.get<any>(`${environment.baseApiUrl}/Invoice/GetInvoiceDetailsByInvoiceId`,opts)
    .pipe(
      retry(2),
      catchError(this.handleError)
    );
  }

  public getMembershipInvoiceDues(): Observable<any>{
    return this.http.get<any>(`${environment.baseApiUrl}/Invoice/GetMembershipInvoiceDues`)
    .pipe(
      retry(2),
      catchError(this.handleError)
    );
  }

  public getAllOutstandingReceivables(): Observable<any>{
    return this.http.get<any>(`${environment.baseApiUrl}/Invoice/GetAllOutstandingReceivables`)
    .pipe(
      retry(2),
      catchError(this.handleError)
    );
  }
  
  
  public getHeaderImage(organizationId: number): Observable<Blob>
  {
      const imageUrl  = `${environment.baseApiUrl}/Document/GetOrganizationImage` +  '?organizationId=' + organizationId.toString() + '&title=header';
      console.log('Image Url:' + imageUrl );
      return this.http.get(imageUrl, { responseType: 'blob' });
  }

  public emailInvoice(opts): Observable<any>{
    return this.http.post<any>(`${environment.baseApiUrl}/Invoice/EmailInvoice`,opts)
    .pipe(
      catchError(this.handleError)
    );
  }

  public updateInvoice(body): Observable<any>{
    return this.http.post<any>(`${environment.baseApiUrl}/Invoice/UpdateInvoice`,body)
    .pipe(
      catchError(this.handleError)
    );
  }

  public getRefundModes(param): Observable<any>{
    return this.http.get<any>(`${environment.baseApiUrl}/Invoice/GetRefundModes`,param)
    .pipe(
      retry(2),
      catchError(this.handleError)
    );
  }

  public refundPayment(body): Observable<any>{
    return this.http.post<any>(`${environment.baseApiUrl}/Receipt/RefundPayment`,body)
    .pipe(
      catchError(this.handleError)
    );
  }

  public createItemInvoice(body): Observable<any>{
    return this.http.post<any>(`${environment.baseApiUrl}/Invoice/CreateItemInvoice`,body)
    .pipe(
      catchError(this.handleError)
    );
  }

  public updateItemInvoice(body): Observable<any>{
    return this.http.post<any>(`${environment.baseApiUrl}/Invoice/UpdateItemInvoice`,body)
    .pipe(
      catchError(this.handleError)
    );
  }
  public getInvoiceHistoryById(params): Observable<any>
  {
    return this.http.get<any>(`${environment.baseApiUrl}/Invoice/GetInvoicesByPersonId`, params)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }

  public getInvoicesBySearchCondition(params): Observable<any>
  {
    return this.http.get<any>(`${environment.baseApiUrl}/Invoice/GetInvoicesBySearchCondition`, params)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }

  public getPaperInvoicePdfByCycleId(cycleId: number, organizationId: number): Observable<any>
  {
    const url  = `${environment.baseApiUrl}/Document/GetPaperInvoicePdf` + '?cycleId='+ cycleId.toString()+ '&organizationId=' + organizationId.toString();
    console.log('pdf Url:' + url );
    return this.http.get(url, { responseType: 'blob' });
  }
  public getPaperInvoicePdfByInvoiceId(invoiceId: number, organizationId: number): Observable<any>
  {
    const url  = `${environment.baseApiUrl}/Document/GetPaperInvoicePdfByInvoiceId` + '?invoiceId='+ invoiceId.toString()+ '&organizationId=' + organizationId.toString();
    console.log('pdf Url:' + url );
    return this.http.get(url, { responseType: 'blob' });
  }
  
  public getEventPaperInvoicePdfByInvoiceId(invoiceId: number, organizationId: number): Observable<any>
  {
    const url  = `${environment.baseApiUrl}/Document/GetEventPaperInvoicePdfByInvoiceId` + '?invoiceId='+ invoiceId.toString()+ '&organizationId=' + organizationId.toString();
    console.log('pdf Url:' + url );
    return this.http.get(url, { responseType: 'blob' });
  }

  public getInvoiceEmailText(invoiceId: any): Observable<any>{
    const url  = `${environment.baseApiUrl}/Invoice/GetInvoiceEmailText` + '?invoiceId='+ invoiceId.toString();
    return this.http.get(url, {responseType: 'text'});
  }

  public updatePaperInvoice(body): Observable<any>{
    return this.http.post<any>(`${environment.baseApiUrl}/Invoice/UpdatePaperInvoice`,body)
    .pipe(
      catchError(this.handleError)
    );
  }

  public deletePaperInvoice(paperInvoiceId: number): Observable<any>{
    return this.http.delete<any>(`${environment.baseApiUrl}/Invoice/DeletePaperInvoice/` +paperInvoiceId)
    .pipe(
      catchError(this.handleError)
    );
  }

  public writeOffReceivable(body): Observable<any>{
    return this.http.post<any>(`${environment.baseApiUrl}/Invoice/CreateWriteOff`,body)
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
  public CheckInvoiceIsInCart(invoiceId: number, ): Observable<any>{
    return this.http.get<any>(`${environment.baseApiUrl}/Invoice/CheckInvoiceIsInCart/` +invoiceId)
    .pipe(
      catchError(this.handleError)
    );
  }

  public deleteInvoice(body): Observable<any>{
    return this.http.post<any>(`${environment.baseApiUrl}/Invoice/DeleteInvoice`,body)
    .pipe(
      catchError(this.handleError)
    );
  }

}
