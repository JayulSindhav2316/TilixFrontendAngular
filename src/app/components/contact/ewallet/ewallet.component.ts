
import { HttpParams } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { AppBreadcrumbService } from '../../../app.breadcrumb.service';
import { Router, ActivatedRoute } from '@angular/router';

import { AuthService } from '../../../services/auth.service';
import { FormBuilder, FormControl } from '@angular/forms';
import { Validators } from '@angular/forms';
import { TK_CONFIG, Config, AcceptJSService, CreditCard } from '@openutility/acceptjs-angular-wrapper';
import { EventCommunicationService } from '../../../services/event-communication.service';
import { BankAccount } from '../../../models/auth-net/bank-account';
import { AcceptJSEcheckService } from '../../../services/acceptjs.service';
import { AuthNetService } from '../../../services/auth-net.service';
import { EntityService } from '../../../services/entity.service';
declare var Accept: any;
declare var opaqueData: any;
import * as moment from 'moment';
import { TRISTATECHECKBOX_VALUE_ACCESSOR } from 'primeng/tristatecheckbox';
@Component({
  selector: 'app-ewallet',
  templateUrl: './ewallet.component.html',
  styleUrls: ['./ewallet.component.scss']
})
export class EwalletComponent implements OnInit {
  @Input() entityId: number;
  paymentProfile: any;
  creditCardPaymentProfile: any[];
  bankAccountPaymentProfile: any[];
  showPaymentProfile: boolean;
  selectedPaymentProfile: any;
  customerProfile: any;
  currentUser: any;
  authNetResponse: any;
  paymentProfileDialog: boolean;
  creditCardData: CreditCard = { cardNumber: '', cardCode: '', month: '', year: '', zip: '', fullName: '' };
  creditCardStreetAddress: string;
  bankAccountData: BankAccount = { accountNumber: '', routingNumber: '', nameOnAccount: '', accountType: '', nickName: '', bankName: '', checkNumber: '' };
  menuItems: MenuItem[];
  errorList: { code: string, text: string }[] = [];
  showError: boolean;
  addErrorMessages: any = {};
  creditCardForm = this.fb.group({
    PersonId: [0],
    BillableEntity: [''],
    CardNumber: ['', Validators.required],
    ExpDate: ['', Validators.required],
    CVV: ['', Validators.required],
    StreetAddress: [''],
    Zip: [''],
    FullName: ['']
  });
  selectedIndex: any;
  ecsubmitted: boolean;
  eCheckForm = this.fb.group({
    PersonId: [0],
    nameOnAccount: ['', [Validators.required, this.noBlankValidator]],
    accountNumber: ['', Validators.required],
    accountType: [''],
    nickName: ['', [Validators.required, this.noBlankValidator]],
    routingNumber: ['', Validators.required],
    SaveProfile: [0]
  });
  submitted: boolean;
  relationsList: any[] = [];
  entity: any;
  processing: boolean;

  constructor(private fb: FormBuilder,
    private acceptJSSrv: AcceptJSService,
    private breadcrumbService: AppBreadcrumbService,
    private eventCommunicationService: EventCommunicationService,
    private messageService: MessageService,
    private router: Router,
    private activateRoute: ActivatedRoute,
    private authService: AuthService,
    private confirmationService: ConfirmationService,
    private accepJsEcheck: AcceptJSEcheckService,
    private authNetService: AuthNetService,
    private entityService: EntityService) { }

  ngOnInit(): void {
    this.menuItems = [{
      label: 'Options',
      items: [
        {
          label: 'Set preferred Payment',
          icon: 'pi pi-pencil',
          command: () => {
            this.setPreferredPaymentProfile();
          }
        },
        {
          label: 'Use for Autobilling',
          icon: 'pi pi-pencil',
          command: () => {
            this.setAutoBillingPaymentProfile();
          }
        },
        {
          label: 'Delete',
          icon: 'pi pi-trash',
          command: () => {
            this.deletePaymentProfile();
          }
        }

      ]
    }
    ];
    this.paymentProfileDialog = false;
    this.currentUser = this.authService.currentUserValue;
    console.log('User:' + JSON.stringify(this.currentUser));

    this.getPaymentProfile(this.entityId);
    this.getRelations(this.entityId);
    this.getEntity(this.entityId);
    this.submitted = false;
    this.ecsubmitted = false;
    this.selectedIndex = 0;

  }
  setAutoBillingPaymentProfile() {
    this.confirmationService.confirm({
      message: 'Are you sure you want to use this profile for Autobilling?',
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        console.log('Set Default Payment Profile:' + this.entityId.toString());
        const formData = new FormData();
        formData.append('entityId', this.entityId.toString());
        formData.append('organizationId', this.currentUser.organizationId);
        formData.append('profileId', this.customerProfile.profileId);
        formData.append('paymentProfileId', this.selectedPaymentProfile.paymentProfileId);
        formData.append('authNetPaymentProfileId', this.selectedPaymentProfile.authNetPaymentProfileId);

        console.log('Payment Request:' + JSON.stringify(formData));
        this.authNetService.setAutobillingPaymentProfile(formData).subscribe((data: any) => {
          console.log(data);
          this.messageService.add({
            severity: "success",
            summary: "Successful",
            detail: "Payment Profile updated Succesfully.",
            life: 3000
          });
          console.log(data);
          this.getPaymentProfile(this.entityId);
        },
          (error) => {
            console.log(error);
            this.messageService.add({
              severity: "error",
              summary: "Error",
              detail: error,
              life: 3000,
            });
          });
      }
    });
  }
  setPreferredPaymentProfile() {
    this.confirmationService.confirm({
      message: 'Are you sure you want to make this preferred Payment Method?',
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        console.log('Set Default Payment Profile:' + this.entityId.toString());
        const formData = new FormData();
        formData.append('entityId', this.entityId.toString());
        formData.append('organizationId', this.currentUser.organizationId);
        formData.append('profileId', this.customerProfile.profileId);
        formData.append('paymentProfileId', this.selectedPaymentProfile.paymentProfileId);
        formData.append('authNetPaymentProfileId', this.selectedPaymentProfile.authNetPaymentProfileId);

        console.log('Payment Request:' + JSON.stringify(formData));
        this.authNetService.setPreferredPaymentProfile(formData).subscribe((data: any) => {
          console.log(data);
          this.messageService.add({
            severity: "success",
            summary: "Successful",
            detail: "Payment Profile updated Succesfully.",
            life: 3000
          });
          console.log(data);
          this.getPaymentProfile(this.entityId);
        },
          (error) => {
            console.log(error);
            this.messageService.add({
              severity: "error",
              summary: "Error",
              detail: error,
              life: 3000,
            });
          });
      }
    });
  }
  deletePaymentProfile() {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete this payment profile?',
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        console.log('Delete Payment Profile:' + this.entityId.toString());
        const formData = new FormData();
        formData.append('entityId', this.entityId.toString());
        formData.append('organizationId', this.currentUser.organizationId);
        formData.append('profileId', this.customerProfile.profileId);
        formData.append('paymentProfileId', this.selectedPaymentProfile.paymentProfileId);
        formData.append('authNetPaymentProfileId', this.selectedPaymentProfile.authNetPaymentProfileId);

        console.log('Payment Request:' + JSON.stringify(formData));
        this.authNetService.deletePaymentProfile(formData).subscribe((data: any) => {
          console.log(data);
          this.messageService.add({
            severity: "success",
            summary: "Successful",
            detail: "Payment Profile deleted Succesfully.",
            life: 3000
          });
          console.log(data);
          this.getPaymentProfile(this.entityId);
        },
          (error) => {
            console.log(error);
            this.messageService.add({
              severity: "error",
              summary: "Error",
              detail: error,
              life: 3000,
            });
          });
      }
    });
  }
  addPaymentProfile() {
    this.showError = false;
    this.creditCardForm.reset();
    this.eCheckForm.reset();
    this.submitted = false;
    this.ecsubmitted = false;
    this.paymentProfileDialog = true;
    // this.creditCardForm.get('BillableEntity').setValue(this.entityId.toString());
    let cardHolderName=this.getCardHolderName();
    this.creditCardForm.get('FullName').setValue(cardHolderName.toString());
    if (this.entity?.person != null) {
      this.creditCardForm.get('StreetAddress').setValue(this.entity.person.streetAddress.toString());
      this.creditCardForm.get('Zip').setValue(this.entity.person.zip.toString());
    }
    else if (this.entity?.company != null) {
      this.creditCardForm.get('StreetAddress').setValue(this.entity.company.streetAddress.toString());
      this.creditCardForm.get('Zip').setValue(this.entity.company.zip.toString());
    }

  }
  setActiveRow(profile: any) {
    this.selectedPaymentProfile = profile;
    console.log("Selected Profile:" + JSON.stringify(this.selectedPaymentProfile));

  }
  clearProfile() {
    this.creditCardForm.reset();
    this.eCheckForm.reset();
    this.paymentProfileDialog = false;
  }
  onChange($event) {
    this.selectedIndex = $event.index;
    this.submitted = false;
    this.ecsubmitted = false;
    this.creditCardForm.reset();
    this.eCheckForm.reset();
    if (this.selectedIndex == 0) {
      // this.creditCardForm.get('BillableEntity').setValue(this.entityId.toString());
      let cardHolderName=this.getCardHolderName();
      this.creditCardForm.get('FullName').setValue(cardHolderName.toString());
      if (this.entity?.person != null) {
        this.creditCardForm.get('StreetAddress').setValue(this.entity.person.streetAddress.toString());
        this.creditCardForm.get('Zip').setValue(this.entity.person.zip.toString());
      }
      else if (this.entity?.company != null) {
        this.creditCardForm.get('StreetAddress').setValue(this.entity.company.streetAddress.toString());
        this.creditCardForm.get('Zip').setValue(this.entity.company.zip.toString());
      }
    }
  }

  async postToAuthNet() {
    this.submitted = true;
    if (this.creditCardForm.valid) {
      let monthYear = this.creditCardForm.get('ExpDate').value.split('/');
      this.creditCardData.fullName = this.creditCardForm.get('FullName').value;
      this.creditCardData.cardNumber = this.creditCardForm.get('CardNumber').value.split("-").join("");
      this.creditCardData.month = monthYear[0];
      this.creditCardData.year = monthYear[1];
      this.creditCardData.cardCode = this.creditCardForm.get('CVV').value;
      this.creditCardStreetAddress = this.creditCardForm.get('StreetAddress').value;
      this.creditCardData.zip = this.creditCardForm.get('Zip').value;
      this.validateCardHolderName(this.creditCardData.fullName);

      try {

        console.log('Submitting Card Data:' + JSON.stringify(this.creditCardData));
        const nonce = await this.acceptJSSrv.generatePaymentNonce(this.creditCardData);
        console.log('received nonce:' + JSON.stringify(nonce));
        this.processPaymentProfile(nonce)

        //Accept.dispatchData(this.secureData, "responseHandler");
      }
      catch (error) {
        console.log(error);
        this.errorList = [];
        for (var i = 0; i < error["messages"]["message"].length; i++) {
          this.errorList.push({ code: error["messages"]["message"][i].code, text: error["messages"]["message"][i].text });
        }
        this.showError = true;
        this.messageService.add({ severity: 'error', summary: 'Errors', detail: "Please correct the errors and try again", life: 3000 });
        return;
      }

    }
    else {
      this.messageService.add({ severity: 'error', summary: 'Errors', detail: 'Please enter required information.', life: 3000 });
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
      this.bankAccountData.accountType = 'checking';
      try {

        console.log('Form Data:' + JSON.stringify(this.bankAccountData));
        const nonce = await this.accepJsEcheck.generateEcheckPaymentNonce(this.bankAccountData);
        console.log('received nonce:' + JSON.stringify(nonce));
        this.processPaymentProfile(nonce)
      }
      catch (error) {
        console.log(error);
        this.errorList = [];
        for (var i = 0; i < error["messages"]["message"].length; i++) {
          this.errorList.push({ code: error["messages"]["message"][i].code, text: error["messages"]["message"][i].text });
        }
        this.showError = true;
        this.processing = false;
        this.messageService.add({ severity: 'warn', summary: 'Errors', detail: "Please correct the errors and try again", life: 3000 });
        return;
      }

    }
    else {
      this.messageService.add({ severity: 'warn', summary: 'Errors', detail: 'Please enter required information.', life: 3000 });
    }
  }
  processPaymentProfile(nonce: any) {
    // Create Transaction Request
    // console.log('Billable Entity:' + this.creditCardForm.get('BillableEntity').value);
    let billableEntityId = 0;
    let paymentMode = "BankAccount";
    if (this.selectedIndex === 0) {
      billableEntityId = this.entityId;
      paymentMode = "CreditCard";
    }

    const formData = new FormData();
    formData.append('entityId', this.entityId.toString());
    formData.append('billableEntityId', this.entityId.toString());
    formData.append('paymentMode', paymentMode);
    formData.append('userId', this.currentUser.userId);
    formData.append('organizationId', this.currentUser.organizationId);
    formData.append('streetAddress', this.creditCardStreetAddress);
    formData.append('zip', this.creditCardData.zip);
    formData.append('fullName', this.creditCardData.fullName);
    formData.append('dataValue', nonce);
    formData.append('nickName', this.eCheckForm.get('nickName').value);

    this.authNetService.processPaymentProfile(formData).subscribe((data: any) => {
      console.log(data);
      this.authNetResponse = data;
      this.handleResponse();
    });
  }
  handleResponse() {
    // send message to subscribers via observable subject
    if (this.authNetResponse.errorMessage.length == 0) {
      this.messageService.add({
        severity: 'success',
        summary: 'Successful',
        detail: 'Payment Profile has been added succesfully.',
        life: 3000
      });
      this.creditCardForm.reset();
      this.paymentProfileDialog = false;
      this.getPaymentProfile(this.authNetResponse.profileId);
    }
    else {
      this.messageService.add({ severity: 'error', summary: 'Errors', detail: this.authNetResponse.errorMessage, life: 3000 });
    }

  }

  getPaymentProfile(entityId: any) {
    console.log('Get Payment Profile:' + this.entityId.toString());
    let searchParams = new HttpParams();
    searchParams = searchParams.append('entityId', this.entityId.toString());
    searchParams = searchParams.append('organizationId', this.currentUser.organizationId);
    const opts = { params: searchParams };
    console.log('Payment Request:' + JSON.stringify(opts));
    this.authNetService.getPaymentProfile(opts).subscribe((data: any) => {
      console.log(data);
      if (data) {
        this.customerProfile = data;
        this.creditCardPaymentProfile = data.creditCards;
        this.bankAccountPaymentProfile = data.bankAccounts;
        this.showPaymentProfile = true;
      }
      else {
        this.creditCardPaymentProfile = [];
        this.bankAccountPaymentProfile = [];
        this.showPaymentProfile = false;
      }
    });
  }

  //validation logic

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
    if ((!this.creditCardForm.get(field).valid) && (this.submitted) && (this.creditCardForm.get(field).hasError('required'))) {
      if (field == 'ExpDate')
        field = 'Expiration Date';
      if (field == 'CardNumber')
        field = 'Card Number';
      if (field == 'FullName')
        field = 'Card Holder Name';
      this.addErrorMessages = { errorType: 'required', controlName: field };
      return true;
    }

  }

  AccountNumberValidation(event) {
    if (event.target.value.length <= 6)
      this.eCheckForm.get('AccountNumber').reset();
  }
  resetSubmitted(field) {
    this.submitted = false;
    this.isFieldValid(field);
  }


  resetecheckSubmitted() {
    this.ecsubmitted = false;
  }

  onEditComplete(event) {
    console.log("Edited:" + JSON.stringify(event));
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

  creditCardNumberValidation(event) {
    const creditCardNumber = event.target.value.replace(/[_()x-]/g, '');
    if (creditCardNumber.length <= 11) {
      this.creditCardForm.get("CardNumber").setErrors({ dankortminlength: true });
    }
  }

  CVVValidation(event) {
    if (event.target.value.length <= 2)
      this.creditCardForm.get('CVV').reset();
  }

  monthFirstPos(event): boolean {
    if ((event.target.selectionStart == 0) && ((event.key == "0") || (event.key == "1"))) { return true; }
    if ((event.target.selectionStart == 1)) { return true; }
    if (event.target.selectionStart == 3) { return true; }
    if (event.target.selectionStart == 4) { return true; }
    return false;
  }

  matcher(event: ClipboardEvent, formControlName: string): boolean {
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

  getRelations(entityId: any) {
    console.log('Get relations:' + this.entityId.toString());
    let searchParams = new HttpParams();
    searchParams = searchParams.append('entityId', this.entityId.toString());
    const opts = { params: searchParams };
    this.entityService.getRelationListByEntityId(opts).subscribe((data: any) => {
      console.log(data);
      if (data) {
        this.relationsList = data;
      }
    });
  }

  getEntity(entityId: any) {
    console.log('Get entity:' + this.entityId.toString());
    let searchParams = new HttpParams();
    searchParams = searchParams.append('entityId', this.entityId.toString());
    const opts = { params: searchParams };
    this.entityService.getEntityById(opts).subscribe((data: any) => {
      console.log(data);
      if (data) {
        this.entity = data;
      }
    });
  }
  validateCardHolderName(input: string) {
    if (input != null && input?.length > 0) {
      var name = input.trim();
      if (name == '' || name == null) {
        this.creditCardForm.get("FullName").reset();
        this.messageService.add({ severity: 'error', summary: 'Errors', detail: 'Please enter the card holder name.', life: 3000 });
        return;
      }
    }
  }
  getCardHolderName(): string {
    let person = this.entity.person;
    let cardHolderName = this.entity.person == null ? this.entity.name : (person?.firstName + ' ' + person?.lastName);
    return cardHolderName;
  }

  populateNickName(event:any){
      this.eCheckForm.get('nickName').setValue(this.eCheckForm.get('nameOnAccount').value);
  }
}
