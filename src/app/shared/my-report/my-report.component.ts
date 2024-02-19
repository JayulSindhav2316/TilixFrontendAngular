import { Component, OnInit,  forwardRef, Input, EventEmitter, Output } from '@angular/core';
import { AbstractControl, ControlValueAccessor, FormBuilder, FormGroup, NG_VALIDATORS, NG_VALUE_ACCESSOR, ValidationErrors, Validator, Validators, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { ReportService } from '../../services/report.service';
import { MembershipService } from '../../services/membership.service';
import { HttpParams } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
@Component({
  selector: 'app-my-report',
  templateUrl: './my-report.component.html',
  styleUrls: ['./my-report.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MyReportComponent),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => MyReportComponent),
      multi: true
    },
    MessageService, ConfirmationService
  ]
})
export class MyReportComponent implements OnInit {
  @Input() userId: number;
  @Input() reportType: string;
  @Output() createReport = new EventEmitter<string>();
  @Output() runReport = new EventEmitter<string>();
  @Output() editReport = new EventEmitter<string>();

  reports: any[];
  currentUser: any;
  constructor(private authService: AuthService, 
    private reportService: ReportService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService) { }

  ngOnInit(): void {
    this.currentUser = this.authService.currentUserValue;
    this.getMyReports(this.currentUser.id);
  }

  createNewReport(){
    this.createReport.emit("new");
  }
  getMyReports(userId: any){
    let searchParams = new HttpParams();
    searchParams = searchParams.append("userId", userId);
    const opts = { params: searchParams };
    this.reportService.getMembershipReportsByUserId(opts).subscribe((data: any[]) => {
      console.log(data);
      this.reports = data;
    });
  }
  _runReport(event){
    console.log("Run Report:"+JSON.stringify(event));
    this.runReport.emit(event.membershipReportId);
  }
  _editReport(event){
    console.log("Edit Report:"+JSON.stringify(event));
    this.editReport.emit(event.membershipReportId);
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
        this.editReport.emit(response.membershipReportId);
      },
      error =>
      {
        console.log(error);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: error, life: 3000 });
      });
  }

  deleteReport(event){
    console.log("Deleting report:"+event.membershipReportId);
      const body = {
        MembershipReportId: event.membershipReportId
      };
      console.log("Deleting report -> body"+JSON.stringify(body));
      this.confirmationService.confirm({
        message: 'Are you sure you want to delete the report: <B>' + event.title + '</B> ?',
        header: 'Confirm',
        icon: 'pi pi-exclamation-triangle',
        accept: () =>
        {
          this.reportService.deleteMembershipReport(body).subscribe(
            response =>
            {
              this.messageService.add({
                severity: 'success',
                summary: 'Successful',
                detail: 'Report deleted succesfully.',
                life: 3000
              });
              this.getMyReports(this.currentUser.id);
            },
            error =>
            {
              console.log(error);
              this.messageService.add({ severity: 'error', summary: 'Error', detail: error, life: 3000 });
            });
        }
      });
  }
}
