import { DatePipe, formatDate } from '@angular/common';
import { Inject, Injectable, LOCALE_ID } from '@angular/core';
import { Workbook } from 'exceljs';
import * as fs from 'file-saver';

@Injectable({
  providedIn: 'root'
})
export class ExportExcelService {

  pipe = new DatePipe('en-US');
  currencyFormatString = '"$"###0.00';

  constructor(@Inject(LOCALE_ID) private locale: string) { }

  exportReceivables(excelData) {

    //Title, Header & Data
    const title = excelData.title;
    const header = excelData.headers
    const data = excelData.data;

    //Create a workbook with a worksheet
    let workbook = new Workbook();
    let worksheet = workbook.addWorksheet('Receivables Report');


    //Add Row and formatting
    worksheet.mergeCells('C1', 'H2');
    let titleRow = worksheet.getCell('C1');
    titleRow.value = title
    titleRow.font = {
      name: 'Calibri',
      size: 16,
      underline: 'single',
      bold: true,
      color: { argb: '0085A3' }
    }
    titleRow.alignment = { vertical: 'middle', horizontal: 'center' }

    let d = new Date();
    let date = this.pipe.transform(d, 'MM/dd/yyyy');

    // Date
    worksheet.mergeCells('E3:F3');
    let dateCell = worksheet.getCell('E3');
    dateCell.value = date;
    dateCell.font = {
      name: 'Calibri',
      size: 12,
      bold: true
    }
    dateCell.alignment = { vertical: 'middle', horizontal: 'center' }

    //Add Image
    // let myLogoImage = workbook.addImage({
    //   base64: logo.imgBase64,
    //   extension: 'png',
    // });
    // worksheet.mergeCells('A1:B4');
    // worksheet.addImage(myLogoImage, 'A1:B4');

    //Blank Row 
    worksheet.addRow([]);

    //Adding Header Row
    let headerRow = worksheet.addRow(header);
    headerRow.eachCell({ includeEmpty: true }, (cell, number) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'BBBBBB' },
        bgColor: { argb: '' }
      }
      cell.font = {
        bold: true,
        color: { argb: '000000' },
        size: 12
      }
      cell.alignment = { horizontal: 'center' }
    })

    worksheet.columns = [
      { key: 'entityId', width: 10 },
      { key: 'personId', width: 25 },
      { key: 'memberName', width: 30 },
      { key: 'billableMemberName', width: 30 },
      { key: 'invoiceId', width: 10 },
      { key: 'createdDate', width: 15 },
      { key: 'dueDate', width: 15 },
      { key: 'description', width: 40 },
      { key: 'totalDue', width: 15 },
      { key: 'paid', width: 15 },
      { key: 'billingType', width: 20 },
      { key: 'balance', width: 15 },
    ];

    // Adding Data with Conditional Formatting
    data.forEach(d => {
      d.dueDate = formatDate(d?.dueDate, 'MM/dd/yyyy', this.locale);
      d.createdDate = formatDate(d?.createdDate, 'MM/dd/yyyy', this.locale);
      let row = worksheet.addRow(d);
      // row.eachCell((cell, number) => {
      //   console.log(cell);
      // })
    }
    );

    worksheet.addRow([]);

    //Footer Row
    let footerRow = worksheet.addRow(['Generated ' + title + ' report from Lighting Bolt on ' + date]);
    footerRow.getCell(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'EEEEEE' }
    };

    //Merge Cells
    worksheet.mergeCells(`A${footerRow.number}:K${footerRow.number}`);
    footerRow.alignment = { vertical: 'middle', horizontal: 'center' }

    worksheet.getColumn('totalDue').numFmt = this.currencyFormatString;
    worksheet.getColumn('paid').numFmt = this.currencyFormatString;
    worksheet.getColumn('balance').numFmt = this.currencyFormatString;

    //Generate & Save Excel File
    workbook.xlsx.writeBuffer().then((data) => {
      let blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      fs.saveAs(blob, title + '.xlsx');
    })

  }

  exportGeneralLedger(excelData) {

    //Title, Header & Data
    const title = excelData.title;
    const header = excelData.headers
    const data = excelData.data;

    //Create a workbook with a worksheet
    let workbook = new Workbook();
    let worksheet = workbook.addWorksheet('General Ledger');


    //Add Row and formatting
    worksheet.mergeCells('C1', 'E2');
    let titleRow = worksheet.getCell('C1');
    titleRow.value = title
    titleRow.font = {
      name: 'Calibri',
      size: 16,
      underline: 'single',
      bold: true,
      color: { argb: '0085A3' }
    }
    titleRow.alignment = { vertical: 'middle', horizontal: 'center' }

    // Date
    let d = new Date();
    let date = this.pipe.transform(d, 'MM/dd/yyyy');
    worksheet.mergeCells('C3:E3');
    let dateCell = worksheet.getCell('C3');
    dateCell.value = (excelData.period == null) ? date : excelData.period;
    dateCell.font = {
      name: 'Calibri',
      size: 12,
      bold: true
    }
    dateCell.alignment = { vertical: 'middle', horizontal: 'center' }

    worksheet.addRow([]);

    //Adding Header Row
    let headerRow = worksheet.addRow(header);
    headerRow.eachCell((cell, number) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'BBBBBB' },
        bgColor: { argb: '' }
      }
      cell.font = {
        bold: true,
        color: { argb: '000000' },
        size: 12
      }
      cell.alignment = { horizontal: 'center' }
    })

    worksheet.columns = [
      { key: 'receiptId', width: 10 },
      { key: 'transactionDate', width: 15 },
      { key: 'itemDescription', width: 30 },
      { key: 'glAccount', width: 20 },
      { key: 'paymentMode', width: 20 },
      { key: 'entryType', width: 15 },
      { key: 'amount', width: 15 }
    ];

    // Adding Data with Conditional Formatting
    data.forEach(d => {
      let row = worksheet.addRow(d);
    }
    );

    const numFmtStr = '_("$"* #,##0.00_);_("$"* (#,##0.00);_("$"* "-"??_);_(@_)';
    worksheet.getColumn('amount').numFmt = numFmtStr;
    worksheet.addRow([]);

    //Footer Row
    let footerRow = worksheet.addRow(['Generated ' + title + ' report from Lighting Bolt on ' + date]);
    footerRow.getCell(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'EEEEEE' }
    };

    //Merge Cells
    worksheet.mergeCells(`A${footerRow.number}:G${footerRow.number}`);

    //Generate & Save Excel File
    workbook.xlsx.writeBuffer().then((data) => {
      let blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      fs.saveAs(blob, title + '.xlsx');
    })

  }


  exporCreditCardReport(excelData, from, to, searchType) {

    var periodText;
    if (searchType === "Month") {
      periodText = "Generated for " + from.toLocaleString('default', { month: 'long' }) + " - " + from.getFullYear();
    }
    else if (searchType === "Day") {
      periodText = "Generated for " + formatDate(from.toString(), "MM/dd/yyyy", this.locale);
    }
    if (searchType === "Date Range") {
      periodText = "Generated for Period " + formatDate(from.toString(), "MM/dd/yyyy", this.locale) + " - " + formatDate(to.toString(), "MM/dd/yyyy", this.locale);
    }

    //Title, Header & Data
    const title = excelData.title;
    const header = excelData.headers
    const data = excelData.data;

    //Create a workbook with a worksheet
    let workbook = new Workbook();
    let worksheet = workbook.addWorksheet('CreditCard Report');


    //Add Row and formatting
    worksheet.mergeCells('A1', 'G4');
    let titleRow = worksheet.getCell('D1');
    titleRow.value = title
    titleRow.font = {
      name: 'Calibri',
      size: 16,
      underline: 'single',
      bold: true,
      color: { argb: '0085A3' }
    }
    titleRow.alignment = { vertical: 'middle', horizontal: 'center' }

    // Date
    worksheet.mergeCells('H1:I4');
    let d = new Date();
    let date = this.pipe.transform(d, 'MM/dd/yyyy');
    let dateCell = worksheet.getCell('H1');
    dateCell.value = date;
    dateCell.font = {
      name: 'Calibri',
      size: 12,
      bold: true
    }
    dateCell.alignment = { vertical: 'middle', horizontal: 'center' }

    worksheet.addRow([]);

    // Search Criteria Display
    worksheet.mergeCells('B5:E6');
    let criteriaCell = worksheet.getCell('D5');
    criteriaCell.value = periodText;
    criteriaCell.font = {
      name: 'Calibri',
      size: 12,
      bold: true
    }

    criteriaCell.alignment = { vertical: 'middle', horizontal: 'center' }

    //Adding Header Row
    let headerRow = worksheet.addRow(header);
    headerRow.eachCell((cell, number) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'BBBBBB' },
        bgColor: { argb: '' }
      }
      cell.font = {
        bold: true,
        color: { argb: '000000' },
        size: 12
      }
    })
    // Adding Data with Conditional Formatting
    data.forEach(d => {
      let row = worksheet.addRow(d);
    }
    );
    worksheet.getColumn(1).width = 10;
    worksheet.getColumn(2).width = 15;
    worksheet.getColumn(3).width = 20;
    worksheet.getColumn(4).width = 15;
    worksheet.getColumn(5).width = 10;
    worksheet.getColumn(6).width = 25;
    worksheet.getColumn(7).width = 10;
    worksheet.getColumn(8).width = 10;
    worksheet.getColumn(9).width = 15;
    const numFmtStr = '_("$"* #,##0.00_);_("$"* (#,##0.00);_(@_)';
    worksheet.getColumn(9).numFmt = numFmtStr;
    worksheet.addRow([]);

    //Footer Row
    let footerRow = worksheet.addRow(['Generated ' + title + ' on ' + this.pipe.transform(d, 'MM/dd/yyyy')]);
    footerRow.getCell(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'EEEEEE' }
    };

    //Merge Cells
    worksheet.mergeCells(`A${footerRow.number}:I${footerRow.number}`);
    var row = new Array();
    row.push('');
    row.push('');
    row.push('');
    row.push('');
    row.push('');
    row.push('');
    row.push('');
    row.push('Total Approved');
    row.push(excelData.totalApprove);
    worksheet.addRow(row);
    //adding decline
    var row = new Array();
    row.push('');
    row.push('');
    row.push('');
    row.push('');
    row.push('');
    row.push('');
    row.push('');
    row.push('Total Declined');
    row.push(excelData.totalDecline);
    var r = worksheet.addRow(row);

    //Generate & Save Excel File
    workbook.xlsx.writeBuffer().then((data) => {
      let blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      fs.saveAs(blob, title + '.xlsx');
    })

  }
  exporDepositReport(excelData, from, to, searchType) {

    var periodText;
    if (searchType === "Month") {
      periodText = "Generated for " + from.toLocaleString('default', { month: 'long' }) + " - " + from.getFullYear();
    }
    else if (searchType === "Day") {
      periodText = "Generated for " + formatDate(from.toString(), "MM/dd/yyyy", this.locale);
    }
    if (searchType === "Date Range") {
      periodText = "Generated for Period " + formatDate(from.toString(), "MM/dd/yyyy", this.locale) + " - " + formatDate(to.toString(), "MM/dd/yyyy", this.locale);
    }

    //Title, Header & Data
    const title = excelData.title;
    const header = excelData.headers
    const data = excelData.data;

    //Create a workbook with a worksheet
    let workbook = new Workbook();
    let worksheet = workbook.addWorksheet('Depsoit Report');


    //Add Row and formatting
    worksheet.mergeCells('A1', ' F4');
    let titleRow = worksheet.getCell('D1');
    titleRow.value = title
    titleRow.font = {
      name: 'Calibri',
      size: 16,
      underline: 'single',
      bold: true,
      color: { argb: '0085A3' }
    }
    titleRow.alignment = { vertical: 'middle', horizontal: 'center' }

    // Date

    let dateTitleCell = worksheet.getCell('E5');
    dateTitleCell.value = "Date";
    dateTitleCell.font = {
      name: 'Calibri',
      size: 12,
      bold: true
    }
    dateTitleCell.alignment = { vertical: 'middle', horizontal: 'center' }

    worksheet.addRow([]);

    let d = new Date();
    let date = this.pipe.transform(d, 'MM/dd/yyyy');
    let dateCell = worksheet.getCell('F5');
    dateCell.value = date;
    dateCell.font = {
      name: 'Calibri',
      size: 12,
      bold: true
    }
    dateCell.alignment = { vertical: 'middle', horizontal: 'center' }

    worksheet.addRow([]);

    // Search Criteria Display
    worksheet.mergeCells('B5:E6');
    let criteriaCell = worksheet.getCell('D5');
    criteriaCell.value = periodText;
    criteriaCell.font = {
      name: 'Calibri',
      size: 12,
      bold: true
    }

    criteriaCell.alignment = { vertical: 'middle', horizontal: 'center' }

    //Adding Header Row
    let headerRow = worksheet.addRow(header);
    headerRow.eachCell((cell, number) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'BBBBBB' },
        bgColor: { argb: '' }
      }
      cell.font = {
        bold: true,
        color: { argb: '000000' },
        size: 12
      }
    })

    // Adding Data with Conditional Formatting
    data.forEach(d => {
      let row = worksheet.addRow(d);
    }
    );
    worksheet.getColumn(1).width = 20;
    worksheet.getColumn(2).width = 20;
    worksheet.getColumn(3).width = 20;
    worksheet.getColumn(4).width = 20;
    worksheet.getColumn(5).width = 20;
    worksheet.getColumn(6).width = 20;
    const numFmtStr = '_("$"* #,##0.00_);_("$"* (#,##0.00);_("$"* "-"??_);_(@_)';
    worksheet.getColumn(2).numFmt = numFmtStr;
    worksheet.getColumn(3).numFmt = numFmtStr;
    worksheet.getColumn(4).numFmt = numFmtStr;
    worksheet.getColumn(5).numFmt = numFmtStr;
    worksheet.getColumn(6).numFmt = numFmtStr;
    worksheet.addRow([]);

    //Footer Row
    const endRow = worksheet.lastRow.number;
    let TotalCell = worksheet.getCell(`A${endRow}`);
    TotalCell.value = 'Total';
    TotalCell.font = {
      name: 'Calibri',
      size: 12,
      bold: true
    }
    TotalCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'BBBBBB' },
      bgColor: { argb: '' }
    }

    worksheet.getCell(`B${endRow}`).value = { formula: `SUM(B9:B${endRow - 1})`, date1904: false };
    worksheet.getCell(`B${endRow}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'BBBBBB' }, bgColor: { argb: '' } };
    worksheet.getCell(`C${endRow}`).value = { formula: `SUM(C9:C${endRow - 1})`, date1904: false };
    worksheet.getCell(`C${endRow}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'BBBBBB' }, bgColor: { argb: '' } };
    worksheet.getCell(`D${endRow}`).value = { formula: `SUM(D9:D${endRow - 1})`, date1904: false };
    worksheet.getCell(`D${endRow}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'BBBBBB' }, bgColor: { argb: '' } };
    worksheet.getCell(`E${endRow}`).value = { formula: `SUM(E9:E${endRow - 1})`, date1904: false };
    worksheet.getCell(`E${endRow}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'BBBBBB' }, bgColor: { argb: '' } };
    worksheet.getCell(`F${endRow}`).value = { formula: `SUM(F9:F${endRow - 1})`, date1904: false };
    worksheet.getCell(`F${endRow}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'BBBBBB' }, bgColor: { argb: '' } };
    //Generate & Save Excel File
    workbook.xlsx.writeBuffer().then((data) => {
      let blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      fs.saveAs(blob, title + '.xlsx');
    })

  }
  exporDepositDetailedReport(excelData, from, to, searchType) {

    var periodText;
    if (searchType === "Month") {
      periodText = "Generated for " + from.toLocaleString('default', { month: 'long' }) + " - " + from.getFullYear();
    }
    else if (searchType === "Day") {
      periodText = "Generated for " + formatDate(from.toString(), "MM/dd/yyyy", this.locale);
    }
    if (searchType === "Date Range") {
      periodText = "Generated for Period " + formatDate(from.toString(), "MM/dd/yyyy", this.locale) + " - " + formatDate(to.toString(), "MM/dd/yyyy", this.locale);
    }

    //Title, Header & Data
    const title = excelData.title;
    const header = excelData.headers
    const data = excelData.data;

    //Create a workbook with a worksheet
    let workbook = new Workbook();
    let worksheet = workbook.addWorksheet('Depsoit Report');


    //Add Row and formatting
    worksheet.mergeCells('A1', 'G4');
    let titleRow = worksheet.getCell('D1');
    titleRow.value = title
    titleRow.font = {
      name: 'Calibri',
      size: 16,
      underline: 'single',
      bold: true,
      color: { argb: '0085A3' }
    }
    titleRow.alignment = { vertical: 'middle', horizontal: 'center' }

    // Date

    let dateTitleCell = worksheet.getCell('F5');
    dateTitleCell.value = "Date";
    dateTitleCell.font = {
      name: 'Calibri',
      size: 12,
      bold: true
    }
    dateTitleCell.alignment = { vertical: 'middle', horizontal: 'center' }

    worksheet.addRow([]);

    let d = new Date();
    let date = this.pipe.transform(d, 'MM/dd/yyyy');
    let dateCell = worksheet.getCell('G5');
    dateCell.value = date;
    dateCell.font = {
      name: 'Calibri',
      size: 12,
      bold: true
    }
    dateCell.alignment = { vertical: 'middle', horizontal: 'center' }

    worksheet.addRow([]);

    // Search Criteria Display
    worksheet.mergeCells('B5:E6');
    let criteriaCell = worksheet.getCell('D5');
    criteriaCell.value = periodText;
    criteriaCell.font = {
      name: 'Calibri',
      size: 12,
      bold: true
    }

    criteriaCell.alignment = { vertical: 'middle', horizontal: 'center' }

    //Adding Header Row
    let headerRow = worksheet.addRow(header);
    headerRow.eachCell((cell, number) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'BBBBBB' },
        bgColor: { argb: '' }
      }
      cell.font = {
        bold: true,
        color: { argb: '000000' },
        size: 12
      }
    })

    // Adding Data with Conditional Formatting
    data.forEach(d => {
      let row = worksheet.addRow(d);
    }
    );
    worksheet.getColumn(1).width = 10;
    worksheet.getColumn(2).width = 15;
    worksheet.getColumn(3).width = 30;
    worksheet.getColumn(4).width = 15;
    worksheet.getColumn(5).width = 15;
    worksheet.getColumn(6).width = 10;
    worksheet.getColumn(7).width = 20;

    const numFmtStr = '_("$"* #,##0.00_);_("$"* (#,##0.00);_("$"* "-"??_);_(@_)';
    worksheet.getColumn(7).numFmt = numFmtStr;
    worksheet.addRow([]);

    //Footer Row
    const endRow = worksheet.lastRow.number;
    let TotalCell = worksheet.getCell(`F${endRow}`);
    TotalCell.value = 'Total';
    TotalCell.font = {
      name: 'Calibri',
      size: 12,
      bold: true
    }
    TotalCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'BBBBBB' },
      bgColor: { argb: '' }
    }
    worksheet.getCell(`G${endRow}`).value = { formula: `SUM(G9:E${endRow - 1})`, date1904: false };
    worksheet.getCell(`G${endRow}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'BBBBBB' }, bgColor: { argb: '' } };
    //Generate & Save Excel File
    workbook.xlsx.writeBuffer().then((data) => {
      let blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      fs.saveAs(blob, title + '.xlsx');
    })

  }

  exportBillinCycleReport(excelData) {

    //Title, Header & Data
    const title = excelData.title;
    const header = excelData.headers
    const data = excelData.data;

    //Create a workbook with a worksheet
    let workbook = new Workbook();
    let worksheet = workbook.addWorksheet('Billing Report');


    //Add Row and formatting
    worksheet.mergeCells('A1', 'I2');
    let titleRow = worksheet.getCell('A1');
    titleRow.value = title
    titleRow.font = {
      name: 'Calibri',
      size: 16,
      underline: 'single',
      bold: true,
      color: { argb: '0085A3' }
    }
    titleRow.alignment = { vertical: 'middle', horizontal: 'center' }

    let d = new Date();
    let date = this.pipe.transform(d, 'MM/dd/yyyy');

    // Date
    let dateCell = worksheet.getCell('G3');
    dateCell.value = date;
    dateCell.font = {
      name: 'Calibri',
      size: 12,
      bold: true
    }
    dateCell.alignment = { vertical: 'middle', horizontal: 'center' }

    //Add Image
    // let myLogoImage = workbook.addImage({
    //   base64: logo.imgBase64,
    //   extension: 'png',
    // });
    // worksheet.mergeCells('A1:B4');
    // worksheet.addImage(myLogoImage, 'A1:B4');

    //Blank Row 
    worksheet.addRow([]);

    //Adding Header Row
    let headerRow = worksheet.addRow(header);
    headerRow.eachCell({ includeEmpty: true }, (cell, number) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'BBBBBB' },
        bgColor: { argb: '' }
      }
      cell.font = {
        bold: true,
        color: { argb: '000000' },
        size: 12
      }
      cell.alignment = { horizontal: 'center' }
    })

    worksheet.columns = [
      { key: 'invoiceId', width: 20 },
      { key: 'billableName', width: 30 },
      { key: 'name', width: 30 },
      { key: 'membershipType', width: 30 },
      { key: 'membershipCount', width: 30 },
      { key: 'dueDate', width: 20 },
      { key: 'description', width: 30 },
      { key: 'preferredBillingNotifictaion', width: 15 },
      { key: 'amount', width: 15 },
    ];

    // Adding Data with Conditional Formatting
    data.forEach(d => {
      d.dueDate = this.pipe.transform(d.dueDate, 'MM/dd/yyyy');
      let row = worksheet.addRow(d);
      // row.eachCell((cell, number) => {
      //   console.log(cell);
      // })
    }
    );
    const numFmtStr = 'mm-dd-yyyy';
    worksheet.addRow([]);
    worksheet.getColumn('amount').numFmt = this.currencyFormatString;
    worksheet.getColumn('dueDate').numFmt = numFmtStr;

    //Generate & Save Excel File
    workbook.xlsx.writeBuffer().then((data) => {
      let blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      fs.saveAs(blob, 'BillingReport-' + title + '.xlsx');
    })

  }
}