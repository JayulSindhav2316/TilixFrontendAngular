import { Component, OnInit, Input } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { AppBreadcrumbService } from '../../../app.breadcrumb.service';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { PersonService } from '../../../services/person.service';
import { MembershipService } from '../../../services/membership.service';
import { HttpParams } from '@angular/common/http';
import { MembershipSession } from '../../../models/membership-session';
import { Output, EventEmitter } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { EventCommunicationService } from '../../../services/event-communication.service'
import { InvoiceService } from '../../../services/invoice.service';
import { ShoppingCartService } from '../../../services/shopping-cart.service';
import { AuthService } from '../../../services/auth.service';
import { MenuService } from 'src/app/app.menu.service';
import { PdfService } from '../../../services/pdf.service';
import { formatDate } from "@angular/common";
import { Inject } from "@angular/core";
import { LOCALE_ID } from "@angular/core";
import { EntityService } from '../../../services/entity.service';
import * as printJS from "print-js";
@Component({
  selector: 'app-invoice',
  templateUrl: './invoice.component.html',
  styleUrls: ['./invoice.component.scss']
})
export class InvoiceComponent implements OnInit {

@Output() activeTabEvent = new EventEmitter<number>();
membershipFees: any[];
additionalMembers: any[];
membershipType: { name: string; code: string; periodName: string};
billableMember: { firstName: string, lastName: string, gender: string, age: number};
membershipSession: MembershipSession;
showAdditionalMemberTable: boolean;
showLoader: boolean;
showInvoice: boolean;
showEmail: boolean; 
emailForm: FormGroup;
invoice: any;
editorData: any;
billablePersonEmail: string;
shoppingCart: any;
pdfMake: any;
currentDate: string;
public localID: string;
billingAddress: any;
addErrorMessages : any = {};
submitted: boolean;
invoicePdf: any;
printInvoiceDetails: any[];
invoiceNotesExist: boolean;
notesSection: any = {};
hideBackButton: boolean;
disablePayment: boolean;
logo: any;
    constructor(
      private breadcrumbService: AppBreadcrumbService,
      private messageService: MessageService,
      private confirmationService: ConfirmationService,
      private router: Router,
      private route: ActivatedRoute,
      private personService: PersonService,
      private invoiceService: InvoiceService,
      private membershipService: MembershipService,
      private eventCommunicationService: EventCommunicationService,
      private shoppingCartService: ShoppingCartService,
      private authService: AuthService,
      private pdfService: PdfService,
      private formBuilder: FormBuilder,
      private menuService: MenuService,
      private entityService: EntityService,
      @Inject( LOCALE_ID ) localID: string
    ) {
          this.membershipType = { name: '', code: '', periodName: ''};
          this.billableMember = { firstName: '', lastName: '', gender: '', age: 0};
          this.showEmail= false;
          this.localID = localID;
          this.hideBackButton = false;
    }

    ngOnInit(): void {
        this.showLoader = true;
        this.showInvoice = false;
        this.showEmail= false;
        this.disablePayment=false;
        
        this.membershipSession  = JSON.parse(localStorage.getItem('NewMembershipSession'));
        console.log('Retrived Membership Session:'+JSON.stringify(this.membershipSession));

        if(this.membershipSession.billableEntityId > 0 && this.membershipSession.membershipTypeId > 0){

          if(this.membershipSession.currentTab === 4) {
            // disable all precvious Tabs

            // Create Invoice
            this.createMembershipInvoice();
            this.emailForm = this.formBuilder.group({
              PersonId: [0],
              ToEmail: ['', [Validators.required, Validators.email]],
              Subject: ['', [Validators.required, this.noBlankValidator]]
            });
            this.getBillingAddress(this.membershipSession.billableEntityId);
            
          }
        }
  }

  getBillingAddress(entityId: number){
    console.log('Fetching Address for Id:' + entityId.toString());
    let searchParams = new HttpParams();
    searchParams = searchParams.append('entityId', entityId.toString());
    const opts = {params: searchParams};
    this.entityService.getBillingAddressByEntityId(opts).subscribe((data: any) =>
    {
      console.log(data);
      this.billingAddress = data;
      //this.invoice.billingAddress=data;
    });
  }
   createMembershipInvoice(){
    const currentUser = this.authService.currentUserValue;
    const body = {
      MembershipId: 0,
      BillableEntityId: this.membershipSession.billableEntityId,
      EntityId: this.membershipSession.entityId,
      PrimaryMemberEntityId: this.membershipSession.primaryMemberEntityId,
      MembershipTypeId: this.membershipSession.membershipTypeId,
      MembershipFeeIds: this.membershipSession.membershipFeeIds,
      AdditionalPersons: this.membershipSession.additionalMembers,
      StartDate: this.membershipSession.startDate,
      EndDate: this.membershipSession.endDate,
      UserId: currentUser.id.toString(),
      Notes: this.membershipSession.notes,
      MembershipFees: this.membershipSession.membershipFees,
    }
    console.log('Create New Membership:' + JSON.stringify(body));

    this.membershipService.createMembership(body).subscribe(
      response => {
        this.messageService.add({ severity: 'success',
                                  summary: 'Successful',
                                  detail: 'Membership has been created succesfully.',
                                  life: 3000
                                });
        this.billablePersonEmail = response.billableMemberEmail
        // Get Invoice 
        this.getInvoiceDetails(response.invoiceId);
        console.log('Create Membership response: ' + JSON.stringify(response));
        this.sendMessage(response.invoiceId);
        this.showLoader=false;
        this.showInvoice=true;
        this.invoice=response;
        if(this.invoice.amount===0){
          this.disablePayment=true;
        }
      },
      error => {
        console.log(error);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: error, life: 3000 });
      });
    }

    sendMessage(message): void {
      // send message to subscribers via observable subject
      this.eventCommunicationService.sendMessage(message);
  }

  clearMessages(): void {
      // clear messages
      this.eventCommunicationService.clearMessages();
  }

  getInvoiceDetails(invoiceId: number){
    console.log('Fetching Invoice data for Id:' + invoiceId.toString());
    let searchParams = new HttpParams();
    searchParams = searchParams.append('invoiceId', invoiceId.toString());
    const opts = {params: searchParams};
    this.invoiceService.getInvoiceDetail(opts).subscribe((data: any) =>
    {
      console.log(data);
      this.invoice = data;
      this.setEditorText();
      this.getHeaderImage();
      this.checkForInvoiceNotes(this.invoice.notes);
    });
  }

  showEmailDialog(){
    this.emailForm.get('ToEmail').setValue(this.billingAddress.billToEmail);
    this.emailForm.get('Subject').setValue('Your Membership Invoice');
    this.showEmail=true;
  }

  getInvoiceEmailBody(){
    console.log('Fetching EMail Text' + this.invoice.invoiceId);
    this.invoiceService.getInvoiceEmailText(this.invoice.invoiceId.toString()).subscribe((data: any) =>
    {
      console.log(data);
      this.editorData=data;
      this.showEmail=true;
    });
  }

  hideEmailDialog(){
     this.showEmail=false;
     this.emailForm.reset();
  }

  sendEmail(){
    this.submitted=true;
    this.hideBackButton=true;
    this.emailInvoice();
    if(this.emailForm.valid)
      this.showEmail=false;
  }

  emailInvoice(){
    if(this.emailForm.valid){
      const body ={ 
          receipientAddress: this.emailForm.get('ToEmail').value,
          subject: this.emailForm.get('Subject').value,
          invoiceId: this.invoice.invoiceId.toString(),
      }
      this.showLoader = true;
      this.invoiceService.emailInvoice(body).subscribe((data: any) =>
      {
        console.log(data);
        if(data === true)
        {
          this.messageService.add({ severity: 'success',
          summary: 'Successful',
          detail: 'Email has been sent succesfully.',
          life: 3000
        });
       
        }
        else{
          this.messageService.add({ severity: 'warn', 
                    summary: 'Warning', 
                    detail: 'An error has occured. Please try later.', 
                    life: 3000 });
        }
      });
      this.showLoader = false;
    }
    else{
      this.messageService.add({ severity: 'warn', 
                summary: 'Warning', 
                detail: 'Please enter the required information.', 
                life: 3000 });
    }

  }

  addToCart(){
    console.log('Adding invoice to cart for Id:' + this.invoice.invoiceId.toString());
    const formData = new FormData();
    formData.append('invoiceId', this.invoice.invoiceId.toString());
    this.shoppingCartService.addInvoiceToCart(formData).subscribe((data: any) =>
    {
      this.hideBackButton=true;
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
        this.hideBackButton=false;
      }
    },
    error =>
    {            
      this.messageService.add({ severity: 'error', summary: 'Error', detail: error, life: 3000 });
    });
  }

  setEditorText(){
    this.editorData= 'Dear '+ this.billingAddress.billToName + '</B>. Please login to member portal to make the payments.';
  }

  showPdf(){
    this.invoiceService.getPaperInvoicePdfByInvoiceId(this.invoice.invoiceId,this.invoice.organization.organizationId).subscribe((data: any) =>
    {
      //console.log(data);
      let parsedResponse =(data)
      var blob = new Blob([data], {type: 'application/pdf'});
      var filename = 'Invoice-'+this.invoice.invoiceId+'.pdf';
      let blobUrl: string = window.URL.createObjectURL(blob);
      // printJS(blobUrl);
      window.open(blobUrl,'_blank',"width=800,height=600");
    } );
  }
 

  async downloadPdf() {
    this.invoiceService.getPaperInvoicePdfByInvoiceId(this.invoice.invoiceId,this.invoice.organization.organizationId).subscribe((data: any) =>
    {
      //console.log(data);
      let parsedResponse =(data)
      var blob = new Blob([data], {type: 'application/pdf'});
      this.invoicePdf = data;
    } );
  }
  
  getHeaderImage()
  {
    this.invoiceService.getHeaderImage(this.invoice.organization.organizationId).subscribe(data => {
      return new Promise((resolve, reject) => {
        let reader = new FileReader();
        reader.addEventListener('load', () => {
          this.logo = [reader.result];
        }, false);
        if (data) {
          reader.readAsDataURL(data);
        }
      }
        );
    }, error => {
      console.log(error);
    });
  }

  async createImageFromBlob(image: Blob) {
    return new Promise((resolve, reject) => {
    let reader = new FileReader();
    reader.addEventListener('load', () => {
      this.logo = [reader.result];
    }, false);
    if (image) {
      reader.readAsDataURL(image);
    }
  }
    )};

    errorIconCss(field: string) {
      return {'has-feedback': this.isFieldValid(field)};
    }
  
    errorFieldCss(field: string) {
      return {'ng-dirty': this.isFieldValid(field)};
    }
  
    isFieldValid(field: string) {    
      if ((!this.emailForm.get(field).valid) && (this.submitted) && (this.emailForm.get(field).hasError('required'))){
        if (field == 'ToEmail')
            field = 'Email'
        this.addErrorMessages =  { errorType: 'required', controlName: field };
        return true;
      }
      if (!this.emailForm.get(field).valid && this.emailForm.get(field).hasError('email')){
        this.addErrorMessages =  { errorType: 'email', controlName: field };
      return true;
    }
    }
  
    resetSubmitted(field){
      this.submitted = false;
      this.isFieldValid(field);
    }

    matcher(event: ClipboardEvent, formControlName: string): boolean {
      this.emailForm.get(formControlName).reset();
      var allowedRegex = "";
      if (formControlName == 'Subject') 
          allowedRegex = ("^[A-Za-z ']{0,64}$");
      if (event.type == "paste") {
        let clipboardData = event.clipboardData;
        let pastedText = clipboardData.getData('text'); 
        if (!pastedText.match(allowedRegex))  {
          event.preventDefault();
          return false;
       }
       return true;
    }
    }
    
    noBlankValidator(control: FormControl)
    {
      const isWhitespace = (control.value || '').trim().length === 0;
      const isValid = !isWhitespace;
      return isValid ? null : { 'required': true };
    }

  checkForInvoiceNotes(invoiceNotes: string)
  {
    if(invoiceNotes){
      if(invoiceNotes.length>0){
        this.invoiceNotesExist = true;
      }
    }
    else{
      this.invoiceNotesExist = false;
    }
  }

  goBack(){
    // revert the current transaction
    const currentUser = this.authService.currentUserValue;
    const body = {
      MembershipId: this.invoice.membershipId,
      PersonId: this.invoice.billablePersonId,
      InvoiceId: this.invoice.invoiceId,
      UserId: currentUser.id.toString()
    }
    console.log('Cancel New Membership:' + JSON.stringify(body));

    this.membershipService.CancelNewMembership(body).subscribe(
      response => {
        this.messageService.add({ severity: 'success',
                                  summary: 'Successful',
                                  detail: 'Invoice has been cancelled. You can make changes now.',
                                  life: 3000
                                });
        this.showLoader=false;
        this.setActiveTab(3);
        
      },
      error => {
        console.log(error);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: error, life: 3000 });
      });
  }

  setActiveTab(value: number) {
    this.activeTabEvent.emit(value);
    console.log('Set Active Tab ->:' + value);
  }


  resetMembershipSession(){
     //Reset Membership Session
     this.membershipSession = {	billableEntityId: 0, 
      primaryMemberEntityId:0,
      entityId:0,
      currentTab: 0,
      membershipId: 0,
      additionalMembers: [],
      membershipTypeId: 0,
      membershipFeeIds: []};
      const jsonData = JSON.stringify(this.membershipSession);
      localStorage.setItem('NewMembershipSession', jsonData);
  }
}