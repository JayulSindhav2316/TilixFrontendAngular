import { Component, OnInit,  forwardRef, Input, EventEmitter, Output } from '@angular/core';
import { AbstractControl, ControlValueAccessor, FormBuilder, FormGroup, NG_VALIDATORS, NG_VALUE_ACCESSOR, ValidationErrors, Validator, Validators, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { ReportService } from '../../services/report.service';
import { MembershipService } from '../../services/membership.service';
import { HttpParams } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
@Component({
  selector: 'app-shared-report',
  templateUrl: './shared-report.component.html',
  styleUrls: ['./shared-report.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SharedReportComponent),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => SharedReportComponent),
      multi: true
    }
  ]
})
export class SharedReportComponent implements OnInit {
  @Input() userId: number;
  @Input() reportType: string;
  @Output() runReport = new EventEmitter<string>();
  reports: any[];
  currentUser: any;
  constructor(private authService: AuthService, 
    private reportService: ReportService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService) { }

  ngOnInit(): void {
    this.currentUser = this.authService.currentUserValue;
    this.getSharedReports(this.currentUser.id);
  }
  getSharedReports(userId: any){
    let searchParams = new HttpParams();
    searchParams = searchParams.append("userId", userId);
    const opts = { params: searchParams };
    this.reportService.getMembershipSharedReportsByUserId(opts).subscribe((data: any[]) => {
      console.log(data);
      this.reports = data;
    });
  }
  cloneReport(event){
    const body = {
      MembershipReportId: event.membershipReportId,
      UserId:this.currentUser.id
    };
    console.log("cloning report: "+event.membershipReportId);
    this.reportService.cloneMembershipReport(body).subscribe(
      response =>
      {
        this.messageService.add({
          severity: 'success',
          summary: 'Successful',
          detail: 'Report cloned succesfully.',
          life: 3000
        });
      },
      error =>
      {
        console.log(error);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: error, life: 3000 });
      });
  }
  _runReport(event){
    console.log("Run Report:"+JSON.stringify(event));
    this.runReport.emit(event.membershipReportId);
  }
}
