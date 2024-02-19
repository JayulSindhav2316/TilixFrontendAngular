
import { Component, OnInit, Input } from '@angular/core';
import { Table } from 'primeng/table';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { AppBreadcrumbService } from '../../../app.breadcrumb.service';
import { ActivatedRoute, Router } from '@angular/router';
import { PersonService } from '../../../services/person.service';
import { HttpParams } from '@angular/common/http';
import { FormBuilder, RequiredValidator, FormControl } from '@angular/forms';
import { Validators } from '@angular/forms';
import { TK_CONFIG, Config, AcceptJSService, CreditCard } from '@openutility/acceptjs-angular-wrapper';
import { AuthService } from '../../../services/auth.service';
import { AuthNetService } from '../../../services/auth-net.service';
import { AutoBillingService } from '../../../services/auto-billing.service';
import { EntityService } from '../../../services/entity.service';
import { MembershipService } from '../../../services/membership.service';
import { SelectList } from '../../../models/select-list';
import * as moment from 'moment';
import { MembershipSession } from 'src/app/models/membership-session';
@Component({
  selector: 'app-membership-info',
  templateUrl: './membership-info.component.html',
  styleUrls: ['./membership-info.component.scss'],
  styles: [`
  :host ::ng-deep .p-dialog {
       width: 150px;
       margin: 0 auto 2rem auto;
       display: block;
   }

   @media screen and (max-width: 960px) {
       :host ::ng-deep .p-datatable .p-datatable-tbody > tr > td:last-child {
           text-align: center;
       }

       :host ::ng-deep .p-datatable .p-datatable-tbody > tr > td:nth-child(6) {
           display: flex;
       }
   }
`],
  providers: [MessageService, ConfirmationService]
})
export class MembershipInfoComponent implements OnInit {
  @Input() entityId: number;
  @Input() isPerson: boolean;
  isMember: boolean;
  terminateMenu: MenuItem[];
  activateMenu: MenuItem[];
  membershipBalnce: number;
  creditAmount: number;
  memberships: any[];
  billingSchedule: any[];
  paymentProfiles: any[];
  billingNotes: any[];
  billingHistory: any[];
  showLoader: boolean;
  authNetResponse: any;
  paymentProfileDialog: boolean;
  currentUser: any;
  errorList: { code: string, text: string }[] = [];
  showError: boolean;
  showPaymentButton: boolean;
  creditCardData: CreditCard = { cardNumber: '', cardCode: '', month: '', year: '', zip: '', fullName: '' };
  paymentProfile: any;
  showPayButton: boolean;
  scheduledBilling: any[];
  showPaymentProfile: boolean;
  showBillingNotes: boolean;
  showBillingHistory: boolean;
  showBillingSchedule: boolean;
  terminationDialog: boolean;
  membershipProfile: any;
  hasMembershipHistory: boolean;
  showCancelDialog: boolean;
  showTerminationDialog: boolean;
  showBillableMemberDialog: boolean;
  submitted: boolean;
  membershipCancelFormSubmitted: boolean;
  addErrorMessages: any = {};
  terminationTitle: string;
  selectedMembership: any;
  editMembership: boolean;
  changeStatus: string;
  membershipFees: any[];
  startDate: any;
  endDate: any;
  nextBillDate: any;
  preNextBillDate: any;
  billableEntity: any;
  billableMember: SelectList;
  relations: any[];
  relationsList: any[];
  notificationList: any[];
  billingNotificationPreference: any;
  billingInvoicePreference: any;
  feeAmount: any;
  billableEntityId: string;
  billableMemberGender: string;
  billableMemberAge: string;
  membershipTerminationForm = this.fb.group({
    PersonId: [0],
    reason: ['', Validators.required]
  });

  creditCardForm = this.fb.group({
    PersonId: [0],
    Name: ['', Validators.required],
    CardNumber: ['', Validators.required],
    ExpDate: ['', Validators.required],
    CVV: ['', Validators.required]
  });

  members: { entityId: string; name: string; age: string; gender: string; isBillable: boolean }[] = [];

  addAdditionalMembers: boolean;
  maxUnits: number;
  hasRelations: boolean = false;
  isRelatedContact: boolean = false;
  membershipSession: MembershipSession;
  mainMemberId: number;
  showSearchControl: boolean = false;
  additionalMembers: number[] = [];
  finalMembersList: number[] = [];
  deletedMembershipConnectionList: number[] = [];
  slotLeft: number;

  constructor(private fb: FormBuilder,
    private breadcrumbService: AppBreadcrumbService,
    private messageService: MessageService,
    private personService: PersonService,
    private confirmationService: ConfirmationService,
    private router: Router,
    private authService: AuthService,
    private authNetService: AuthNetService,
    private acceptJSSrv: AcceptJSService,
    private entityService: EntityService,
    private autoBillingService: AutoBillingService,
    private membershipService: MembershipService,
    private route: ActivatedRoute) {
    this.membershipBalnce = 0;
    this.creditAmount = 0;
    this.paymentProfileDialog = false;
    this.showPayButton = true;
    this.terminationDialog = false;
    this.isMember = false;
    this.hasMembershipHistory = false;
    this.showCancelDialog = false;
    this.showTerminationDialog = false;
    this.membershipCancelFormSubmitted = false;
    this.terminationTitle = "Terminate Membership";
    this.showBillableMemberDialog = false;

    this.terminateMenu = [{
      label: 'Options',
      items: [
        {
          label: 'Edit',
          icon: 'pi pi-exclamation-circle',
          command: () => {
            this.editMembershipDetails();
          }
        },
        {
          label: 'On Hold',
          icon: 'pi pi-exclamation-circle',
          command: () => {
            this.putOnHold();
          }
        },
        {
          label: 'Terminate',
          icon: 'pi pi-ban',
          command: () => {
            this.terminate();
          }
        }
      ]
    }
    ];
    this.activateMenu = [{
      label: 'Options',
      items: [
        {
          label: 'Reactivate',
          icon: 'pi pi-refresh',
          command: () => {
            this.reactivate();
          }
        }
      ]
    }
    ];
    this.notificationList = [
      { name: 'Paper Invoice', code: 'Paper' },
      { name: 'Email', code: 'Email' },
      { name: 'Paper Invoice & Email', code: 'Both' }
    ];
  }

  ngOnInit(): void {
    this.currentUser = this.authService.currentUserValue;
    this.showLoader = true;
    this.showPaymentProfile = false;
    this.showBillingNotes = false;
    this.showBillingHistory = false;
    this.showBillingSchedule = false;
    this.getPaymentProfile(this.entityId);
    this.getMembershipProfile();

    console.log('Membership-info-CurrentUser:' + JSON.stringify(this.currentUser));
  }

  setActiveRow(memberhip: any) {
    this.selectedMembership = memberhip;
  }

  reactivate() {
    this.terminationTitle = "Reactivate Membership"
    this.showTerminationDialog = true;
    this.changeStatus = "Active";
  }

  putOnHold() {
    this.terminationTitle = "Change status to On Hold"
    this.showTerminationDialog = true;
    this.changeStatus = "OnHold";
  }

  terminate() {
    this.terminationTitle = "Terminate Membership";
    this.showTerminationDialog = true;
    this.changeStatus = "Terminate";
  }

  editMembershipDetails() {
    console.log(this.selectedMembership);
    this.getMembershipBillingFee(this.selectedMembership.membershipId);
    this.getRelationsByEntity(this.selectedMembership.billableEntity.entityId);
    this.startDate = new Date(this.selectedMembership.startDate);
    this.endDate = new Date(this.selectedMembership.endDate);
    this.nextBillDate = new Date(this.selectedMembership.nextBillDate);
    this.billableEntity = this.selectedMembership.billableEntity;
    if (this.billableEntity != null) {
      this.billableMemberAge = this.billableEntity?.person?.age;
      this.billableMemberGender = this.billableEntity?.person?.gender;
    }
    this.billableEntityId = this.selectedMembership.billableEntity.entityId.toString();
    this.maxUnits = this.selectedMembership.maxUnits;
    let code = this.selectedMembership.billableEntity.preferredBillingCommunication == 0 ? 'Paper' :
      this.selectedMembership.billableEntity.preferredBillingCommunication == 1 ? 'Email' : 'Both';
    this.billingNotificationPreference = { code: code };
    this.billingInvoicePreference = { code: code };
    this.editMembership = true;
    this.getMembers();
  }

  cancelMembershipEdit() {
    this.editMembership = false;
  }

  saveEditedMembership() {
    console.log('Updating Membership:' + JSON.stringify(this.selectedMembership.membershipId));
    console.log('Start Date:' + moment(this.startDate).utc(true).format());
    console.log('Next Bill Date:' + moment(this.nextBillDate).utc(true).format());
    console.log('End Date:' + moment(this.endDate).utc(true).format());
    console.log('Billable Member:' + JSON.stringify(this.billableMember));
    console.log('Billing Preference:' + JSON.stringify(this.billingNotificationPreference));
    let update = true;
    if (this.endDate < this.startDate) {
      this.messageService.add({ severity: 'error', summary: 'Errors', detail: "Membership end date can not be earlier than start date.", life: 3000 });
      update = false;
    }

    if (this.startDate > this.nextBillDate) {
      this.messageService.add({ severity: 'error', summary: 'Errors', detail: "Membership start date can not be later than next bill date.", life: 3000 });
      update = false;;
    }
    if (update) {
      this.members.forEach(element => {
        this.finalMembersList.push(parseInt(element.entityId));
      });
      const body = {
        membershipId: this.selectedMembership.membershipId,
        startDate: moment(this.startDate).utc(true).format(),
        nextBillDate: moment(this.nextBillDate).utc(true).format(),
        endDate: moment(this.endDate).utc(true).format(),
        billableEntityId: parseInt(this.billableEntityId),
        billingNotificationPreference: this.billingNotificationPreference.code,
        members: this.finalMembersList
      };
      console.log("Update Membership:" + JSON.stringify(body));
      this.membershipService.updateMembershipDetails(body).subscribe((data: any) => {
        console.log(data);
        this.messageService.add({ severity: 'success', summary: 'Success', detail: "Membership updated successfully.", life: 3000 });
        this.editMembership = false;
        //this.getMembershipProfile();
        this.router.navigate(['/contactProfile'], {
          queryParams: { 'entityId': this.entityId, 'tab': 3 },
        })
          .then(() => {
            window.location.reload();
          });
      });
    }

  }

  updateFee(fee) {
    if (fee.fee) {
      let itemFee = parseFloat(this.feeAmount);
      if (itemFee === null) {
        this.feeAmount = 0.00;
      }
      if (itemFee < 0) {
        this.feeAmount = 0.00;
      }
    }
    else {
      fee.fee = 0.00;
    }
    console.log("Fee:" + JSON.stringify(fee));

    console.log('Updating Membership Fee:' + JSON.stringify(this.selectedMembership.membershipId));
    console.log('Fee Id:' + fee.billingFeeId)
    console.log('Fee Amount:' + fee.fee)

    const body = {
      billingFeeId: fee.billingFeeId,
      fee: fee.fee
    };
    console.log("Update Membership Fee:" + JSON.stringify(body));
    this.membershipService.updateBillingFee(body).subscribe((data: any) => {
      console.log(data);
    });
  }

  getMembershipBillingFee(membershipId: any) {
    console.log('Get Membership Billing:' + membershipId);
    let searchParams = new HttpParams();
    searchParams = searchParams.append('membershipId', membershipId);
    const opts = { params: searchParams };
    this.membershipService.getBillingFeeByMembershipId(opts).subscribe((data: any) => {
      console.log(data);
      this.membershipFees = data;
    });
  }

  getMembershipProfile() {
    console.log('Get Membership Profile Entity:' + this.entityId);
    let searchParams = new HttpParams();
    searchParams = searchParams.append('entityId', this.entityId.toString());
    const opts = { params: searchParams };
    this.entityService.getMembershipProfileById(opts).subscribe((data: any) => {
      console.log(data);
      this.membershipProfile = data;
      if (this.membershipProfile.membershipHistory.length > 0) {
        this.hasMembershipHistory = true;
      }
      if (this.membershipProfile.billingSchedule != null) {
        this.scheduledBilling = this.membershipProfile.billingSchedule;
        this.showBillingSchedule = true;
      }
      if (this.membershipProfile.membershipBillingHistory.length > 0) {
        this.billingHistory = this.membershipProfile.membershipBillingHistory;
        this.showBillingHistory = true;
      }
      if (this.membershipProfile.membershipHistory != null) {
        this.memberships = this.membershipProfile.membershipHistory;
      }
      if (this.membershipProfile.isMember.toString() == "true") {
        this.isMember = true;
      }
      this.membershipBalnce = this.membershipProfile.membershipBalance;
      this.creditAmount = this.membershipProfile.availableCredit;



    });
  }

  terminateMembership() {
    console.log('Terminating Membership for Person:' + this.selectedMembership.membershipId);
    const body = {
      entityId: this.entityId,
      membershipId: this.selectedMembership.membershipId,
      changeStatus: this.changeStatus,
      reason: this.membershipTerminationForm.get('reason').value,
    };
    console.log('terminate:' + JSON.stringify(body));
    this.personService.terminateMembership(body).subscribe((data: any) => {
      console.log(data);
      this.showTerminationDialog = false;
      this.getMembershipProfile();
    });
  }
  cancelTermination() {
    this.showTerminationDialog = false;
  }

  async postToAuthNet() {
    //Get form Data
    //Check form Data
    this.submitted = true;
    if (this.creditCardForm.valid) {
      this.showLoader = true;
      let monthYear = this.creditCardForm.get('ExpDate').value.split('/');
      this.creditCardData.fullName = this.creditCardForm.get('Name').value;
      this.creditCardData.cardNumber = this.creditCardForm.get('CardNumber').value.split("-").join("");
      this.creditCardData.month = monthYear[0];
      this.creditCardData.year = monthYear[1];
      this.creditCardData.cardCode = this.creditCardForm.get('CVV').value;

      try {

        this.showPaymentButton = false;
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
        this.showLoader = false;
        this.showPaymentButton = true;
        this.messageService.add({ severity: 'error', summary: 'Errors', detail: "Please correct the errors and try again", life: 3000 });
        return;
      }

    }
    else {
      this.messageService.add({ severity: 'error', summary: 'Errors', detail: 'Please enter required information.', life: 3000 });
    }

  }
  processPaymentProfile(nonce: any) {
    this.showLoader = true;
    this.showPayButton = false;
    // Create Transaction Request
    console.log('Process Payment:' + JSON.stringify(nonce));
    const formData = new FormData();
    formData.append('entityId', this.entityId.toString());
    formData.append('userId', this.currentUser.userId);
    formData.append('organizationId', this.currentUser.organizationId);
    formData.append('dataValue', nonce);
    console.log('Payment Request:' + JSON.stringify(formData));
    this.authNetService.processPaymentProfile(formData).subscribe((data: any) => {
      console.log(data);
      this.authNetResponse = data;
      this.handleResponse();
      this.showLoader = false;
    });
  }
  handleResponse() {
    this.showLoader = false;
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

  getPaymentProfile(personId: any) {
    this.showLoader = true;
    console.log('Get Payment Profile:' + this.entityId.toString());
    let searchParams = new HttpParams();
    searchParams = searchParams.append('entityId', this.entityId.toString());
    searchParams = searchParams.append('organizationId', this.currentUser.organizationId);
    const opts = { params: searchParams };
    console.log('Payment Request:' + JSON.stringify(opts));
    this.authNetService.getPaymentProfile(opts).subscribe((data: any) => {
      console.log(data);
      if (data.profile) {
        this.paymentProfile = data.profile.paymentProfiles;
        this.showPaymentProfile = true;
      }
      else {
        this.paymentProfile = [];
        if (this.isMember) {
          this.showPaymentProfile = true;
        }
      }
      this.showLoader = false;
    });
  }

  getRelationsByEntity(entityId: any) {
    let searchParams = new HttpParams();
    searchParams = searchParams.append('entityId', this.entityId.toString());
    const opts = { params: searchParams };

    if (!this.isPerson) {
      this.entityService.getEntityById(opts).subscribe((data: any) => {
        console.log('Get billable Entity;' + JSON.stringify(data));

        let entity = data;
        if (entity.companyId) {
          this.billableMember = { code: data.entityId, name: entity.name };
          this.relationsList = [];
          this.relationsList.push({ name: entity.name, code: entity.entityId.toString() });
        }
      });
    }
    else {

      this.entityService.getRelationListByEntityId(opts).subscribe((data: any) => {
        console.log(data);
        if (data) {
          this.billableMember = { code: this.selectedMembership.billableEntity.entityId.toString(), name: this.selectedMembership.billableEntityName };
          this.relationsList = data;
          let addBillable = true;
          this.relationsList.forEach((member) => {
            if (parseInt(member.code) == parseInt(this.selectedMembership.billableEntity.entityId)) {
              addBillable = false;
            }
          });
          if (addBillable) {
            this.relationsList.push(this.billableMember);
          }

          console.log('Billable Member:' + JSON.stringify(this.billableMember));
        }
      });
    }
  }

  addPaymentProfile() {
    this.paymentProfileDialog = true;
    this.creditCardForm.reset();
    this.submitted = false;
    this.showPayButton = true;
  }
  clearAutoPayOnHold(item: any) {
    this.confirmationService.confirm({
      message: 'Are you sure that you want clear the Hold?',
      accept: () => {
        let body = {
          MembershipId: item.membershipId,
          Reason: '',
          UserId: this.currentUser.id
        }
        console.log('Form data:' + JSON.stringify(body));
        this.autoBillingService.clearAutoPayOnHold(body).subscribe((data: any) => {
          console.log(data);
          if (data) {
            this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Auto Pay updated succesfully.', life: 3000 });
            this.getMembershipProfile();
          }
          else {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to update auto billing pay on hold.', life: 3000 });
          }
        });
      }
    });
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
      this.addErrorMessages = { errorType: 'required', controlName: field };
      return true;
    }

  }

  resetSubmitted(field) {
    this.submitted = false;
    this.isFieldValid(field);
  }

  changeInvoicePreference(input) {
    var preference = input.value;
    if (preference != this.billingInvoicePreference?.code) {
      if (this.membershipProfile.membershipHistory.length > 1) {
        this.confirmationService.confirm({
          message: 'Are you sure that you want to change the invoice preference? This will update the invoice preference for all memberships for the selected billable member.',
          header: "Confirm",
          icon: "pi pi-exclamation-triangle",
          accept: () => {
            this.billingNotificationPreference.code = preference;

          },
          reject: () => {
            this.billingNotificationPreference.code = this.billingInvoicePreference.code;
          }
        });
      } else {
        this.billingNotificationPreference.code = preference;
      }
    }
    else {
      this.billingNotificationPreference.code = this.billingInvoicePreference.code;
    }
  }
  onEditComplete(event, memberhip: any) {
    this.selectedMembership = memberhip;
    let code = this.selectedMembership.billableEntity.preferredBillingCommunication == 0 ? 'Paper' :
      this.selectedMembership.billableEntity.preferredBillingCommunication == 1 ? 'Email' : 'Both';
    this.billingNotificationPreference = { code: code };
    this.billableEntityId = this.selectedMembership.billableEntity.entityId;
    this.startDate = this.selectedMembership.startDate;
    this.endDate = this.selectedMembership.endDate;
    this.nextBillDate = moment(this.selectedMembership.nextBillDate).utc(true).format();
    if (this.startDate > this.nextBillDate) {
      this.messageService.add({ severity: 'error', summary: 'Errors', detail: "Membership start date can not be later than next bill date.", life: 3000 });
      memberhip.nextBillDate = this.preNextBillDate;
    }
    else {
      const body = {
        membershipId: this.selectedMembership.membershipId,
        startDate: moment(this.startDate).utc(true).format(),
        nextBillDate: moment(this.nextBillDate).utc(true).format(),
        endDate: moment(this.endDate).utc(true).format(),
        billableEntityId: parseInt(this.billableEntityId),
        billingNotificationPreference: this.billingNotificationPreference.code
      };
      this.membershipService.updateMembershipDetails(body).subscribe((data: any) => {
        console.log(data);
        this.messageService.add({ severity: 'success', summary: 'Success', detail: "Membership updated successfully.", life: 3000 });
        this.getMembershipProfile();
      });
    }
  }

  preNextBillDateValue(event, preNextBillDate: any) {
    this.preNextBillDate = preNextBillDate;
  }

  getMembers() {
    let searchParams = new HttpParams();
    searchParams = searchParams.append('membershipId', this.selectedMembership.membershipId.toString());
    const opts = { params: searchParams };
    this.entityService.getMembershipConnectionsByMembershipId(opts).subscribe((data: any) => {
      console.log(data);
      let members = [];
      data.forEach(element => {
        if (this.deletedMembershipConnectionList.length > 0) {
          let isDeletedMember = this.deletedMembershipConnectionList.includes(element.entityId);
          if (!isDeletedMember) {
            members.push(element.entityId);
          }
        }
        else {
          members.push(element.entityId);
        }
      });

      if (this.additionalMembers.length > 0) {
        members.push(this.additionalMembers);
      }

      let searchParams = new HttpParams();
      searchParams = searchParams.append("entityIds", members.toString());
      const opts = { params: searchParams };
      this.entityService.getEntitiesByIds(opts).subscribe((data: any) => {
        this.members = [];
        console.log(data);
        data.forEach((entityElement) => {
          let isBillable = false;

          if (parseInt(entityElement.entityId) === parseInt(this.billableEntityId)) {
            isBillable = true;
          }
          let item = {
            entityId: entityElement.entityId,
            name: entityElement.name,
            gender: entityElement.gender,
            age: entityElement.age,
            isBillable: isBillable
          };
          this.members.push(item);
        });

        this.slotLeft = this.maxUnits - this.members.length;
        if (this.members.length >= this.maxUnits) {
          this.addAdditionalMembers = false;
        }
        else {
          this.addAdditionalMembers = true;
        }
        this.isRelatedContact = false;
        this.getRelationsByEntityId();
      });
    });
  }

  getRelationsByEntityId() {
    let searchParams = new HttpParams();
    searchParams = searchParams.append('entityId', this.entityId);
    const opts = { params: searchParams };
    this.entityService.getRelationsByEntityId(opts).subscribe((data: any[]) => {
      console.log(data);
      this.relations = data.filter(x => x.relationshipType != "Company");
      if (this.relations.length > 0) {
        this.hasRelations = true;

        if (this.members.length > 0) {
          this.members.forEach((member) => {
            this.relations = this.relations.filter(item => parseInt(member.entityId) != parseInt(item.relatedEntityId));
          });
          this.hasRelations = this.relations.length > 0 ? true : false;
        }
      }
    });
  }

  addMember() {
    this.showSearchControl = true;
  }

  addAdditionalMember(event) {
    this.showSearchControl = false;
    console.log("Serach control sent Event for :" + event.additionalEntityId);
    if (this.addAdditionalMembers) {
      let memberAlreadyAdded = this.additionalMembers.includes(event.additionalEntityId);
      let alreadyMember = this.members.find(x => x.entityId == event.additionalEntityId);
      if (!memberAlreadyAdded && !alreadyMember) {
        this.additionalMembers.push(event.additionalEntityId);
      }
      else {
        this.messageService.add({
          severity: "warn",
          summary: "Warning",
          detail: "You cannot add a person multiple times in same membership.",
          life: 3000,
        });
      }
      this.getMembers();
    }
    else {
      this.messageService.add({
        severity: "warn",
        summary: "Warning",
        detail: "Cannot add more person to this membership as the max limit has reached.",
        life: 3000,
      });
    }
  }

  addRelationalContact(member: any) {
    if (this.addAdditionalMembers) {
      let relatedConactAlreadyAdded = this.additionalMembers.includes(member.relatedEntityId);
      if (!relatedConactAlreadyAdded) {
        this.additionalMembers.push(member.relatedEntityId);
      }
      this.getMembers();
    }
    else {
      this.messageService.add({
        severity: "warn",
        summary: "Warning",
        detail: "Cannot add more person to this membership as the max limit has reached.",
        life: 3000,
      });
    }

  }

  removeMember(contact) {
    if (this.members.length == 1) {
      this.messageService.add({
        severity: "warn",
        summary: "Warning",
        detail: "You need to have atleast one member.",
        life: 3000,
      });
    }
    else {
      this.additionalMembers.forEach((element) => {
        console.log("Elementt:" + JSON.stringify(element));
        if (element === parseInt(contact.entityId)) {
          this.additionalMembers = this.additionalMembers.filter(item => item != parseInt(contact.entityId));
        }
      });
      this.members.forEach((element) => {
        console.log("Elementt:" + JSON.stringify(element));
        if (parseInt(element.entityId) === parseInt(contact.entityId)) {
          this.members = this.members.filter(item => parseInt(item.entityId) != parseInt(contact.entityId));
          this.deletedMembershipConnectionList.push(parseInt(element.entityId));
        }
      });
      this.getMembers();
    }
  }

  closeSearchFunction() {
    this.showSearchControl = false;
  }

  billableMemberChangeEvent(event) {
    var id = event?.value;
    if (id) {
      var relation = this.relations.filter(x => x.relatedEntityId == id)[0];
      if (relation != null) {
        this.billableMemberAge = relation.age?.substring(0, 2);
        this.billableMemberGender = relation.gender;
      }
      else {
        var member = this.members.filter(x => x.entityId == id)[0];
        if (member != null) {
          this.billableMemberAge = member.age?.substring(0, 2);
          this.billableMemberGender = member.gender;
        }
      }
    }
  }
}
