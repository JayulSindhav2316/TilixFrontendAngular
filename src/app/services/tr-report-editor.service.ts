import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable} from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TrReportService {

  constructor(private http: HttpClient) { }

  public getAllReports(): Observable<any>
  {
    return this.http.get<any>(`${environment.reportApiUrl}/api/ReportDefinition/GetAllReports`);
  }

  public getReportsByCategory(categoryId:number): Observable<any>
  {
    return this.http.get<any>(`${environment.reportApiUrl}/api/ReportDefinition/GetAllReportsByCategory?categoryId=` + categoryId);
  }

  public getReportTemplates(): Observable<any>
  {
    return this.http.get<any>(`${environment.reportApiUrl}/api/ReportTemplate`);
  }

  public createReport(body): Observable<any>{
    return this.http.post<any>(`${environment.reportApiUrl}/api/ReportDefinition/AddReport`,body);
  }

  public updateReport(body): Observable<any>{    
    return this.http.put<any>(`${environment.reportApiUrl}/api/ReportDefinition/UpdateReport`,body);
  }

  public cloneReport(body): Observable<any>{    
    return this.http.post<any>(`${environment.reportApiUrl}/api/ReportDefinition/CloneReport`,body);
  }
  public deleteReport(id): Observable<any>{    
    return this.http.delete(`${environment.reportApiUrl}/api/ReportDefinition/` + id);
  }

}
