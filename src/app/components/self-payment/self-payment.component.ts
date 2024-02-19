import { Component, OnInit, Input } from '@angular/core';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { Router , ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { ShoppingCartService } from '../../services/shopping-cart.service';
import { AuthService } from '../../services/auth.service';
import { HttpParams } from '@angular/common/http';
import { FormBuilder, FormControl } from '@angular/forms';
import { Validators } from '@angular/forms';
import { TK_CONFIG, Config, AcceptJSService, CreditCard } from '@openutility/acceptjs-angular-wrapper';
import { EventCommunicationService } from '../../services/event-communication.service';
import { BankAccount } from '../../models/auth-net/bank-account';
import { AcceptJSEcheckService } from '../../services/acceptjs.service';
import { first } from 'rxjs/operators';
import { HttpClient  } from '@angular/common/http';
import { OrganizationService } from 'src/app/services/organization.service';
import { InvoiceService } from '../../services/invoice.service';
import { EntityService } from '../../services/entity.service';
import { ReceiptService } from '../../services/receipt.service';
import { formatDate } from "@angular/common";
import { Inject } from "@angular/core";
import { LOCALE_ID } from "@angular/core";
import * as printJS from "print-js";
declare var Accept: any;
declare var opaqueData: any;
import * as fs from 'file-saver';

@Component({
  selector: 'app-self-payment',
  templateUrl: './self-payment.component.html',
  styleUrls: ['./self-payment.component.scss'],
  providers: [MessageService, ConfirmationService]
})
export class SelfPaymentComponent implements OnInit {

  processing: boolean;
  payAmount: number;
  secureData: any;
  cardData: {fullName: string, cardNumber: string, month:string, year: string, cardCode: string}; 
  authData: {clientKey: string, apiLoginID: string};
  currentUser: any;
  cartItems: any[];
  cartTotal: number;
  authNetResponse: any;
  errorList: {code:string, text: string}[]=[];
  showError: boolean;
  showLoader: boolean;
  showPaymentButton: boolean;
  dataDescriptor: string;
  dataValue: string;
  subscription: Subscription;
  messages: any[] = [];
  creditCardData: CreditCard={cardNumber:'',cardCode:'',month:'',year:'',zip:'',fullName:''};
  bankAccountData: BankAccount={accountNumber:'',routingNumber:'',nameOnAccount:'',accountType:'',nickName:'', bankName:'', checkNumber:''};
  addErrorMessages : any = {}; 
  submitted: boolean;
  ecsubmitted: boolean;
  checkSubmitted: boolean;
  selectedIndex = 0;
  cartId: any;
  showPayment: boolean;
  organizationName: string;
  paymentToken: string;
  ipAddress: string;
  organizationAddress: string;
  organizationUrl: string;
  organization: any;
  organizationImage: any;
  organizationId: number;
  invoice: any;
  printInvoice: boolean;
  printInvoiceId: number;
  pdfMake: any;
  dataLoaded: boolean;
  receipt:any;
  receipts:any[];
  cart: any;
  logo: any;
  invoicePdf: any;
  primaryAddress: any[];
  public localID: string;
  creditCardForm = this.fb.group({
    PersonId: [0],    
    Name: ['', [Validators.required, this.noBlankValidator]],
    CardNumber: ['',Validators.required],
    ExpDate: ['',Validators.required],
    CVV: ['',Validators.required],
    Zip:[''],
    Street:['']
  } );

  eCheckForm = this.fb.group({
    PersonId: [0],    
    nameOnAccount: ['',[Validators.required, this.noBlankValidator]],
    accountNumber: ['',Validators.required],
    accountType: [''],
    nickName: ['',Validators.required],
    routingNumber: ['',Validators.required]
  });
 billingAddress: any;
  constructor(private fb: FormBuilder,
    private acceptJSSrv: AcceptJSService,
    private eventCommunicationService: EventCommunicationService,
    private organizationService: OrganizationService,
    private messageService: MessageService, 
    private router: Router,
    private activateRoute: ActivatedRoute ,
    private authService: AuthService,
    private entityService: EntityService,
    private shoppingCartService: ShoppingCartService,
    private confirmationService: ConfirmationService,
    private accepJsEcheck: AcceptJSEcheckService,
    private http:HttpClient,
    private invoiceService: InvoiceService,
    private receiptService: ReceiptService,
    @Inject( LOCALE_ID ) localID: string
    ) { 
      this.cartTotal=0;
      this.showError = false;
      this.showLoader=false;
      this.showPaymentButton=true;
      this.processing=false;
      this.checkSubmitted=false;
      this.printInvoice=false;
      this.localID = localID;
      this.showPayment = true;
      this.dataLoaded = false;
    }

  ngOnInit(): void {

    this.activateRoute.queryParams.subscribe(params => {
      this.organizationName = params.organization;
      this.paymentToken = params.id;
    });
 
    const body = {
      organizationName: this.organizationName,
      paymentToken: this.paymentToken,
      ipAddress: this.ipAddress,
    };
    
  
    this.authService.ValidatePaymentUrl(body)
    .pipe(first())
    .subscribe(
        data => {
          //console.log('Data:'+JSON.stringify(data));
          if(parseInt(data.paymentStatus) === 2){
            this.showPayment = false;
          }
          console.log("PaymentUrl:"+JSON.stringify(data));
          this.cart = data.shoppingCart;
          this.cartId = data.shoppingCart.shoppingCartId;
          this.cartItems = data.shoppingCart.shoppingCartDetails;
          this.organization = data.organization;
          this.invoice = data.invoice;
          this.billingAddress = data.billingAddress;
          this.invoice.billingAddress=data.billingAddress;
          this.receipt=data.receipt;
          this.receipts=data.receiptList;
          this.getTotalDue();
          this.getHeaderImage();
       
          localStorage.setItem("PaymentToken", this.paymentToken);
          this.dataLoaded = true;
        },
        error => {
            console.log('Error:' + JSON.stringify(error));
            console.log('Status:'+error.status);
       });
  }

  getIPAddress()
    {
      this.http.get("https://api.ipify.org/?format=json").subscribe((res:any)=>{
        this.ipAddress = res.ip;
        //console.log('IP:'+this.ipAddress);
      });
    }

  getTotalDue() {
    this.cartTotal=0;
    if (this.cartItems) {
        for (let i = 0; i < this.cartItems.length; i++) {
            this.cartTotal = this.cartTotal + parseFloat(this.cartItems[i].amount);
        }
    }
    if( this.cart.creditBalance > 0){
       if( this.cart.useCreditBalance ===1){
          this.cartTotal = this.cartTotal -  this.cart.creditBalance;

          if( this.cartTotal <= 0){
            //create Receipt
          }
       }
    }
  }
  
  async postBankDataToAuthNet(){
    //Get form Data
    this.submitted = true;

    if (this.selectedIndex == 1)
    this.ecsubmitted = true;

    if(this.eCheckForm.valid){
      this.processing=true;
      this.bankAccountData.accountNumber = this.eCheckForm.get('accountNumber').value;
      this.bankAccountData.routingNumber = this.eCheckForm.get('routingNumber').value;
      this.bankAccountData.nameOnAccount = this.eCheckForm.get('nameOnAccount').value;
      this.bankAccountData.accountType  = 'checking';
      // this.bankAccountData.nickName  = this.eCheckForm.get('nickName').value;
      try {
        this.showLoader=true;
        this.showPaymentButton=false;
        //console.log('Form Data:'+ JSON.stringify(this.bankAccountData));
        const nonce = await this.accepJsEcheck.generateEcheckPaymentNonce(this.bankAccountData);
        //console.log('received nonce:' + JSON.stringify(nonce));
        this.processPayment(nonce,'eCheck')
      }
      catch (error) {
        //console.log(error);
        this.errorList=[];
        for(var i = 0; i < error["messages"]["message"].length; i++) {
          this.errorList.push({ code: error["messages"]["message"][i].code , text: error["messages"]["message"][i].text});
        }
        this.showError=true;
        this.showLoader=false;
        this.showPaymentButton=true;
        this.processing=false;
        this.messageService.add({ severity: 'warn', summary: 'Errors', detail: "Please correct the errors and try again", life: 3000 });
        return;
      }
    
    }
    else {
      this.messageService.add({ severity: 'warn', summary: 'Errors', detail: 'Please enter required information.', life: 3000 });
    }

  }

  async postCreditCardToAuthNet(){
    //Get form Data
    this.submitted = true;

    if (this.selectedIndex == 1)
    this.ecsubmitted = true;
    
    if(this.creditCardForm.valid){
      this.processing=true;
      let monthYear = this.creditCardForm.get('ExpDate').value.split('/');
      this.creditCardData.fullName = this.creditCardForm.get('Name').value;
      this.creditCardData.cardNumber = this.creditCardForm.get('CardNumber').value.split("-").join("");
      this.creditCardData.month = monthYear[0];
      this.creditCardData.year = monthYear[1];
      this.creditCardData.cardCode = this.creditCardForm.get('CVV').value;
      this.creditCardData.zip = this.creditCardForm.get('Zip').value;
      try {
        this.showLoader=true;
        this.showPaymentButton=false;
        //console.log('Form Data:'+ JSON.stringify(this.creditCardData));
        const nonce = await this.acceptJSSrv.generatePaymentNonce(this.creditCardData);
        //console.log('received nonce:' + JSON.stringify(nonce));
        this.processPayment(nonce,'CreditCard')

        //Accept.dispatchData(this.secureData, "responseHandler");
      }
      catch (error) {
        //console.log(error);
        this.errorList=[];
        for(var i = 0; i < error["messages"]["message"].length; i++) {
          this.errorList.push({ code: error["messages"]["message"][i].code , text: error["messages"]["message"][i].text});
        }
        this.showError=true;
        this.showLoader=false;
        this.showPaymentButton=true;
        this.processing=false;
        this.messageService.add({ severity: 'warn', summary: 'Errors', detail: "Please correct the errors and try again", life: 3000 });
        return;
      }
     
    }
    else {
      this.messageService.add({ severity: 'warn', summary: 'Errors', detail: 'Please enter required information.', life: 3000 });
    }
    
  }

  processPayment(nonce: any,paymentMode: string){
    this.showPaymentButton=false;
    this.processing=true;
        // Create Transaction Request
        //console.log('Process Payment:'+JSON.stringify(nonce));
        const formData = new FormData();
        formData.append('cartId',this.cartId.toString());
        formData.append('userId',this.cart.userId.toString());
        formData.append('organizationId',this.organization.organizationId);
        formData.append('paymentMode',paymentMode);
        formData.append('dataValue',nonce);
        if(paymentMode === 'eCheck'){
          formData.append('AccountHolderName',this.eCheckForm.get('nameOnAccount').value);
          formData.append('nickName',this.eCheckForm.get('nickName').value);
          formData.append('RoutingNumber',this.eCheckForm.get('routingNumber').value);
          formData.append('AccountType',this.eCheckForm.get('accountType').value);
        }
        //console.log('Payment Request:' + JSON.stringify(formData));
        this.shoppingCartService.processMemberPayment(formData).subscribe((data: any) =>
        {
          //console.log(data);
          this.authNetResponse = data;
          this.handleResponse();
          
        });
  }
  
  handleResponse() {
    this.showLoader=false;
     // send message to subscribers via observable subject
    if(this.authNetResponse.authCode != null){
      this.router.navigate(['/selfreceipt'], {
        queryParams: { 'cartId': this.cartId },
      });
    }
    localStorage.setItem("ShoppingCartId", this.cartId.toString());

    this.errorList=[];
    this.errorList.push({ code: this.authNetResponse.errorCode , text: this.authNetResponse.errorMessage});
    this.showError=true;
    this.showLoader=false;
    this.showPaymentButton=true;
    this.processing=false;
    this.messageService.add({ severity: 'danger', summary: 'Errors', detail: "Please correct the errors and try again", life: 3000 });
  }

  errorIconCss(field: string) {
    return { 'has-feedback': this.isFieldValid(field) };
  }

  errorFieldCss(field: string) {
    return { 'ng-dirty': this.isFieldValid(field) };
  }

  isFieldValid(field: string) {    
    if ((!this.creditCardForm.get(field).valid) && (this.submitted) && (this.creditCardForm.get(field).hasError('required'))){
      if (field=='ExpDate')
        field = 'Expiration Date';
      if (field=='CardNumber')
        field = 'Card Number';
      this.addErrorMessages =  { errorType: 'required', controlName: field };
      return true;
    }
  }

  resetSubmitted(field){
    this.submitted = false;
    this.isFieldValid(field);
  }

  resetecheckSubmitted(){
    this.ecsubmitted = false;
  }

  resetCheckSubmitted(){
    this.checkSubmitted = false;
  }

  onChange($event){
    this.selectedIndex = $event.index;
    this.creditCardForm.reset();
    this.eCheckForm.reset();
  }

  expirationValidation(event): boolean {
    let expDate = new Date();
    let currentDate = new Date();
    if (event.target.selectionStart==5) {
      let monthYear = event.target.value.split('/');
      monthYear[1] = '20'+monthYear[1];
      //console.log(monthYear[0])
      expDate.setFullYear(monthYear[1], monthYear[0], 0);      
      if (expDate < currentDate) {
        event.target.value = '';
        this.creditCardForm.get('ExpDate').reset();
      }
      return true;
    }
    return false;
  }


  CVVValidation(event) {
    if (event.target.value.length <= 2)
    this.creditCardForm.get('CVV').reset();
  }

  streetValidation(event) {
    if (event.target.value.length <= 3)
    this.creditCardForm.get('Street').reset();
  }

  zipValidation(event) {
    if (event.target.value.length <= 4)
    this.creditCardForm.get('Zip').reset();
  }

  AccountNumberValidation(event) {
    if (event.target.value.length <= 6)
      this.eCheckForm.get('AccountNumber').reset();
  }

  monthFirstPos(event):boolean{
    if ((event.target.selectionStart==0) && ((event.key=="0") || (event.key=="1"))){ return true;}
    if ((event.target.selectionStart==1)) {return true;}
    if (event.target.selectionStart==3) {return true;}
    if (event.target.selectionStart==4) {return true;}
    if (event.key=="Tab") {return true;}
  return false;
}

  matcher(event: ClipboardEvent, formControlName: string): boolean {
    if (this.selectedIndex==0){
    var allowedRegex = "";
    if (formControlName == 'Name')
        allowedRegex = ("^[A-Za-z ']{0,30}$");
    if (formControlName == 'CVV')
        allowedRegex = ("^[0-9]{3,4}$");
    if (event.type == "paste") {
      let clipboardData = event.clipboardData;
      let pastedText = clipboardData.getData('text') ; 
      if ((formControlName == 'CVV') || (formControlName == 'ExpDate')){
          this.creditCardForm.get(formControlName).reset();
      }
      if (formControlName == 'ExpDate'){
        let expDate = new Date();
        let currentDate = new Date();
        let expMonth = parseInt(pastedText.slice(0,2));
        let expYear = parseInt('20'+ (pastedText.slice(2)));
        expDate.setFullYear( expYear, expMonth, 0);
        //console.log(expDate)
        if (expDate < currentDate) {          
          event.preventDefault();
          return false;
      } }
      if (!pastedText.match(allowedRegex))  {
        event.preventDefault();
        return false;
     }
     return true;
  }
}   
if (this.selectedIndex==1){  
  var allowedRegex = "";
  if (formControlName == 'Name')
      allowedRegex = ("^[A-Za-z ']{0,30}$");
  if (formControlName == 'BankName')
      allowedRegex = ("^[A-Za-z ]{0,64}$");
      if (event.type == "paste") {
        let clipboardData = event.clipboardData;
        let pastedText = clipboardData.getData('text'); 
          pastedText = clipboardData.getData('text');   
        if (!pastedText.match(allowedRegex))  {
          event.preventDefault();
          return false;
       }
       return true;
      }
    }
}

noBlankValidator(control: FormControl)
{
  const isWhitespace = (control.value || '').trim().length === 0;
  const isValid = !isWhitespace;
  return isValid ? null : { 'required': true };
}

creditCardNumberValidation(event) {
    const creditCardNumber = event.target.value.replace(/[_()x-]/g, '');
    if (creditCardNumber.length <= 11){
      this.creditCardForm.get("CardNumber").setErrors({dankortminlength: true});
    }
  }

  getBillingAddress(entityId: number){
    //console.log('Fetching Address for Id:' + entityId.toString());
    let searchParams = new HttpParams();
    searchParams = searchParams.append('entityId', entityId.toString());
    const opts = {params: searchParams};
    this.entityService.getBillingAddressByEntityId(opts).subscribe((data: any) =>
    {
      //console.log(data);
      this.billingAddress = data;
      this.invoice.billingAddress=data;
    });
  }
  
  getInvoicePDF(download: number){
    this.invoiceService.getPaperInvoicePdfByInvoiceId(this.invoice.invoiceId,this.organization.organizationId ).subscribe((data: any) =>
    {
      //console.log(data);
      let parsedResponse =(data)
      var blob = new Blob([data], {type: 'application/pdf'});
      var filename = 'Invoice-'+this.invoice.invoiceId+'.pdf';
      if(download === 1){
        fs.saveAs(blob, filename);
      }
      if( download === 0 ){
        let blobUrl: string = window.URL.createObjectURL(blob);
        window.open(blobUrl); 
        var a         = document.createElement('a');
        a.href        = blobUrl; 
        a.target      = '_blank';
        a.download    = filename;
        document.body.appendChild(a);
        a.click();
      }
      if(download === 2){
        let blobUrl: string = window.URL.createObjectURL(blob);
        // printJS(blobUrl);
        window.open(blobUrl,'_blank',"width=800,height=600");
      }
    } );
  }
  exportToPDF(){
    this.invoiceService.getPaperInvoicePdfByCycleId(this.invoice.invoiceId,this.organization.organizationId ).subscribe((data: any) =>
    {
      //console.log(data);
      let parsedResponse =(data)
      var blob = new Blob([data], {type: 'application/pdf'});
      var filename = 'Invoice-'+this.invoice.invoiceId+'.pdf';
      fs.saveAs(blob, filename);
     
    } );
  }
  /* PDF Generator Code */
  async showPdf() {
  
    this. getInvoicePDF(0);
  }

  async printPdf() {
    this. getInvoicePDF(2);
  }

  async downloadPdf() {
    this. getInvoicePDF(1);
  }
  
  
  getHeaderImage()
  {
    this.invoiceService.getHeaderImage(this.organization.organizationId).subscribe(data => {
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
      //console.log(error);
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

    downloadReceiptPdf(receiptId:any){
      //console.log("Get Receipt PDF:"+ JSON.stringify(this.receipt));
      this.receiptService.getReceiptPdfByReceiptId(receiptId).subscribe((data: any) =>
      {
        //console.log(data);
        let parsedResponse =(data)
        var blob = new Blob([data], {type: 'application/pdf'});
        var filename = 'Receipt-'+receiptId+'.pdf';
       
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
    isMobile() {
      return window.innerWidth <= 640;
    }

    getDate(date: any){
      const _date = new Date(date);
      return  _date.getMonth()+1 + "-"+  _date.getDate() +"-"+_date.getFullYear();
    };
}

