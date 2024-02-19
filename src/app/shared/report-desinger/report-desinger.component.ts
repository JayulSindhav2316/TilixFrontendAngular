import { Component, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-report-desinger',
  templateUrl: './report-desinger.component.html',
  styleUrls: ['./report-desinger.component.scss'],
})
export class ReportDesingerComponent implements OnInit {  
  reportApiUrl: any = null;
  loading = true;  
  backtoreportLink:string;
  name:any;
  constructor( private sanitizer: DomSanitizer,private route: ActivatedRoute) {
    
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe((params: ParamMap) => {
      window.localStorage.setItem("RestoreReports", "false");
      window.localStorage.removeItem("PreviouslyOpenedReports");
      window.localStorage.removeItem("LastOpenedReport");
      console.log(params.get('reportname'));      
      if (params.get('page')=='webReportDesinger')
      {
        this.backtoreportLink= '/setup/report-desinger';
      }
      else
      {
        this.backtoreportLink= '/report/reportList';
      }
      
      this.reportApiUrl = this.sanitizer.bypassSecurityTrustResourceUrl(`${environment.reportApiUrl}/${params.get('page')}.html?reportname=${params.get('reportname')}&email=${params.get('email')}`);        
    })
    
    this.loading = true;
  }
  onLoaded(event) {
    this.loading = false;
  }

}
