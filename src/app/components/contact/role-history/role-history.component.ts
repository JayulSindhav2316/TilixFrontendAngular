import { Component, OnInit, Input } from '@angular/core';
import { Table } from 'primeng/table';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { AppBreadcrumbService } from '../../../app.breadcrumb.service';
import { Router } from '@angular/router';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ImageService } from '../../../services/image.service';
import { PersonService } from '../../../services/person.service';
import { DomSanitizer } from '@angular/platform-browser';
import { FormBuilder, Validators, FormGroup, FormControl } from "@angular/forms";
import { EntityService } from '../../../services/entity.service';
import { EntityRoleService } from '../../../services/entity-role.service';
import { ContactRoleService } from '../../../services/contact-role.service';
import { DatePipe } from '@angular/common';
import { ContactActivityService } from 'src/app/services/contact-activity.service';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-role-history',
  templateUrl: './role-history.component.html',
  styleUrls: ['./role-history.component.scss']
})
export class RoleHistoryComponent implements OnInit {

  @Input() entityId: number;
  accountContacts: any[];

  showContactTable: boolean;
  showSearch: boolean;
  entity: any;
  contact: any;
  menuItems: { label: string; items: { label: string; icon: string; command: () => void; }[]; }[];
  selectedContactRole: any;
  unassignRoleDialog: boolean = false;
  disabledUnassignSaveBtn: boolean = false;
  selectedEntityRole: any;
  roleHasHistory: boolean;
  unassignHistoricRecordRoleDialog: boolean;
  activeEntityRoles: any;
  minEffectiveEndDate: Date;
  unassignRoleName: any;
  unassignRoleContact: string;
  unassignRoleAccount: any;
  effectiveEndDate: Date = new Date;
  effectiveEndDateRequired: boolean;
  currentUser: any;

  constructor(private breadcrumbService: AppBreadcrumbService,
    private messageService: MessageService,
    private imageService: ImageService,
    private confirmationService: ConfirmationService,
    private router: Router,
    private sanitizer: DomSanitizer,
    private personService: PersonService,
    private fb: FormBuilder,
    private entityService: EntityService,
    private entityRoleService: EntityRoleService,
    private contactRoleService: ContactRoleService,
    private datepipe: DatePipe,
    private contactActivityService: ContactActivityService,
    private authService: AuthService,
    private httpClient: HttpClient) { }

  ngOnInit(): void {
    this.menuItems = [{
      label: 'Options',
      items: [{
        label: 'Unassign Contact',
        icon: 'pi pi-times',
        command: () => {
          this.unassignRole();
        }
      },
      ]
    }
    ];
    //this.getAccountContactsRoleAndByEntityId();
    this.getEntityById(this.entityId);
    this.getContactRoleHistoryByEntityId();
    this.showContactTable = false;
    this.currentUser = this.authService.currentUser;


  }

  getContactRoleHistoryByEntityId() {
    console.log('Fetching contact Account data for Entity:' + this.entityId);
    let searchParams = new HttpParams();
    searchParams = searchParams.append('entityId', this.entityId);
    const opts = { params: searchParams };
    this.entityRoleService.getContactRoleHistoryByEntityId(opts).subscribe((data: any) => {
      console.log('Account Contact Role history:' + JSON.stringify(data));
      this.accountContacts = data;
      this.showContactTable = true;
    });
  }
  showAccountDetail(role: any) {
    console.log('Redirecting user to Account overview:' + JSON.stringify(role));
    this.router.navigate(["/contactProfile"], {
      queryParams: {
        entityId: role.accountId,
        tab: 0,
      },
    });
  }
  showAccountRoleDetail(role: any) {
    console.log('Redirecting user to Account Role:' + JSON.stringify(role));
    localStorage.setItem('ActiveRole', role.contactRoleId)
    this.router.navigate(["/contactProfile"], {
      queryParams: {
        entityId: role.accountId,
        tab: 4,
      },
    });
  }

  getEntityById(entityId) {
    console.log("Fetcing data for Entity:" + entityId);
    let searchParams = new HttpParams();
    searchParams = searchParams.append("entityId", entityId);
    const opts = { params: searchParams };
    this.entityService.getEntitySummaryById(opts)
      .subscribe((data: any) => {
        console.log(data);
        this.entity = data;
        this.contact=this.entity?.person;
      });
  }


  addContacts() {
    this.showSearch = true;
    this.showContactTable = false;
  }

  reloadContactRoles(event) {
    this.messageService.add({
      severity: 'success',
      summary: 'Successful',
      detail: 'Role has been assigned succesfully.',
      life: 3000
    });
    this.showSearch = false;
    this.showContactTable = true;
    this.getContactRoleHistoryByEntityId();
  }

  setActiveRow(contactRole: any) {
    console.log('Selected Contact Role:' + JSON.stringify(contactRole));
    this.selectedContactRole = contactRole;
  }

  unassignEntityRole() {
    this.disabledUnassignSaveBtn = true;
    this.selectedEntityRole = this.selectedContactRole;
    this.selectedEntityRole.entityRoleId = this.selectedContactRole.entityRoleId;
    this.selectedEntityRole.contactRoleId = this.selectedContactRole.contactRoleId;
    this.selectedEntityRole.endDate = this.datepipe.transform(this.effectiveEndDate, "MM/dd/yyyy");
    this.selectedEntityRole.status = 0;
    this.selectedEntityRole.staffUserId = this.currentUser?.id;
    this.selectedEntityRole.haveHistoricRecords = this.roleHasHistory;
    this.entityRoleService.unassignEntityRole(this.selectedEntityRole).subscribe((res) => {
      this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Role unassigned successfully.' })
      this.unassignHistoricRecordRoleDialog = false;
      this.unassignRoleDialog = false;
      this.disabledUnassignSaveBtn = false;
      this.getContactRoleHistoryByEntityId();
    });
  }

  unassignRole() {
    if (this.disabledUnassignSaveBtn) {
      this.disabledUnassignSaveBtn = false;
      return;
    }
    if (this.selectedContactRole) {
      this.minEffectiveEndDate = new Date(this.selectedContactRole.effectiveDate);
      this.unassignRoleName = this.selectedContactRole.role;
      var person = this.entity?.person;
      this.unassignRoleContact = person.firstName + " " + person.lastName;
      this.unassignRoleAccount = this.selectedContactRole.accountName;
      this.unassignRoleDialog = true;
    }
  }
  async unassignRoleAccept() {
    if (!this.effectiveEndDate) {
      this.effectiveEndDateRequired = true;
      return;
    }
    var res = await this.checkActivityForRole(this.selectedContactRole.effectiveDate);
    if (res) {
      this.roleHasHistory = true;
      this.disabledUnassignSaveBtn = true;
      this.unassignEntityRole();
    }
    else {
      this.roleHasHistory = false;
      this.unassignRoleDialog = false;
      this.unassignHistoricRecordRoleDialog = true;
    }
  }

  unassignHistoricRecordRoleAccept() {
    this.disabledUnassignSaveBtn = true;
    this.effectiveEndDate = new Date;
    this.unassignEntityRole();
  }
  unassignRoleReject() {
    this.unassignRoleDialog = false;
  }
  unassignHistoricRecordRoleReject() {
    this.unassignHistoricRecordRoleDialog = false;
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
    searchParams = searchParams.append('entityId', this.entityId.toString());
    searchParams = searchParams.append('activityDate', date);
    const opts = { params: searchParams };
    var result = await this.contactActivityService.getContactActivitiesByDate(opts).toPromise();
    if (result != null && result.length > 0) {
      return true;
    }
    return false;
  }


}