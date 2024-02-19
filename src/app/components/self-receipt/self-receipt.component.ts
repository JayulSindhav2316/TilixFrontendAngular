import { Component, OnInit } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { ReceiptService } from '../../services/receipt.service';
import { AuthService } from '../../services/auth.service';
import { formatDate } from "@angular/common";
import { LOCALE_ID } from "@angular/core";
import { Inject } from "@angular/core";
import { InvoiceService } from '../../services/invoice.service';
import { Router , ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-self-receipt',
  templateUrl: './self-receipt.component.html',
  styleUrls: ['./self-receipt.component.scss']
})
export class SelfReceiptComponent implements OnInit {
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
  cartId: number;
  addErrorMessages : any = {};
  submitted: boolean;
  paymentToken: string;
  paymentResponse: any;

  constructor(private activateRoute: ActivatedRoute, private authService: AuthService, @Inject( LOCALE_ID ) localID: string,  private receiptService: ReceiptService,private invoiceService: InvoiceService) { 
    this.showReceipt = false;
    this.localID = localID;
  }

  ngOnInit(): void {
    this.activateRoute.queryParams.subscribe(params => {
      this.cartId = params.cartId;
    });
    this.paymentToken = localStorage.getItem("PaymentToken");
    this.getPaymentReceipt();
  }

  getPaymentReceipt(){
  
    console.log('Fetching Receipt for cart Id:' + this.paymentToken);
    const body = {
      paymentToken: this.paymentToken,
      cartId:this.cartId
    };
    this.authService.getSelfPaymentReceipt(body).subscribe((data: any) =>
    {
      console.log(data);
      this.paymentResponse = data;
      this.receipt = data.receipt;
      this.showReceipt = true;
      this.getHeaderImage();
    });
  }

  getReceiptPdf(){
    console.log("Get Receipt PDF:"+ JSON.stringify(this.receipt));
    this.receiptService.getReceiptPdfByReceiptId(this.receipt.receiptid ).subscribe((data: any) =>
    {
      //console.log(data);
      let parsedResponse =(data)
      var blob = new Blob([data], {type: 'application/pdf'});
      var filename = 'Receipt-'+this.receipt.receiptid+'.pdf';
     
        let blobUrl: string = window.URL.createObjectURL(blob);
        window.open(blobUrl); 
        var a         = document.createElement('a');
        a.href        = blobUrl; 
        a.target      = '_blank';
        a.download    = filename;
        document.body.appendChild(a);
        a.click();
      
    } );
  }
  getHeaderImage()
  {
    this.invoiceService.getHeaderImage(this.receipt.organizationId).subscribe(data => {
        this.createImageFromBlob(data);
        console.log(data);
    }, error => {
      console.log(error);
    });
  }
  async showPdf() {
    this.getReceiptPdf()
  }
  createImageFromBlob(image: Blob) {
    let reader = new FileReader();
    reader.addEventListener('load', () => {
      this.logo = [reader.result];
    }, false);
    if (image) {
      reader.readAsDataURL(image);
      this.showReceipt=true;
    }
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
                      text: receipt.organization.website,link: 'https://'+receipt.organization.website,
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
                widths: ['50%','50%'],
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
            widths: ['10%', '60%', '15%', '15%'],
            body: [
              // Table Header
              [
                {
                  text: 'Quantity',
                  style:  ['itemsHeader']
                },
                {
                  text: 'Description',
                  style:  ['itemsHeader']
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
              // { text:  p.amount, style: 'itemCurrency' },
              // { text:  p.amount, style: 'itemCurrency' }])),
              ...this.receipt.lineItems.map(p => ([{ text: p.quantity,  style: 'itemNumber' },
              { text: p.description + p.membershipCategory + p.membershipName, style: 'itemText' },
              { text:  p.amount, style: 'itemCurrency' },
              { text:  p.amount, style: 'itemCurrency' }])),
              [
                 { 
                    text: 'Important Message: ' + this.receipt.notes, colSpan:2, rowSpan:3, style: 'itemMessage' 
                  },
                {

                },  
                {
                  text: 'Total', style: 'itemsFooterTotalValue'  
                }, 
                { 
                  text: '$' + this.receipt.totalAmount.toFixed(2), style: 'itemTotal' 
                }
            ],
            [
                { 
                  text: '', colSpan:2, style: 'itemMessage' 
                },
                {

                },  
                {
                  text: 'Balance', style: 'itemsFooterTotalValue' 
                }, 
                { 
                  text: 'none' , style: 'itemsFooterTotalValue'  
                }
            ],
            [
              { 
                text: '', style: 'itemMessage' 
              },
              {

              },  
              {
                text: 'Pay By', style: 'itemsFooterTotalValue' 
              }, 
              { 
                text: receipt.paymentTransactions[0].cardType, style: 'itemSummary' 
              }
            ]         
              // END Items
            ],
            
          }, // table
          layout:{
            paddingBottom: (rowIndex: number, node: any, colIndex: number) => {
                const DEFAULT_PADDING = 2;
        
                // Calculate padding for the last element of the table.
                if (rowIndex === node.table.body.length - 4) {
                    const currentPosition = node.positions[node.positions.length - 1];
                    const totalPageHeight = currentPosition.pageInnerHeight;
                    const currentHeight = currentPosition.top;
                    const paddingBottom = totalPageHeight - currentHeight - 100;
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
          alignment:'right'
        },
        invoiceSubTitle: {
          fontSize: 12,
          alignment:'left'
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
          alignment:'center',
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
    return def;
   // pdfMake.createPdf(content).print({}, window.frames['printPdf']);
  }
}
