import { Injectable,Inject,LOCALE_ID  } from '@angular/core';
import { InvoiceService } from '../services/invoice.service';
import { PersonService } from '../services/person.service';
import { formatDate } from '@angular/common';
@Injectable({
  providedIn: 'root'
})
export class PdfService {
  pdfMake: any;
  logo: any;
  invoice: any;
  

  constructor( private invoiceService: InvoiceService,
                private personService: PersonService,
                @Inject(LOCALE_ID) private locale: string) { }

  async loadPdfMaker() {
    if (!this.pdfMake) {
      const pdfMakeModule = await import('pdfmake/build/pdfmake');
      const pdfFontsModule = await import('pdfmake/build/vfs_fonts');
      this.pdfMake = pdfMakeModule.default;
      this.pdfMake.vfs = pdfFontsModule.default.pdfMake.vfs;
    }
  }
  async exportGeneralLedger(generalLedger: any, from, to) {
    await this.loadPdfMaker();

    // playground requires you to assign document definition to a variable called dd

var headers = {
  fila_0:{
      col_1:{ text: 'Receipt No.', style: 'tableHeader',alignment: 'center',margin: [0, 8, 0, 0] },
      col_2:{ text: 'Date', style: 'tableHeader', alignment: 'center',margin: [0, 8, 0, 0] },
      col_3:{ text: 'Item Description', style: 'tableHeader', alignment: 'center',margin: [0, 8, 0, 0] },
      col_4:{ text: 'GL Account', style: 'tableHeader', alignment: 'center',margin: [0, 8, 0, 0] },
      col_5:{ text: 'Payment Mode', style: 'tableHeader', alignment: 'center',margin: [0, 8, 0, 0] },
      col_6:{ text: 'Entry Type', style: 'tableHeader', alignment: 'center',margin: [0, 8, 0, 0] },
      col_7:{ text: 'Amount', style: 'tableHeader', alignment: 'center',margin: [0, 8, 0, 0] }
  }
}
var rows = generalLedger;

var body = [];
for (var key in headers){
  if (headers.hasOwnProperty(key)){
      var header = headers[key];
      var row = new Array();
      row.push( header.col_1 );
      row.push( header.col_2 );
      row.push( header.col_3 );
      row.push( header.col_4 );
      row.push( header.col_5 );
      row.push( header.col_6 );
      row.push( header.col_7 );
      body.push(row);
  }
}
for (var key in rows) 
{
  if (rows.hasOwnProperty(key))
  {
      var data = rows[key];
      var row = new Array();
      row.push( {text:data.receiptId.toString()} );
      row.push( {text:data.transactionDate.toString()} );
      row.push( {text:data.itemDescription.toString()} );
      row.push( {text:data.glAccount.toString()}  );
      row.push( {text:data.paymentMode ? data.paymentMode.toString() : ''} );
      row.push( {text:data.entryType.toString()} );
      row.push( {text:this.formatCurrency(data.amount).toString(),alignment: 'right'} );
      body.push(row);
  }
}

var dd = {
      pageMargins: [40,80,40,40],
      pageOrientation: 'landscape',
      header: function() {
          return {
              margin: 10,
              columns: [
                  { text:['General Ledger'], alignment: 'center',bold:true,margin:[0,20,0,0],fontSize: 16}
              ],
          }
      },
      footer: function(currentPage, pageCount) {
          return { text:'Page '+ currentPage.toString() + ' of ' + pageCount, alignment: 'center',margin:[-20,30,0,0] };
      },
      content: [
        {
          columns: [
            {
              text: 'Date:' +formatDate(new Date(),"MM/dd/yyyy",this.locale),
              alignment: 'right'
            },

          ]
        },
          {columns: [
              { text:['Period : From: ' + formatDate(new Date(from.toString()),"MM/dd/yyyy",this.locale) +' T0: ' +formatDate(new Date(to.toString()),"MM/dd/yyyy",this.locale)], alignment: 'center',bold:true, margin:[0,20,0,10],fontSize: 12}
          ],},
          
          {
              style: 'small',
              table: {
                  widths: [ '12%', '12%', '25%', '12%', '12%','12%','12%' ],
                  headerRows: 1,
                  keepWithHeaderRows: 1,
                  body: body
              },
              layout: {
                fillColor: function(rowIndex) {
                  if (rowIndex === 0) {
                    return '#bbbbbb';
                  }
                  return (rowIndex % 2 === 0) ? '#f2f2f2' : null;
                }
              }
          }],
      styles: {
          header: {
              fontSize: 28,
              bold: true
          },
          tableHeader: {
              fontSize: 10,
              bold: true
          },
          quote: {
              italics: true
          },
          small: {
              fontSize: 10
          },
          sta: {
              fontSize: 8,
              bold: false,
              alignment: 'justify'
          }
      }
    }
    this.pdfMake.createPdf(dd).open();
  }

  async exportCreditCardReport(creditCardReport: any, from, to, searchType) {
    var periodText;
    if(searchType === "Month"){
      periodText = "Generated for " + from.toLocaleString('default', { month: 'long'}) + " - " + from.getFullYear();
    }
    else if(searchType === "Day"){
      periodText = "Generated for " + formatDate(from.toString(), "MM/dd/yyyy", this.locale);
    }
    if(searchType === "Date Range"){
      periodText = "Generated for Period " + formatDate(from.toString(), "MM/dd/yyyy", this.locale) + " - " + formatDate(to.toString(), "MM/dd/yyyy", this.locale);
    }

    await this.loadPdfMaker();

    // playground requires you to assign document definition to a variable called dd

var headers = {
  fila_0:{
      col_1:{ text: 'Receipt No.', style: 'tableHeader',alignment: 'center',margin: [0, 8, 0, 0] },
      col_2:{ text: 'Date', style: 'tableHeader', alignment: 'center',margin: [0, 8, 0, 0] },
      col_3:{ text: 'Name', style: 'tableHeader', alignment: 'center',margin: [0, 8, 0, 0] },
      col_4:{ text: 'Card Number', style: 'tableHeader', alignment: 'center',margin: [0, 8, 0, 0] },
      col_5:{ text: 'Card Type', style: 'tableHeader', alignment: 'center',margin: [0, 8, 0, 0] },
      col_6:{ text: 'Auth Code', style: 'tableHeader', alignment: 'center',margin: [0, 8, 0, 0] },
      col_7:{ text: 'Status', style: 'tableHeader', alignment: 'center',margin: [0, 8, 0, 0] },
      col_8:{ text: 'Type', style: 'tableHeader', alignment: 'center',margin: [0, 8, 0, 0] },
      col_9:{ text: 'Amount', style: 'tableHeader', alignment: 'center',margin: [0, 8, 0, 0] }
  }
}
var rows = creditCardReport;
var totalApproved = 0;
var totalDeclined = 0;
var body = [];
for (var key in headers){
  if (headers.hasOwnProperty(key)){
      var header = headers[key];
      var row = new Array();
      row.push( header.col_1 );
      row.push( header.col_2 );
      row.push( header.col_3 );
      row.push( header.col_4 );
      row.push( header.col_5 );
      row.push( header.col_6 );
      row.push( header.col_7 );
      row.push( header.col_8 );
      row.push( header.col_9 );
      body.push(row);
  }
}
for (var key in rows) 
{
  if (rows.hasOwnProperty(key))
  {
      var data = rows[key];
      var row = new Array();
      row.push( {text:data.receiptId.toString()} );
      row.push( {text:data.transactionDate.toString()} );
      row.push( {text:data.billableName.toString()} );
      row.push( {text:data.creditCardNumber.toString()}  );
      row.push( {text:data.cardType.toString()} );
      row.push( {text:data.authCode.toString()} );
      row.push( {text:data.paymentStatus.toString()} );
      row.push( {text:data.transactionType.toString()} );
      row.push( {text:this.formatCurrency(data.amount).toString(),alignment: 'right'} );
      body.push(row);
      if(data.paymentStatus === 'Approved')
      {
        totalApproved += parseFloat(data.amount)
      }
      else {
        totalDeclined += parseFloat(data.amount)
      }
      
  }
}
//Push totals 
var row = new Array();
row.push( {text:'Total Approved', colSpan: 8,alignment: 'right',bold:true,fontSize: 12});
row.push( {text:' '});
row.push( {text:' '});
row.push( {text:' '});
row.push( {text:' '});
row.push( {text:' '});
row.push( {text:' '});
row.push( {text:' '});
row.push( {text: this.formatCurrency(totalApproved).toString(), colSpan: 1,alignment: 'right',bold:true,fontSize: 12} );
body.push(row);

var row = new Array();
row.push( {text:'Total Declined', colSpan: 8,alignment: 'right',bold:true,fontSize: 12});
row.push( {text:' '});
row.push( {text:' '});
row.push( {text:' '});
row.push( {text:' '});
row.push( {text:' '});
row.push( {text:' '});
row.push( {text:' '});
row.push( {text: this.formatCurrency(totalDeclined).toString(), colSpan: 1,alignment: 'right',bold:true,fontSize: 12} );
body.push(row);
var dd = {
      pageMargins: [40,80,40,40],
      pageOrientation: 'landscape',
      header: function() {
          return {
              margin: 10,
              columns: [
                  { text:['Credit Card Report'], alignment: 'center',bold:true,margin:[0,20,0,0],fontSize: 16}
              ],
          }
      },
      footer: function(currentPage, pageCount) {
          return { text:'Page '+ currentPage.toString() + ' of ' + pageCount, alignment: 'center',margin:[-20,30,0,0] };
      },
      content: [
        {
          columns: [
            {
              text: 'Date:' + formatDate(new Date(),"MM/dd/yyyy",this.locale),
              alignment: 'right'
            },

          ]
        },
          {columns: [
              { text:[periodText], alignment: 'center',bold:true, margin:[0,20,0,10],fontSize: 12}
          ],},
          
          {
              style: 'small',
              table: {
                  widths: [ '10%', '10%', '20%', '10%', '10%','10%','10%','10%','10%' ],
                  headerRows: 1,
                  keepWithHeaderRows: 1,
                  body: body
              },
              layout: {
                fillColor: function(rowIndex) {
                  if (rowIndex === 0) {
                    return '#bbbbbb';
                  }
                  return (rowIndex % 2 === 0) ? '#f2f2f2' : null;
                }
              }
          }],
      styles: {
          header: {
              fontSize: 28,
              bold: true
          },
          tableHeader: {
              fontSize: 10,
              bold: true
          },
          quote: {
              italics: true
          },
          small: {
              fontSize: 10
          },
          sta: {
              fontSize: 8,
              bold: false,
              alignment: 'justify'
          }
      }
    }
    this.pdfMake.createPdf(dd).open();
  }
  formatCurrency(num) {
    var p = num.toFixed(2).split(".");
    if(parseFloat(num) >= 0){
      return "$" + p[0].split("").reverse().reduce(function(acc, num, i, orig) {
        return  num=="-" ? acc : num + (i && !(i % 3) ? "," : "") + acc;
    }, "") + "." + p[1];
    }
    else {
      return "($" + p[0].split("").reverse().reduce(function(acc, num, i, orig) {
        return  num=="-" ? acc : num + (i && !(i % 3) ? "," : "") + acc;
    }, "") + "." + p[1]+")";
    }
   
  }
  async exportDepositReport(depositReport: any, from, to, searchType) {
    var periodText;
    if(searchType === "Month"){
      periodText = "Generated for " + from.toLocaleString('default', { month: 'long'}) + " - " + from.getFullYear();
    }
    else if(searchType === "Day"){
      periodText = "Generated for " + formatDate(from.toString(), "MM/dd/yyyy", this.locale);
    }
    if(searchType === "Date Range"){
      periodText = "Generated for Period " + formatDate(from.toString(), "MM/dd/yyyy", this.locale) + " - " + formatDate(to.toString(), "MM/dd/yyyy", this.locale);
    }

    await this.loadPdfMaker();

    // playground requires you to assign document definition to a variable called dd

var headers = {
  fila_0:{
      col_1:{ text: 'Date', style: 'tableHeader',alignment: 'center',margin: [0, 8, 0, 0] },
      col_2:{ text: 'Cash', style: 'tableHeader', alignment: 'center',margin: [0, 8, 0, 0] },
      col_3:{ text: 'Check', style: 'tableHeader', alignment: 'center',margin: [0, 8, 0, 0] },
      col_4:{ text: 'eCheck', style: 'tableHeader', alignment: 'center',margin: [0, 8, 0, 0] },
      col_5:{ text: 'Credit Card', style: 'tableHeader', alignment: 'center',margin: [0, 8, 0, 0] },
      col_6:{ text: 'Off Line', style: 'tableHeader', alignment: 'center',margin: [0, 8, 0, 0] }
  }
}
var rows = depositReport;
var totalCash = 0;
var totalCheck = 0;
var totalECheck =0;
var totalCreditCard = 0;
var totalOffline = 0;
var body = [];
for (var key in headers){
  if (headers.hasOwnProperty(key)){
      var header = headers[key];
      var row = new Array();
      row.push( header.col_1 );
      row.push( header.col_2 );
      row.push( header.col_3 );
      row.push( header.col_4 );
      row.push( header.col_5 );
      row.push( header.col_6 );
      body.push(row);
  }
}
for (var key in rows) 
{
  if (rows.hasOwnProperty(key))
  {
      var data = rows[key];
      var row = new Array();
      row.push( {text:data.transactionDate.toString()} );
      row.push( {text:this.formatCurrency(data.totalCash).toString(),alignment: 'right'} );
      row.push( {text:this.formatCurrency(data.totalCheck).toString(),alignment: 'right'} );
      row.push( {text:this.formatCurrency(data.totalECheck).toString(),alignment: 'right'} );
      row.push( {text:this.formatCurrency(data.totalCreditCard).toString(),alignment: 'right'} );
      row.push( {text:this.formatCurrency(data.totalOffline).toString(),alignment: 'right'} );
      body.push(row);

      totalCash += parseFloat(data.totalCash);
      totalCheck += parseFloat(data.totalCheck);
      totalECheck += parseFloat(data.totalECheck);
      totalCreditCard += parseFloat(data.totalCreditCard);
      totalOffline += parseFloat(data.totalOffline);
  }
}

//Push totals

var row = new Array();
row.push( {text:'Total',style: 'tableHeader'} );
row.push( {text:this.formatCurrency(totalCash).toString(),alignment: 'right',style: 'tableHeader'} );
row.push( {text:this.formatCurrency(totalCheck).toString(),alignment: 'right',style: 'tableHeader'} );
row.push( {text:this.formatCurrency(totalECheck).toString(),alignment: 'right',style: 'tableHeader'} );
row.push( {text:this.formatCurrency(totalCreditCard).toString(),alignment: 'right',style: 'tableHeader'} );
row.push( {text:this.formatCurrency(totalOffline).toString(),alignment: 'right',style: 'tableHeader'} );
body.push(row);

var dd = {
      pageMargins: [40,80,40,40],
      //pageOrientation: 'portrait',
      header: function() {
          return {
              margin: 10,
              columns: [
                  { text:['Deposit Report'], alignment: 'center',bold:true,margin:[0,20,0,0],fontSize: 16}
              ],
          }
      },
      footer: function(currentPage, pageCount) {
          return { text:'Page '+ currentPage.toString() + ' of ' + pageCount, alignment: 'center',margin:[-20,30,0,0] };
      },
      content: [
        {
          columns: [
            {
              text: 'Date:' + formatDate(new Date(),"MM/dd/yyyy",this.locale),
              alignment: 'right'
            },

          ]
        },
          {columns: [
              { text:[periodText], alignment: 'center',bold:true, margin:[0,20,0,10],fontSize: 12}
          ],},
          
          {
              style: 'small',
              table: {
                  widths: [ '25%', '15%', '15%', '15%', '15%','15%'],
                  headerRows: 1,
                  keepWithHeaderRows: 1,
                  body: body
              },
              layout: {
                fillColor: function(rowIndex) {
                  if (rowIndex === 0) {
                    return '#bbbbbb';
                  }
                  return (rowIndex % 2 === 0) ? '#f2f2f2' : null;
                }
              }
          }],
      styles: {
          header: {
              fontSize: 28,
              bold: true
          },
          tableHeader: {
              fontSize: 10,
              bold: true
          },
          quote: {
              italics: true
          },
          small: {
              fontSize: 10
          },
          sta: {
              fontSize: 8,
              bold: false,
              alignment: 'justify'
          }
      }
    }
    this.pdfMake.createPdf(dd).open();
  }
  async exportDepositDetailedReport(depositReport: any, from, to, searchType) {
    var periodText;
    if(searchType === "Month"){
      periodText = "Generated for " + from.toLocaleString('default', { month: 'long'}) + " - " + from.getFullYear();
    }
    else if(searchType === "Day"){
      periodText = "Generated for " + formatDate(from.toString(), "MM/dd/yyyy", this.locale);
    }
    if(searchType === "Date Range"){
      periodText = "Generated for Period " + formatDate(from.toString(), "MM/dd/yyyy", this.locale) + " - " + formatDate(to.toString(), "MM/dd/yyyy", this.locale);
    }

    await this.loadPdfMaker();

    // playground requires you to assign document definition to a variable called dd

var headers = {
  fila_0:{
      col_1:{ text: 'Receipt', style: 'tableHeader',alignment: 'center',margin: [0, 8, 0, 0] },
      col_2:{ text: 'Date', style: 'tableHeader',alignment: 'center',margin: [0, 8, 0, 0] },
      col_3:{ text: 'Name', style: 'tableHeader', alignment: 'center',margin: [0, 8, 0, 0] },
      col_4:{ text: 'Transaction Ref.', style: 'tableHeader', alignment: 'center',margin: [0, 8, 0, 0] },
      col_5:{ text: 'Portal', style: 'tableHeader', alignment: 'center',margin: [0, 8, 0, 0] },
      col_6:{ text: 'Amount', style: 'tableHeader', alignment: 'center',margin: [0, 8, 0, 0] }
  }
}
var rows = depositReport;
var totalCash = 0;
var totalCheck = 0;
var totalECheck =0;
var totalCreditCard = 0;
var totalOffline = 0;

var reportTotalCash = 0;
var reportTotalCheck = 0;
var reportTotalECheck =0;
var reportTotalCreditCard = 0;
var reportTotalOffline = 0;
var grandTotal = 0;

var body = [];
for (var key in headers){
  if (headers.hasOwnProperty(key)){
      var header = headers[key];
      var row = new Array();
      row.push( header.col_1 );
      row.push( header.col_2 );
      row.push( header.col_3 );
      row.push( header.col_4 );
      row.push( header.col_5 );
      row.push( header.col_6 );
      body.push(row);
  }
}
var paymentMode = '';

for (var key in rows) 
{
  if (rows.hasOwnProperty(key))
  {
      var data = rows[key];
      if(paymentMode != data.paymentMode){

        if(paymentMode != ''){
          var row = new Array();
         
          if(paymentMode === 'Cash'){
            row.push( {text:this.formatCurrency(totalCash).toString(), colSpan: 6,alignment: 'right',bold:true,fontSize: 12} );
          }
          if(paymentMode === 'Check'){
            row.push( {text: this.formatCurrency(totalCheck).toString(), colSpan: 6,alignment: 'right',bold:true,fontSize: 12} );
          }
          if(paymentMode === 'eCheck'){
            row.push( {text: this.formatCurrency(totalECheck).toString(), colSpan: 6,alignment: 'right',bold:true,fontSize: 12} );
          }
          if(paymentMode === 'CreditCard'){
            row.push( {text: this.formatCurrency(totalCreditCard).toString(), colSpan: 6,alignment: 'right',bold:true,fontSize: 12} );
          }
          if(paymentMode === 'Off Line'){
            row.push( {text: this.formatCurrency(totalOffline).toString(), colSpan: 6,alignment: 'right',bold:true,fontSize: 12} );
          }
          else {
            row.push( {text: this.formatCurrency(totalOffline).toString(), colSpan: 6,alignment: 'right',bold:true,fontSize: 12} );
          }
          body.push(row);
        }
        paymentMode = data.paymentMode;
        var row = new Array();
        row.push( {text:'Payment Mode:' + paymentMode, colSpan: 6,alignment: 'left',bold:true,fontSize: 14} );
        body.push(row);
      }

      var row = new Array();
      row.push( {text:data.receiptId.toString()} );
      row.push( {text:data.transactionDate.toString()} );
      row.push( {text:data.billableName,alignment: 'left'} );
      row.push( {text:data.transactionReference,alignment: 'left'} );
      row.push( {text:data.portal,alignment: 'center'} );
      row.push( {text:this.formatCurrency(data.amount).toString(),alignment: 'right'} );
     
      body.push(row);
      if(paymentMode === 'Cash'){
        totalCash += parseFloat(data.amount);
        reportTotalCash += parseFloat(data.amount);
      }
      if(paymentMode === 'Check'){
        totalCheck += parseFloat(data.amount);
        reportTotalCheck += parseFloat(data.amount);
      }
      if(paymentMode === 'eCheck'){
        totalECheck += parseFloat(data.amount);
        reportTotalECheck += parseFloat(data.amount);
      }
      if(paymentMode === 'CreditCard'){
        totalCreditCard += parseFloat(data.amount);
        reportTotalCreditCard += parseFloat(data.amount);
      }
      if(paymentMode === 'Off Line'){
        totalOffline += parseFloat(data.amount);
        reportTotalOffline += parseFloat(data.amount);
      }
      grandTotal += parseFloat(data.amount);
  }
}

//Push totals

var row = new Array();
row.push( {text:'Total ECheck', colSpan: 5,alignment: 'right',bold:true,fontSize: 12});
row.push( {text:' '});
row.push( {text:' '});
row.push( {text:' '});
row.push( {text:' '});
row.push( {text: this.formatCurrency(totalECheck).toString(), colSpan: 1,alignment: 'right',bold:true,fontSize: 12} );
body.push(row);

var row = new Array();
row.push( {text:'Total Credit Card', colSpan: 5,alignment: 'right',bold:true,fontSize: 12});
row.push( {text:' '});
row.push( {text:' '});
row.push( {text:' '});
row.push( {text:' '});
row.push( {text: this.formatCurrency(totalCreditCard).toString(), colSpan: 1,alignment: 'right',bold:true,fontSize: 12} );
body.push(row);

var row = new Array();
row.push( {text:'Total Cash', colSpan: 5,alignment: 'right',bold:true,fontSize: 12});
row.push( {text:' '});
row.push( {text:' '});
row.push( {text:' '});
row.push( {text:' '});
row.push( {text: this.formatCurrency(totalCash).toString(), colSpan: 1,alignment: 'right',bold:true,fontSize: 12} );
body.push(row);

var row = new Array();
row.push( {text:'Total Check', colSpan: 5,alignment: 'right',bold:true,fontSize: 12});
row.push( {text:' '});
row.push( {text:' '});
row.push( {text:' '});
row.push( {text:' '});
row.push( {text: this.formatCurrency(totalCheck).toString(), colSpan: 1,alignment: 'right',bold:true,fontSize: 12} );
body.push(row);

var row = new Array();
row.push( {text:'Total Off Line', colSpan: 5,alignment: 'right',bold:true,fontSize: 12});
row.push( {text:' '});
row.push( {text:' '});
row.push( {text:' '});
row.push( {text:' '});
row.push( {text: this.formatCurrency(totalOffline).toString(), colSpan: 1,alignment: 'right',bold:true,fontSize: 12} );
body.push(row);

var row = new Array();
row.push( {text:'Grand Total', colSpan: 5,alignment: 'right',bold:true,fontSize: 12});
row.push( {text:' '});
row.push( {text:' '});
row.push( {text:' '});
row.push( {text:' '});
row.push( {text: this.formatCurrency(grandTotal).toString(), colSpan: 1,alignment: 'right',bold:true,fontSize: 12} );
body.push(row);
var dd = {
      pageMargins: [40,80,40,40],
      pageOrientation: 'landscape',
      header: function() {
          return {
              margin: 10,
              columns: [
                  { text:['Deposit Report'], alignment: 'center',bold:true,margin:[0,20,0,0],fontSize: 16}
              ],
          }
      },
      footer: function(currentPage, pageCount) {
          return { text:'Page '+ currentPage.toString() + ' of ' + pageCount, alignment: 'center',margin:[-20,30,0,0] };
      },
      content: [
        {
          columns: [
            {
              text: 'Date:' + formatDate(new Date(),"MM/dd/yyyy",this.locale),
              alignment: 'right'
            },

          ]
        },
          {columns: [
              { text:[periodText], alignment: 'center',bold:true, margin:[0,20,0,10],fontSize: 12}
          ],},
          
          {
              style: 'small',
              table: {
                  widths: [ '10%', '15%', '30%', '15%', '10%', '20%'],
                  headerRows: 1,
                  keepWithHeaderRows: 1,
                  body: body
              },
              layout: {
                fillColor: function(rowIndex) {
                  if (rowIndex === 0) {
                    return '#bbbbbb';
                  }
                  return (rowIndex % 2 === 0) ? '#f2f2f2' : null;
                }
              }
          }],
      styles: {
          header: {
              fontSize: 28,
              bold: true
          },
          tableHeader: {
              fontSize: 10,
              bold: true
          },
          quote: {
              italics: true
          },
          small: {
              fontSize: 10
          },
          sta: {
              fontSize: 8,
              bold: false,
              alignment: 'justify'
          }
      }
    }
    this.pdfMake.createPdf(dd).open();
  }
}
