import { Component, OnInit, Inject, LOCALE_ID, ViewChild } from '@angular/core';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { FormBuilder, Validators, FormGroup, FormControl } from "@angular/forms";
import { AppBreadcrumbService } from 'src/app/app.breadcrumb.service';
import { GLChartOfAccountService } from 'src/app/services/glchart-of-account.service';
import { ReceiptService } from 'src/app/services/receipt.service';
import { HttpParams } from '@angular/common/http';
import { formatDate } from '@angular/common';
import { ExportExcelService } from '../../../services/export-excel.service';
import { PdfService } from '../../../services/pdf.service';
import { element } from 'protractor';
import { environment } from 'src/environments/environment';
import { TelerikReportViewerComponent } from '@progress/telerik-angular-report-viewer';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-credit-card',
  templateUrl: './credit-card.component.html',
  styleUrls: ['./credit-card.component.scss'],
  providers: [MessageService, ConfirmationService]
})
export class CreditCardComponent implements OnInit {
  searchList: any[];
  creditCardReport: any[];
  selectedSearch: { name: string; code: string };
  selectedCreditCard: { name: string; code: string };
  searchByDayForm: FormGroup;
  searchByMonthForm: FormGroup;
  searchByDateRangeForm: FormGroup;
  minDate: Date;
  maxDate: Date;
  cardTypeList: any[];
  showLoader: boolean;
  showTable: boolean;
  showReport: boolean;
  fromDate: any;
  toDate: any;
  totalApproved: number;
  totalDeclined: number;
  reportApiUrl: string = `${environment.reportApiUrl}/api/reports`;
  maxApiUrl: string = `${environment.baseApiUrl}/Receipt/GetCreditCardReport`;
  viewerContainerStyle = {
    position: 'relative',
    height: '80vh',
    ['font-family']: 'ms sans serif'
  };
  @ViewChild('glReportViewer') glReportViewer: TelerikReportViewerComponent;

  showExport: boolean;
  constructor(private fb: FormBuilder,
    private breadcrumbService: AppBreadcrumbService,
    private glChartOfAccountService: GLChartOfAccountService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private receiptService: ReceiptService,
    private excelService: ExportExcelService,
    private pdfService: PdfService,
    private authService: AuthService,
    @Inject(LOCALE_ID) private locale: string) {

    this.breadcrumbService.setItems([
      { label: 'Home' },
      { label: 'Reports' },
      { label: 'credit Card / ACH' }
    ])

    this.searchList = [
      { name: "Day", code: "Day" },
      { name: "Month", code: "Month" },
      { name: "Date Range", code: "Date Range" },
    ];
    this.cardTypeList = [
      { name: "---- All ----", code: "All" },
      { name: "VISA", code: "Visa" },
      { name: "Master", code: "MasterCard" },
      { name: "AMEX", code: "AmericanExpress" },
      { name: "Discover", code: "Discover" },
      { name: "Diners Club", code: "DinersClub" },
      { name: "JCB", code: "JCB" },
      { name: "eCheck", code: "eCheck" }
    ];

    this.showLoader = false;
    this.showTable = false;
    this.showReport=false;
    this.showExport = true;
  }

  ngOnInit(): void {
    this.selectedSearch = { name: "Day", code: "Day" };
    this.selectedCreditCard = { name: "---- ALL ----", code: "All" };
    this.searchByDayForm = this.fb.group({ Day: ["", [Validators.required]] });
    this.searchByMonthForm = this.fb.group({ Month: ["", [Validators.required]] });
    this.searchByDateRangeForm = this.fb.group({ FromDate: ["", Validators.required], ToDate: ["", Validators.required] });

    let today = new Date();
    let month = today.getMonth();
    let year = today.getFullYear();
    let prevMonth = (month === 0) ? 11 : month - 1;
    let prevYear = (prevMonth === 11) ? year - 1 : year;
    let nextMonth = (month === 11) ? 0 : month + 1;
    let nextYear = (nextMonth === 0) ? year + 1 : year;
    let dateString = '2000-01-01T00:00:00'
    this.minDate = new Date(dateString);
    this.minDate.setMonth(1);
    this.minDate.setFullYear(2000);
    this.maxDate = new Date();
    this.maxDate.setMonth(month);
    this.maxDate.setFullYear(year);

    let monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

    this.searchByDayForm.get('Day').setValue(today);
    this.searchByMonthForm.get('Month').setValue(today);
    this.searchByDateRangeForm.get('FromDate').setValue(monthStart);
    this.searchByDateRangeForm.get('ToDate').setValue(today);
  }
  getCreditCard(isNewReport: boolean) {
    let validSearch = false;
    this.showTable = isNewReport?false:true
    this.showReport =  isNewReport?true:false;
    if (this.selectedSearch.name === "Day") {
      if (this.searchByDayForm.valid) {
        this.fromDate = this.searchByDayForm.get("Day").value;
        this.toDate = this.searchByDayForm.get("Day").value;
        validSearch = true;
      }
      else {
        this.messageService.add({
          severity: "info",
          summary: "No Date",
          detail: "Please select Date.",
          life: 3000,
        });
      }
    }
    if (this.selectedSearch.name === "Month") {
      if (this.searchByMonthForm.valid) {
        this.fromDate = this.searchByMonthForm.get("Month").value;
        this.toDate = this.searchByMonthForm.get("Month").value;
        console.log('Selected Month:', JSON.stringify(this.fromDate) + '-' + JSON.stringify(this.toDate));
        validSearch = true;
      }
      else {
        this.messageService.add({
          severity: "info",
          summary: "No Month",
          detail: "Please select Month.",
          life: 3000,
        });
      }
    }
    if (this.selectedSearch.name === "Date Range") {
      if (this.searchByDateRangeForm.valid) {
        this.fromDate = this.searchByDateRangeForm.get("FromDate").value;
        this.toDate = this.searchByDateRangeForm.get("ToDate").value;
        validSearch = true;
      }
      else {
        this.messageService.add({
          severity: "info",
          summary: "No Range",
          detail: "Please select From & To Date.",
          life: 3000,
        });
      }
    }
    if (validSearch) {
      if (this.showTable) {
        this.showLoader = true;
        console.log('Search CardTypeGL :' + JSON.stringify(this.selectedCreditCard));
        let searchParams = new HttpParams();
        let fromDate = this.searchByDayForm.get("Day").value;
        searchParams = searchParams.append("cardType", this.selectedCreditCard.code);
        searchParams = searchParams.append("searchBy", this.selectedSearch.name);
        searchParams = searchParams.append("fromDate", formatDate(new Date(this.fromDate), "MM/dd/yyyy", this.locale));
        searchParams = searchParams.append("toDate", formatDate(new Date(this.toDate), "MM/dd/yyyy", this.locale));
        const opts = { params: searchParams };
        console.log('Search :' + JSON.stringify(opts));
        this.getCreditCardReport(opts);
      }
      if (this.showReport)
      {
        var rs = {
          report: 'CreditCardReport.trdx',
          parameters: {
            Url: this.maxApiUrl,
            token: this.authService.currentUserValue.token,
            tenantid: this.authService.currentUserValue.tenantId,
            cardType: this.selectedCreditCard.code,
            searchBy: this.selectedSearch.name,
            fromDate: formatDate(new Date(this.fromDate), "MM/dd/yyyy", this.locale),
            toDate: formatDate(new Date(this.toDate), "MM/dd/yyyy", this.locale)
          }
        }
        this.glReportViewer?.setReportSource(rs);
      }
    }
  }


  getCreditCardReport(params) {

    this.receiptService.getCreditCardReport(params).subscribe((data: any[]) => {
      console.log(data);
      this.creditCardReport = data;
      this.showTable = true;
      this.showLoader = false;
      if (data.length > 0) {
        this.updateTotals();
        this.showExport = false; //UI check for diabled so false -> buttons enabled
      }
      else {
        this.totalApproved = 0;
        this.totalDeclined = 0
      }
    });

  }

  updateTotals() {
    this.totalApproved = 0;
    this.totalDeclined = 0
    this.creditCardReport.forEach(element => {
      if (element.paymentStatus == "Approved") {
        this.totalApproved += parseFloat(element.amount);
      }
      else {
        this.totalDeclined += parseFloat(element.amount);
      }

    });
  }

  exportExcel() {
    console.log(this.creditCardReport);
    // reportData.forEach(x => delete x.billingType);

    let dataForExcel = [];
    let headers = ['Receipt No.', 'Date', 'Name', 'Card Number', 'Type', 'Status', 'Auth Code', 'Type', 'Amount'];

    this.creditCardReport.forEach((row: any) => {
      dataForExcel.push(Object.values(row))
    })
    let data = {
      title: "Credit Card Report",
      data: dataForExcel,
      headers: headers,
      totalApprove:this.totalApproved,
      totalDecline:this.totalDeclined
    }
    this.excelService.exporCreditCardReport(data, this.fromDate, this.toDate, this.selectedSearch.name);
  }
  exportPdf() {
    this.pdfService.exportCreditCardReport(this.creditCardReport, this.fromDate, this.toDate, this.selectedSearch.name);
  }
}
