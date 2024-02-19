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
import { formatDate } from "@angular/common";
import { LOCALE_ID } from "@angular/core";
import { Inject } from "@angular/core";
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import * as moment from 'moment';
import { OrganizationService } from 'src/app/services/organization.service';
import { AuthNetService } from 'src/app/services/auth-net.service';
import { AuthService } from 'src/app/services/auth.service';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
import { EntityService } from '../../../services/entity.service';
import { faEdit, faPlus } from '@fortawesome/free-solid-svg-icons';
import { SelectItem } from 'primeng/api';
@Component({
  selector: 'app-review',
  templateUrl: './review.component.html',
  styleUrls: ['./review.component.scss']
})
export class ReviewComponent implements OnInit {
  @Output() activeTabEvent = new EventEmitter<number>();
  membershipFees: any[];
  additionalMembers: any[];
  membershipType: { name: string; code: string; periodName: string, period: number };
  billableEntity: { name: string, gender: string, age: number, billingNotification: string };
  membershipSession: MembershipSession;
  showAdditionalMemberTable: boolean;
  startDate: string;
  endDate: string;
  notes: string;
  public localID: string;
  organization: any;
  currentUser: any;
  dateForm = this.fb.group({ startDate: [''], endDate: [''] }
  );
  addErrorMessages: any = {};
  configuredMembershipFees: any[];
  isCompanyBillable: boolean;
  faEdit = faEdit;
  faPlus = faPlus;
  showBillingNotificationDialog: boolean;
  billingNotificationPreference: any;
  notificationList: any[];
  selectedNotification: { name: string; code: string; } = null;
  billableOptions: any[];
  selectedBillableEntity: any;
  showBillableMemberDialog: boolean;
  relations: any[]
  familyMembers: any[] = [];
  selectedBillableMember: string;
  preferredCommunication: any;
  entityHasMembership: boolean = false;
  updatedBillingNotification: boolean = false;
  updatedBillableMember: boolean = false;
  constructor(
    private fb: FormBuilder,
    private breadcrumbService: AppBreadcrumbService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private router: Router,
    private route: ActivatedRoute,
    private personService: PersonService,
    private membershipService: MembershipService,
    private organizationService: OrganizationService,
    private authService: AuthService,
    private entityService: EntityService,
    @Inject(LOCALE_ID) localID: string
  ) {
    this.membershipType = { name: '', code: '', periodName: '', period: 0 };
    this.billableEntity = { name: '', gender: '', age: 0, billingNotification: 'Email' };
    this.localID = localID;
    this.isCompanyBillable = false;
    this.notificationList = [
      { name: 'Select Invoice Preference', code: null },
      { name: 'Paper Invoice', code: 'Paper' },
      { name: 'Email', code: 'Email' },
      { name: 'Paper Invoice & Email', code: 'Paper Invoice & Email' }
    ];
  }

  ngOnInit(): void {
    this.membershipSession = JSON.parse(localStorage.getItem('NewMembershipSession'));
    this.currentUser = this.authService.currentUserValue;
    console.log('Review Membership Session:' + JSON.stringify(this.membershipSession));
    if (this.membershipSession.billableEntityId > 0) {
      this.getBillableEntity(this.membershipSession.billableEntityId);
    }
    if (this.membershipSession.membershipTypeId > 0) {
      this.getMembershipType(this.membershipSession.membershipTypeId);
    }

    if (this.membershipSession.currentTab >= 2) {
      console.log('Review Membership:' + JSON.stringify(this.membershipSession));
      if (this.membershipSession.additionalMembers.length > 0) {
        this.getAdditionalMembers();

      }
      if (this.membershipSession.membershipFeeIds.length > 0) {
        this.getMembershipFees();
      }
    }
    this.getOrganizationDetails();

  }

  getAdditionalMembers() {
    console.log('Fetcing review data for Entities:' + this.membershipSession.additionalMembers.toString());
    let searchParams = new HttpParams();
    searchParams = searchParams.append('entityIds', this.membershipSession.additionalMembers.toString());
    const opts = { params: searchParams };
    this.entityService.getEntitiesByIds(opts).subscribe((data: any) => {
      console.log(data);
      this.additionalMembers = data;
      if (this.additionalMembers.length > 0) {
        this.showAdditionalMemberTable = true;
      }
    });
  }

  getMembershipFees() {

    console.log('Fetcing Fee data for Persons:' + this.membershipSession.membershipFeeIds.toString());
    let searchParams = new HttpParams();
    searchParams = searchParams.append('feeIds', this.membershipSession.membershipFeeIds.toString());
    const opts = { params: searchParams };
    this.membershipService.getMembershipFeeByIds(opts).subscribe((data: any) => {
      console.log(data);
      this.membershipFees = data;
      this.configuredMembershipFees = JSON.parse(JSON.stringify(data));
    });
  }
  getBillableEntity(entityId) {
    console.log('Fetcing data for Entity:' + entityId);
    this.billableOptions = [];
    let searchParams = new HttpParams();
    searchParams = searchParams.append('entityId', entityId);
    const opts = { params: searchParams };
    this.entityService.getEntityById(opts).subscribe((data: any) => {
      console.log('Get billable Entity;' + JSON.stringify(data));

      let entity = data;
      this.selectedNotification = null;
      this.preferredCommunication = null;
      if (entity.memberships.length > 0) {
        this.entityHasMembership = true;
        var preference = this.notificationList.find(x => x.name == entity.preferredCommunication);
        this.selectedNotification = preference?.code;
        this.preferredCommunication = preference?.code;
      }
      if (this.updatedBillingNotification == true) {
        var preference = this.notificationList.find(x => x.name == entity.preferredCommunication);
        this.selectedNotification = preference?.code;
        this.preferredCommunication = preference?.code;
      }

      if (entity.companyId) {
        this.billableEntity.name = entity.name;
        this.billableEntity.gender = '';
        this.billableEntity.age = 0;
        this.billableEntity.billingNotification = entity.preferredCommunication;
        this.selectedBillableEntity = { name: entity.name, code: entityId.toString() };
        this.billableOptions.push({ name: entity.name, code: entity.entityId.toString() });
        this.isCompanyBillable = true;
        this.membershipSession.isCompanyBillable = true;
      }
      else {
        this.billableEntity.name = entity.name;
        this.billableEntity.gender = entity.person.gender;
        this.billableEntity.age = entity.person.age;
        this.billableEntity.billingNotification = entity.preferredCommunication;
        this.selectedBillableEntity = { name: entity.person.firstName + ' ' + entity.person.lastName, code: entityId.toString() };
        this.billableOptions.push({ name: entity.person.firstName + ' ' + entity.person.lastName, code: entityId.toString() });
        this.getRelationsByEntityId(entityId);
        this.getMembers();
        this.isCompanyBillable = false;
        this.membershipSession.isCompanyBillable = false;
      }
      localStorage.setItem('NewMembershipSession', JSON.stringify(this.membershipSession));
    });
  }

  getMembershipType(typeId) {
    console.log('Get Membership Type:;' + typeId);

    let searchParams = new HttpParams();
    searchParams = searchParams.append('membershipTypeId', typeId.toString());
    const opts = { params: searchParams };
    this.membershipService.getMembershipTypeById(opts).subscribe((data: any) => {
      console.log(data);
      this.membershipType = data;
      this.membershipType.periodName = data.periodName;
      this.setDate(data.startDate, data.endDate);
    });
  }

  getOrganizationDetails() {
    let params = new HttpParams();
    params = params.append('organizationId', this.currentUser.organizationId.toString());
    const opts = { params: params };
    this.organizationService.getOrganizationById(opts).subscribe((data: any[]) => {
      console.log(data);
      this.organization = data;
      this.notes = this.organization.printMessage ? this.organization.printMessage : '';
    });
  }

  checkFee(fee) {

    if (!fee.feeAmount) {
      this.messageService.add({
        severity: "warn",
        summary: "Warning",
        detail: "Please correct the Fee.It cant be blank",
        life: 3000,
      });
    }
    this.configuredMembershipFees.forEach((element) => {

      if (parseInt(element.feeId) === parseInt(fee.feeId)) {
        console.log('Validating Fee ID :' + element.feeId + 'with :' + fee.feeId);
        if (parseFloat(element.feeAmount) < parseFloat(fee.feeAmount)) {
          console.log('Entered fee :' + fee.feeAmount + 'is higher than :' + element.feeAmount);
          this.messageService.add({
            severity: "warn",
            summary: "Warning",
            detail: "Please correct the Fee.It cant be more than $" + element.feeAmount,
            life: 3000,
          });
          return false;
        }
      }
    });
  }

  validateFee() {
    let validFee = true;
    this.configuredMembershipFees.forEach((element) => {
      this.membershipFees.forEach(feeElement => {
        if (parseInt(element.feeId) === parseInt(feeElement.feeId)) {
          console.log('Validating Fee ID :' + element.feeId + 'with :' + feeElement.feeId);
          if (feeElement.feeAmount == null || feeElement.feeAmount == 0) {
            this.messageService.add({
              severity: "error",
              summary: "Error",
              detail: "Please correct the Required Fee.It cant be blank or 0",
              life: 3000,
            });
            validFee = false;
          }
          if (parseFloat(element.feeAmount) < parseFloat(feeElement.feeAmount)) {
            console.log('Entered fee :' + feeElement.feeAmount + 'is higher than :' + element.feeAmount);
            this.messageService.add({
              severity: "warn",
              summary: "Warning",
              detail: "Please correct the " + element.description + ". It can't be more than $" + element.feeAmount,
              life: 3000,
            });
            validFee = false;
          }
        }
      });
    });
    return validFee;
  }

  setActiveTab(value: number) {
    this.activeTabEvent.emit(value);
    console.log('Set Active Tab ->:' + value);
  }

  goBack() {
    this.setActiveTab(2);
  }


  goToNext() {
    if (this.selectedNotification == undefined || this.selectedNotification == null) {
      this.messageService.add({ severity: 'error', summary: 'Errors', detail: 'Please select invoice preference.', life: 3000 });
      return;
    }
    //Update tab 
    if (this.validateFee() === true) {
      this.membershipSession = JSON.parse(localStorage.getItem('NewMembershipSession'));
      this.membershipSession.startDate = moment(this.dateForm.get('startDate').value).utc(true).format();
      this.membershipSession.endDate = moment(this.dateForm.get('endDate').value).utc(true).format();
      this.membershipSession.membershipFees = [];
      this.membershipSession.membershipFeeIds = [];
      this.membershipFees.forEach(element => {
        this.membershipSession.membershipFeeIds.push(parseFloat(element.feeId));
        console.log('FeeId:' + element.feeId);
        this.membershipSession.membershipFees.push(parseFloat(element.feeAmount));
        console.log('Fee:' + element.feeAmount);
      });

      console.log('Edited Fee:' + JSON.stringify(this.membershipSession.membershipFees))
      console.log('Membership Session:' + JSON.stringify(this.membershipSession))
      this.membershipSession.currentTab = 4;
      this.membershipSession.notes = this.notes;
      localStorage.setItem('NewMembershipSession', JSON.stringify(this.membershipSession));
      console.log('Saved Membership Session:' + JSON.stringify(this.membershipSession));
      this.setActiveTab(4);
    }

  }

  goToSearch() {
    this.router.navigate(['/membership/searchMember'], {
      queryParams: {}
    });
  }

  noteValidation(event) {
    this.notes = event.target.value.trim();
  }

  endDateValidation(field: string) {
    var startdt = new Date(this.dateForm.get('startDate').value);
    var enddt = new Date(this.dateForm.get('endDate').value);
    var curentdate = new Date;
    if (curentdate != startdt) {
      if (startdt > enddt) {
        this.addErrorMessages = { errorType: 'lesserEndDate', controlName: field };
        return true;
      }
    }
  }

  setEndDate() {
    var startDate = this.dateForm.get('startDate').value;

    //Get end Date
    let searchParams = new HttpParams()
      .append('periodId', this.membershipType.period.toString())
      .append('startDate', formatDate(new Date(startDate.toString()), "MM/dd/yyyy", this.localID));
    const opts = { params: searchParams };
    this.membershipService.getMembershipEndDate(opts).subscribe((data: any) => {
      console.log(data);
      this.setDate(startDate, data);
    });

  }

  setDate(startDate, endDate) {
    //get Date
    let fstartDate = formatDate(new Date(startDate.toString()), "MM/dd/yyyy", this.localID);
    let fendDate = formatDate(new Date(endDate.toString()), "MM/dd/yyyy", this.localID);
    this.dateForm = this.fb.group({ startDate: [fstartDate], endDate: [fendDate] });
  }

  setPreferredCommunication() {
    this.showBillingNotificationDialog = true;
  }
  cancelNotification() {
    this.showBillingNotificationDialog = false;
  }
  updateBillingNotification() {
    if (this.selectedNotification != null || this.selectedNotification != undefined) {
      if (this.entityHasMembership == true) {
        this.confirmationService.confirm({
          message: 'Are you sure that you want to change the invoice preference? This will update the invoice preference for all memberships for the selected billable member.',
          header: "Confirm",
          icon: "pi pi-exclamation-triangle",
          accept: () => {
            console.log("Selected Notification:" + this.selectedNotification);
            const body = {
              entityId: this.membershipSession.billableEntityId,
              BillingNotification: this.selectedNotification
            };
            this.entityService.updateBillingNotification(body).subscribe((data: any) => {
              console.log(data);
              this.updatedBillingNotification = true;
              this.getBillableEntity(this.membershipSession.billableEntityId);
            });
          },
          reject: () => {
            this.selectedNotification = this.preferredCommunication;
          }
        });
      }
      else {
        console.log("Selected Notification:" + this.selectedNotification);
        const body = {
          entityId: this.membershipSession.billableEntityId,
          BillingNotification: this.selectedNotification
        };
        this.entityService.updateBillingNotification(body).subscribe((data: any) => {
          console.log(data);
          this.updatedBillingNotification = true;
          this.getBillableEntity(this.membershipSession.billableEntityId);
        });
      }
    }
  }

  setBillableMember() {
    console.log('Changed Billable:' + JSON.stringify(this.selectedBillableEntity));
    this.membershipSession = JSON.parse(localStorage.getItem("NewMembershipSession"));
    //if(this.membershipSession.additionalMembers.length>0){
    //  this.membershipSession.primaryMemberEntityId = this.selectedBillableEntity;
    //}
    this.membershipSession.billableEntityId = this.selectedBillableEntity;
    this.getAdditionalMembers();

    localStorage.setItem("NewMembershipSession", JSON.stringify(this.membershipSession));

    let searchParams = new HttpParams();
    searchParams = searchParams.append('entityId', this.membershipSession.billableEntityId);
    const opts = { params: searchParams };
    this.entityService.getEntityById(opts).subscribe((data: any) => {
      let entity = data;
      this.selectedNotification = null;
      if (entity.memberships.length > 0) {
        this.entityHasMembership = true;
        var preference = this.notificationList.find(x => x.name == entity.preferredCommunication);
        this.selectedNotification = preference?.code;
      }
      if (entity.companyId) {
        this.billableEntity.name = entity.name;
        this.billableEntity.gender = '';
        this.billableEntity.age = 0;
        this.billableEntity.billingNotification = entity.preferredCommunication;
        this.billableOptions.push({ name: entity.name, code: entity.this.membershipSession.billableEntityId.toString() });
        this.isCompanyBillable = true;
        this.membershipSession.isCompanyBillable = true;
      }
      else {
        this.billableEntity.name = entity.name;
        this.billableEntity.gender = entity.person.gender;
        this.billableEntity.age = entity.person.age;
        this.billableEntity.billingNotification = entity.preferredCommunication;
        this.isCompanyBillable = false;
        this.membershipSession.isCompanyBillable = false;
      }
      localStorage.setItem('NewMembershipSession', JSON.stringify(this.membershipSession));
    });
    return;
  }
  cancelBillable() {
    this.showBillableMemberDialog = false;
  }

  getRelationsByEntityId(entityId) {
    let searchParams = new HttpParams();
    searchParams = searchParams.append('entityId', entityId);
    const opts = { params: searchParams };
    this.entityService.getRelationsByEntityId(opts).subscribe((data: any[]) => {
      console.log(data);
      this.relations = data;
      if (this.relations.length > 0) {
        let counter = 0;
        for (var relation of this.relations) {
          let data = this.billableOptions.find(obj => obj.code === relation.relatedEntityId.toString());
          console.log("Find results:" + data)
          if (data === undefined) {
            this.billableOptions.push({ name: relation.firstName + ' ' + relation.lastName, code: relation.relatedEntityId.toString() });
          }
          else {
            console.log('Not Added' + JSON.stringify({ name: relation.name, code: relation.relatedEntityId.toString() }));
          }
        }
      }
      console.log('Billable Options [relations]:' + JSON.stringify(this.billableOptions));
    });
  }
  updateBillableMember() {
    console.log("Selected Billable Member:" + this.selectedBillableEntity);
    this.membershipSession = JSON.parse(localStorage.getItem("NewMembershipSession"));
    //Remove moved member from additional members
    //if(this.membershipSession.additionalMembers.length>0){
    // this.membershipSession.additionalMembers = this.membershipSession.additionalMembers.filter(item => item != parseInt(this.selectedBillableEntity));
    // this.membershipSession.additionalMembers.push(this.membershipSession.billableEntityId);
    //this.membershipSession.primaryMemberEntityId = this.selectedBillableEntity;
    //}
    this.membershipSession.billableEntityId = this.selectedBillableEntity;
    this.getAdditionalMembers();

    localStorage.setItem("NewMembershipSession", JSON.stringify(this.membershipSession));
    console.log("Current Membership Session:" + JSON.stringify(this.membershipSession));
    this.getBillableEntity(this.membershipSession.billableEntityId);
  }



  getMembers() {
    this.membershipSession = JSON.parse(localStorage.getItem("NewMembershipSession"));
    let members = [];

    if (this.membershipSession.additionalMembers.length > 0) {
      members.push(this.membershipSession.additionalMembers);

      console.log("Fetcing data for Persons:" + members.toString());

      let searchParams = new HttpParams();
      searchParams = searchParams.append("entityIds", members.toString());

      const opts = { params: searchParams };

      this.entityService.getEntitiesByIds(opts).subscribe((data: any) => {
        console.log(data);
        data.forEach((element) => {
          let data = this.billableOptions.find(obj => obj.code === element.entityId.toString());
          console.log("Find results:" + data)
          if (data === undefined) {
            this.billableOptions.push({ name: element.name, code: element.entityId.toString() });
            console.log('Added' + JSON.stringify({ name: element.name, code: element.entityId.toString() }));
          }
          else {
            console.log('Not Added' + JSON.stringify({ name: element.name, code: element.entityId.toString() }));
          }

        });
        console.log('Selected Billable Entity:' + JSON.stringify(this.selectedBillableEntity));
      });
    }
    console.log('Billable Options [get members]:' + JSON.stringify(this.billableOptions));
  }
}
