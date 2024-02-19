import { Component, OnInit, Input, Inject,LOCALE_ID } from '@angular/core';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { AppBreadcrumbService } from '../../../app.breadcrumb.service';
import { InvoiceService } from '../../../services/invoice.service';
import { AutoBillingService } from '../../../services/auto-billing.service';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { BillingService } from '../../../services/billing.service';
import { formatDate } from '@angular/common';
import { faEdit } from '@fortawesome/free-solid-svg-icons';
import { HttpParams } from '@angular/common/http';
import * as moment from 'moment';


@Component({
  selector: 'app-recurring-billing-setup',
  templateUrl: './recurring-billing-setup.component.html',
  styleUrls: ['./recurring-billing-setup.component.scss'],
  providers: [MessageService, ConfirmationService]
})
export class RecurringBillingSetupComponent implements OnInit {
  autoBillingEnabled: boolean;
  autoBillingRunStatus: boolean;
  autoEnbledText: string;
  autoRunText: string;
  autoBillingSetup: any;
  autoBillingSettingId: number;
  throughDate: any;
  effectiveDate: any;
  pauseStatus: boolean;
  autoBillingProcessingDateId: boolean;
  faEdit = faEdit;
  showControls: boolean;
  showMain: boolean;
  showDetail: boolean;
  billingDocuments: any;
  billingDraft: any;
  draftMemberCount: any;
  draftRevenue: any;
  maxDateValue: any;
  minDateValue: any;
  emails: string[];
  smsNumbers: string[];
  minDate: Date;
  maxDate: Date;
  showLoader: boolean;
  constructor(  private billingService: BillingService,
    private breadcrumbService: AppBreadcrumbService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private autoBillingService: AutoBillingService,
    private formBuilder: FormBuilder,
    @Inject(LOCALE_ID) private locale: string) { 
      let today = new Date();
      let month = today.getMonth();
      let year = today.getFullYear();
      let prevMonth = (month === 0) ? 11 : month -1;
      let prevYear = (prevMonth === 11) ? year - 1 : year;
      let nextMonth = (month === 11) ? 0 : month + 1;
      let nextYear = (nextMonth === 0) ? year + 1 : year;
      this.minDate = new Date();
      this.minDate.setMonth(prevMonth);
      this.minDate.setFullYear(year);
      this.maxDate = new Date();
      this.maxDate.setMonth(month);
      this.maxDate.setFullYear(year);
      this.showLoader=true;
      this.breadcrumbService.setItems([
        { label: 'Home', routerLink: ['/']},
        { label: 'Setup'},
        { label: 'Recurring Billing'}
      ]);
      
    }

  ngOnInit(): void {
    this.showControls=false;
    this.getAutoBillingSetup();
    this.showMain=true;
    this.showDetail=false;
  }

  getAutoBillingSetup(){
   
    this.autoBillingService.getAutoBillingSetup().subscribe((data: any) =>
    {
      console.log(data);
      this.autoBillingSetup = data;
      console.log(this.autoBillingSetup.throughDate);
      console.log(this.autoBillingSetup.effectiveDate);
      this.throughDate =  formatDate(new Date(this.autoBillingSetup.throughDate),"MM/dd/yyyy",this.locale);
      this.effectiveDate = formatDate(new Date(this.autoBillingSetup.effectiveDate),"MM/dd/yyyy",this.locale);
      this.autoBillingRunStatus =  this.autoBillingSetup.autoBillingStatus;
      this.autoBillingProcessingDateId =  this.autoBillingSetup.autoBillingProcessingDateId;
      this.autoBillingSettingId = this.autoBillingSetup.autoBillingSettingId;
      this.autoBillingEnabled =  this.autoBillingSetup.autoBillingEnabled;
      this.emails =this.autoBillingSetup.notificationEmails;
      this.smsNumbers =this.autoBillingSetup.notificationSMSNumbers;
      this.showLoader=false;    
    });
  }
  updateSettings(){
    this.showLoader=true;    
    const body = {
      autoBillingSettingId: this.autoBillingSettingId,
      autoBillingProcessingDateId: this.autoBillingProcessingDateId,
      effectiveDate: moment(this.effectiveDate).utc(true).format(),
      throughDate: moment(this.throughDate).utc(true).format(),
      autoBillingStatus: this.autoBillingRunStatus,
      autoBillingEnabled: this.autoBillingEnabled,
      notificationEmails: this.emails,
      notificationSMSNumbers: this.smsNumbers
    }
    console.log('Updating Auto BillingSetting:' +  JSON.stringify(body));
    this.autoBillingService.updateSetting(body).subscribe(
      response => {
        this.messageService.add({ severity: 'success',
                                  summary: 'Successful',
                                  detail: 'Auto Billing settings updated succesfully.',
                                  life: 3000
                                });
        this.showControls=false;
        this.getAutoBillingSetup();
        this.showLoader=false;    
      },
      error => {
        console.log(error);
        this.messageService.add({ severity: 'error', 
                                  summary: 'Error', 
                                  detail: error, 
                                  life: 3000 });
      });
    
  }
  cancelChanges(){

    this.throughDate =  formatDate(new Date(this.autoBillingSetup.throughDate),"MM/dd/yyyy",this.locale);
    this.effectiveDate = formatDate(new Date(this.autoBillingSetup.effectiveDate),"MM/dd/yyyy",this.locale);
    this.autoBillingRunStatus =  this.autoBillingSetup.autoBillingStatus;
    this.autoBillingEnabled =  this.autoBillingSetup.autoBillingEnabled;

   }
}
