import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders,HttpErrorResponse  } from '@angular/common/http';
import { Observable, throwError} from 'rxjs';
import { environment } from '../../environments/environment';
import { retry, catchError } from 'rxjs/operators';
@Injectable({
  providedIn: 'root'
})
export class ReceiptService {

  constructor(private http: HttpClient) {}

  public getReceiptDetailByCartId(opts): Observable<any>{
    return this.http.get<any>(`${environment.baseApiUrl}/Receipt/GetReceiptDetailByCartId`,opts)
    .pipe(
      retry(2),
      catchError(this.handleError)
    );
  }
  public getReceiptDetailById(opts): Observable<any>{
    return this.http.get<any>(`${environment.baseApiUrl}/Receipt/GetReceiptDetailById`,opts)
    .pipe(
      retry(2),
      catchError(this.handleError)
    );
  }
  public getCreditCardReport(params): Observable<any>
  {
    return this.http.get<any>(`${environment.baseApiUrl}/Receipt/GetCreditCardReport`,params)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }
  public getSalesByMonth(): Observable<any>
  {
    return this.http.get<any>(`${environment.baseApiUrl}/Dashboard/GetDailySalesByMonth`)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }
  public updateReceipt(body): Observable<any>
  {
    return this.http.post<any>(`${environment.baseApiUrl}/Receipt/UpdateReceipt`, body)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }
  
  public emailReceipt(opts): Observable<any>{
    return this.http.post<any>(`${environment.baseApiUrl}/Receipt/EmailReceipt`,opts)
    .pipe(
      catchError(this.handleError)
    );
  }
  public getDepositReport(params): Observable<any>
  {
    return this.http.get<any>(`${environment.baseApiUrl}/Receipt/getDepositReport`,params)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }

  public voidReceipt(body): Observable<any>
  {
    return this.http.post<any>(`${environment.baseApiUrl}/Receipt/VoidPayment`, body)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }

  public getReceiptPdfByReceiptId(receiptId: number): Observable<any>
  {
    const url  = `${environment.baseApiUrl}/Document/GetReceiptPdf` + '?receiptId='+ receiptId;
    console.log('pdf Url:' + url );
    return this.http.get(url, { responseType: 'blob' });
  }
  
  handleError(error: HttpErrorResponse) {
    if(error.message){
      return throwError(error.message);
    }
    console.log('Receipt Service:'+ error);
    return throwError(error);
  }
}
