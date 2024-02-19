import {Injectable} from '@angular/core';
//import {Http, ResponseContentType} from '@angular/http';
import {HttpClient, HttpResponse} from '@angular/common/http';
import {Observable} from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class FileService {

  constructor(private http: HttpClient) {}


  downloadFile(invoiceId): any {
		return this.http.get(`${environment.baseApiUrl}/Document/GetInvoicePdf?invoiceId=7`, {responseType: 'blob'});
  }
   
}