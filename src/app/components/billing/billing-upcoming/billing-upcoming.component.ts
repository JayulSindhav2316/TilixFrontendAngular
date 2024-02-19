import { Component, OnInit, Input, Inject,LOCALE_ID } from '@angular/core';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { AppBreadcrumbService } from '../../../app.breadcrumb.service';
import { InvoiceService } from '../../../services/invoice.service';
import { AutoBillingService } from '../../../services/auto-billing.service';
import { BillingService } from '../../../services/billing.service';
import { HttpParams } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { formatDate } from '@angular/common';
import { faEdit } from '@fortawesome/free-solid-svg-icons';
import { FormBuilder, RequiredValidator } from '@angular/forms';
import { Validators } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';
@Component({
  selector: 'app-billing-upcoming',
  templateUrl: './billing-upcoming.component.html',
  styleUrls: ['./billing-upcoming.component.scss'],
  providers: [MessageService, ConfirmationService]
})
export class BillingUpcomingComponent implements OnInit {

  showManual: boolean;
  showAuto: boolean;

  manualBillingList: any[];
  autoBillingList: any[];
  autoBillingSetup: any;
  autoBillingSettingId: number;
  throughDate: string;
  effectiveDate: string;
  pauseStatus: boolean;
  autoBillingMemberCount: number;
  autoBillingRevenue: number;
  showSaveCancel: boolean;
  manualBillingMemberCount: number;
  manualBillingRevenue: number;
  prevEffectiveDate: string;
  prevThroughDate: string;
  prevPauseStatus: boolean;
  autoBillingProcessingDateId: boolean;
  faEdit = faEdit;
  cycleName: string;
  manualThroughDate: string;
  showAutoPayDialog: boolean;
  selectedAutoBillingItem: any;
  selectedInvoice:any;
  editInvoice=false;
  minDate = new Date();
  currentUser: any;

  autoPayForm = this.fb.group({
    membershipId: [0],    
    person:[''],
    reason: ['', Validators.required],
    reviewDate: ['', Validators.required]
  });
  constructor( private breadcrumbService: AppBreadcrumbService,
              private messageService: MessageService,
              private confirmationService: ConfirmationService,
              private invoiceService: InvoiceService,
              private autoBillingService: AutoBillingService,
              private billingService: BillingService,
              private datePipe: DatePipe,
              private fb: FormBuilder,
              @Inject(LOCALE_ID) private locale: string,
              private authService: AuthService,
    ) {
    this.showManual=false;
    this.showAuto=true;
    this.showSaveCancel=false;
    this.showAutoPayDialog= false;
    this.minDate = new Date();
   }

  ngOnInit(): void {
    this.autoBillingRevenue = 0;
    this.manualBillingRevenue = 0;
    this.getAutoBillingSetup();
    this.getAutoBillingCurrentDraft();
    this.getManualBillingDues();
    this.currentUser = this.authService.currentUserValue;
  }
  updateSettings() {
    this.showSaveCancel=true;
  }
  saveAutoBilling()
  {
    const body = {
      autoBillingSettingId: this.autoBillingSettingId,
      autoBillingProcessingDateId: this.autoBillingProcessingDateId,
      effectiveDate: this.effectiveDate,
      throughDate: this.throughDate,
      pauseStatus: this.pauseStatus
    }
    console.log('Updating Auto BillingSetting:' +  JSON.stringify(body));
    this.autoBillingService.updateSetting(body).subscribe(
      response => {
        this.messageService.add({ severity: 'success',
                                  summary: 'Successful',
                                  detail: 'Auto Billing settings updated succesfully.',
                                  life: 3000
                                });
        this.showSaveCancel=false;
      },
      error => {
        console.log(error);
        this.messageService.add({ severity: 'error', 
                                  summary: 'Error', 
                                  detail: error, 
                                  life: 3000 });
      });
  }
  cancelEdit(){
    this.effectiveDate = this.prevEffectiveDate;
    this.throughDate = this.prevThroughDate;
    this.pauseStatus = this.prevPauseStatus;
    this.showSaveCancel=false;
  }
  autoTabClicked(){
    if( this.showAuto){
      this.showAuto=false;
  
    } else {
      this.showAuto=true;

    }
    
  }
  manualTabClicked(){
    if( this.showManual){
      this.showManual=false;
    } else {
      this.showManual=true;
    }
  }

  getAutoBillingCurrentDraft(){
    this.autoBillingService.getAutobillingCurrentDraft().subscribe((data: any) =>
    {
      console.log(data);
      this.autoBillingList = data
      this.autoBillingMemberCount = this.autoBillingList.length;
      this.autoBillingRevenue =  this.autoBillingList.map(o => o.amount).reduce((a, c) => { return a + c });
    } );

}

  getManualBillingDues(){
    this.billingService.getPreliminaryPaperInvoices().subscribe((data: any) =>
    {
      console.log(data);
      this.manualBillingList = data
      this.manualBillingMemberCount = this.manualBillingList.length;
      this.manualBillingRevenue =  this.manualBillingList.map(o => o.amount).reduce((a, c) => { return a + c });
      if(data.length >0 ){
        this.showManual =true;
      }
    } );
    
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
      this.pauseStatus =  this.autoBillingSetup.autoBillingStatus==1? true: false;
      this.autoBillingProcessingDateId =  this.autoBillingSetup.autoBillingProcessingDateId;
      this.autoBillingSettingId = this.autoBillingSetup.autoBillingSettingId;
      this.prevEffectiveDate = this.effectiveDate ;
      this.prevThroughDate = this.throughDate;
      this.prevPauseStatus = this.pauseStatus;
    });
  }
  editPersonAutoPay(item: any){
    console.log('Auto billing on Hold:' + JSON.stringify(item));
    this.selectedAutoBillingItem = item;
    this.showAutoPayDialog= true;
    this.autoPayForm.get('person').setValue(this.selectedAutoBillingItem.name);
    this.autoPayForm.get('membershipId').setValue(this.selectedAutoBillingItem.membershipId);
  }
  stopAutoPay(){
    let body = {
      MembershipId:this.selectedAutoBillingItem.membershipId,
      Reason:this.autoPayForm.get('reason').value,
      ReviewDate:this.autoPayForm.get('reviewDate').value,
      UserId:this.currentUser.id
    }
    console.log('Form data:'+JSON.stringify(body));
    this.autoBillingService.setAutoPayOnHold(body).subscribe((data: any) =>{
      console.log(data);
      if(data) {
        this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Auto Pay updated succesfully.', life: 3000 });
        this.showAutoPayDialog=false; 
      }
      else {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to update auto billing pay on hold.', life: 3000 });
      }     
    });
  }
  
  cancelAutoPay(){
    this.showAutoPayDialog= false;
  }
  editPersonPaperInvoice(item)
  {
  this.selectedInvoice=item;
  this.editInvoice=true;
  }
  
  closeEditInvoice(){
    this.editInvoice = false;
  }
}
