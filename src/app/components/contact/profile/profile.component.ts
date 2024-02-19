import { Component, OnInit, Input } from '@angular/core';
import { faEdit, faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { AppBreadcrumbService } from '../../../app.breadcrumb.service';
import { Output, EventEmitter } from '@angular/core';
import { PersonService } from '../../../services/person.service';
import { HttpParams } from '@angular/common/http';
import { EnumArray } from 'src/app/helpers/enumArray';
import { Router } from '@angular/router';
import { CreateMembership } from 'src/app/models/create-membership';
import { EntityService } from '../../../services/entity.service';
import { Location } from '@angular/common';
import { CompanyService } from 'src/app/services/company.service';
import { AuthService } from 'src/app/services/auth.service';
import { ConfigurationService } from "../../../services/configuration.service";
import { ContactActivityService } from 'src/app/services/contact-activity.service';
import { EntityRoleService } from '../../../services/entity-role.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  providers: [EnumArray]
})
export class ProfileComponent implements OnInit {
  constructor(private breadcrumbService: AppBreadcrumbService,
    private messageService: MessageService,
    private personService: PersonService,
    private confirmationService: ConfirmationService,
    private enumArray: EnumArray,
    private entityService: EntityService,
    private companyService: CompanyService,
    private router: Router,
    private location: Location,
    private authService: AuthService,
    private configurationService: ConfigurationService,
    private contactActivityService: ContactActivityService,
    private entityRoleService: EntityRoleService,
  ) {
    this.breadcrumbService.setItems([
      { label: 'Home' },
      { label: 'Contacts-CRM', routerLink: ['/contacts'] },
      { label: 'Profile' }
    ]);
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
  }

  @Input() entityId: number;

  @Output() activeTabEvent = new EventEmitter<number>();

  contact: any;
  entity: any;
  company: any;
  historyRoles: any
  profileLoaded: boolean;
  invoices: any[];
  profile: any;
  membershipStatus: string;
  membershipExpirationDate: Date;
  showLoader: boolean;
  preferredContact: string;
  newMembershipData: CreateMembership;
  relations: any[];
  accountContacts: any[];
  contactActivities: any[];
  currentActivityPage: any = 0;
  activityItemsPerPage: any = 2;
  pagedContactActivities: any[] = [];
  totalActivityRecords: number = 0;
  loadingbody: boolean;
  faEdit = faEdit;
  faTrash = faTrash;
  faPlus = faPlus;
  configuration: any;
  isCompanyProfile: boolean;
  skeletonnList = [
    { name: 'dummy1', code: '001' },
    { name: 'dummy2', code: '002' },
    { name: 'dummy3', code: '003' },
    { name: 'dummy4', code: '004' },
  ];
  showNotes: boolean;
  showEncounters: boolean;
  showBoardGroups: boolean;
  showWebInfo: boolean;
  showWallet: boolean;
  showInvoicePayments: boolean;
  showMembership: boolean;
  showRelatedContacts: boolean;
  showDetails: boolean;
  showOverview: boolean;
  disableDelete: boolean;
  showAccountContacts: boolean;
  showRoles: boolean;
  showActivities: boolean;
  currentUser: any;
  entityRoles: string;
  // tslint:disable-next-line:member-ordering
  ngOnInit(): void {
    //this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.showLoader = true;
    console.log('profile: EntiyId:' + this.entityId);
    this.profileLoaded = false;
    this.isCompanyProfile = false;
    // Get Person Record
    this.loadingbody = true;
    this.showNotes = true;
    this.showBoardGroups = true;
    this.showEncounters = true;
    this.showWebInfo = true;
    this.showWallet = true;
    this.showInvoicePayments = true;
    this.showMembership = true;
    this.showRelatedContacts = true;
    this.showDetails = true;
    this.showOverview = true;
    this.showAccountContacts = true;
    this.showRoles = true;
    this.showActivities = true;
    this.getRelationsById(this.entityId);
    this.getProfileById(this.entityId);
    this.getAccountContactsById(this.entityId);
    this.getAllActivity(this.entityId);
    this.getConfiguration(this.currentUser.organizationId);

  }

  setActiveTab(value: number) {
    console.log('Set Active Tab ->:' + value);
    this.activeTabEvent.emit(value);
  }

  getProfileById(entityId) {
    console.log('Fetching profile data for Entity:' + entityId);
    let searchParams = new HttpParams();
    searchParams = searchParams.append('entityId', entityId);
    const opts = { params: searchParams };
    this.entityService.getEntityProfileById(opts).subscribe((data: any) => {
      console.log(data);
      this.contact = data.person;
      this.entity = data;
      this.company = data.company;

      if (this.entity.personId) {
        if (this.contact.zip) {
          const maskedzip = this.contact.zip.replace(/[_-]/g, '');
          if (maskedzip.length == 5)
            this.contact.zip = maskedzip
        }

        this.preferredContact = this.enumArray.getPreferredContactValue(this.contact.preferredContact);

        //Get roles & Account contact Roles

        if (this.contact.companyId > 0) {
          this.entityRoles = '';
          if (this.contact.entityRoles) {
            this.contact.entityRoles.forEach(element => {
              if (this.entityRoles != '') {
                this.entityRoles = this.entityRoles + ", " + element.contactRole.name;
              }
              else {
                this.entityRoles = element.contactRole.name;
              }

            });
          }

        }

      } else {
        this.isCompanyProfile = true;
        // if(this.company.zip){
        //   const maskedzip  = this.company.zip.replace(/[_-]/g, '');
        //   if (maskedzip.length == 5)
        //     this.company.zip = maskedzip
        // }
      }

      this.showLoader = false;
      this.profileLoaded = true;
    });
    this.entityRoleService.getActiveContactRolesByEntityId(opts).subscribe((data: any) => {
      console.log('Account Contact Role history:' + JSON.stringify(data));
      this.historyRoles = data;
    });

  }

  getAccountContactsById(entityId) {
    this.accountContacts = [];
    console.log('Fetching contact Account data for Entity:' + entityId);
    let searchParams = new HttpParams();
    searchParams = searchParams.append('entityId', entityId);
    const opts = { params: searchParams };
    this.entityRoleService.GetAccountContactsByEntityId(opts).subscribe((data: any) => {
      console.log('Account Contacts:' + JSON.stringify(data));
      this.accountContacts = data;

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

  getAllActivity(entityId) {

    let searchParams = new HttpParams();
    searchParams = searchParams.append('id', entityId);
    const opts = { params: searchParams };

    this.contactActivityService.getContactActivitiesByEntityId(opts).subscribe((res) => {
      this.contactActivities = [];
      res.forEach((activity: any) => {
        activity.expandDescription = activity.description.replace(/\\n/g, '<br>');
        activity.description = activity.description.replace(/\\n/g, ' ');
        this.contactActivities.push(activity);
      });
      this.updateActivityPagination();
    }, error => {
      console.log(error);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: error,
        life: 3000
      });
    })
  }
  getRelationsById(entityId) {
    console.log('Fetching relation data for Entity:' + entityId);
    let searchParams = new HttpParams();
    searchParams = searchParams.append('entityId', entityId);
    const opts = { params: searchParams };
    this.entityService.getRelationsByEntityId(opts).subscribe((data: any) => {
      console.log(data);
      this.relations = data;
      //this.loadingbody=false;
    });
  }
  getConfiguration(organizationId) {
    this.configurationService
      .getConfigurationByOrganizationId(organizationId)
      .subscribe((data: any) => {
        console.log("Configuration:" + JSON.stringify(data));
        this.configuration = data;

        //Show hide tabs
        console.log(
          "Configuration Display Tabs:" +
          JSON.stringify(this.configuration.contactDisplayTabs)
        );
        console.log(
          "Configuration Display Tabs:" +
          JSON.stringify(this.configuration.displayRoles));
        var contactTabs =
          this.configuration.contactDisplayTabs.split(",");
        if (contactTabs.indexOf("Encounters") < 0) {
          this.showEncounters = false;
        }
        if (contactTabs.indexOf("Notes") < 0) {
          this.showNotes = false;
        }
        if (contactTabs.indexOf("BoardsGroups") < 0) {
          this.showBoardGroups = false;
        }
        if (contactTabs.indexOf("WebInfo") < 0) {
          this.showWebInfo = false;
        }
        if (contactTabs.indexOf("Wallet") < 0) {
          this.showWallet = false;
        }
        if (contactTabs.indexOf("InvoicePayments") < 0) {
          this.showInvoicePayments = false;
        }
        if (contactTabs.indexOf("Membership") < 0) {
          this.showMembership = false;
        }
        if (contactTabs.indexOf("RelatedContacts") < 0) {
          this.showRelatedContacts = false;
        }

        if (contactTabs.indexOf("AccountContacts") < 0) {
          this.showAccountContacts = false;
        }
        if (contactTabs.indexOf("Roles") < 0) {
          this.showRoles = false;
        }
        if (contactTabs.indexOf("Activities") < 0) {
          this.showActivities = false;
        }

      });
  }
  createMembership() {
    this.newMembershipData = { entityId: this.contact.entityId };
    const jsonData = JSON.stringify(this.newMembershipData);
    localStorage.setItem("NewMembershipEntity", jsonData);

    this.router.navigate(["membership/createMembership"], { queryParams: { entityId: this.entityId }, });
  }
  showDetail(relation: any) {
    console.log("Active Row:" + JSON.stringify(relation));
    this.router.navigate(["/contactProfile"], {
      queryParams: { entityId: relation.relatedEntityId },
    });
  }
  showRoleDetail(role: any) {
    console.log("Active Role:" + JSON.stringify(role));
    localStorage.setItem('ActiveRole', role)
    this.setActiveTab(3);
  }
  showAccountDetail(contact: any) {
    console.log('Redirecting user to Account overview:' + JSON.stringify(contact));
    localStorage.removeItem('ActiveRole');
    this.router.navigate(["/contactProfile"], {
      queryParams: {
        entityId: contact.company.entityId,
        tab: 0,
      },
    });
  }

  onActivityPageChange(event: any) {
    this.currentActivityPage = event.page;
    this.updatePagedActivities();
  }

  updatePagedActivities() {
    const startIndex = (this.currentActivityPage) * this.activityItemsPerPage;
    const endIndex = startIndex + this.activityItemsPerPage;
    this.pagedContactActivities = this.contactActivities.slice(startIndex, endIndex);
  }

  updateActivityPagination() {
    this.totalActivityRecords = this.contactActivities.length;
    this.updatePagedActivities();
  }
  showContactDetail(contact: any){
    console.log('Redirecting user to Account overview:' + JSON.stringify(contact));
    this.router.navigate(["/contactProfile"], {
      queryParams: {
          entityId: contact.entityId,
          tab: 0,
      },
  });
  }
}
