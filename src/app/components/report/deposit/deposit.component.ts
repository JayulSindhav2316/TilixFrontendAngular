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
import { AuthService } from 'src/app/services/auth.service';
import { TelerikReportViewerComponent } from '@progress/telerik-angular-report-viewer';

@Component({
  selector: 'app-deposit-card',
  templateUrl: './deposit.component.html',
  styleUrls: ['./deposit.component.scss'],
  providers: [MessageService, ConfirmationService]
})
export class DepositComponent implements OnInit {
  searchList: any[];
  portalList: any[];
  depositReport: any[];
  selectedSearch: { name: string; code: string };
  selectedPayment: { name: string; code: string };
  selectedPortal: { name: string; code: string };
  searchByDayForm: FormGroup;
  searchByMonthForm: FormGroup;
  searchByDateRangeForm: FormGroup;
  minDate: Date;
  maxDate: Date;
  paymentTypeList: any[];
  showLoader: boolean;
  showTable: boolean;
  showReport: boolean;
  fromDate: any;
  toDate: any;
  totalCash: number;
  totalCheck: number;
  totaleCheck: number;
  totalCreditCard: number;
  totalOffline: number;
  showExport: boolean;
  summaryReport: boolean;
  reportApiUrl: string = `${environment.reportApiUrl}/api/reports`;
  maxApiUrl: string = `${environment.baseApiUrl}/Receipt/getDepositReport`;
  @ViewChild('depositReportViewer') glReportViewer: TelerikReportViewerComponent;
  viewerContainerStyle = {
    position: 'relative',
    height: '80vh',
    ['font-family']: 'ms sans serif'
  };

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
      { label: 'Depsoit' }
    ])

    this.searchList = [
      { name: "Day", code: "Day" },
      { name: "Month", code: "Month" },
      { name: "Date Range", code: "Date Range" },
    ];
    this.portalList = [
      { name: "---All---", code: "All" },
      { name: "Staff", code: "Staff" },
      { name: "Member", code: "Member" },
    ];

    this.paymentTypeList = [
      { name: "---- All ----", code: "All" },
      { name: "Cash", code: "Cash" },
      { name: "Check", code: "Check" },
      { name: "CreditCard", code: "CreditCard" },
      { name: "eCheck", code: "eCheck" },
      { name: "Off Line", code: "Off Line" }
    ];

    this.showLoader = false;
    this.showTable = false;
    this.showReport = false;
    this.showExport = true;
  }

  ngOnInit(): void {
    this.selectedSearch = { name: "Day", code: "Day" };
    this.selectedPayment = { name: "---- ALL ----", code: "All" };
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
    this.summaryReport = true;
  }
  getDeposit(isNewReport: boolean) {
    let validSearch = false;
    this.showTable = isNewReport ? false : true
    this.showReport = isNewReport ? true : false;
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
      this.showLoader = true;
      let summary = 1;
      if (!this.summaryReport) {
        summary = 0;
      }
      if (this.showTable) {
        console.log('Search Payment Type :' + JSON.stringify(this.selectedPayment));
        let searchParams = new HttpParams();
        let fromDate = this.searchByDayForm.get("Day").value;
        searchParams = searchParams.append("paymentType", this.selectedPayment.code);
        searchParams = searchParams.append("searchBy", this.selectedSearch.name);
        searchParams = searchParams.append("fromDate", formatDate(new Date(this.fromDate), "MM/dd/yyyy", this.locale));
        searchParams = searchParams.append("toDate", formatDate(new Date(this.toDate), "MM/dd/yyyy", this.locale));
        searchParams = searchParams.append("summary", summary);
        searchParams = searchParams.append("portal", this.selectedPortal.code);
        const opts = { params: searchParams };
        console.log('Search :' + JSON.stringify(opts));
        this.getDepositReport(opts);
      }
      if(this.showReport)
      {
        var rs = {
          report: 'DepositReport.trdx',
          parameters: {
            Url: this.maxApiUrl,
            token: this.authService.currentUserValue.token,
            tenantid: this.authService.currentUserValue.tenantId,
            paymentType: this.selectedPayment.code,
            searchBy: this.selectedSearch.name,
            fromDate: formatDate(new Date(this.fromDate), "MM/dd/yyyy", this.locale),
            toDate: formatDate(new Date(this.toDate), "MM/dd/yyyy", this.locale),
            summary:this.summaryReport?1:0,
            portal:this.selectedPortal.code
          }
        }
        this.glReportViewer?.setReportSource(rs);
      }

    }
  }

  getDepositReport(params) {

    this.receiptService.getDepositReport(params).subscribe((data: any[]) => {
      console.log(data);
      this.depositReport = data;
      if (data.length > 0) {
        this.showTable = true;
        this.showLoader = false;
        this.showExport = false; //UI check for diabled so false -> buttons enabled
      }
      this.updateTotals();
    });
  }

  updateTotals() {
    this.totalCash = 0;
    this.totalCheck = 0;
    this.totaleCheck = 0
    this.totalCreditCard = 0
    this.totalOffline = 0;
    if (!this.summaryReport) {
      this.depositReport.forEach(element => {
        if (element.paymentMode == "Cash") {
          this.totalCash += parseFloat(element.amount);
        }
        if (element.paymentMode == "Check") {
          this.totalCheck += parseFloat(element.amount);
        }
        if (element.paymentMode == "eCheck") {
          this.totaleCheck += parseFloat(element.amount);
        }
        if (element.paymentMode == "CreditCard") {
          this.totalCreditCard += parseFloat(element.amount);
        }
        if (element.paymentMode == "Off Line") {
          this.totalOffline += parseFloat(element.amount);
        }

      });
    }
    else {
      this.depositReport.forEach(element => {
        this.totalCash += parseFloat(element.totalCash);
        this.totalCheck += parseFloat(element.totalCheck);
        this.totaleCheck += parseFloat(element.totalECheck);
        this.totalCreditCard += parseFloat(element.totalCreditCard);
        this.totalOffline += parseFloat(element.totalOffline);
      });
    }

  }
  calculatePaymentTotal(paymentMode) {
    let total = 0;
    if (this.depositReport) {
      for (let payment of this.depositReport) {
        if (payment.paymentMode === paymentMode) {
          total += parseFloat(payment.amount);
        }
      }
    }

    return total;

  }

  exportExcel() {
    console.log(this.depositReport);
    if (this.summaryReport) {
      let dataForExcel = [];
      let headers = ['Date', 'Cash', 'Check', 'eCheck', 'Credit Card', 'Off Line'];

      this.depositReport.forEach((row: any) => {
        var rowValue = [];
        rowValue[0] = row.transactionDate;
        rowValue[1] = row.totalCash;
        rowValue[2] = row.totalCheck;
        rowValue[3] = row.totalECheck;
        rowValue[4] = row.totalCreditCard;
        rowValue[5] = row.totalOffline;
        dataForExcel.push(Object.values(rowValue))
      })

      let data = {
        title: "Deposit Report",
        data: dataForExcel,
        headers: headers
      }
      this.excelService.exporDepositReport(data, this.fromDate, this.toDate, this.selectedSearch.name);
    }
    else {
      let dataForExcel = [];
      let headers = ['Receipt#', 'Date', 'Name', 'Payment Type', 'Transaction Ref', 'Portal', 'Amount'];

      this.depositReport.forEach((row: any) => {
        var rowValue = [];
        rowValue[0] = row.receiptId;
        rowValue[1] = row.transactionDate;
        rowValue[2] = row.billableName;
        rowValue[3] = row.paymentMode;
        rowValue[4] = row.transactionReference;
        rowValue[5] = row.portal;
        rowValue[6] = row.amount;
        dataForExcel.push(Object.values(rowValue))
      })

      let data = {
        title: "Deposit Report",
        data: dataForExcel,
        headers: headers
      }
      this.excelService.exporDepositDetailedReport(data, this.fromDate, this.toDate, this.selectedSearch.name);
    }
  }
  exportPdf() {
    if (this.summaryReport) {
      this.pdfService.exportDepositReport(this.depositReport, this.fromDate, this.toDate, this.selectedSearch.name);
    }
    else {
      this.pdfService.exportDepositDetailedReport(this.depositReport, this.fromDate, this.toDate, this.selectedSearch.name);
    }

  }
  searchSelectChanged(isNewReport: boolean) {
    //this.showTable = false;
    //this.getDeposit(isNewReport);
  }
  summaryChanged(event) {
    //this.showTable = false;
    //this.getDeposit(isNewReport);
  }
  portalChanged(event) {
    console.log('Portal changed:' + JSON.stringify(event));
    if (event.code === 'All') {
      this.paymentTypeList = [
        { name: "---- All ----", code: "All" },
        { name: "Cash", code: "Cash" },
        { name: "Check", code: "Check" },
        { name: "CreditCard", code: "CreditCard" },
        { name: "eCheck", code: "eCheck" },
        { name: "Off Line", code: "Off Line" }
      ];
    }
    if (event.code === 'Staff') {
      this.paymentTypeList = [
        { name: "---- All ----", code: "All" },
        { name: "Cash", code: "Cash" },
        { name: "Check", code: "Check" },
        { name: "CreditCard", code: "CreditCard" },
        { name: "eCheck", code: "eCheck" },
        { name: "Off Line", code: "Off Line" }
      ];
    }
    if (event.code === 'Member') {
      this.paymentTypeList = [
        { name: "---- All ----", code: "All" },
        { name: "CreditCard", code: "CreditCard" },
        { name: "eCheck", code: "eCheck" }
      ];
    }
  }
}
