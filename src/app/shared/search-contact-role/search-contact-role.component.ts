import { Component, OnInit, Input, ViewChild, forwardRef } from "@angular/core";
import { ConfirmationService, MenuItem, MessageService } from "primeng/api";
import { Router, ActivatedRoute } from "@angular/router";
import { Output, EventEmitter } from "@angular/core";
import { HttpParams } from "@angular/common/http";
import { EntityService } from "../../services/entity.service";
import { ContactRoleService } from "../../services/contact-role.service";
import { PersonService } from "../../services/person.service";
import { EntityRoleService } from "../../services/entity-role.service";
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
type ChangeCallbackFn<T> = (value: T) => void;
type TouchCallbackFn = () => void;
@Component({
  selector: 'app-search-contact-role',
  templateUrl: './search-contact-role.component.html',
  styleUrls: ['./search-contact-role.component.scss'],
  providers: [MessageService, ConfirmationService, {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => SearchContactRoleComponent),
    multi: true
  },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => SearchContactRoleComponent),
      multi: true
    }]
})
export class SearchContactRoleComponent implements OnInit {
  @Input() parentControl: string;
  @Input() parentEntityId: number;
  @Input() parentCompanyId: number;
  @Input() searchEnabled: boolean;
  @Input() selectedParentRole: string;
  @Input() firstName: string;
  @Input() lastName: string;
  @Output() closeEvent = new EventEmitter<string>();
  @Output() addNewContactRoleEvent = new EventEmitter<EntityRole>();

  controlValueChanged: { roleChanged: boolean };
  onTouched: () => void = () => { };
  contactSearchEnabled: boolean;
  searchByContactNameForm: FormGroup;
  showAddContactRoleTable: boolean;
  entityRoles: any[];
  roleList: any[];
  selectedRole: string;
  selecctedRoleIds: any[];
  contactRoleFormGroup: FormGroup = this.fb.group({
    roleId: ['']
  });
  effectiveDate: Date;
  submitted: boolean;
  endDate: Date;
  showRemoveDialog: boolean;
  newRole: EntityRole;
  removeRoleId: string;
  removeRoleName: string;
  accountContacts: any[];
  styleValue: { width: '50vw' };
  canAddRole: boolean;
  hasSelectedRole: boolean;
  parentRoleId: number;
  currentRoles: any[];
  roles: any[];
  activeEntityRoles: any;
  constructor(
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private router: Router,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private entityService: EntityService,
    private contactRoleService: ContactRoleService,
    private personService: PersonService,
    private entityRoleService: EntityRoleService
  ) {

  }
  ngOnInit(): void {
    this.searchByContactNameForm = this.fb.group({
      ParentEntityId: [0],
      FirstName: [{ value: "", disabled: !this.searchEnabled }],
      LastName: [{ value: "", disabled: !this.searchEnabled }],
    });
    this.showAddContactRoleTable = false;
    this.contactSearchEnabled = this.searchEnabled;
    if (this.parentEntityId != null) {
      this.showAddContactRoleTable = true;
      this.contactSearchEnabled = false;
      this.getContactRoleDetails(this.parentEntityId);
    }

    this.searchByContactNameForm.get('FirstName').setValue(this.firstName ?? '');
    this.searchByContactNameForm.get('LastName').setValue(this.lastName ?? '');
    this.getContactRoleSelectList();
    this.selecctedRoleIds = [];
    this.showRemoveDialog = false;
    this.effectiveDate = new Date();
    this.endDate = new Date();
    this.canAddRole = false;
    //this.selectedRole="None";
    if (this.selectedParentRole) {
      this.hasSelectedRole = true;
    }
    console.log("Parent Selected Role:" + this.selectedParentRole)
    this.newRole = {};
    this.newRole.effectiveDate= (this.effectiveDate.getMonth() + 1) + "/" + this.effectiveDate.getDate() + "/" + this.effectiveDate.getFullYear();
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
  }

  getContactRoleSelectList() {
    console.log('Fetching Role List');
    this.contactRoleService.getContactRoleSelectList().subscribe((data: any) => {
      console.log(data);
      this.roleList = data;
      if (this.selectedParentRole) {
        this.parentRoleId = this.roleList.find(x => x.name == this.selectedParentRole).code;
        this.roleList = [];
        this.newRole.contactRoleId = this.parentRoleId;
      }
    });
  }
  async validateEntityAccountRole(entityId: any) {
    console.log('Fetching Role data for Id:' + entityId.toString());
    let validRole = true;
    let searchParams = new HttpParams();
    searchParams = searchParams.append('entityId', entityId.toString());
    const opts = { params: searchParams };
    let roleid = 0;
    this.entityService.getActiveEntityRolesByEntityId(opts).subscribe((data: any) => {
      this.entityRoles = [];
      this.entityRoles = data;
      console.log("Validating role:" + this.selectedRole);
      if (this.selectedParentRole) {
        this.entityRoles.forEach(element => {
          console.log("Roles:" + JSON.stringify(element.contactRole.name));
          if (element.contactRole.name === this.selectedParentRole) {
            validRole = false;
            console.log("Role already exists:" + this.selectedParentRole);
          }
        });
      }
      else {
        this.entityRoles.forEach(element => {
          console.log("Roles:" + JSON.stringify(element.contactRole.name));
          if (element.contactRole.name === this.selectedRole) {
            validRole = false;
            console.log("Role already exists:" + this.selectedRole);
          }
        });
      }

      if (validRole) {
        //Add role 
        const body = {
          entityId: entityId,
          contactRoleId: this.newRole.contactRoleId,
          effectiveDate: this.newRole.effectiveDate,
          companyId: this.parentCompanyId,
          status: this.newRole.status,
        }

        this.entityRoleService.createEntityRole(body).subscribe(
          response => {
            this.messageService.add({
              severity: 'success',
              summary: 'Successful',
              detail: 'Role has been assigned succesfully.',
              life: 3000
            });
            this.addNewContactRole();
          },
          error => {
            console.log(error);
            this.messageService.add({ severity: 'error', summary: 'Error', detail: error, life: 3000 });
          });
      }
      else {
        this.messageService.add({ severity: 'warn', summary: 'Warning', detail: 'Unsuccessfully assigned Contact to the Role. Contact is already assigned to that Role.' });
      }
    });
    return validRole;
  }
  saveContactRole(entityId: any) {
    if (this.selectedRole === '') {
      this.messageService.add({ severity: 'warn', summary: 'Warning', detail: 'Please select a Role.' });
      return false;
    }
    else {
      this.validateEntityAccountRole(entityId);
    }
  }
  onRoleChange(i: any, e: any) {
    console.log("Role changed:" + JSON.stringify(e))
    console.log("Role row changed:" + JSON.stringify(i))
    console.log("Selected value:" + this.roleList.find(x => x.code == e.value).name);
    this.selectedRole = this.roleList.find(x => x.code == e.value).name;
    if (parseInt(e.value) > 0) {
      this.accountContacts[i].addRoleEnabled = 1
    }
    if (this.selectedParentRole) {
      this.accountContacts[i].addRoleEnabled = 1
    }
    this.newRole.status = 1;
    this.newRole.contactRoleId = e.value;
    this.newRole.effectiveDate = (this.effectiveDate.getMonth() + 1) + "/" + this.effectiveDate.getDate() + "/" + this.effectiveDate.getFullYear();
  }


  addNewContactRole() {

    this.addNewContactRoleEvent.emit(this.newRole);
  }

  onEffectiveDateChange(i: any, event: any) {
    console.log("Date changed:" + JSON.stringify(event))
    console.log("Date row changed:" + JSON.stringify(i))
    let effectiveDate = new Date(event);
    let currentDate = new Date();
    this.newRole.effectiveDate = (effectiveDate.getMonth() + 1) + "/" + effectiveDate.getDate() + "/" + effectiveDate.getFullYear();
    if (effectiveDate.getFullYear() < currentDate.getFullYear() || effectiveDate.getFullYear() > currentDate.getFullYear()) {
      this.confirmationService.confirm({
        message: "Are you sure you want to use this date?",
        header: "Confirm",
        icon: "pi pi-exclamation-triangle",
        accept: () => {
          this.accountContacts[i].effectiveDate = effectiveDate;
          console.log('yes', this.accountContacts[i].effectiveDate);
          this.effectiveDate = effectiveDate;
          this.newRole.effectiveDate=(this.effectiveDate.getMonth() + 1) + "/" + this.effectiveDate.getDate() + "/" + this.effectiveDate.getFullYear();
  
        },
        reject: () => {
          this.accountContacts[i].effectiveDate = new Date();
          console.log('no', this.accountContacts[i].effectiveDate);
          this.effectiveDate = new Date();
          this.newRole.effectiveDate=(this.effectiveDate.getMonth() + 1) + "/" + this.effectiveDate.getDate() + "/" + this.effectiveDate.getFullYear();
        },
      });
    }
  }

  searchContacts() {
    this.firstName = this.searchByContactNameForm.get("FirstName").value;
    this.lastName = this.searchByContactNameForm.get("LastName").value;
    console.log("first Name:" + this.firstName);
    console.log("last Name:" + this.lastName);
    console.log("CompanyId:" + this.parentCompanyId.toString());
    if (!this.firstName) {
      this.firstName = '';
    }
    if (!this.lastName) {
      this.lastName = '';
    }
    let searchParams = new HttpParams();
    searchParams = searchParams.append("firstName", this.firstName);
    searchParams = searchParams.append("lastName", this.lastName);
    searchParams = searchParams.append("companyId", this.parentCompanyId.toString());
    const opts = { params: searchParams };
    this.getContactsByFirstAndLastName(opts);
    console.log("form submitted:" + JSON.stringify(searchParams));

  }
  getContactsByFirstAndLastName(params) {
    this.entityRoleService
      .getContactsByFirstAndLastName(params)
      .subscribe((data: any[]) => {
        console.log('accounts contacts: ', data);
        this.accountContacts = data;
        this.showAddContactRoleTable = true;
      });
  }
  resetSubmitted(field) {
    this.submitted = false;
    this.isFieldValid(field);
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
      this.accountContacts = [{
        firstName: this.firstName,
        lastName: this.lastName,
        fullName: this.firstName + ' ' + this.lastName,
        entityRoles: this.roles,
        effectiveDate: this.effectiveDate,
        entityId: this.parentEntityId,
        addRoleEnabled: 0
      }];
    });
  }
}
