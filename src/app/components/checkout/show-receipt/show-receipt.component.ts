import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { HttpParams } from '@angular/common/http';
import { ReceiptService } from '../../../services/receipt.service';
import { InvoiceService } from '../../../services/invoice.service';
import { AppBreadcrumbService } from '../../../app.breadcrumb.service';
import { EventCommunicationService } from '../../../services/event-communication.service';
import { PdfService } from '../../../services/pdf.service';
import { formatDate } from "@angular/common";
import { Inject } from "@angular/core";
import { LOCALE_ID } from "@angular/core";
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
@Component({
  selector: 'app-show-receipt',
  templateUrl: './show-receipt.component.html',
  styleUrls: ['./show-receipt.component.scss'],
  providers: [MessageService]
})
export class ShowReceiptComponent implements OnInit {

  currentUser: any;
  receipt: any;
  showReceipt: boolean;
  receiptTotal: number;
  pdfMake: any;
  currentDate: string;
  public localID: string;
  billingAddress: any;
  logo: any;
  receiptPdf: any;
  showNote: boolean;
  receiptNoteForm: FormGroup;
  addErrorMessages: any = {};
  submitted: boolean;
  // notesExist: boolean;
  emailForm: FormGroup;
  showEmail: boolean;
  orgPrintMessage: string;
  notesAndAnnouncements: string;
  discountApplied: boolean;
  constructor(
    private router: Router,
    private authService: AuthService,
    private receiptService: ReceiptService,
    private invoiceService: InvoiceService,
    private breadcrumbService: AppBreadcrumbService,
    private eventCommunicationService: EventCommunicationService,
    private pdfService: PdfService,
    private formBuilder: FormBuilder,
    private messageService: MessageService,
    @Inject(LOCALE_ID) localID: string
  ) {
    this.localID = localID;
    this.discountApplied = false;
  }

  ngOnInit(): void {
    this.currentUser = this.authService.currentUserValue;
    console.log('CartId:' + JSON.stringify(this.currentUser.cartId));
    this.showReceipt = false;
    this.getReceiptDetailByCartId(this.currentUser.cartId);
    this.showEmail = false;

    this.receiptNoteForm = this.formBuilder.group({
      ReceiptId: [0],
      Note: ['', [Validators.required]]
    });

    this.emailForm = this.formBuilder.group({
      PersonId: [0],
      ToEmail: ['', [Validators.required, Validators.email]],
      Subject: ['', [Validators.required, this.noBlankValidator]],
      Body: ['', [Validators.required]],
    });

  }

  getReceiptDetailByCartId(id: number) {

    console.log('Fetching Receipt for cart Id:' + id.toString());
    let searchParams = new HttpParams();
    searchParams = searchParams.append('cartId', id.toString());
    const opts = { params: searchParams };
    this.receiptService.getReceiptDetailByCartId(opts).subscribe((data: any) => {
      console.log(data);
      this.receipt = data;
      console.log('Organization:' + JSON.stringify(this.receipt.organization));
      this.getHeaderImage();
      this.checkForNotesAndAnnouncements();
      if (parseFloat(this.receipt.totalDiscount) > 0) {
        this.discountApplied = true;
      }
    });
  }

  getHeaderImage() {
    this.invoiceService.getHeaderImage(this.receipt.organizationId).subscribe(data => {
      this.createImageFromBlob(data);
      console.log(data);
    }, error => {
      console.log(error);
    });
  }

  createImageFromBlob(image: Blob) {
    let reader = new FileReader();
    reader.addEventListener('load', () => {
      this.logo = [reader.result];
    }, false);
    if (image) {
      reader.readAsDataURL(image);
      this.showReceipt = true;
      this.clearCart();
    }
  }
  clearCart() {
    this.authService.clearCart();
    this.breadcrumbService.setCart(0);
    this.eventCommunicationService.sendMessage("message");
  }
  goHome() {
    this.router.navigate(['/contactProfile'], {
      queryParams: {
        entityId: this.receipt?.entityId
      }
    });
  }
  addNote() {
    this.showNote = true;
    this.receiptNoteForm.get('ReceiptId').setValue(this.receipt.receiptid);
    if (this.receipt.notes) {
      if (this.receipt.notes.length > 0) {
        this.receiptNoteForm.get('Note').setValue(this.receipt.notes);
      }
    }
    else {
      if (this.receipt.organization.printMessage) {
        this.receiptNoteForm.get('Note').setValue(this.receipt.organization.printMessage);
      }
    }

  }

  hideNoteDialog() {
    this.showNote = false;
    this.submitted = false;
  }

  saveNote() {
    this.submitted = true;
    if (this.receiptNoteForm.valid) {
      const body = {
        Notes: this.receiptNoteForm.get('Note').value,
        Receiptid: this.receiptNoteForm.get('ReceiptId').value,
      };
      console.log(body);

      this.receiptService.updateReceipt(body).subscribe(response => {
        this.messageService.add({
          severity: 'success',
          summary: 'Successful',
          detail: 'Note Added succesfully.',
          life: 3000
        });
        this.getReceiptDetailByCartId(this.currentUser.cartId);
        this.hideNoteDialog();

      },
        error => {
          console.log(error);
          this.messageService.add({ severity: 'error', summary: 'Error', detail: error, life: 3000 });
        });
    }
  }

  noteValidation(event) {
    this.receiptNoteForm.get('Note').setValue(event.target.value.trim());
  }

  errorIconCss(field: string) {
    return { 'has-feedback': this.isFieldValid(field) };
  }

  errorFieldCss(field: string) {
    return { 'ng-dirty': this.isFieldValid(field) };
  }

  isFieldValid(field: string) {
    if (this.showNote) {
      if ((!this.receiptNoteForm.get(field).valid) && (this.submitted) && (this.receiptNoteForm.get(field).hasError('required'))) {
        this.addErrorMessages = { errorType: 'required', controlName: field };
        return true;
      }
    }
  }

  checkForNotesAndAnnouncements() {
    if (this.receipt.notes) {
      if (this.receipt.notes.length > 0) {
        this.notesAndAnnouncements = this.receipt.notes;
      }
    }
    else {
      this.notesAndAnnouncements = this.receipt.organization.printMessage ? this.receipt.organization.printMessage : '';
    }
  }


  /* email code */
  isEmailFormFieldValid(field: string) {
    if (this.showEmail) {
      if ((!this.emailForm.get(field).valid) && (this.submitted) && (this.emailForm.get(field).hasError('required'))) {
        if (field == 'ToEmail') {
          field = 'Email'
          this.addErrorMessages = { errorType: 'required', controlName: field };
          return true;
        }
      }
      if (!this.emailForm.get(field).valid && this.emailForm.get(field).hasError('email')) {
        this.addErrorMessages = { errorType: 'email', controlName: field };
        return true;
      }
    }

  }

  async showEmailDialog() {
    await this.downloadPdf();
    let billablePersonEmail = '';
    if (this.receipt.billingAddress) {
      billablePersonEmail = this.receipt.billingAddress.billToEmail;

    }
    // const billablePersonEmail = this.receipt.billablePerson.emails.length > 0 ? this.receipt.billablePerson.emails[0].emailAddress : '';
    const editorData = 'Dear ' + this.receipt.billingAddress.billToName + '<br />Please find membership receipt attached with this email for your membership(s).';
    this.emailForm.get('ToEmail').setValue(billablePersonEmail);
    this.emailForm.get('Subject').setValue('Your Membership Receipt');
    this.emailForm.get('Body').setValue(editorData);

    this.showEmail = true;
  }

  hideEmailDialog() {
    this.showEmail = false;
    this.emailForm.reset();
  }

  sendEmail() {
    this.submitted = true;
    this.emailInvoice();
    if (this.emailForm.valid)
      this.showEmail = false;
  }

  emailInvoice() {
    if (this.emailForm.valid) {
      const body = {
        receipientAddress: this.emailForm.get('ToEmail').value,
        subject: this.emailForm.get('Subject').value,
        messageBody: this.emailForm.get('Body').value,
        receiptId: this.receipt.receiptid,
        pdfData: this.receiptPdf,
        entityId: this.receipt.billableEntity.entityId,
        organizationName: this.currentUser.organizationName
      }
      // this.showLoader = true;
      this.receiptService.emailReceipt(body).subscribe((data: any) => {
        console.log(data);
        if (data === true) {
          this.messageService.add({
            severity: 'success',
            summary: 'Successful',
            detail: 'Email has been sent succesfully.',
            life: 3000
          });

        }
        else {
          this.messageService.add({
            severity: 'warn',
            summary: 'Warning',
            detail: 'An error has occured. Please try later.',
            life: 3000
          });
        }
      });
      // this.showLoader = false;
    }
    else {
      this.messageService.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Please enter the required information.',
        life: 3000
      });
    }

  }

  noBlankValidator(control: FormControl) {
    const isWhitespace = (control.value || '').trim().length === 0;
    const isValid = !isWhitespace;
    return isValid ? null : { 'required': true };
  }

  /* PDF Generator Code */

  async showPdf() {

    console.log("Get Receipt PDF:" + JSON.stringify(this.receipt));
    this.receiptService.getReceiptPdfByReceiptId(this.receipt.receiptid).subscribe((data: any) => {
      //console.log(data);
      let parsedResponse = (data)
      var blob = new Blob([data], { type: 'application/pdf' });
      var filename = 'Receipt-' + this.receipt.receiptid + '.pdf';

      let blobUrl: string = window.URL.createObjectURL(blob);
      let iframe = document.createElement('iframe'); //load content in an iframe to print later
      document.body.appendChild(iframe);
      iframe.style.display = 'none';
      iframe.src = blobUrl;
      iframe.onload = function () {
        setTimeout(function () {
          iframe.focus();
          iframe.contentWindow.print();
        }, 1);
      };
    });
    // await this.loadPdfMaker();
    // var def = this.generatePdf(this.receipt);  console.log(def);
    // this.pdfMake.createPdf(def).print({}, window.frames['printPdf']);
  }


  async downloadPdf() {
    this.receiptService.getReceiptPdfByReceiptId(this.receipt.receiptid).subscribe(async (data: any) => {
      let parsedResponse = data;
      var blob = new Blob([data], { type: 'application/pdf' });
      var filename = 'Receipt-' + this.receipt.receiptid + '.pdf';
      this.receiptPdf = await this.blobToBase64(blob);
    });

    // await this.loadPdfMaker();
    // var def = this.generatePdf(this.receipt);  console.log(def);
    // const pdfDocGenerator = this.pdfMake.createPdf(def);
    // pdfDocGenerator.getBase64((data) => {
    //   this.receiptPdf = data;
    // });
  }

  async blobToBase64(blob: Blob): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onload = () => {
        const base64String = reader.result.toString().split(',')[1];
        resolve(base64String);
      };
      reader.onerror = (error) => {
        reject(error);
      };
    });
  }



  async loadPdfMaker() {
    if (!this.pdfMake) {
      const pdfMakeModule = await import('pdfmake/build/pdfmake');
      const pdfFontsModule = await import('pdfmake/build/vfs_fonts');
      this.pdfMake = pdfMakeModule.default;
      this.pdfMake.vfs = pdfFontsModule.default.pdfMake.vfs;
    }
  }
  generatePdf(receipt: any) {
    let def = {

      pageMargins: [64, 10, 20, 100],
      footer: function (currentPage, pageCount) {
        return {
          margin: 5,
          columns: [
            {
              fontSize: 9,
              text: [
                {
                  text: 'Trilix  -   ' + ' Page [ ' + currentPage.toString() + ' / ' + pageCount + ' ]',
                }
              ],
              alignment: 'center'
            }
          ]
        };
      },
      content: [
        // Header
        {
          columns: [
            {
              image: this.logo,
              width: 188,
              height: 66,
              margin: [0, 0, 0, 10],
            },
            {
              text: 'RECEIPT',
              style: 'invoiceTitle',
              width: '*'
            }
          ]
        },
        {
          columns: [
            {
              stack: [
                {
                  columns: [
                    {
                      text: receipt.organization.address1,
                      style: 'invoiceSubTitle',
                      width: '*'

                    }
                  ]
                },
                {
                  columns: [
                    {
                      text: receipt.organization.address2,
                      style: 'invoiceSubTitle',
                      width: '*'
                    }
                  ]
                },
                {
                  columns: [
                    {
                      text: receipt.organization.address3,
                      style: 'invoiceSubTitle',
                      width: '*'
                    }
                  ]
                },
                {
                  columns: [
                    {
                      text: receipt.organization.city + ', ' + receipt.organization.state + ', ' + receipt.organization.zip,
                      style: 'invoiceSubTitle',
                      width: '*'
                    }
                  ]
                },
                {
                  columns: [
                    {
                      text: receipt.organization.website, link: 'https://' + receipt.organization.website,
                      style: 'invoiceSubTitle',
                      width: '*'
                    }
                  ]
                },

              ]
            },
            {

            }
          ],
        },
        // Billing Details
        {

          columns: [
            {
              width: '70%',
              stack: [
                {
                  columns: [
                    {
                      text: 'Bill To:',
                      style: 'invoiceBillingAddressTitle',
                      width: '*'

                    }
                  ]
                },
                {
                  columns: [
                    {
                      text: receipt.billingAddress.billToName,
                      style: 'invoiceBillingAddress'
                    }
                  ]
                },
                // Billing Address
                {
                  columns: [
                    {
                      text: receipt.billingAddress.streetAddress,
                      style: 'invoiceBillingAddress'
                    }
                  ]
                },
                {
                  columns: [
                    {
                      text: receipt.billingAddress.city + ', ' + receipt.billingAddress.state + ', ' + receipt.billingAddress.zip,
                      style: 'invoiceBillingAddress'
                    }
                  ]
                },
              ]
            },
            {
              width: '30%',
              table: {
                widths: ['50%', '50%'],
                body: [
                  [
                    {
                      text: 'Receipt'
                    },
                    {
                      text: receipt.receiptid
                    }
                  ],
                  [
                    {
                      text: 'Date'
                    },
                    {
                      text: formatDate(receipt.date, 'MM/dd/yy', this.localID)
                    }
                  ],
                  [
                    {
                      text: 'Created'
                    },
                    {
                      text: this.currentUser.username
                    }
                  ]
                ]
              },
            }

          ]
        },
        // Membership Type
        // Items
        '\n',
        {
          table: {
            // headers are automatically repeated if the table spans over multiple pages
            // you can declare how many rows should be treated as headers
            headerRows: 1,
            widths: ['10%', '60%', '15%', '19%'],
            body: [
              // Table Header
              [
                {
                  text: 'Quantity',
                  style: ['itemsHeader']
                },
                {
                  text: 'Description',
                  style: ['itemsHeader']
                },
                {
                  text: 'Rate',
                  style: ['itemsHeader']
                },
                {
                  text: 'Amount',
                  style: ['itemsHeader']
                }
              ],

              // Items
              // ...this.receipt.lineItems.map(p => ([{ text: p.quantity,  style: 'itemNumber' },
              // { text: p.description + p.membershipCategory  + p.membershipPeriod + p.membershipName, style: 'itemText' },
              // { text:  p.rate, style: 'itemCurrency' },
              // { text:  p.amount, style: 'itemCurrency' }])),
              ...this.receipt.lineItems.map(p => ([{ text: p.quantity, style: 'itemNumber' },
              { text: p.description + p.membershipCategory + p.membershipName, style: 'itemText' },
              { text: p.rate, style: 'itemCurrency' },
              { text: p.amount, style: 'itemCurrency' }])),
              // END Items
            ],

          }, // table
          layout: {
            paddingBottom: (rowIndex: number, node: any, colIndex: number) => {
              const DEFAULT_PADDING = 2;

              // Calculate padding for the last element of the table.
              if (rowIndex === node.table.body.length - 5) {
                const currentPosition = node.positions[node.positions.length - 1];
                const totalPageHeight = currentPosition.pageInnerHeight;
                const currentHeight = currentPosition.top;
                const paddingBottom = totalPageHeight - currentHeight - 150;
                return paddingBottom;
              } else {
                return DEFAULT_PADDING;
              }
            },
          }
        },
      ],
      styles: {
        invoiceTitle: {
          fontSize: 45,
          alignment: 'right'
        },
        invoiceSubTitle: {
          fontSize: 12,
          alignment: 'left'
        },
        // Billing Headers
        invoiceBillingTitle: {
          fontSize: 14,
          bold: true,
          alignment: 'left',
          margin: [0, 20, 0, 5],
        },
        // Billing Details
        invoiceBillingDetails: {
          alignment: 'left'

        },
        invoiceBillingAddressTitle: {
          margin: [0, 25, 0, 3],
          bold: true
        },
        invoiceBillingAddress: {

        },
        // Items Header
        itemsHeader: {
          margin: [0, 5, 0, 5],
          bold: true,
          alignment: 'center',
          fillColor: '#dedede'
        },
        // Item Title
        itemTitle: {
          bold: true,
        },
        itemSubTitle: {
          italics: true,
          fontSize: 11
        },
        itemNumber: {
          margin: [0, 5, 0, 5],
          alignment: 'center',
          fontSize: 10,
        },
        itemTotal: {
          margin: [0, 5, 0, 5],
          alignment: 'right'

        },
        itemTotalBalance: {
          margin: [0, 5, 0, 5],
          alignment: 'right',
          bold: true

        },
        itemText: {
          margin: [0, 5, 0, 5],
          alignment: 'left',
          fontSize: 12,
        },
        itemSummary: {
          margin: [0, 5, 0, 5],
          alignment: 'center',
          fontSize: 12,
        },
        itemCurrency: {
          margin: [0, 5, 0, 5],
          alignment: 'right',
          fontSize: 10,
        },
        // Items Footer (Subtotal, Total, Tax, etc)
        itemsFooterTotalValue: {
          margin: [0, 5, 0, 5],
          alignment: 'right',
        },
        itemsMessage: {
          margin: [0, 5, 0, 5],
          bold: true,
          alignment: 'left',
        },
        sectionHeader: {
          fontSize: 14,
          color: '#444444',
          bold: true,
          fillColor: '#2361AE',
          margin: [0, 5, 0, 5]
        },
        section: {
          fontSize: 10,
          color: '#000000',
          margin: [0, 5, 0, 5]
        },
      },
      defaultStyle: {
        columnGap: 20

      }
    };

    this.addPdfItems(def);

    return def;
  }

  addPdfItems(def: any) {
    var pdfItem = this.getPdfItemMessage();
    def.content[4].table.body.push(pdfItem);
    //if(this.receipt.totalDiscount>0){
    def.content[4].table.body.push(this.getPdfDiscount());
    //}
    if (this.receipt.creditUsed > 0) {
      def.content[4].table.body.push(this.getPdfMemberCredit());
    }
    def.content[4].table.body.push(this.getPdfPayBy());
    return def;
  }

  getPdfItemMessage() {
    var rowSpan = 4; var totalRowSpan = 0;
    if (this.receipt.creditUsed > 0 && this.receipt.totalDiscount > 0) {
      totalRowSpan = 0; rowSpan = 4;
    }
    else if (this.receipt.creditUsed > 0 && !(this.receipt.totalDiscount > 0)) {
      totalRowSpan = 2; rowSpan = 4;
    }
    else if (this.receipt.totalDiscount > 0 && !(this.receipt.creditUsed > 0)) {
      totalRowSpan = 0; rowSpan = 3;
    }
    else {
      totalRowSpan = 2; rowSpan = 3;
    }
    return [
      {
        text: 'Important Message: ' + this.notesAndAnnouncements, colSpan: 2, rowSpan: rowSpan, style: 'itemMessage'
      },
      {

      },
      {
        text: 'Total', rowSpan: totalRowSpan, style: 'itemsFooterTotalValue'
      },
      {
        text: '$' + this.receipt.totalAmount.toFixed(2), rowSpan: totalRowSpan, style: 'itemTotal'
      }
    ]
  }

  getPdfDiscount() {
    var rowSpan = 0;
    if (!(this.receipt.creditUsed > 0)) rowSpan = rowSpan + 1;
    return [
      {
        text: '', rowSpan: rowSpan, style: 'itemMessage'
      },
      {

      },
      {
        text: 'Discount', style: 'itemsFooterTotalValue'
      },
      {
        text: '$' + this.receipt.totalDiscount.toFixed(2), style: 'itemTotal'
      }
    ]
  }

  getPdfMemberCredit() {
    var rowSpan = 0;
    if (!(this.receipt.totalDiscount > 0)) rowSpan = 1;
    return [
      {
        text: '', rowSpan: rowSpan, style: 'itemMessage'
      },
      {

      },
      {
        text: 'Member Credit Used', style: 'itemsFooterTotalValue'
      },
      {
        text: '$' + this.receipt.creditUsed.toFixed(2), style: 'itemTotal'
      }
    ]
  }

  getPdfPayBy() {
    var rowSpan = 0;
    // if(!(this.receipt.totalDiscount>0) || !(this.receipt.creditUsed>0)) rowSpan=2;

    return [
      {
        text: '', style: 'itemMessage'
      },
      {

      },
      {
        text: 'Pay By', style: 'itemsFooterTotalValue'
      },
      {
        text: this.receipt.paymentTransactions[0].paymentType === 'CreditCard' ? this.receipt.paymentTransactions[0].cardType : this.receipt.paymentTransactions[0].paymentType, style: 'itemSummary'
      }
    ]
  }

}
