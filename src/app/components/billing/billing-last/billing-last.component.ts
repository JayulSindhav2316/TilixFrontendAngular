import { Component, OnInit, Input } from '@angular/core';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { AutoBillingService } from 'src/app/services/auto-billing.service';
import { BillingService } from 'src/app/services/billing.service';
import { AppBreadcrumbService } from '../../../app.breadcrumb.service';
import { InvoiceService } from '../../../services/invoice.service';

@Component({
  selector: 'app-billing-last',
  templateUrl: './billing-last.component.html',
  styleUrls: ['./billing-last.component.scss'],
  providers: [MessageService, ConfirmationService]
})
export class BillingLastComponent implements OnInit {
  processedDate: any;
  showManual: boolean;
  showAuto: boolean;
  autoBillingprocessedDate: any;
  autoBillingMemberCount: any;
  autoBillingRevenue: any;
  manualBillingprocessedDate: any;
  manualBillingMemberCount: any;
  manualBillingRevenue: any;
  lastManualBillingList: any[];
  lastAutoBillingList: any[];

  constructor(private breadcrumbService: AppBreadcrumbService,
              private messageService: MessageService,
              private confirmationService: ConfirmationService,
              private invoiceCartService: InvoiceService,
              private autoBillingService: AutoBillingService,
              private billingService: BillingService) { }

  ngOnInit(): void {
  this.autoBillingRevenue =0 ;
  this.manualBillingRevenue =0 ;
  this.getLastAutoBillingDrafts();
  this.getLastManualBillingDrafts();
  this.showAuto=true;
  }

  autoTabClicked(){
    if( this.showAuto){
      this.showAuto=false;
      this.showManual=true;
    } else {
      this.showAuto=true;
      this.showManual=false;
    }
    
  }
  manualTabClicked(){
    if( this.showManual){
      this.showAuto=true;
      this.showManual=false;
    } else {
      this.showAuto=false;
      this.showManual=true;
    }
  }
  getLastAutoBillingDrafts(){
    this.autoBillingService.getAutobillingDraftByDocumentId(0).subscribe((data: any) =>
    {
      console.log(data);
      this.lastAutoBillingList = data; 
      this.autoBillingMemberCount = this.lastAutoBillingList.length;
     
      if(this.lastAutoBillingList.length>0){
        this.autoBillingprocessedDate = this.lastAutoBillingList[0].createDate;
        this.autoBillingRevenue =  this.lastAutoBillingList.map(o => o.amount).reduce((a, c) => { return a + c });
      }

    });
  }

  getLastManualBillingDrafts(){
    this.billingService.getLastManualBillingDrafts(0).subscribe((data: any) =>
    {
      console.log(data);
      this.lastManualBillingList= data;
      this.manualBillingMemberCount = this.lastManualBillingList.length;
      if(this.lastManualBillingList.length>0){
        this.manualBillingprocessedDate = this.lastManualBillingList[0].createDate;4
        this.manualBillingRevenue =  this.lastManualBillingList.map(o => o.amount).reduce((a, c) => { return a + c });
      }
    });
  }

}
