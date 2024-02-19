import { Component, OnInit, Input, ViewChild, forwardRef, OnChanges } from "@angular/core";
import { ConfirmationService, MenuItem, MessageService } from "primeng/api";
import { Router, ActivatedRoute } from "@angular/router";
import { Output, EventEmitter } from "@angular/core";
import { HttpParams } from "@angular/common/http";
import { EntityService } from "../../services/entity.service";
import { ContactRoleService } from "../../services/contact-role.service";
import {
  FormBuilder,
  Validator,
  Validators,
  FormGroup,
  FormControl,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
} from "@angular/forms";
import { EntityRole } from "../../models/entity-role";
import { TagComponent } from "../tag/tag.component";
import { EntityRoleService } from "src/app/services/entity-role.service";
import { AuthService } from "src/app/services/auth.service";
import { ContactActivityService } from "src/app/services/contact-activity.service";
import { DatePipe, formatDate } from "@angular/common";
import { promise } from "protractor";
type ChangeCallbackFn<T> = (value: T) => void;
type TouchCallbackFn = () => void;
@Component({
  selector: 'app-edit-contact-role',
  templateUrl: './edit-contact-role.component.html',
  styleUrls: ['./edit-contact-role.component.scss'],
  providers: [MessageService, ConfirmationService, {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => EditContactRoleComponent),
    multi: true
  },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => EditContactRoleComponent),
      multi: true
    }]
})
export class EditContactRoleComponent implements OnInit, OnChanges {
  @Input() parentControl: string;
  @Input() parentEntityId: number;
  @Input() firstName: string;
  @Input() lastName: string;
  @Input() searchEnabled: boolean;
  @Input() parentCompanyId: number;
  @Output() closeEvent = new EventEmitter<string>();
  @Output() addNewContactRoleEvent = new EventEmitter<EntityRole>();

  controlValueChanged: { roleChanged: boolean };
  onTouched: () => void = () => { };
  contactSearchEnabled: boolean;
  searchByContactNameForm: FormGroup;
  showAddContactRoleTable: boolean;
  roles: any[];
  roleList: any[];
  selectedRole: string;
  selecctedRoleIds: any[];
  contactRoleDetail: any[];
  contactRoleFormGroup: FormGroup = this.fb.group({
    roleId: ['']
  });
  effectiveDate: Date;
  endDate: Date;
  showRemoveDialog: boolean;
  newRole: EntityRole;
  removeRoleId: string;
  removeRoleName: string;
  canAddRole: boolean;
  styleValue: { width: '50vw' };
  roleSelected: boolean;
  minDate: Date;
  unassignRoleDialog: boolean;
  unassignRoleName: string = "";
  unassignRoleContact: string = "";
  unassignRoleAccount: string = "";
  unassignRoleDialogSecond: boolean;
  activeEntityRoles: any;
  effectiveEndDate: Date = new Date;
  effectiveEndDateRequired: boolean;
  selectedEntityRole: any;
  minEffectiveEndDate: Date = new Date;
  currentUser: any;
  contactActivities: any[] = [];
  roleHasHistory: boolean = false;
  disabledUnassignSaveBtn: boolean = false;
  constructor(
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private router: Router,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private entityService: EntityService,
    private entityRoleService: EntityRoleService,
    private contactRoleService: ContactRoleService,
    private contactActivityService: ContactActivityService,
    private datepipe: DatePipe,
    private authService: AuthService
  ) {

  }
  ngOnInit(): void {
    this.searchByContactNameForm = this.fb.group({
      ParentEntityId: [0],
      FirstName: [""],
      LastName: [""],
    });
    this.showAddContactRoleTable = true;
    this.contactSearchEnabled = false;
    this.contactRoleDetail = [{
      firstName: this.firstName,
      lastName: this.lastName,
      roles: this.roles
    }];
    this.searchByContactNameForm.get('FirstName').setValue(this.firstName);
    this.searchByContactNameForm.get('LastName').setValue(this.lastName);
    this.getContactRoleDetails(this.parentEntityId);
    this.getContactRoleSelectList();
    this.selecctedRoleIds = [];
    this.showRemoveDialog = false;
    this.effectiveDate = new Date();
    this.endDate = new Date();
    this.canAddRole = false;
    this.selectedRole = "";
    this.roleSelected = false;
    this.newRole = {};
    if (this.parentCompanyId > 0) {
      this.canAddRole = true;
    }
    this.minDate = new Date("01/01/1900");
    this.currentUser = this.authService.currentUserValue;
  }

  registerOnChange(fn: ChangeCallbackFn<object>): void {
    this.searchByContactNameForm.valueChanges.subscribe(fn);
  }
  registerOnTouched(fn: TouchCallbackFn): void {
    this.onTouched = fn;
  }
  errorIconCss(field: string) {
    return { 'has-feedback': this.isFieldValid(field) };
  }

  errorFieldCss(field: string) {
    return { 'ng-dirty': this.isFieldValid(field) };
  }

  isFieldValid(field: string) {
  }
  writeValue(val: any): void {
    if (val) {
      this.contactRoleFormGroup.setValue(val, { emitEvent: false });
    }
  }
  addContactRole() {
    this.contactSearchEnabled = true;
    this.selectedRole = '';
    this.roleSelected = false;
  }

  getContactRoleDetails(entityId: number) {
    console.log('Fetching Role data for Id:' + entityId.toString());
    let searchParams = new HttpParams();
    searchParams = searchParams.append('entityId', entityId.toString());
    const opts = { params: searchParams };
    this.entityService.getActiveEntityRolesByEntityId(opts).subscribe((data: any) => {
      this.roles = [];
      console.log(data);
      this.activeEntityRoles = data;
      data.forEach(element => {
        let contactRole = element.contactRole;
        this.roles.push(contactRole.name);
      });

    });
  }
  getContactRoleSelectList() {
    console.log('Fetching Role List');
    this.contactRoleService.getContactRoleSelectList().subscribe((data: any) => {
      console.log(data);
      this.roleList = data;
    });
  }
  saveContactRole() {
    if (this.selectedRole === '') {
      this.messageService.add({ severity: 'warn', summary: 'Warn', detail: 'Please select a Role.' });
      this.roleSelected = false;
      return false;
    }
    else {
      if (this.roles.indexOf(this.selectedRole) > -1) {
        this.messageService.add({ severity: 'warn', summary: 'Warn', detail: 'Unsuccessfully assigned Contact to the Role. Contact is already assigned to that Role.' });
        return false;
      }
      else {
        this.roles.push(this.selectedRole);
        this.contactSearchEnabled = false;
        this.addNewContactRole();
      }
    }
  }
  onRoleChange(e: any) {
    console.log("Role changed:" + JSON.stringify(e))
    console.log("Selected value:" + this.roleList.find(x => x.code == e.value).name);
    this.selectedRole = this.roleList.find(x => x.code == e.value).name;
    //check for duplicate
    console.log(this.roles.indexOf(this.selectedRole));
    console.log(this.roles);
    if (parseInt(e.value) > 0) {
      this.roleSelected = true;
    }

    this.selecctedRoleIds.push(e.value);
    this.newRole.status = 1;
    this.newRole.contactRoleId = e.value;
    this.newRole.effectiveDate = (this.effectiveDate.getMonth() + 1) + "/" + this.effectiveDate.getDate() + "/" + this.effectiveDate.getFullYear();
  }
  removeRole(role: any) {
    console.log("Roles:" + JSON.stringify(this.roles));
    console.log("Remove role:" + role);
    this.removeRoleName = role;
    this.removeRoleId = this.roleList.find(x => x.name == role).code;
    console.log("Remove role Id:" + this.removeRoleId);
    this.showRemoveDialog = true;
  }
  cancelRemoveDialog() {
    this.roles = [...this.roles];
    console.log("canceled Roles:" + JSON.stringify(this.roles));
    this.showRemoveDialog = false;
  }
  addNewContactRole() {
   this.newRole.effectiveDate=(this.effectiveDate.getMonth() + 1) + "/" + this.effectiveDate.getDate() + "/" + this.effectiveDate.getFullYear();
    this.addNewContactRoleEvent.emit(this.newRole);
  }

  onEffectiveDateChange(event: any) {
    console.log("Effetive Date:" + JSON.stringify(event));
    let effectiveDate = new Date(event);
    let currentDate = new Date();
    if (effectiveDate.getFullYear() != currentDate.getFullYear()) {
      this.confirmationService.confirm({
        message: "Are you sure you want to use this date?",
        header: "Confirm",
        icon: "pi pi-exclamation-triangle",
        accept: () => {
          this.effectiveDate = effectiveDate;
        },
        reject: () => {
          this.effectiveDate = new Date();
        },
      });
    }
  }

  ngOnChanges(changes: any) {

    for (let property in changes) {
      if (property === 'parentCompanyId') {
        console.log('Previous:', changes[property].previousValue);
        console.log('Current:', changes[property].currentValue);
        console.log('firstChange:', changes[property].firstChange);
        if (parseInt(changes[property].currentValue) > 0) {
          this.canAddRole = true;
        }
      }
    }
  }

  async getContactActiveRoleList(entityId: number) {
    console.log('Fetching Role data for Id:' + entityId.toString());
    let searchParams = new HttpParams();
    searchParams = searchParams.append('entityId', entityId.toString());
    const opts = { params: searchParams };
    var data = await this.entityService.getActiveEntityRolesByEntityId(opts).toPromise();
    console.log(data);
    this.activeEntityRoles = data;
  }

  unassignEntityRole() {
    this.disabledUnassignSaveBtn = true;
    this.selectedEntityRole.endDate = this.datepipe.transform(this.effectiveEndDate, "MM/dd/yyyy");
    this.selectedEntityRole.status = 0;
    this.selectedEntityRole.staffUserId = this.currentUser?.id;
    this.selectedEntityRole.haveHistoricRecords= this.roleHasHistory;
    this.entityRoleService.unassignEntityRole(this.selectedEntityRole).subscribe((res) => {
      this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Role unassigned successfully.' })
      this.unassignRoleDialogSecond = false;
      this.unassignRoleDialog = false;
      this.getContactRoleDetails(this.parentEntityId);
      this.disabledUnassignSaveBtn = false;
    });
  }

  async unassignRole(role: any) {
    if (this.disabledUnassignSaveBtn) {
      this.disabledUnassignSaveBtn = false;
      return;
    }
    this.effectiveEndDate=new Date();
    if (!this.activeEntityRoles.find(x => x.contactRole?.name === role)) {
      await this.getContactActiveRoleList(this.parentEntityId);
    }
    this.selectedEntityRole = this.activeEntityRoles.find(x => x.contactRole.name == role);
    if (this.selectedEntityRole) {
      this.minEffectiveEndDate = new Date(this.selectedEntityRole.effectiveDate);
      this.unassignRoleName = role;
      var person = this.selectedEntityRole.entity?.people[0];
      this.unassignRoleContact = person.firstName + " " + person.lastName;
      this.unassignRoleAccount = this.selectedEntityRole.company?.companyName;
      this.unassignRoleDialog = true;
    }
  }
  async unassignRoleAccept() {
    if (!this.effectiveEndDate) {
      this.effectiveEndDateRequired = true;
      return;
    }
    var res = await this.checkActivityForRole(this.selectedEntityRole.effectiveDate);
    if (res) {
      this.roleHasHistory = true;
      this.disabledUnassignSaveBtn = true;
      this.unassignEntityRole();
    }
    else {
      this.unassignRoleDialog = false;
      this.unassignRoleDialogSecond = true;
    }
  }

  unassignRoleSecondAccept() {
    this.disabledUnassignSaveBtn = true;
    this.effectiveEndDate=new Date;
    this.unassignEntityRole();
  }
  unassignRoleReject() {
    this.unassignRoleDialog = false;
  }
  unassignRoleSecondReject() {
    this.unassignRoleDialogSecond = false;
  }
  effectiveEndDateChanged(input) {
    this.effectiveEndDateRequired = false;
  }

  async checkActivityForRole(date): Promise<boolean> {
    var result = await this.getContactActivitiesByDate(date);
    return result;
  }
  async getContactActivitiesByDate(activityDate): Promise<boolean> {
    let date = this.datepipe.transform(activityDate, "MM/dd/yyyy")
    let searchParams = new HttpParams();
    searchParams = searchParams.append('entityId', this.parentEntityId.toString());
    searchParams = searchParams.append('activityDate', date);
    const opts = { params: searchParams };
    var result = await this.contactActivityService.getContactActivitiesByDate(opts).toPromise();
    if (result != null && result.length > 0) {
      return true;
    }
    return false;
  }

}
