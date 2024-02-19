import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class InvoiceItemService {

  constructor(private http: HttpClient) { }

  public getInvoiceItems(params): Observable<any>
  {
    return this.http.get<any>(`${environment.baseApiUrl}/Item/GetAllItems`, params)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }
  public getInvoiceItemsByCode(params): Observable<any>
  {
    return this.http.get<any>(`${environment.baseApiUrl}/Item/GetItemsByCode`, params)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }
  public getInvoiceItemsByName(params): Observable<any>
  {
    return this.http.get<any>(`${environment.baseApiUrl}/Item/GetItemsByName`, params)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }
  public getInvoiceItemTypes(): Observable<any>
  {
    return this.http.get<any>(`${environment.baseApiUrl}/Item/GetSelectList`)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }

  public createItem(item): Observable<any>
  {
    return this.http.post<any>(`${environment.baseApiUrl}/Item/CreateItem`, item)
      .pipe(
        catchError(this.handleError)
      );
  }

  public updateItem(item): Observable<any>
  {
    return this.http.post<any>(`${environment.baseApiUrl}/Item/UpdateItem`, item)
      .pipe(
        catchError(this.handleError)
      );
  }
  public deleteItem(item): Observable<any>
  {
    return this.http.post<any>(`${environment.baseApiUrl}/Item/DeleteItem`, item)
      .pipe(
        catchError(this.handleError)
      );
  }

  public getInvoiceItemById(params): Observable<any>
  {
    return this.http.get<any>(`${environment.baseApiUrl}/Item/GetItemById`, params)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }

  handleError(error: HttpErrorResponse) {
    if(error.message){
      return throwError(error.message);
    }
    console.log('itemService:'+ error);
    return throwError(error);
  }
}
