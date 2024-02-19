import { HttpParams } from '@angular/common/http';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { AppBreadcrumbService } from 'src/app/app.breadcrumb.service';
import { EventSession } from 'src/app/models/event-session';
import { AuthService } from 'src/app/services/auth.service';
import { InvoiceItemService } from 'src/app/services/invoice-item.service';
import { InvoiceService } from 'src/app/services/invoice.service';
import { ShoppingCartService } from 'src/app/services/shopping-cart.service';

@Component({
  selector: 'app-eventinvoice',
  templateUrl: './eventinvoice.component.html',
  styleUrls: ['./eventinvoice.component.scss']
})
export class EventinvoiceComponent implements OnInit {
  @Output() activeTabEvent = new EventEmitter<number>();
  eventSession : EventSession;
  invoice : any;
  newInvoiceId : number;
  showInvoice:boolean;
  existingInvoiceDetailsList: any[];
  items: any[] = new Array();
  logo: any;
  showEmail: boolean;
  emailForm: FormGroup;
  hideSendEmailButton: boolean = false;
  addErrorMessages: any = {};
  shoppingCart: any;
  showNote : boolean;
  invoiceNoteForm: FormGroup;

  constructor(
  private invoiceService: InvoiceService,
    private invoiceItemService: InvoiceItemService,
    private formBuilder: FormBuilder,
    private messageService: MessageService,
    private shoppingCartService: ShoppingCartService,
    private authService: AuthService,
    private breadcrumbService: AppBreadcrumbService,
    private router: Router) { }

  ngOnInit(): void {
    this.emailForm = this.formBuilder.group({
      PersonId: [0],
      ToEmail: ['', [Validators.required, Validators.email]],
      Subject: ['', [Validators.required, this.noBlankValidator]],
    });

    this.invoiceNoteForm = this.formBuilder.group({
      InvoiceId: [0],
      Note: ['', [Validators.required]]
    });

    this.eventSession = JSON.parse(localStorage.getItem('NewEventRegistrationSession'));
    this.newInvoiceId = this.eventSession.invoiceId;
    this.getReceiptData(this.newInvoiceId);
  }
  getReceiptData(invoiceid: any) {
    let searchParams = new HttpParams();
    searchParams = searchParams.append('invoiceId', invoiceid);
    const opts = { params: searchParams };

    this.invoiceService.getInvoiceDetail(opts).subscribe((data: any) => {
      console.log(data);
      this.invoice = data;
      // this.bindItems();
      this.getHeaderImage();
      this.showInvoice = true;
    })
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

  showPdf() {
    this.invoiceService.getEventPaperInvoicePdfByInvoiceId(this.invoice.invoiceId, this.invoice.organization.organizationId).subscribe((data: any) => {
      //console.log(data);
      let parsedResponse = (data)
      var blob = new Blob([data], { type: 'application/pdf' });
      var filename = 'Invoice-' + this.invoice.invoiceId + '.pdf';
      let blobUrl: string = window.URL.createObjectURL(blob);
      window.open(blobUrl, '_blank', "width=800,height=600");
      // printJS(blobUrl);
    });
  }

  showEmailDialog() {
    let billablePersonEmail = '';
    if (this.invoice.billingAddress) {
      billablePersonEmail = this.invoice.billingAddress.billToEmail;

    }
    this.emailForm.get('ToEmail').setValue(billablePersonEmail);
    this.emailForm.get('Subject').setValue('Your Event Registration Invoice');
    this.showEmail = true;
  }

  hideEmailDialog() {
    this.showEmail = false;
    this.hideSendEmailButton = false;
    this.emailForm.reset();
  }

  sendEmail() {
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

  addToCart(){
    console.log('Adding invoice to cart for Id:' + this.invoice.invoiceId.toString());
    const formData = new FormData();
    formData.append('invoiceId', this.invoice.invoiceId.toString());
    this.shoppingCartService.addInvoiceToCart(formData).subscribe((data: any) =>
    {
      console.log(data);
      this.shoppingCart = data;
      if(this.shoppingCart.shoppingCartId > 0){

        //Set cartId in session
        this.authService.addCart(this.shoppingCart.shoppingCartId);
        this.breadcrumbService.setCart(this.shoppingCart.shoppingCartId);

        this.router.navigate(['/checkout'], {
          queryParams: { cartId: this.shoppingCart.shoppingCartId }
        });
       
      }
      else {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to add invoice to cart.', life: 3000 });
      }
    },
    error =>
    {            
      this.messageService.add({ severity: 'error', summary: 'Error', detail: error, life: 3000 });
    });
  }

  setActiveTab(value: number) {
    this.activeTabEvent.emit(value);
    console.log('Set Active Tab ->:' + value);
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
    if(this.showNote)
    {
      if ((!this.invoiceNoteForm.get(field).valid)) {
        this.addErrorMessages = { errorType: 'required', controlName: field };
        return true;
      }
    }
    else
    {
      if ((!this.emailForm.get(field).valid)) {
        this.addErrorMessages = { errorType: 'required', controlName: field };
        return true;
      }
    }
  }

  addNote() {
    this.showNote = true;
  }

  noteValidation(event) {
    this.invoiceNoteForm.get('Note').setValue(event.target.value.trim());
  }

  hideNoteDialog() {
    this.showNote = false;
  }

  saveNote() {
    if(this.invoiceNoteForm.valid)
    {
      this.invoice.notes = this.invoiceNoteForm.get('Note').value,
      this.invoiceService.updateInvoice(this.invoice).subscribe(response => {
        this.messageService.add({
          severity: 'success',
          summary: 'Successful',
          detail: 'Note Added succesfully.',
          life: 3000
        });
        this.getReceiptData(this.newInvoiceId);
        this.hideNoteDialog();

      },
        error => {
          console.log(error);
          this.messageService.add({ severity: 'error', summary: 'Error', detail: error, life: 3000 });
        });
    }
    }
}
