import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TrReportCatetoryService {
  
  constructor(private http: HttpClient) { }

  public getAllReportCategories(): Observable<any>
  {
    return this.http.get<any>(`${environment.reportApiUrl}/api/ReportCategory`);
  }

  public createReportCategory(body): Observable<any>{
    return this.http.post<any>(`${environment.reportApiUrl}/api/ReportCategory`,body);    
  }

  public updateReportCategory(body): Observable<any>{    
    return this.http.put<any>(`${environment.reportApiUrl}/api/ReportCategory`,body);
  }

  public deleteReportCategory(id): Observable<any>{    
    return this.http.delete(`${environment.reportApiUrl}/api/ReportCategory/` + id);
  }

}
