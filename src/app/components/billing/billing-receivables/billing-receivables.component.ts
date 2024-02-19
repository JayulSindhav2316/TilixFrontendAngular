import { Component, OnInit, Input } from '@angular/core';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { AppBreadcrumbService } from '../../../app.breadcrumb.service';
import { InvoiceService } from '../../../services/invoice.service';
import { ExportExcelService } from '../../../services/export-excel.service';

@Component({
  selector: 'app-billing-receivables',
  templateUrl: './billing-receivables.component.html',
  styleUrls: ['./billing-receivables.component.scss'],
  providers: [MessageService, ConfirmationService]
})
export class BillingReceivablesComponent implements OnInit {
  showUptoThirtyDays: boolean;
  showThirtyToSixtyDays: boolean;
  showSixtyToNinetyDays: boolean;
  showNinetyDaysOrMore: boolean;

  uptoThirtyDaysList: any[];
  thirtyToSixtyDaysList: any[];
  sixtyToNinetyDaysList: any[];
  ninetyDaysOrMoreList: any[];
  allReceivablesList: any[];

  memberCountUptoThrity: any;
  balanceUptoThirty: any;

  memberCountThirtytoSixity: any;
  balanceThirtytoSixity: any;

  memberCountSixtytoNinty: any;
  balanceSixtytoNinty: any;

  memberCountNintyOrMore: any;
  balanceNintyOrMore: any;
  currentUser: any;
  
  constructor(private breadcrumbService: AppBreadcrumbService,
            private messageService: MessageService,
            private confirmationService: ConfirmationService,
            private invoiceCartService: InvoiceService,
            private excelService: ExportExcelService) { 
              this.currentUser = JSON.parse(localStorage.getItem('currentUser')); 
              console.log('Current User on Receivable :' + JSON.stringify(this.currentUser));
            }

  ngOnInit(): void {
    this.showUptoThirtyDays = true;
    this. balanceUptoThirty = 0;
    this. balanceThirtytoSixity = 0;
    this. balanceSixtytoNinty = 0;
    this. balanceNintyOrMore = 0;
    this.getAllReceivables();   
  }

  exportToExcel(exportType: number)
  {
    if(exportType === 0)
    {   
      var toDate = Date.parse(this.getDateByAddingDays(0));
      var data= this. allReceivablesList.filter(x =>Date.parse(x.dueDate) <= toDate);
      this.renderExcel(data, "All Outstanding Receivables List");
    }
    else if(exportType === 1)
    {
      this.renderExcel(this.uptoThirtyDaysList, "30 days or Less Outstanding Receivables List");
    }
    else if(exportType === 2)
    {
      this.renderExcel(this.thirtyToSixtyDaysList, "31 - 60 days Outstanding Receivables List");
    }
    else if(exportType === 3)
    {
      this.renderExcel(this.sixtyToNinetyDaysList, "61 - 90 days Outstanding Receivables List");
    }
    else if(exportType === 4)
    {
      this.renderExcel(this.ninetyDaysOrMoreList, "90 days + Outstanding Receivables List");
    }
  }

  showUptoThirtyDaysTabClicked()
  {
    this.showUptoThirtyDays = !this.showUptoThirtyDays;
    this.showThirtyToSixtyDays = false;
    this.showSixtyToNinetyDays = false;
    this.showNinetyDaysOrMore = false;
  }

  showThirtyToSixtyDaysTabClicked()
  {
    this.showUptoThirtyDays = false;
    this.showThirtyToSixtyDays = !this.showThirtyToSixtyDays;
    this.showSixtyToNinetyDays = false;
    this.showNinetyDaysOrMore = false;
  }

  showSixtyToNinetyDaysTabClicked()
  {
    this.showUptoThirtyDays = false;
    this.showThirtyToSixtyDays = false;
    this.showSixtyToNinetyDays = !this.showSixtyToNinetyDays;
    this.showNinetyDaysOrMore = false;
  }

  showNinetyDaysOrMoreTabClicked()
  {
    this.showUptoThirtyDays = false;
    this.showThirtyToSixtyDays = false;
    this.showSixtyToNinetyDays = false;
    this.showNinetyDaysOrMore = !this.showNinetyDaysOrMore;
  }

  getAllReceivables(){
    this.invoiceCartService.getAllOutstandingReceivables().subscribe((data: any) =>
    {
      console.log(data);
      this.allReceivablesList = data;

      if(this.allReceivablesList.length > 0)
      {
        for(var i=1; i<=4; i++)
        {
          if(i === 1)
          {
            var fromDate = Date.parse(this.getDateByAddingDays(-30));
            var toDate = Date.parse(this.getDateByAddingDays(0));

            this.uptoThirtyDaysList = this. allReceivablesList.filter(x => Date.parse(x.dueDate) >= fromDate && Date.parse(x.dueDate) <= toDate);
            console.log(this.uptoThirtyDaysList); 
            this.memberCountUptoThrity = this.uptoThirtyDaysList.length;
            if(this.memberCountUptoThrity >0){
              this.balanceUptoThirty =  this.uptoThirtyDaysList.map(o => o.balance).reduce((a, c) => { return a + c });
            }
          }
          else if(i === 2)
          {
            var fromDate = Date.parse(this.getDateByAddingDays(-60));
            var toDate = Date.parse(this.getDateByAddingDays(-31));

            this.thirtyToSixtyDaysList = this.allReceivablesList.filter(x => Date.parse(x.dueDate) >= fromDate && Date.parse(x.dueDate) <= toDate);
            console.log(this.thirtyToSixtyDaysList);
            this.memberCountThirtytoSixity = this.thirtyToSixtyDaysList.length;
            if(this.memberCountThirtytoSixity >0){
              this.balanceThirtytoSixity =  this.thirtyToSixtyDaysList.map(o => o.balance).reduce((a, c) => { return a + c });
            }
          }
          else if(i === 3)
          {
            var fromDate = Date.parse(this.getDateByAddingDays(-90));
            var toDate = Date.parse(this.getDateByAddingDays(-61));

            this.sixtyToNinetyDaysList = this.allReceivablesList.filter(x => Date.parse(x.dueDate) >= fromDate && Date.parse(x.dueDate) <= toDate);
            console.log(this.sixtyToNinetyDaysList);
            this.memberCountSixtytoNinty = this.sixtyToNinetyDaysList.length;
            if(this.memberCountSixtytoNinty >0){
              this.balanceSixtytoNinty =  this.sixtyToNinetyDaysList.map(o => o.balance).reduce((a, c) => { return a + c });
            }
          }
          else if(i === 4)
          {
            var fromDate = Date.parse(this.getDateByAddingDays(-999));
            var toDate = Date.parse(this.getDateByAddingDays(-91));

            this.ninetyDaysOrMoreList = this.allReceivablesList.filter(x => Date.parse(x.dueDate) >= fromDate && Date.parse(x.dueDate) <= toDate);
            console.log(this.ninetyDaysOrMoreList);
            this.memberCountNintyOrMore = this.ninetyDaysOrMoreList.length;
            if(this.memberCountNintyOrMore >0){
              this.balanceNintyOrMore =  this.ninetyDaysOrMoreList.map(o => o.balance).reduce((a, c) => { return a + c });
            }
          }
        }
      }      
    });
  }

  getDateByAddingDays(daystoAdd: number)
  { 
    var futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daystoAdd);
    return futureDate.toLocaleDateString("en-US", {timeZone: "America/New_York"}); 
  }

  renderExcel(reportData: any[], reportName: string)
  {
    console.log(reportData);
    // reportData.forEach(x => delete x.billingType);

    let dataForExcel = [];
    let headers = ['Entity ID','Member/'+this.currentUser.accountName+' ID', 'Member/'+this.currentUser.accountName+' Name', 'Billable Member', 'Invoice ID','Created Date', 'Due Date', 
      'Description', 'Total Due', 'Paid', 'Billing Type', 'Balance'];

    reportData.forEach((row: any) => {
      dataForExcel.push(Object.values(row))
    })

    let data = {
      title: reportName,
      data: reportData,
      headers: headers
    }
    this.excelService.exportReceivables(data);
  }
}
