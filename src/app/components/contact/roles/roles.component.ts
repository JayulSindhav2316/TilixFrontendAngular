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
import { AuthService } from 'src/app/services/auth.service';
import { ContactActivityService } from 'src/app/services/contact-activity.service';
@Component({
  selector: 'app-roles',
  templateUrl: './roles.component.html',
  styleUrls: ['./roles.component.scss']
})
export class RolesComponent implements OnInit {

  @Input() entityId: number;
  @Input() selectedRole: string;

  noRecords: boolean;
  accountContacts: any[];
  images: { [index: number]: [any] } = {};
  imgUrl: string;
  isImageLoading: boolean;
  showTable: boolean;
  public personImage: any = [];
  showSearch: boolean;
  searchEnabled: boolean;
  showCompany: boolean;
  showContact: boolean;
  companyId: number;
  contact: any;
  roles: any[];
  selectedRoleId: number;
  showRoles: boolean;
  showPanels: boolean;
  showContactTable: boolean;
  showRoleHistoryTable: boolean;
  currentRole: any;
  items: any[] = [];
  selectedContactRole: any;
  currentUser = this.authService.currentUserValue;
  roleHasHistory: string | number | boolean;
  unassignRoleHistoricRecordsDialog: boolean;
  unassignRoleDialog: boolean;
  activeEntityRoles: any;
  minEffectiveEndDate: Date;
  unassignRoleName: any;
  unassignRoleContact: string;
  unassignRoleAccount: any;
  effectiveEndDate: Date = new Date;
  effectiveEndDateRequired: boolean;
  disableUnassignSaveBtn: boolean = false;

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
    private httpClient: HttpClient,
    private datepipe: DatePipe,
    private authService: AuthService,
    private contactActivityService: ContactActivityService) { }

  ngOnInit(): void {
    this.items = [{
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
    this.showSearch = false;
    this.searchEnabled = true;
    this.showCompany = false;
    this.showContact = false;
    // this.showRoles = true;
    this.showPanels = false;
    this.showContactTable = false;
    this.showRoleHistoryTable = true;

  }
  getAccountContactsRoleAndByEntityId() {
    console.log('Fetching contact Account data for Entity:' + this.entityId);
    let searchParams = new HttpParams();
    searchParams = searchParams.append('roleId', this.selectedRoleId);
    searchParams = searchParams.append('entityId', this.entityId);
    const opts = { params: searchParams };
    this.entityRoleService.getContactsByRoleAndEntityId(opts).subscribe((data: any) => {
      console.log('Account Contacts:' + JSON.stringify(data));
      this.accountContacts = data;
      let counter = 0;
      for (var contact of this.accountContacts) {
        this.getImageFromService(contact.entityId, counter);
        counter++;
        this.showTable = true;
        this.showPanels = true;
        this.showContactTable = true;
        this.showRoleHistoryTable = true;
      }
    });
  }
  getAccountContactsRoleAndByCompanyId() {
    console.log('Fetching contact Account data for Company:' + this.companyId);
    let searchParams = new HttpParams();
    searchParams = searchParams.append('roleId', this.selectedRoleId);
    searchParams = searchParams.append('companyId', this.companyId);
    const opts = { params: searchParams };
    this.entityRoleService.getContactsByRoleAndCompanyId(opts).subscribe((data: any) => {
      console.log('Account Contacts:' + JSON.stringify(data));
      this.accountContacts = data;
      let counter = 0;
      for (var contact of this.accountContacts) {
        this.getImageFromService(contact.entityId, counter);
        counter++;
        this.showTable = true;
      }
    });
  }
  getContactRoleById(roleId: any) {
    console.log('Fetching contact Role:' + roleId);
    let searchParams = new HttpParams();
    searchParams = searchParams.append('roleId', roleId);
    const opts = { params: searchParams };
    this.contactRoleService.getContactRoleById(opts).subscribe((data: any) => {
      console.log('Contact ROle:' + JSON.stringify(data));
      this.selectedRole = data.name;
      this.getAccountContactsRoleAndByCompanyId();
    });
  }
  getRolesByCompanyId() {
    console.log('Fetching Roles data for company:' + this.companyId);
    let searchParams = new HttpParams();
    searchParams = searchParams.append('companyId', this.companyId);
    const opts = { params: searchParams };
    this.entityRoleService.getRolesByCompanyId(opts).subscribe((data: any) => {
      console.log('Roles:' + JSON.stringify(data));
      this.roles = data;
      if (this.roles.length > 0) {
        this.showTable = true;
        this.showRoles = true;
        this.noRecords = false;
      }
      else {
        this.showRoles = false;
        this.noRecords = true;
      }

      //Check if linked from overview tab

      let activeRole = localStorage.getItem('ActiveRole');
      console.log("Active Role:" + activeRole);
      if (activeRole) {
        //this.selectedRole=activeRole;
        this.selectedRoleId = parseInt(activeRole);
        this.showRoles = false;
        this.getContactRoleById(this.selectedRoleId)
        this.getAccountContactsRoleAndByCompanyId();
        this.showPanels = true;
        this.showRoles = false;
        this.showContactTable = true;
        this.showRoleHistoryTable = true;
      }
    });
  }
  getImageFromService(personId: number, counter: number) {
    this.isImageLoading = true;

    this.entityService.getProfileImage(personId).subscribe(data => {
      this.createImageFromBlob(data, counter);
      this.isImageLoading = false;
      console.log(data);
    }, error => {
      this.isImageLoading = false;
      console.log(error);
    });
  }

  createImageFromBlob(image: Blob, counter: number) {
    let reader = new FileReader();
    reader.addEventListener('load', () => {
      this.personImage.push(reader.result);
      this.images[counter] = [reader.result];
    }, false);
    if (image) {
      reader.readAsDataURL(image);
    }
  }
  getEntityById(entityId) {
    console.log("Fetcing data for Entity:" + entityId);
    let searchParams = new HttpParams();
    searchParams = searchParams.append("entityId", entityId);
    const opts = { params: searchParams };
    this.entityService.getEntitySummaryById(opts)
      .subscribe((data: any) => {
        console.log(data);
        this.contact = data;

        if (this.contact.companyId) {
          this.showCompany = true;
          console.log("Showing company record");
          this.companyId = this.contact.companyId;
          this.getRolesByCompanyId();
        } else {
          this.showContact = true;
        }
      });
  }
  showContactsDetail(role: any) {
    this.currentRole = role;
    console.log("Fetcing data for RoleId:" + role.contactRoleId);
    let searchParams = new HttpParams();
    searchParams = searchParams.append("roleId", this.currentRole.contactRoleId);
    searchParams = searchParams.append("companyId", this.companyId);
    const opts = { params: searchParams };
    this.entityRoleService.getContactsByRoleAndCompanyId(opts)
      .subscribe((data: any) => {
        console.log(data);
        this.accountContacts = data;
        var counter = 0;
        for (var contact of this.accountContacts) {
          this.getImageFromService(contact.entityId, counter);
          counter++;
          this.selectedRole = contact.role;
        }
        this.showPanels = true;
        this.showRoles = false;
        this.showContactTable = true;
        this.showRoleHistoryTable = true;
      });
  }
  addContacts() {
    this.showSearch = true;
    this.showRoleHistoryTable = false;
  }
  reloadContactRoles(e: any) {
    this.showContactsDetail(this.currentRole);
    this.showSearch = false;
    this.showRoleHistoryTable = true;
    this.showContactTable = true;
  }
  closeContactPanel() {
    this.showSearch = false;
    this.showRoles = true;
    this.showContactTable = false;
    this.showRoleHistoryTable = false;
    this.showPanels = false;
    localStorage.removeItem('ActiveRole');
  }
  showContactDetail(contact: any) {
    console.log('Redirecting user to Account overview:' + JSON.stringify(contact));
    this.router.navigate(["/contactProfile"], {
      queryParams: {
        entityId: contact.entityId,
        tab: 0,
      },
    });
  }
  setActiveRow(contactRole: any) {
    console.log('Selected Contact Role:' + JSON.stringify(contactRole));
    this.selectedContactRole = contactRole;
  }

  unassignEntityRole() {
    this.selectedContactRole.endDate = this.datepipe.transform(new Date, "MM/dd/yyyy");
    this.selectedContactRole.status = 0;
    this.selectedContactRole.staffUserId = this.currentUser?.id;
    this.selectedContactRole.haveHistoricRecords = this.roleHasHistory;
    this.entityRoleService.unassignEntityRole(this.selectedContactRole).subscribe((res) => {
      this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Contact unassigned from role successfully.' })
      this.unassignRoleHistoricRecordsDialog = false;
      this.unassignRoleDialog = false;
      this.showContactsDetail(this.selectedContactRole);
    });
  }

  unassignRole() {
    if (this.disableUnassignSaveBtn) {
      this.disableUnassignSaveBtn = false;
      return;
    }
    if (this.selectedContactRole) {
      this.minEffectiveEndDate = new Date(this.selectedContactRole.effectiveDate);
      this.unassignRoleName = this.selectedContactRole.role;
      this.unassignRoleContact = this.selectedContactRole.firstName + " " + this.selectedContactRole.lastName;
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
      this.disableUnassignSaveBtn = true;
      this.unassignEntityRole();
    }
    else {
      this.unassignRoleDialog = false;
      this.unassignRoleHistoricRecordsDialog = true;
    }
  }

  unassignRoleSecondAccept() {
    this.disableUnassignSaveBtn = true;
    this.effectiveEndDate = new Date;
    this.unassignEntityRole();
  }
  unassignRoleReject() {
    this.unassignRoleDialog = false;
  }
  unassignRoleSecondReject() {
    this.unassignRoleHistoricRecordsDialog = false;
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
    searchParams = searchParams.append('entityId', this.selectedContactRole.entityId);
    searchParams = searchParams.append('activityDate', date);
    const opts = { params: searchParams };
    var result = await this.contactActivityService.getContactActivitiesByDate(opts).toPromise();
    if (result != null && result.length > 0) {
      return true;
    }
    return false;
  }

}
