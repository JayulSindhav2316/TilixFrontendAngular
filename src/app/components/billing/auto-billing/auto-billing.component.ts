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

@Component({
  selector: 'app-auto-billing',
  templateUrl: './auto-billing.component.html',
  styleUrls: ['./auto-billing.component.scss'],
  providers: [MessageService, ConfirmationService]
})
export class AutoBillingComponent implements OnInit {
  autoBillingEnabled: boolean;
  autoBillingRunStatus: boolean;
  autoEnbledText: string;
  autoRunText: string;
  autoBillingList: any[];
  autoBillingSetup: any;
  autoBillingSettingId: number;
  throughDate: string;
  effectiveDate: string;
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

  constructor(  private billingService: BillingService,
    private breadcrumbService: AppBreadcrumbService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private autoBillingService: AutoBillingService,
    private formBuilder: FormBuilder,
    @Inject(LOCALE_ID) private locale: string) {
      this.breadcrumbService.setItems([
        { label: 'Home' },
        { label: 'Billing' },
        { label: 'Recurring Billing' }
      ])
     }

  ngOnInit(): void {
    this.showControls=false;
    this.getAutoBillingSetup();
    this.getAutoBillingDocuments();
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

      //Update Status
      if(this.autoBillingRunStatus){
        this.autoRunText = "Running";
        this.autoBillingRunStatus= true;
      }
      else {
        this.autoRunText = "Paused";
        this.autoBillingRunStatus= false;
      }
      if(this.autoBillingEnabled){
        this.autoEnbledText = "Enabled";
        this.autoBillingEnabled=true;
      }
      else {
        this.autoEnbledText = "Disabled";
        this.autoBillingEnabled= false;
      }
      
    });
  }
  getAutoBillingDocuments(){
    this.autoBillingService.getAutoBillingDocuments().subscribe((data: any) =>
    {
      console.log(data);
      this.billingDocuments = data
    } );
  }
  handleEnableChange(event){
    this.autoBillingEnabled = event.checked;
    if(event.checked){
      this.autoEnbledText = "Enabled"
    } else {
      this.autoEnbledText = "Disabled"
    }
    this.showControls=true;
  }

  handlePauseChange(event){
    this.autoBillingRunStatus = event.checked;
    if(event.checked){
      this.autoRunText = "Running"
    } else {
      this.autoRunText = "Paused"
    }
    this.showControls=true;
  }

  settingChanged()
  {
    this.showControls=true;
  }
  updateSettings(){
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
        this.showControls=false;
        this.getAutoBillingSetup();
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
    this.autoBillingRunStatus =  this.autoBillingSetup.autoBillingStatus===1? true: false;
    this.autoBillingEnabled =  this.autoBillingSetup.autoBillingEnabled===1? true: false;

    //Update Status
    if(this.autoBillingRunStatus){
      this.autoRunText = "Running";
      this.autoBillingRunStatus= true;
    }
    else {
      this.autoRunText = "Paused";
      this.autoBillingRunStatus= false;
    }
    if(this.autoBillingEnabled){
      this.autoEnbledText = "Enabled";
      this.autoBillingEnabled=true;
    }
    else {
      this.autoEnbledText = "Disabled";
      this.autoBillingEnabled= false;
    }
    this.showControls=false;
  }

  showDetails(item: any){
    console.log('Fetching details for:'+ JSON.stringify(item));
    let searchParams = new HttpParams();
    searchParams = searchParams.append('billingDocumentId', item.billingDocumentId.toString());
    const opts = {params: searchParams};
    console.log('Geting data for Document:' +  JSON.stringify(opts));
    this.autoBillingService.getAutobillingDraftByDocumentId(opts).subscribe((data: any) =>
    {
      console.log(data);
      this.billingDraft = data
      this.draftMemberCount = this.billingDraft.length;
      this.draftRevenue =  this.billingDraft.map(o => o.amount).reduce((a, c) => { return a + c });
      this.showDetail=true;
      this.showMain=false;
    } );
    
  }
  regenrateDraft(item: any){
    this.confirmationService.confirm({
    message: 'Are you sure that you want to regenerate the billing?',
    accept: () => {
        console.log('Regenrating draft for:'+ JSON.stringify(item));
        let searchParams = new HttpParams();
        searchParams = searchParams.append('billingDocumentId', item.billingDocumentId.toString());
        const opts = {params: searchParams};
        console.log('Geting data for Document:' +  JSON.stringify(opts));
        this.autoBillingService.regenrateAutobillingDraft(opts).subscribe((data: any) =>
        {
          this.messageService.add({ severity: 'success',
                                    summary: 'Successful',
                                    detail: 'Auto Billing job has been scheduled again.',
                                    life: 3000
                                  });
          this.showControls=false;
          this.getAutoBillingSetup();
        },
        error => {
          console.log(error);
          this.messageService.add({ severity: 'error', 
                                    summary: 'Error', 
                                    detail: error, 
                                    life: 3000 });
        });
      }
    });
  }

  goBack(){
    this.showDetail=false;
      this.showMain=true;
  }
 
}
