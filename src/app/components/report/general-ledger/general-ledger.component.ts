import { Component, OnInit, Inject, LOCALE_ID, ViewChild } from '@angular/core';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { FormBuilder, Validators, FormGroup, FormControl } from "@angular/forms";
import { AppBreadcrumbService } from 'src/app/app.breadcrumb.service';
import { GLChartOfAccountService } from 'src/app/services/glchart-of-account.service';
import { GeneralLedgerService } from 'src/app/services/general-ledger.service';
import { HttpParams } from '@angular/common/http';
import { formatDate } from '@angular/common';
import { ExportExcelService } from '../../../services/export-excel.service';
import { PdfService } from '../../../services/pdf.service';
import * as fs from 'file-saver';
import { QuickbooksService } from 'src/app/services/quickbooks.service';
import { TelerikReportViewerComponent } from '@progress/telerik-angular-report-viewer';
import { environment } from 'src/environments/environment';
import { AuthService } from 'src/app/services/auth.service';
@Component({
  selector: 'app-general-ledger',
  templateUrl: './general-ledger.component.html',
  styleUrls: ['./general-ledger.component.scss'],
  providers: [MessageService, ConfirmationService]
})
export class GeneralLedgerComponent implements OnInit {

  searchList: any[];
  generalLedger: any[];
  selectedSearch: { name: string; code: string };
  selectedGL: { name: string; code: string };
  searchByDayForm: FormGroup;
  searchByMonthForm: FormGroup;
  searchByDateRangeForm: FormGroup;
  minDate: Date;
  maxDate: Date;
  glAccountList: any[];
  showLoader: boolean;
  showTable: boolean;
  showReport: boolean;
  fromDate: any;
  toDate: any;
  showExport: boolean;
  totalReceipt: number;
  monthStart: Date;
  monthEnd: Date;
  toReportDate: string;
  fromReportDate: string;
  reportApiUrl: string = `${environment.reportApiUrl}/api/reports`;
  maxApiUrl: string = `${environment.baseApiUrl}/GeneralLedger/GetGeneralLedger`;
  viewerContainerStyle = {
    position: 'relative',
    height: '80vh',
    ['font-family']: 'ms sans serif'
  };
  @ViewChild('glReportViewer') glReportViewer: TelerikReportViewerComponent;

  constructor(private fb: FormBuilder,
    private breadcrumbService: AppBreadcrumbService,
    private glChartOfAccountService: GLChartOfAccountService,
    private messageService: MessageService,
    private authService: AuthService,
    private generalLedgerService: GeneralLedgerService,
    private excelService: ExportExcelService,
    private pdfService: PdfService,
    private quickBookService: QuickbooksService,
    @Inject(LOCALE_ID) private locale: string) {

    this.breadcrumbService.setItems([
      { label: 'Home' },
      { label: 'Reports' },
      { label: 'General Ledger' }
    ])

    this.searchList = [
      { name: "Day", code: "Day" },
      { name: "Month", code: "Month" },
      { name: "Date Range", code: "Date Range" },
    ];
    this.showLoader = false;
    this.showTable = false;
    this.showReport = false;
    this.showExport = true;
  }

  ngOnInit(): void {
    this.selectedSearch = { name: "Day", code: "Day" };
    this.selectedGL = { name: "---- ALL ----", code: "All" };
    this.getGlAccountList();
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

    this.monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    this.monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    this.searchByDayForm.get('Day').setValue(today);
    this.searchByMonthForm.get('Month').setValue(today);
    this.searchByDateRangeForm.get('FromDate').setValue(this.monthStart);
    this.searchByDateRangeForm.get('ToDate').setValue(today);
  }
  searchSelectChanged(event: any) {

  }

  getGeneralLedger(isNewReport: boolean) {
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
          summary: "No Month",
          detail: "Please select From & To Date.",
          life: 3000,
        });
      }
    }
    if (validSearch) {
      if (this.showTable) {
        this.showLoader = true;
        console.log('Search GL :' + JSON.stringify(this.selectedGL));
        let searchParams = new HttpParams();
        let fromDate = this.searchByDayForm.get("Day").value;
        searchParams = searchParams.append("glAccount", this.selectedGL.name);
        searchParams = searchParams.append("searchBy", this.selectedSearch.name);
        searchParams = searchParams.append("fromDate", formatDate(new Date(this.fromDate), "MM/dd/yyyy", this.locale));
        searchParams = searchParams.append("toDate", formatDate(new Date(this.toDate), "MM/dd/yyyy", this.locale));
        const opts = { params: searchParams };
        console.log('Search :' + JSON.stringify(opts));
        this.getGeneralLedgerByDate(opts);
      }
      if (this.showReport) {
        this.fromReportDate = formatDate(new Date(this.fromDate), "MM/dd/yyyy", this.locale);
        this.toReportDate = formatDate(new Date(this.toDate), "MM/dd/yyyy", this.locale);
        if (this.selectedSearch.name === "Month") {
          var firstDayOfMonth = new Date(this.fromDate.getFullYear(), this.fromDate.getMonth(), 1);
          this.fromReportDate = formatDate(firstDayOfMonth, "MM/dd/yyyy", this.locale);
          var lastDayOfMonth = new Date(this.fromDate.getFullYear(), this.fromDate.getMonth() + 1, 0);
          this.toReportDate = formatDate(lastDayOfMonth, "MM/dd/yyyy", this.locale);

        }

        var rs = {
          report: 'GLReport.trdp',
          parameters: {
            Url: this.maxApiUrl,
            token: this.authService.currentUserValue.token,
            tenantid: this.authService.currentUserValue.tenantId,
            glAccount: this.selectedGL.name,
            searchBy: this.selectedSearch.name,
            fromDate: this.fromReportDate,
            toDate: this.toReportDate
          }
        }
        this.glReportViewer.setReportSource(rs);
      }

    }
  }

  getGlAccountList() {
    this.glChartOfAccountService.getAllGLAccountsSelectList().subscribe((data: any[]) => {
      console.log(data);
      this.glAccountList = data;
    });
  }

  getGeneralLedgerByDate(params) {
    this.totalReceipt = 0;
    this.generalLedgerService.getGeneralLedgerByDate(params).subscribe((data: any[]) => {
      console.log(data);
      this.generalLedger = data;
      this.showTable = true;
      this.showLoader = false;
      if (data.length > 0) {
        this.updateTotal();
        this.showExport = false;
      }
    });

  }
  updateTotal() {
    this.totalReceipt = 0;
    this.generalLedger.forEach(element => {
      if (element.entryType != 'Discount')
        this.totalReceipt += parseFloat(element.amount);
    });
  }
  exportExcel() {
    console.log(this.generalLedger);
    // reportData.forEach(x => delete x.billingType);

    let dataForExcel = [];
    let headers = ['Receipt No.', 'Date', 'Item', 'GL Account', 'Payment Mode', 'Entry Type', 'Amount'];

    this.generalLedger.forEach((row: any) => {
      dataForExcel.push(Object.values(row))
    })

    let daterange = this.selectedSearch.name === "Month" ? (this.fromDate.getUTCMonth() + 1).toString() + "/" + this.fromDate.getUTCFullYear().toString() : formatDate(this.fromDate, "MM/dd/yyyy", this.locale).toString() + " TO " + formatDate(this.toDate, "MM/dd/yyyy", this.locale).toString();

    let data = {
      title: "General Ledger",
      period: daterange,
      data: this.generalLedger,
      headers: headers
    }
    this.excelService.exportGeneralLedger(data);
  }
  exportPdf() {
    if (this.selectedSearch.name === "Month") {
      this.pdfService.exportGeneralLedger(this.generalLedger, this.monthStart, this.monthEnd);
    } else {
      this.pdfService.exportGeneralLedger(this.generalLedger, this.fromDate, this.toDate);
    }
  }
  exportQuickbooks() {
    this.quickBookService.exportGeneralLedgerQuickBook(this.generalLedger);
  }
}
