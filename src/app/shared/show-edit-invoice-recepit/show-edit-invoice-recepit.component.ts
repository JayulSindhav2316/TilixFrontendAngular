import { HttpParams } from '@angular/common/http';
import { Component, Inject, Input, LOCALE_ID, OnInit, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { InvoiceService } from 'src/app/services/invoice.service';
import { formatDate } from "@angular/common";
import { ReceiptService } from 'src/app/services/receipt.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ShoppingCartService } from 'src/app/services/shopping-cart.service';
import { AppBreadcrumbService } from 'src/app/app.breadcrumb.service';
import * as moment from 'moment';
import { InvoiceItemService } from 'src/app/services/invoice-item.service';
import { PersonService } from 'src/app/services/person.service';
import { EntityService } from 'src/app/services/entity.service';
import * as printJS from 'print-js';
import { CompanyService } from 'src/app/services/company.service';

@Component({
  selector: 'app-show-edit-invoice-recepit',
  templateUrl: './show-edit-invoice-recepit.component.html',
  styleUrls: ['./show-edit-invoice-recepit.component.scss'],
})
export class ShowEditInvoiceRecepitComponent implements OnInit {
  @Input() invoiceId: number;
  @Input() previousInvoiceId: number;
  @Output() closeEvent = new EventEmitter<string>();

  person: any;
  entity: any;
  showReceipt: boolean;
  itemInvoice: boolean;
  //receiptId: number;
  currentUser: any;
  invoice: any;
  emailForm: FormGroup;
  showEmail: boolean;
  pdfMake: any;
  receiptPdf: any;
  logo: any;
  public localID: string;
  receiptNoteForm: FormGroup;
  submitted: boolean;
  addErrorMessages: any = {};
  showNote: boolean;
  hideBackButton: boolean;
  shoppingCart: any;
  existingInvoiceDetailsList: any[];
  items: any[] = new Array();
  membershipInvoice: boolean;
  itemModel: {
    InvoiceDetailId: any;
    ItemId: any;
    Description: any;
    Quantity: any;
    UnitRate: any;
  };
  companyInvoice: boolean;
  company: any;
  hideAddCartButton: boolean = false;
  hideSendEmailButton: boolean = false;

  constructor(private activateRoute: ActivatedRoute,
    private authService: AuthService,
    private invoiceService: InvoiceService,
    private formBuilder: FormBuilder,
    private receiptService: ReceiptService,
    private messageService: MessageService,
    private shoppingCartService: ShoppingCartService,
    private breadcrumbService: AppBreadcrumbService,
    private router: Router,
    @Inject(LOCALE_ID) localID: string,
    private invoiceItemService: InvoiceItemService,
    private personService: PersonService,
    private entityService: EntityService,
    private companyService: CompanyService
  ) {
    this.hideBackButton = false;
    this.localID = localID;
    this.membershipInvoice = true;
  }

  ngOnInit(): void {
    this.currentUser = this.authService.currentUserValue;
    this.showEmail = false;

    this.receiptNoteForm = this.formBuilder.group({
      ReceiptId: [0],
      Note: ['', [Validators.required]]
    });

    this.emailForm = this.formBuilder.group({
      PersonId: [0],
      ToEmail: ['', [Validators.required, Validators.email]],
      Subject: ['', [Validators.required, this.noBlankValidator]],
    });

    if (this.invoiceId != 0) {
      this.getReceiptData(this.invoiceId);
    }
  }

  getHeaderImage() {
    this.invoiceService.getHeaderImage(this.invoice.organization.organizationId).subscribe(data => {
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
    }
  }

  getReceiptData(invoiceid: any) {
    let searchParams = new HttpParams();
    searchParams = searchParams.append('invoiceId', invoiceid);
    const opts = { params: searchParams };

    this.invoiceService.getInvoiceDetail(opts).subscribe((data: any) => {
      console.log(data);
      this.invoice = data;
      if (this.invoice.membership) {
        this.membershipInvoice = true;
      } else {
        this.membershipInvoice = false;
      }
      this.bindItems();
      this.getHeaderImage();
      this.showReceipt = true;
      this.itemInvoice = false;
    })
  }

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

  showEmailDialog() {
    let billablePersonEmail = '';
    if (this.invoice.billingAddress) {
      billablePersonEmail = this.invoice.billingAddress.billToEmail;

    }
    this.emailForm.get('ToEmail').setValue(billablePersonEmail);
    this.emailForm.get('Subject').setValue('Your Invoice');
    this.showEmail = true;
  }


  showPdf() {
    this.invoiceService.getPaperInvoicePdfByInvoiceId(this.invoice.invoiceId, this.invoice.organization.organizationId).subscribe((data: any) => {
      //console.log(data);
      let parsedResponse = (data)
      var blob = new Blob([data], { type: 'application/pdf' });
      var filename = 'Invoice-' + this.invoice.invoiceId + '.pdf';
      let blobUrl: string = window.URL.createObjectURL(blob);
      window.open(blobUrl, '_blank', "width=800,height=600");
      // printJS(blobUrl);
    });
  }

  async downloadPdf() {
    this.invoiceService.getPaperInvoicePdfByInvoiceId(this.invoice.invoiceId, this.invoice.organization.organizationId).subscribe((data: any) => {
      //console.log(data);
      let parsedResponse = (data)
      var blob = new Blob([data], { type: 'application/pdf' });
      this.receiptPdf = data;
    });
  }

  noBlankValidator(control: FormControl) {
    const isWhitespace = (control.value || '').trim().length === 0;
    const isValid = !isWhitespace;
    return isValid ? null : { 'required': true };
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

  hideEmailDialog() {
    this.showEmail = false;
    this.hideSendEmailButton = false;
    this.emailForm.reset();
  }

  sendEmail() {
    this.submitted = true;
    this.hideBackButton = true;
    this.hideSendEmailButton = true;
    this.emailInvoice();
    if (this.emailForm.valid)
      this.showEmail = false;
  }

  emailInvoice() {
    if (this.emailForm.valid) {
      const body = {
        receipientAddress: this.emailForm.get('ToEmail').value,
        subject: this.emailForm.get('Subject').value,
        invoiceId: this.invoice.invoiceId.toString(),
      }
      this.invoiceService.emailInvoice(body).subscribe((data: any) => {
        console.log(data);
        if (data === true) {
          this.hideBackButton = true;
          this.hideSendEmailButton = true;
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

  addToCart() {
    console.log('Adding invoice to cart for Id:' + this.invoiceId.toString());
    const formData = new FormData();
    formData.append('invoiceId', this.invoiceId.toString());
    this.shoppingCartService.addInvoiceToCart(formData).subscribe((data: any) => {
      console.log(data);
      this.shoppingCart = data;
      if (this.shoppingCart.shoppingCartId > 0) {
        this.hideBackButton = true;
        //Set cartId in session
        this.authService.addCart(this.shoppingCart.shoppingCartId);
        this.breadcrumbService.setCart(this.shoppingCart.shoppingCartId);
        this.hideAddCartButton = true;
        this.messageService.add({
          severity: 'success',
          summary: 'Successful',
          detail: 'Items has been added to cart succesfully.',
          life: 3000
        });
      }
      else {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to add invoice to cart.', life: 3000 });
        this.hideBackButton = false;
        this.messageService.add({
          severity: 'success',
          summary: 'Successful',
          detail: 'Failed to add invoice to cart.',
          life: 3000
        });
      }
    },
      error => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: error, life: 3000 });
      });
  }

  getPersonById() {
    let searchParams = new HttpParams();
    searchParams = searchParams.append('personId', this.entity.personId.toString());
    const opts = { params: searchParams };
    this.personService.getPersonById(opts).subscribe((data: any[]) => {
      this.person = data;
      this.itemInvoice = true;
      this.showReceipt = false;
      this.companyInvoice = false;
    });
  }

  getCompanyById() {
    let searchParams = new HttpParams();
    searchParams = searchParams.append('companyId', this.entity.companyId.toString());
    const opts = { params: searchParams };
    this.companyService.getCompanyById(opts).subscribe((data: any[]) => {
      console.log(data);
      this.company = data;
      this.itemInvoice = true;
      this.showReceipt = false;
      this.companyInvoice = true;
    });
  }

  getEntityById() {
    let searchParams = new HttpParams();
    searchParams = searchParams.append('entityId', this.invoice.billableEntityId.toString());
    const opts = { params: searchParams };
    this.entityService.getEntityById(opts).subscribe((data: any[]) => {
      this.entity = data;
      if (this.entity.personId) {
        this.getPersonById();
      }
      else {
        this.getCompanyById();
      }
    });
  }

  goBack() {
    this.previousInvoiceId = 0;
    this.getEntityById();
  }

  closeItemInvoice(data) {
    if (data == "close" || data==undefined) {
      this.closeEvent.emit();
    }
    else {
      if (this.previousInvoiceId != 0 && this.previousInvoiceId != undefined) {
        this.invoiceId = this.previousInvoiceId;
      }
      this.itemInvoice = false;
      this.getReceiptData(this.invoiceId);
      this.showReceipt = true;
    }
  }

  bindItems() {
    let searchParams = new HttpParams();
    searchParams = searchParams.append('invoiceId', this.invoiceId.toString());
    const opts = { params: searchParams };
    this.existingInvoiceDetailsList = this.invoice.invoiceDetails;
    this.existingInvoiceDetailsList.forEach(item => {
      let searchParams = new HttpParams();
      searchParams = searchParams.append('itemId', item.itemId);
      const opts = { params: searchParams };
      this.items = new Array();
      this.invoiceItemService.getInvoiceItemById(opts).subscribe((data: any) => {
        let generalInvoiceItem: any = {};
        generalInvoiceItem.InvoiceDetailId = item.invoiceDetailId;
        generalInvoiceItem.LineItemId = item.itemId;
        generalInvoiceItem.ItemCode = data.itemCode;
        generalInvoiceItem.ItemCodeSearch = data.itemCode;
        generalInvoiceItem.Description = data.name;
        generalInvoiceItem.DescriptionSearch = data.description;
        generalInvoiceItem.Quantity = item.quantity;
        generalInvoiceItem.Rate = item.price;
        generalInvoiceItem.Amount = item.amount;
        generalInvoiceItem.StockCount = data.stockCount;
        generalInvoiceItem.ItemType = data.itemType;
        generalInvoiceItem.EnableStock = data.enableStock
        this.items.push(generalInvoiceItem);
      });

    });
  }

  onNewCreate() {
    this.previousInvoiceId = this.invoiceId;
    this.invoiceId = 0;
    this.getEntityById();
  }
}
