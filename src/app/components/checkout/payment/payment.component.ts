import { Component, OnInit, Input } from '@angular/core';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { AppBreadcrumbService } from '../../../app.breadcrumb.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { ShoppingCartService } from '../../../services/shopping-cart.service';
import { AuthService } from '../../../services/auth.service';
import { HttpParams } from '@angular/common/http';
import { FormBuilder, FormControl } from '@angular/forms';
import { Validators } from '@angular/forms';
import { TK_CONFIG, Config, AcceptJSService, CreditCard } from '@openutility/acceptjs-angular-wrapper';
import { EventCommunicationService } from '../../../services/event-communication.service';
import { BankAccount } from '../../../models/auth-net/bank-account';
import { AcceptJSEcheckService } from '../../../services/acceptjs.service';
import { AuthNetService } from '../../../services/auth-net.service';
declare var Accept: any;
declare var opaqueData: any;
import * as moment from 'moment';
import { ThisReceiver } from '@angular/compiler';
import { EntityService } from 'src/app/services/entity.service';
import { error } from 'console';
@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.scss'],
  providers: [MessageService, ConfirmationService]
})


export class PaymentComponent implements OnInit {
  processing: boolean;
  payAmount: number;
  secureData: any;
  cardData: { fullName: string, cardNumber: string, month: string, year: string, cardCode: string };
  authData: { clientKey: string, apiLoginID: string };
  currentUser: any;
  cartItems: any[];
  cartTotal: number;
  authNetResponse: any;
  errorList: { code: string, text: string }[] = [];
  showError: boolean;
  showLoader: boolean;
  showPaymentButton: boolean;
  dataDescriptor: string;
  dataValue: string;
  subscription: Subscription;
  messages: any[] = [];
  creditCardData: CreditCard = { cardNumber: '', cardCode: '', month: '', year: '', zip: '', fullName: '' };
  bankAccountData: BankAccount = { accountNumber: '', routingNumber: '', nameOnAccount: '', accountType: '', nickName: '', bankName: '', checkNumber: '' };
  addErrorMessages: any = {};
  submitted: boolean;
  ecsubmitted: boolean;
  checkSubmitted: boolean;
  paymentSubmitted: boolean;
  selectedIndex = 0;
  cartId: any;
  paymentStatus: any;
  hasBalance: boolean;
  paymentProfiles: any[];
  creditCardPaymentProfiles: any[];
  bankPaymentProfiles: any[];
  showPaymentProfile: boolean;
  selectedPaymentProfile: any;
  customerProfileId: string;
  selectedBankAccountProfile: any;
  selectedCreditCardProfile: any;
  profilePaymentMode: string;
  cart: any;
  index: any;
  promoCode: any;
  discountPercentage: any;
  currentPaymentMode:string;

  creditCardForm = this.fb.group({
    PersonId: [0],
    Name: ['', [Validators.required, this.noBlankValidator]],
    CardNumber: ['', Validators.required],
    ExpDate: ['', Validators.required],
    CVV: ['', Validators.required],
    Zip: [''],
    Street: [''],
    SaveProfile: [0]
  });

  eCheckForm = this.fb.group({
    PersonId: [0],
    nameOnAccount: ['', [Validators.required, this.noBlankValidator]],
    accountNumber: ['', Validators.required],
    accountType: [''],
    nickName: ['', [Validators.required, this.noBlankValidator]],
    routingNumber: ['', Validators.required],
    SaveProfile: [0]
  });

  checkForm = this.fb.group({
    PersonId: [0],
    nameOnAccount: ['', [Validators.required, this.noBlankValidator]],
    accountNumber: ['', Validators.required],
    accountType: ['', Validators.required],
    bankName: ['', Validators.required],
    checkNumber: ['', Validators.required],
  });

  offLineForm = this.fb.group({
    PersonId: [0],
    payerName: ['', [Validators.required, this.noBlankValidator]],
    referenceNumber: [''],
    paymentType: ['', Validators.required],
    transactionDate: ['', Validators.required]
  });

  constructor(private fb: FormBuilder,
    private acceptJSSrv: AcceptJSService,
    private breadcrumbService: AppBreadcrumbService,
    private eventCommunicationService: EventCommunicationService,
    private messageService: MessageService,
    private router: Router,
    private activateRoute: ActivatedRoute,
    private authService: AuthService,
    private shoppingCartService: ShoppingCartService,
    private confirmationService: ConfirmationService,
    private accepJsEcheck: AcceptJSEcheckService,
    private authNetService: AuthNetService,
    private entityService: EntityService,
  ) {
    this.cartTotal = 0;
    this.showError = false;
    this.showLoader = false;
    this.showPaymentButton = true;
    this.processing = false;
    this.checkSubmitted = false;
    this.paymentSubmitted = false;
    this.hasBalance = false;
  }

  ngOnInit(): void {
    this.currentUser = this.authService.currentUserValue;
    console.log('User:' + JSON.stringify(this.currentUser));

    this.activateRoute.queryParams.subscribe(params => {
      console.log(params);
      this.cartId = params.cartId;
      this.paymentStatus = params.paymentStatus;
      this.discountPercentage = params.discountPercentage;
      this.promoCode = params.promoCode;
      this.currentUser.cartId = this.cartId;
      this.authService.currentUser = this.currentUser;
    });

    console.log('Cart Id:' + this.cartId);
    console.log('Payment Status:' + this.paymentStatus);
    if (this.paymentStatus === "2") {
      this.router.navigate(['/receipt'], {
        queryParams: {}
      });
    }
    this.showPaymentProfile = false;
    this.getShoppingCart(this.currentUser.id);
  }
  test() {
    console.log("got it.");
  }

  getShoppingCart(id: number) {

    console.log('Fetching Cart for Id:' + id.toString());
    let searchParams = new HttpParams();
    searchParams = searchParams.append('userId', id.toString());
    const opts = { params: searchParams };
    this.shoppingCartService.getGetShoppingCartByUserId(opts).subscribe((data: any) => {
      console.log(data);
      this.cart = data;
      this.cartItems = data.shoppingCartDetails;
      this.getTotalDue();
      this.getCardHolderName(this.cart.entityId);
      this.offLineForm.get('payerName').setValue(this.cart.billableEntityName);
      this.offLineForm.get('transactionDate').setValue(new Date());
      this.getPaymentProfile(this.cart.entityId);
    });
  }

  getTotalDue() {
    this.cartTotal = 0;
    if (this.cartItems) {
      for (let i = 0; i < this.cartItems.length; i++) {
        this.cartTotal = this.cartTotal + parseFloat(this.cartItems[i].amount);
      }
    }
    if (this.cart.creditBalance > 0) {
      if (this.cart.useCreditBalance === 1) {
        this.cartTotal = this.cartTotal - this.cart.creditBalance;

        if (this.cartTotal <= 0) {
          //create Receipt
        }
      }
    }
    if (this.cartTotal <= 0) {
      this.messageService.add({ severity: 'warn', summary: 'Errors', detail: "You have no balance in cart to Pay for.", life: 3000 });
    }
    else {
      this.hasBalance = true;
    }
  }

  async postBankDataToAuthNet() {
    //Get form Data
    this.submitted = true;

    if (this.selectedIndex == 1)
      this.ecsubmitted = true;

    if (this.eCheckForm.valid) {
      this.processing = true;
      this.bankAccountData.accountNumber = this.eCheckForm.get('accountNumber').value;
      this.bankAccountData.routingNumber = this.eCheckForm.get('routingNumber').value;
      this.bankAccountData.nameOnAccount = this.eCheckForm.get('nameOnAccount').value;
      this.bankAccountData.nickName = this.eCheckForm.get('nickName').value;
      this.bankAccountData.accountType = "checking";
      try {

        this.showPaymentButton = false;
        console.log('Form Data:' + JSON.stringify(this.bankAccountData));
        const nonce = await this.accepJsEcheck.generateEcheckPaymentNonce(this.bankAccountData);
        console.log('received nonce:' + JSON.stringify(nonce));
        this.processPayment(nonce, 'eCheck')
      }
      catch (error) {
        console.log(error);
        this.errorList = [];
        for (var i = 0; i < error["messages"]["message"].length; i++) {
          this.errorList.push({ code: error["messages"]["message"][i].code, text: error["messages"]["message"][i].text });
        }
        this.showError = true;
        this.showLoader = false;
        this.showPaymentButton = true;
        this.processing = false;
        this.messageService.add({ severity: 'warn', summary: 'Errors', detail: "Please correct the errors and try again", life: 3000 });
        return;
      }

    }
    else {
      this.ecsubmitted = true;
      this.messageService.add({ severity: 'warn', summary: 'Errors', detail: 'Please enter required information.', life: 3000 });
    }
  }

  async postCheckPayment() {

    //Get form Data
    this.submitted = true;

    if (this.selectedIndex == 2) {
      this.checkSubmitted = true;
    }

    if (this.checkForm.valid) {
      this.processing = true;

      try {
        this.showLoader = true;
        this.showPaymentButton = false;
        const formData = new FormData();
        formData.append('cartId', this.currentUser.cartId.toString());
        formData.append('userId', this.currentUser.id.toString());
        formData.append('organizationId', this.currentUser.organizationId);
        formData.append('CheckNumber', this.checkForm.get('checkNumber').value);
        formData.append('AccountHolderName', this.checkForm.get('nameOnAccount').value);
        formData.append('AccountNumber', this.checkForm.get('accountNumber').value);
        formData.append('CheckNumber', this.checkForm.get('accountType').value);
        formData.append('BankName', this.checkForm.get('bankName').value);
        formData.append('AccountType', this.checkForm.get('accountType').value);
        console.log('Form Data Check:' + JSON.stringify(formData));
        this.shoppingCartService.processCheckPayment(formData).subscribe((data: any) => {
          console.log(data);
          this.updateInvoiceDetails();
          if (data) {
            this.router.navigate(['/receipt'], {
              queryParams: {}
            });
          }

        });
      }
      catch (error) {
        console.log(error);
        this.errorList = [];
        for (var i = 0; i < error["messages"]["message"].length; i++) {
          this.errorList.push({ code: error["messages"]["message"][i].code, text: error["messages"]["message"][i].text });
        }
        this.showError = true;
        this.showLoader = false;
        this.showPaymentButton = true;
        this.processing = false;
        this.messageService.add({ severity: 'warn', summary: 'Errors', detail: "Please correct the errors and try again", life: 3000 });
        return;
      }

    }
    else {
      this.checkSubmitted = true;
      this.messageService.add({ severity: 'warn', summary: 'Errors', detail: 'Please enter required information.', life: 3000 });
    }

  }

  async postOfflinePayment() {

    //Get form Data
    this.submitted = true;

    if (this.selectedIndex == 3) {
      this.paymentSubmitted = true;
    }


    if (this.offLineForm.valid) {
      this.processing = true;

      try {
        this.showLoader = true;
        this.showPaymentButton = false;
        const formData = new FormData();
        formData.append('cartId', this.currentUser.cartId.toString());
        formData.append('userId', this.currentUser.id.toString());
        formData.append('organizationId', this.currentUser.organizationId);
        formData.append('PayerName', this.offLineForm.get('payerName').value);
        formData.append('PaymentType', this.offLineForm.get('paymentType').value);
        formData.append('ReferenceNumber', this.offLineForm.get('referenceNumber').value);
        formData.append('TransactionDate', moment(this.offLineForm.get('transactionDate').value).format('L'));
        console.log('Form Data Check:' + JSON.stringify(formData));
        this.shoppingCartService.processOfflinePayment(formData).subscribe(
          response => {
            console.log(response);
            this.updateInvoiceDetails();
            this.router.navigate(['/receipt'], {
              queryParams: {}
            });
          },
          error => {
            console.log(error);
            this.messageService.add({ severity: 'error', summary: 'Error', detail: error, life: 3000 });
            this.processing = false;
          });
      }
      catch (error) {
        console.log(error);
        this.errorList = [];
        for (var i = 0; i < error["messages"]["message"].length; i++) {
          this.errorList.push({ code: error["messages"]["message"][i].code, text: error["messages"]["message"][i].text });
        }
        this.showError = true;
        this.showLoader = false;
        this.showPaymentButton = true;
        this.processing = false;
        this.messageService.add({ severity: 'warn', summary: 'Errors', detail: "Please correct the errors and try again", life: 3000 });
        return;
      }

    }
    else {
      this.paymentSubmitted = true;
      this.messageService.add({ severity: 'warn', summary: 'Errors', detail: 'Please enter required information.', life: 3000 });
    }

  }

  async postCreditCardToAuthNet() {
    //Get form Data
    this.submitted = true;

    if (this.selectedIndex == 1)
      this.ecsubmitted = true;

    if (this.creditCardForm.valid) {
      this.processing = true;
      let monthYear = this.creditCardForm.get('ExpDate').value.split('/');
      this.creditCardData.fullName = this.creditCardForm.get('Name').value;
      this.creditCardData.cardNumber = this.creditCardForm.get('CardNumber').value.split("-").join("");
      this.creditCardData.month = monthYear[0];
      this.creditCardData.year = monthYear[1];
      this.creditCardData.cardCode = this.creditCardForm.get('CVV').value;
      this.creditCardData.zip = this.creditCardForm.get('Zip').value ?? '';
      try {
        this.showLoader = true;
        this.showPaymentButton = false;
        console.log('Form Data:' + JSON.stringify(this.creditCardData));
        const nonce = await this.acceptJSSrv.generatePaymentNonce(this.creditCardData);
        console.log('received nonce:' + JSON.stringify(nonce));
        this.processPayment(nonce, 'CreditCard')

        //Accept.dispatchData(this.secureData, "responseHandler");
      }
      catch (error) {
        console.log(error);
        this.errorList = [];
        for (var i = 0; i < error["messages"]["message"].length; i++) {
          this.errorList.push({ code: error["messages"]["message"][i].code, text: error["messages"]["message"][i].text });
        }
        this.showError = true;
        this.showLoader = false;
        this.showPaymentButton = true;
        this.processing = false;
        this.messageService.add({ severity: 'warn', summary: 'Errors', detail: "Please correct the errors and try again", life: 3000 });
        return;
      }

    }
    else {
      this.messageService.add({ severity: 'warn', summary: 'Errors', detail: 'Please enter required information.', life: 3000 });
    }

  }

  processPayment(nonce: any, paymentMode: string) {
    this.showPaymentButton = false;
    this.processing = true;
    // Create Transaction Request
    console.log('Process Payment:' + JSON.stringify(nonce));
    const formData = new FormData();
    formData.append('cartId', this.currentUser.cartId.toString());
    formData.append('userId', this.currentUser.id.toString());
    formData.append('organizationId', this.currentUser.organizationId);
    formData.append('paymentMode', paymentMode);
    formData.append('dataValue', nonce);
    let saveProfile = this.creditCardForm.get('SaveProfile').value;
    if (paymentMode === 'eCheck') {
      formData.append('AccountHolderName', this.eCheckForm.get('nameOnAccount').value);
      formData.append('NickName', this.eCheckForm.get('nickName').value);
      formData.append('RoutingNumber', this.eCheckForm.get('routingNumber').value);
      formData.append('AccountType', this.eCheckForm.get('accountType').value);
      saveProfile = this.eCheckForm.get('SaveProfile').value;
    }
    if (paymentMode === 'CreditCard') {
      var name=this.creditCardForm.get('Name').value;
      formData.append('AccountHolderName', name);
    }
    console.log("Save Profile:" + saveProfile);
    formData.append('savePaymentProfile', saveProfile ? "1" : "0");
    console.log('Payment Request:' + JSON.stringify(formData));
    this.shoppingCartService.processPayment(formData).subscribe((data: any) => {
      console.log(data);
      this.authNetResponse = data;

      this.updateInvoiceDetails();

      let saveProfile = 0;
      if (paymentMode === 'eCheck') {
        saveProfile = this.eCheckForm.get('SaveProfile').value;
      } else {
        saveProfile = this.creditCardForm.get('SaveProfile').value;
      }
      if (saveProfile) {
        //add payment prfile if it already has
        if (this.showPaymentProfile) {
          console.log("Adding another payment profile: Payment Mode->" + paymentMode)
          this.addPaymentProfile(paymentMode);
        }
      }
      this.handleResponse();

    });
  }

  handleResponse() {
    this.showLoader = false;
    // send message to subscribers via observable subject
    if (this.authNetResponse.responseCode === "1") {
      this.router.navigate(['/receipt'], {
        queryParams: {}
      });
    }
    this.errorList = [];
    console.log("Error Message:" + JSON.stringify(this.authNetResponse.errorMessage));
    if (this.authNetResponse.responseCode === "2") {
      this.errorList.push({ code: this.authNetResponse.responseCode, text: "This transaction has been declined" });
    }
    else {
      if (this.authNetResponse.errorCode) {
        this.errorList.push({ code: this.authNetResponse.errorCode, text: this.authNetResponse.errorMessage });
      }
      else {
        if (this.authNetResponse.errorMessage) {
          this.errorList.push({ code: '', text: this.authNetResponse.errorMessage });
        }
        else {
          this.errorList.push({ code: this.authNetResponse.responseCode, text: "This transaction has been declined" });
        }

      }
    }
    console.log("Error List:" + JSON.stringify(this.errorList));
    this.showError = true;
    this.showLoader = false;
    this.showPaymentButton = true;
    this.processing = false;
    this.messageService.add({ severity: 'danger', summary: 'Errors', detail: "Please correct the errors and try again", life: 3000 });
  }

  errorIconCss(field: string) {
    return { 'has-feedback': this.isFieldValid(field) };
  }

  errorFieldCss(field: string) {
    return { 'ng-dirty': this.isFieldValid(field) };
  }

  isFieldValid(field: string) {
    if ((!this.creditCardForm.get(field).valid) && (this.submitted) && (this.creditCardForm.get(field).hasError('required'))) {
      if (field == 'ExpDate')
        field = 'Expiration Date';
      if (field == 'CardNumber')
        field = 'Card Number';
      this.addErrorMessages = { errorType: 'required', controlName: field };
      return true;
    }
  }

  resetSubmitted(field) {
    this.submitted = false;
    this.isFieldValid(field);
  }

  resetecheckSubmitted() {
    this.ecsubmitted = false;
  }

  resetCheckSubmitted() {
    this.checkSubmitted = false;
  }

  resetPaymentSubmitted() {
    this.checkSubmitted = false;
  }

  onChange($event) {
    this.selectedIndex = $event.index;
    this.submitted = false;
    this.ecsubmitted = false;
    this.creditCardForm.reset();
    this.eCheckForm.reset();
  }

  expirationValidation(event): boolean {
    let expDate = new Date();
    let currentDate = new Date();
    if (event.target.selectionStart == 5) {
      let monthYear = event.target.value.split('/');
      monthYear[1] = '20' + monthYear[1];
      console.log(monthYear[0])
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

  ReferenceNumberValidation(event) {
    if (event.target.value.length <= 3)
      this.offLineForm.get('referenceNumber').reset();
  }

  monthFirstPos(event): boolean {
    if ((event.target.selectionStart == 0) && ((event.key == "0") || (event.key == "1"))) { return true; }
    if ((event.target.selectionStart == 1)) { return true; }
    if (event.target.selectionStart == 3) { return true; }
    if (event.target.selectionStart == 4) { return true; }
    if (event.key == "Tab") { return true; }
    return false;
  }

  matcher(event: ClipboardEvent, formControlName: string): boolean {
    if (this.selectedIndex == 0) {
      var allowedRegex = "";
      if (formControlName == 'Name')
        allowedRegex = ("^[A-Za-z ']{0,30}$");
      if (formControlName == 'CVV')
        allowedRegex = ("^[0-9]{3,4}$");
      if (event.type == "paste") {
        let clipboardData = event.clipboardData;
        let pastedText = clipboardData.getData('text');
        if ((formControlName == 'CVV') || (formControlName == 'ExpDate')) {
          this.creditCardForm.get(formControlName).reset();
        }
        if (formControlName == 'ExpDate') {
          let expDate = new Date();
          let currentDate = new Date();
          let expMonth = parseInt(pastedText.slice(0, 2));
          let expYear = parseInt('20' + (pastedText.slice(2)));
          expDate.setFullYear(expYear, expMonth, 0);
          console.log(expDate)
          if (expDate < currentDate) {
            event.preventDefault();
            return false;
          }
        }
        if (!pastedText.match(allowedRegex)) {
          event.preventDefault();
          return false;
        }
        return true;
      }
    }
    if (this.selectedIndex == 1) {
      var allowedRegex = "";
      if (formControlName == 'Name')
        allowedRegex = ("^[A-Za-z ']{0,30}$");
      if (formControlName == 'BankName')
        allowedRegex = ("^[A-Za-z ]{0,64}$");
      if (event.type == "paste") {
        let clipboardData = event.clipboardData;
        let pastedText = clipboardData.getData('text');
        pastedText = clipboardData.getData('text');
        if (!pastedText.match(allowedRegex)) {
          event.preventDefault();
          return false;
        }
        return true;
      }
    }
  }

  noBlankValidator(control: FormControl) {
    const isWhitespace = (control.value || '').trim().length === 0;
    const isValid = !isWhitespace;
    return isValid ? null : { 'required': true };
  }

  creditCardNumberValidation(event) {
    const creditCardNumber = event.target.value.replace(/[_()x-]/g, '');
    if (creditCardNumber.length <= 11) {
      this.creditCardForm.get("CardNumber").setErrors({ dankortminlength: true });
    }
  }

  onEditComplete(event) {
    console.log('Edited:' + JSON.stringify(event));

  }

  //Payment Profile

  getPaymentProfile(entityId: any) {
    this.showLoader = true;
    console.log('Get Payment Profile:' + this.cart.entityId.toString());
    let searchParams = new HttpParams();
    searchParams = searchParams.append('entityId', this.cart.entityId.toString());
    searchParams = searchParams.append('organizationId', this.currentUser.organizationId);
    const opts = { params: searchParams };
    console.log('Payment Request:' + JSON.stringify(opts));
    this.authNetService.getPaymentProfile(opts).subscribe((data: any) => {
      console.log(data);
      if (data.entityId > 0) {
        this.paymentProfiles = data;
        this.creditCardPaymentProfiles = data.creditCards;
        this.bankPaymentProfiles = data.bankAccounts;
        this.showPaymentProfile = true;
        this.customerProfileId = data.profileId;
        //Set preferred payment method

        this.selectedCreditCardProfile = this.creditCardPaymentProfiles.find(obj => {
          return obj.preferredPaymentMethod === 1
        })
        if (this.selectedCreditCardProfile) {
          this.selectedPaymentProfile = this.selectedCreditCardProfile;
          this.profilePaymentMode = "CreditCard";
        }

        this.selectedBankAccountProfile = this.bankPaymentProfiles.find(obj => {
          return obj.preferredPaymentMethod === 1
        })
        if (this.selectedBankAccountProfile) {
          this.selectedPaymentProfile = this.selectedBankAccountProfile;
          this.profilePaymentMode = "eCheck";
        }
      }
      else {
        this.creditCardPaymentProfiles = [];
        this.bankPaymentProfiles = [];
        this.showPaymentProfile = false;
        this.index = 1;
      }
      this.showLoader = false;
    });
  }

  setCreditCardPaymentProfile(item: any) {
    this.selectedBankAccountProfile = null;
    console.log("Previous Selected Profile:" + JSON.stringify(this.selectedPaymentProfile));
    console.log("Selected Profile:" + JSON.stringify(item));
    this.profilePaymentMode = "CreditCard";
    if (this.selectedPaymentProfile) {
      if (this.selectedPaymentProfile.authNetPaymentProfileId === item.authNetPaymentProfileId) {
        this.selectedPaymentProfile = null;
      }
      else {
        this.selectedPaymentProfile = item;
      }
    }
    else {
      this.selectedPaymentProfile = item;
    }
  }

  setBankAccountPaymentProfile(item: any) {
    this.profilePaymentMode = "eCheck";
    this.selectedCreditCardProfile = null;
    console.log("Previous Selected Profile:" + JSON.stringify(this.selectedPaymentProfile));
    console.log("Selected Profile:" + JSON.stringify(item));
    if (this.selectedPaymentProfile) {
      if (this.selectedPaymentProfile.authNetPaymentProfileId === item.authNetPaymentProfileId) {
        this.selectedPaymentProfile = null;
      }
      else {
        this.selectedPaymentProfile = item;
      }
    }
    else {
      this.selectedPaymentProfile = item;
    }
  }

  postEWaletToAuthNet() {
    if (this.selectedPaymentProfile == null) {
      this.messageService.add({ severity: 'warn', summary: 'Errors', detail: "Please select a payment profile.", life: 3000 });
    }
    else {
      this.showPaymentButton = false;
      this.processing = true;
      // Create Transaction Request
      console.log('Process Profile Payment:' + JSON.stringify(this.selectedPaymentProfile));
      const formData = new FormData();
      formData.append('cartId', this.currentUser.cartId.toString());
      formData.append('userId', this.currentUser.id.toString());
      formData.append('organizationId', this.currentUser.organizationId);
      formData.append('paymentProfileId', this.selectedPaymentProfile.paymentProfileId);
      formData.append('profileId', this.customerProfileId);
      formData.append('authNetPaymentProfileId', this.selectedPaymentProfile.authNetPaymentProfileId);
      formData.append('paymentMode', this.profilePaymentMode);
      console.log('Process Profile Payment Request:' + JSON.stringify(formData));
      this.shoppingCartService.processPaymentProfilePayment(formData).subscribe((data: any) => {
        this.updateInvoiceDetails();
        console.log(data);
        this.authNetResponse = data;
        this.handleResponse();
      });
    }

  }

  async addPaymentProfile(paymentMode: string) {
    try {

      if (paymentMode === "eCheck") {
        console.log('Submitting Check Data for profile:' + JSON.stringify(this.bankAccountData));
        const nonce = await this.accepJsEcheck.generateEcheckPaymentNonce(this.bankAccountData);
        console.log('received nonce:' + JSON.stringify(nonce));
        this.processPaymentProfile(nonce, paymentMode)
      }
      else {
        console.log('Submitting Card Data for profile:' + JSON.stringify(this.creditCardData));
        const nonce = await this.acceptJSSrv.generatePaymentNonce(this.creditCardData);
        console.log('received nonce:' + JSON.stringify(nonce));
        this.currentPaymentMode="CreditCard";
        this.processPaymentProfile(nonce,paymentMode)
      }

    }
    catch (error) {
      console.log(error);
      this.errorList = [];
      for (var i = 0; i < error["messages"]["message"].length; i++) {
        this.errorList.push({ code: error["messages"]["message"][i].code, text: error["messages"]["message"][i].text });
      }
      this.showError = true;
      this.showLoader = false;
      this.showPaymentButton = true;
      this.messageService.add({ severity: 'error', summary: 'Errors', detail: "Please correct the errors and try again", life: 3000 });
      return;
    }
  }
  processPaymentProfile(nonce: any,paymentMode: string) {

    // Create Transaction Request
    console.log('Process Payment:' + JSON.stringify(nonce));
    const formData = new FormData();
    formData.append('entityId', this.cart.entityId.toString());
    formData.append('userId', this.currentUser.userId);
    formData.append('organizationId', this.currentUser.organizationId);
    formData.append('dataValue', nonce);
    if(this.currentPaymentMode=='CreditCard')
    {
      var name=this.creditCardForm.get('Name').value;
      formData.append('FullName', name);
    }
    if(paymentMode == "eCheck")
    {
      if(this.bankAccountData!=undefined && this.bankAccountData != null)
      {
        formData.append('nickName', this.bankAccountData.nickName);
      }
    }
    console.log('Payment Request:' + JSON.stringify(formData));
    this.authNetService.processPaymentProfile(formData).subscribe((data: any) => {
      console.log(data);
      this.authNetResponse = data;
    });
  }

  updateInvoiceDetails() {
    if (this.cartId == null || this.promoCode == null) {
      return;
    }
    const formData = new FormData();
    formData.append('cartId', this.cartId.toString());
    formData.append('promoCode', this.promoCode);
    formData.append('discount', this.discountPercentage.toString());
    this.shoppingCartService.updateShoppingCartInvoiceDetails(formData).subscribe(() => {
      console.log('invoice details updated for cart id ' + this.cartId);
    });
  }

  getCardHolderName(entityId) {
    let searchParams = new HttpParams();
    searchParams = searchParams.append('entityId', entityId.toString());
    const opts = { params: searchParams };
    this.entityService.getEntityById(opts).subscribe((entity) => {
      let person = entity.person;
      let cardHolderName = entity.person == null ? entity.name : (person?.firstName + ' ' + person?.lastName);
      this.offLineForm.get('payerName').setValue(cardHolderName);
    }), error => {
      this.offLineForm.get('payerName').setValue(this.cart.billableEntityName);
    };
  }
  
  populateNickName(event:any){
    this.eCheckForm.get('nickName').setValue(this.eCheckForm.get('nameOnAccount').value);
  }
}
