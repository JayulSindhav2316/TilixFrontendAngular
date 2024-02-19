import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders,HttpErrorResponse  } from '@angular/common/http';
import { Observable, throwError} from 'rxjs';
import { environment } from '../../environments/environment';
import { retry, catchError } from 'rxjs/operators';
@Injectable({
  providedIn: 'root'
})
export class ShoppingCartService {

  constructor(private http: HttpClient) {}

  public addInvoiceToCart(params): Observable<any>
  {
     return this.http.post(`${environment.baseApiUrl}/ShoppingCart/AddInvoiceToShoppingCart`, params)
     .pipe(
      catchError(this.handleError)
    );
  }

  public addInvoiceToMemberPortalCart(params): Observable<any>
  {
    return this.http.post(`${environment.baseApiUrl}/ShoppingCart/AddInvoicesToMemberPortalShoppingCart`, params)
     .pipe(
      catchError(this.handleError)
    );
  }

  public addReceiptToShoppingCart(params): Observable<any>
  {
     return this.http.post(`${environment.baseApiUrl}/ShoppingCart/AddReceiptToShoppingCart`, params)
     .pipe(
      catchError(this.handleError)
    );
  }

  public processPayment(body): Observable<any>
  {
    return this.http.post<any>(`${environment.baseApiUrl}/ShoppingCart/ProcessPayment`, body)
      .pipe(
        catchError(this.handleError)
      );
  }
  public processMemberPayment(body): Observable<any>
  {
    return this.http.post<any>(`${environment.baseApiUrl}/Authorization/ProcessMemberPayment`, body)
      .pipe(
        catchError(this.handleError)
      );
  }
  public processCheckPayment(body): Observable<any>
  {
    return this.http.post<any>(`${environment.baseApiUrl}/ShoppingCart/ProcessCheckPayment`, body)
      .pipe(
        catchError(this.handleError)
      );
  }
  
  public processOfflinePayment(body): Observable<any>
  {
    return this.http.post<any>(`${environment.baseApiUrl}/ShoppingCart/ProcessOfflinePayment`, body)
      .pipe(
        catchError(this.handleError)
      );
  }
  public getGetShoppingCartByUserId(params): Observable<any>
  {
     return this.http.get(`${environment.baseApiUrl}/ShoppingCart/GetShoppingCartByUserId`, params)
     .pipe(
      retry(2),
      catchError(this.handleError)
    );
  }

  public deleteCart(params): Observable<any>
  {
     return this.http.get(`${environment.baseApiUrl}/ShoppingCart/DeleteShoppingCartById`, params)
     .pipe(
      catchError(this.handleError)
    );
  }
  

  public applyPromoCode(body): Observable<any>
  {
    return this.http.post<any>(`${environment.baseApiUrl}/ShoppingCart/ApplyPromoCode`, body)
      .pipe(
        catchError(this.handleError)
      );
  }
  public deletePromoCode(body): Observable<any>
  {
    return this.http.post<any>(`${environment.baseApiUrl}/ShoppingCart/DeletePromoCode`, body)
      .pipe(
        catchError(this.handleError)
      );
  }

  public updateShoppingCartItem(body): Observable<any>
  {
    return this.http.post<any>(`${environment.baseApiUrl}/ShoppingCart/UpdateShoppingCartItem`, body)
      .pipe(
        catchError(this.handleError)
      );
  }
  public deleteShoppingCartItem(body): Observable<any>
  {
    return this.http.post<any>(`${environment.baseApiUrl}/ShoppingCart/DeleteShoppingCartItem`, body)
      .pipe(
        catchError(this.handleError)
      );
  }

  public processPaymentProfilePayment(body): Observable<any>
  {
    return this.http.post<any>(`${environment.baseApiUrl}/ShoppingCart/ProcessPaymentProfilePayment`, body)
      .pipe(
        catchError(this.handleError)
      );
  }
  public updateShoppingCartInvoiceDetails(body): Observable<any>
  {
    return this.http.post<any>(`${environment.baseApiUrl}/ShoppingCart/UpdateInvoiceDetails`, body)
      .pipe(
        catchError(this.handleError)
      );
  }


  handleError(error: HttpErrorResponse) {
    if(error.message){
      return throwError(error.message);
    }
    console.log('ShoppingCartService:'+ error);
    return throwError(error);
  }
}
