import { HttpParams, JsonpClientBackend } from '@angular/common/http';
import { Component, OnInit, Input } from '@angular/core';
import { Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { Validators } from '@angular/forms';
import { FormArray } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { AppBreadcrumbService } from '../../../app.breadcrumb.service';
import { ContactAddress } from '../../../models/contact-address';
import { ContactEmail } from '../../../models/contact-email';
import { ContactPhone } from '../../../models/contact-phone';
import { LookupService } from '../../../services/lookup.service';
import { PersonService } from '../../../services/person.service';
import { CompanyService } from '../../../services/company.service';
import { Inject } from "@angular/core";
import { LOCALE_ID } from "@angular/core";
import { Menu } from 'primeng/menu';
import * as moment from 'moment';
import { BehaviorSubject } from 'rxjs';
import { EntityService } from '../../../services/entity.service';
import { AuthService } from '../../../services/auth.service';
import { CountryService } from 'src/app/services/country.service';
import { StateService } from "src/app/services/state.service";
import { EntityRole } from 'src/app/models/entity-role';
import { ConfigurationService } from "src/app/services/configuration.service";
import { CustomFieldService } from 'src/app/services/custom-field.service';
import { CalendarModule } from 'primeng/calendar';
@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.scss'],
  styles: [`
  :host ::ng-deep .p-inputtext {
    background-color: #f8f9fa;
   }
   `],
  providers: [MessageService, ConfirmationService]
})
export class DetailComponent implements OnInit {
  @Input() entityId: number;
  @Output() activeTabEvent = new EventEmitter<number>();
  selectedCategory:string="";
  selectedDropValue:string="";
  selectedDropValueMulti:string="";
  calendarValue:any="";
  showAdditionalBlock:boolean=false;
  controls:any[];
  group1:any;
  companyPh:any;
  companyEm:any;
  billableContactForId=0;
  zipFormatLength: number = 0;
  zipFormat: string = "999999";
  sCompany: string = "";
  contact: any;
  company: any;
  entity: any;
  prefixList: any[];
  titles: any[];
  birthDate: Date;
  selectedPrefix: { name: string; code: string; };
  genders: any[];
  preferredContact: any[];
  selectedGender: { name: string; code: string; };
  isPermanentAddressSame: boolean;
  showForm: boolean;
  showLoader: boolean;
  submitted: boolean;
  isAddNewRecord: boolean;
  currentDate: Date;
  public localID: string;
  disallowSave: boolean;
  redirectRoute: string;
  contactToRelation: string;
  controlValueChanged: {
    prefixChanged: boolean, firstNamechanged: boolean, middleNameChanged: boolean, casualNameChanged: boolean, lastNameChanged: boolean, suffixChanged: boolean, birthDateChanged: boolean, genderChanged: boolean,
    preferredContactChanged: boolean, designationChanged: boolean, companyIdChanged: boolean, companyNameChanged: boolean, titleChanged: boolean, companyWebsite: boolean, companyPhoneChanged: boolean, companyEmailChanged: boolean,
    websiteChanged: boolean, linkedinNameChanged: boolean, twitterNameChanged: boolean, facebookNameChanged: boolean, addresschanged: boolean, phoneChanged: boolean, emailChanged: boolean
  };
  editProfile: boolean;
  showPerson: boolean;
  showCompany: boolean;
  showCompanyName: boolean;
  addErrorMessages: any = {};
  profileForm = this.fb.group({
    PersonId: [0],
    RelationType: [0],
    Prefix: ['', [Validators.required, this.noBlankValidator]],
    FirstName: ['', [Validators.required, this.noBlankValidator]],
    MiddleName: [''],
    LastName: ['', [Validators.required, this.noBlankValidator]],
    CasualName: [''],
    Suffix: [''],
    DateOfBirth: ['', Validators.required],
    Gender: ['', Validators.required],
    PreferredContact: ['', Validators.required],
    Designation: ['', Validators.required],
    CompanyId: [0],
    Title: [''],
    // CompanyName: [''],
    SelectedCompanyName: [''],
    CompanyWebsite: [''],
    CompanyPhone: [''],
    CompanyEmail: [''],
    Website: [''],
    LinkedinName: [''],
    TwitterName: [''],
    FacebookName: [''],
    SkypeName: [''],
    Addresses: this.fb.array([
      this.fb.control('')
    ]),
    Emails: this.fb.array([
      this.fb.control('')
    ]),
    Phones: this.fb.array([
      this.fb.control('')
    ])
  });
  companyForm = this.fb.group({
    CompanyId: [0],
    CompanyName: ['', [Validators.required, this.noBlankValidator]],
    CompanyWebsite: [''],
    BillableContactId: [0],
    BillableFirstName: [''],
    BillableLastName: [''],
    BillableLastNameSearch: [''],
    BillablePhone: [''],
    BillableEmail: [''],
    Title: [''],
    CompanyAddresses: this.fb.array([
      this.fb.control('')
    ]),
    CompanyEmails: this.fb.array([
      this.fb.control('')
    ]),
    CompanyPhones: this.fb.array([
      this.fb.control('')
    ])
  });
  controlName: string;
  relations: any[];
  showBillableContactSearch: boolean;
  enablePersonalInfoSave: boolean;
  enablePhoneInfoSave: boolean;
  enableEmailInfoSave: boolean;
  enableAddressInfoSave: boolean;
  enableCompanyInfoSave: boolean;
  enableSocialInfoSave: boolean;
  parentControl: string;
  companyId: number;
  stateList: any[];
  designationList: any[];
  currentUser: any;
  currentAction: string
  $filtered = new BehaviorSubject([]);
  companyList: any[];
  contactList: any[];
  showBillableInfo: boolean;
  showBillableSearch: boolean;
  addingCompanyBillableContact: boolean = false;
  newAddedCompanyBillablePersonId: number;
  disableSave: boolean = false;
  disableSaveButton: boolean = false;
  countryList: any[];
  entityRoles: EntityRole[] = [];
  enableRoleInfoSave: boolean;
  configuration: any;

  get Addresses() {
    return this.profileForm.get('Addresses') as FormArray;
  }
  get Emails() {
    return this.profileForm.get('Emails') as FormArray;
  }
  get Phones() {
    return this.profileForm.get('Phones') as FormArray;
  }
  get CompanyAddresses() {
    return this.companyForm.get('CompanyAddresses') as FormArray;
  }
  get CompanyEmails() {
    return this.companyForm.get('CompanyEmails') as FormArray;
  }
  get CompanyPhones() {
    return this.companyForm.get('CompanyPhones') as FormArray;
  }

  constructor(private fb: FormBuilder,
    private customFieldService: CustomFieldService,
    private breadcrumbService: AppBreadcrumbService,
    private messageService: MessageService,
    private lookupService: LookupService,
    private personService: PersonService,
    private router: Router,
    private confirmationService: ConfirmationService,
    @Inject(LOCALE_ID) localID: string,
    private route: ActivatedRoute,
    private authService: AuthService,
    private entityService: EntityService,
    private companyService: CompanyService,
    private countryService: CountryService,
    private stateService: StateService,
    private configurationService: ConfigurationService) {

    this.contactToRelation = '0';
    this.showCompany = false;
    this.showPerson = true;
    this.showCompanyName = false;
    this.showBillableInfo = false;
    this.showBillableSearch = false;
    this.companyId = 0;
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));

    this.showBillableContactSearch = false;
    if (this.router.url.includes("/contactProfile?entityId=")) {
      this.redirectRoute = '';
      this.breadcrumbService.setItems([
        { label: 'Home' },
        { label: 'Contacts-CRM', routerLink: ['/contacts'] },
        { label: 'Profile' }
      ]);
      this.currentAction = 'ShowPorfile';
      this.addingCompanyBillableContact = false;
    }
    if (this.router.url.includes("contactDetail?action=addContact")) {
      this.redirectRoute = '/contactProfile';
      this.breadcrumbService.setItems([
        { label: 'Home' },
        { label: 'Contacts-CRM', routerLink: ['/contacts'] },
        { label: 'Profile' },
        { label: 'Add New Contact' }
      ]);
      this.showCompany = false;
      this.showPerson = true;
      this.currentAction = 'AddNewPerson';
      this.addingCompanyBillableContact = false;
    }
    if (this.router.url.includes("contactDetail?action=addCompanyContact")) {
      this.redirectRoute = '/contactProfile';
      this.breadcrumbService.setItems([
        { label: 'Home' },
        { label: 'Contacts-CRM', routerLink: ['/contacts'] },
        { label: 'Profile' },
        { label: 'Add new ' + this.currentUser.accountName }
      ]);
      this.showCompany = true;
      this.showPerson = false;
      this.currentAction = 'AddNewCompany';
      this.addingCompanyBillableContact = false;
    }
    if (this.router.url.includes("contactDetail?action=addMember")) {
      this.redirectRoute = '/membership/createMembership';
      this.breadcrumbService.setItems([
        { label: 'Home' },
        { label: 'Contacts-CRM', routerLink: ['/contacts'] },
        { label: 'Membership' },
        { label: 'Add New Contact' }
      ]);
      this.currentAction = 'AddNewMembership';
      this.addingCompanyBillableContact = false;
    }
    if (this.router.url.includes("contactDetail?action=addCompanyMember")) {
      this.redirectRoute = '/membership/createMembership';
      this.breadcrumbService.setItems([
        { label: 'Home' },
        { label: 'Contacts-CRM', routerLink: ['/contacts'] },
        { label: 'Membership' },
        { label: 'Add New Contact' }
      ]);
      this.showCompany = true;
      this.showPerson = false;
      this.currentAction = 'AddNewMembership';
      this.addingCompanyBillableContact = false;
    }
    if (this.router.url.includes("/contactDetail?relatedContactforID=")) {
      this.redirectRoute = '/contactProfile';
      this.route.queryParams.subscribe(params => {
        this.contactToRelation = params['relatedContactforID'];

        console.log('Add to Relation:' + this.contactToRelation);
        this.currentAction = 'AddRelation';
      });
    }

    if (this.router.url.includes("/contactDetail?action=addEventRegisterContact")) {
      this.redirectRoute = '/eventregistration/createeventregistration';
      this.currentAction = 'addEventRegisterContact';
    }

    if (this.router.url.includes("contactDetail?action=addCompanyBillableContact")) {
      this.route.queryParams.subscribe(params => {
        this.billableContactForId = params['billableContactforID'];
      });
      this.redirectRoute = '/contactProfile';
      this.breadcrumbService.setItems([
        { label: 'Home' },
        { label: 'Contacts-CRM', routerLink: ['/contacts'] },
        { label: 'Profile' },
        { label: 'Add Company Billable Contact' }
      ]);
      this.showCompany = false;
      this.showPerson = true;
      this.currentAction = 'AddCompanyBillableContact';
      this.addingCompanyBillableContact = true;
      this.isAddNewRecord = true;
    }

    this.currentDate = new Date();
    this.currentDate.setDate(this.currentDate.getDate());
    this.parentControl = "Company";
    console.log('Current Action:' + this.currentAction);
  }

  ngOnInit(): void {
    this.manageCustomFields();
    console.log("URL:" + this.router.url);
    var currentDate = new Date();
    var currentBirthYear = currentDate.getFullYear();
    var defaultBirthDate = new Date("01/01/" + currentBirthYear);
    if(this.currentUser.isBirthdayRequired)
    {
      this.profileForm.get('DateOfBirth').setValue(defaultBirthDate);
    }
    else
    {
      this.profileForm.controls['DateOfBirth'].clearValidators();
    }
    this.getRelationOptions();
    this.getGendersLookup();
    this.getPrefixLookup();
    this.getTitlesLookup();
    this.getPreferredContactLookup();
    this.getCompaniesList();
    this.getCountries();
    this.getConfiguration(this.currentUser.organizationId);
    this.disallowSave = true;
    if (this.entityId) {
      this.isAddNewRecord = false;
      this.showForm = false;
      this.showLoader = true;
      console.log('EntityId:' + this.entityId);

      this.getEntityById();
    }
    else {
      this.showForm = true;
      this.showLoader = false;
      this.isAddNewRecord = true;
      this.contact = { 'firstName': '', 'lastName': '' };
    }

    this.controlValueChanged = {
      prefixChanged: false, firstNamechanged: false, middleNameChanged: false, casualNameChanged: false, lastNameChanged: false, suffixChanged: false, birthDateChanged: false,
      genderChanged: false, designationChanged: false, preferredContactChanged: false, companyIdChanged: false, companyNameChanged: false, titleChanged: false, companyWebsite: false, companyPhoneChanged: false,
      companyEmailChanged: false, websiteChanged: false, linkedinNameChanged: false, twitterNameChanged: false, facebookNameChanged: false, addresschanged: false,
      phoneChanged: false, emailChanged: false
    };
    this.editProfile = false;
    if (this.router.url.includes("/contactProfile?personId")) {
      this.editProfile = true;
    }
    this.disableSectionButtons();
    this.getStatesLookup("");
    this.getdesignationLookup();
  }

  getZipFormat(name: string) {
    let zipformat = this.countryList.filter(
      (x) => x.name == name
    )[0].zipFormat;
    if (zipformat != null) {
      this.zipFormat = zipformat;
    }
  }

  getEntityById() {
    let searchParams = new HttpParams();
    searchParams = searchParams.append('entityId', this.entityId.toString());
    const opts = { params: searchParams };
    this.entityService.getEntityById(opts).subscribe((data: any[]) => {
      console.log(data);

      this.entity = data;
      if (this.entity.personId) {
        console.log('Loading person data')
        this.getPersonById(this.entity.personId);

      } else {
        console.log('Loading company data')
        this.getCompanyById(this.entity.companyId);
        this.showCompany = true;
        this.showPerson = false;
      }
      this.showForm = true;
      this.showLoader = false;

    });
  }
  addAddress() {
    if (this.Addresses.length === 4) {
      this.messageService.add({ severity: 'warn', summary: 'Warn', detail: 'You can have only 4 Addresses' });
    }
    else {
      this.Addresses.push(this.fb.control({
        'addressId': 0,
        'addressType': '',
        'streetAddress': '',
        'city': '',
        'state': '',
        'country': '',
        'countryCode': '',
        'stateCode': '',
        'zip': '',
        'isPrimary': false
      }));
      this.enableAddressInfoSave = true;
    }
  }
  addCompanyAddress() {
    if (this.CompanyAddresses.length === 4) {
      this.messageService.add({ severity: 'warn', summary: 'Warn', detail: 'You can have only 4 Addresses' });
    }
    else {
      this.CompanyAddresses.push(this.fb.control({
        'addressId': 0,
        'addressType': '',
        'streetAddress': '',
        'city': '',
        'state': '',
        'country': '',
        'countryCode': '',
        'stateCode': '',
        'zip': '',
        'isPrimary': false
      }));
      this.enableAddressInfoSave = true;
    }
  }
  addEmail() {
    if (this.Emails.length === 4) {
      this.messageService.add({ severity: 'warn', summary: 'Warn', detail: 'You can have only 4 Email address' });
    }
    else {
      this.Emails.push(this.fb.control({
        'emailId': 0,
        'emailAddressType': '',
        'emailAddress': '',
        'isPrimary': false
      }));
      this.enableEmailInfoSave = true;
    }
  }
  addCompanyEmail() {
    if (this.CompanyEmails.length === 4) {
      this.messageService.add({ severity: 'warn', summary: 'Warn', detail: 'You can have only 4 Email address' });
    }
    else {
      this.CompanyEmails.push(this.fb.control({
        'emailId': 0,
        'emailAddressType': '',
        'emailAddress': '',
        'isPrimary': false
      }));
      this.enableEmailInfoSave = true;
    }
  }
  addCompanyPhone() {
    if (this.CompanyPhones.length === 4) {
      this.messageService.add({ severity: 'warn', summary: 'Warn', detail: 'You can have only 4 Phone Numbers' });
    }
    else {
      this.CompanyPhones.push(this.fb.control({
        'phoneId': 0,
        'phoneType': '',
        'phoneNumber': '',
        'isPrimary': false
      }));
      this.enablePhoneInfoSave = true;
    }
  }

  onSubmit() {
    // TODO: Use EventEmitter with form value
    console.log(this.profileForm.value);
  }

  removePhone(controlId) {
    this.controlName = controlId;
    console.log(this.controlName);
    if (this.Phones.length > 1) {
      this.Phones.removeAt(controlId);
      this.enablePhoneInfoSave = true;
    }
    else {
      this.messageService.add({ severity: 'warn', summary: 'Warn', detail: 'You need to provide at least 1 Phone Number' });
    }
  }

  removeCompanyPhone(controlId) {
    this.controlName = controlId;
    console.log(this.controlName);
    if (this.CompanyPhones.length > 1) {
      this.CompanyPhones.removeAt(controlId);
      this.enablePhoneInfoSave = true;
    }
    else {
      this.messageService.add({ severity: 'warn', summary: 'Warn', detail: 'You need to provide at least 1 Phone Number' });
    }
  }

  checkPrimaryPhone(controlId) {
    for (let i = 0; i < this.Phones.length; i++) {
      if (i != controlId) {
        let phoneControl = this.Phones.at(i) as FormGroup;
        let choice = phoneControl.value;
        choice.isPrimary = false;
        phoneControl.setValue(choice);
      }
    }
  }
  checkCompanyPrimaryPhone(controlId) {
    for (let i = 0; i < this.CompanyPhones.length; i++) {
      if (i != controlId) {
        let phoneControl = this.CompanyPhones.at(i) as FormGroup;
        let choice = phoneControl.value;
        choice.isPrimary = false;
        phoneControl.setValue(choice);
      }
    }
  }
  checkPrimaryEmail(controlId) {
    for (let i = 0; i < this.Emails.length; i++) {
      if (i != controlId) {
        let emailControl = this.Emails.at(i) as FormGroup;
        let choice = emailControl.value;
        choice.isPrimary = false;
        emailControl.setValue(choice);
      }
    }
  }
  checkCompanyPrimaryEmail(controlId) {
    for (let i = 0; i < this.CompanyEmails.length; i++) {
      if (i != controlId) {
        let emailControl = this.CompanyEmails.at(i) as FormGroup;
        let choice = emailControl.value;
        choice.isPrimary = false;
        emailControl.setValue(choice);
      }
    }
  }
  checkPrimaryAddress(controlId) {
    for (let i = 0; i < this.Addresses.length; i++) {
      if (i != controlId) {
        let addressControl = this.Addresses.at(i) as FormGroup;
        let choice = addressControl.value;
        choice.isPrimary = false;
        addressControl.setValue(choice);
      }
    }
  }
  checkCompanyPrimaryAddress(controlId) {
    for (let i = 0; i < this.CompanyAddresses.length; i++) {
      if (i != controlId) {
        let addressControl = this.CompanyAddresses.at(i) as FormGroup;
        let choice = addressControl.value;
        choice.isPrimary = false;
        addressControl.setValue(choice);
      }
    }
  }
  removeEmail(controlId) {
    this.controlName = controlId;
    console.log(this.controlName);
    if (this.Emails.length > 1) {
      this.Emails.removeAt(controlId);
      this.enableEmailInfoSave = true;
    }
    else {
      this.messageService.add({ severity: 'warn', summary: 'Warn', detail: 'You need to provide at least 1 Email Address' });
    }
  }
  removeCompanyEmail(controlId) {
    this.controlName = controlId;
    console.log(this.controlName);
    if (this.CompanyEmails.length > 1) {
      this.CompanyEmails.removeAt(controlId);
      this.enableEmailInfoSave = true;
    }
    else {
      this.messageService.add({ severity: 'warn', summary: 'Warn', detail: 'You need to provide at least 1 Email Address' });
    }
  }

  removeAddress(controlId) {
    this.controlName = controlId;
    console.log(this.controlName);

    if (this.Addresses.length > 1) {
      this.Addresses.removeAt(controlId);
      this.enableAddressInfoSave = true;
    }
    else {
      this.messageService.add({ severity: 'warn', summary: 'Warn', detail: 'You need to provide at least 1 Address' });
    }

  }
  removeCompanyAddress(controlId) {
    this.controlName = controlId;
    console.log(this.controlName);

    if (this.CompanyAddresses.length > 1) {
      this.CompanyAddresses.removeAt(controlId);
      this.enableAddressInfoSave = true;
    }
    else {
      this.messageService.add({ severity: 'warn', summary: 'Warn', detail: 'You need to provide at least 1 Address' });
    }

  }
  updateForm() {

    let companyId = 0;
    let companyName = '';
    let website = '';
    let companyPhone = '';
    let companyEmail = '';

    if (this.showPerson) {

      if (this.contact.company != null) {
        companyId = this.contact.company.companyId;
        companyName = this.contact.company.companyName;
        website = this.contact.company.website;
        companyPhone = this.contact.company.primaryContactPhone;
        companyEmail = this.contact.company.email;
        this.showCompanyName = true;
      }
      else {
        this.showCompanyName = false;
      }

      this.profileForm.get('Prefix').setValue(this.contact.prefix);
      this.profileForm.get('FirstName').setValue(this.contact.firstName);
      this.profileForm.get('MiddleName').setValue(this.contact.middleName);
      this.profileForm.get('LastName').setValue(this.contact.lastName);
      this.profileForm.get('CasualName').setValue(this.contact.casualName);
      this.profileForm.get('Suffix').setValue(this.contact.suffix);
      if(this.contact.birthDate != null && this.contact.birthDate != "")
      {
        this.profileForm.get('DateOfBirth').setValue(new Date(this.contact.birthDate));
      }
      this.profileForm.get('Gender').setValue(this.contact.gender);
      this.profileForm.get('PreferredContact').setValue(this.contact.preferredContact);
      if (companyId == 0) {
        this.profileForm.get('CompanyId').setValue("");
      }
      else {
        this.profileForm.get('CompanyId').setValue(companyId.toString());
      }
      // this.profileForm.get('CompanyName').setValue(companyId);
      this.profileForm.get('Title').setValue(this.contact.title);
      // this.profileForm.get('CompanyWebsite').setValue(website);
      // this.profileForm.get('CompanyPhone').setValue(companyPhone);
      // this.profileForm.get('CompanyEmail').setValue(companyEmail);
      this.profileForm.get('Website').setValue(this.contact.website);
      this.profileForm.get('LinkedinName').setValue(this.contact.linkedinName);
      this.profileForm.get('TwitterName').setValue(this.contact.twitterName);
      this.profileForm.get('FacebookName').setValue(this.contact.facebookName);
      this.profileForm.get('Designation').setValue(this.contact.designation);

      // pupulate Address

      this.Addresses.removeAt(0);
      if (this.router.url.includes("/contactProfile?personId=")) {
        this.Phones.clear();
        this.Addresses.clear();
        this.Emails.clear();
      }
      if (this.router.url.includes("/contactProfile?entityId=")) {
        this.Phones.clear();
        this.Addresses.clear();
        this.Emails.clear();
      }
      this.contact.addresses.forEach(element => {
        let streetAddress = element.address1;
        if (element.address2) {
          streetAddress += ', ' + element.address2;
        }
        if (element.address3) {
          streetAddress += ', ' + element.address3;
        }

        const address = new ContactAddress();
        address.addressId = element.addressId;
        address.addressType = element.addressType;
        address.streetAddress = streetAddress;
        address.city = element.city;
        address.state = element.state;
        address.country = element.country;
        address.countryCode = element.countryCode;
        address.stateCode = element.stateCode;
        address.zip = element.zip;
        address.isPrimary = element.isPrimary;
        this.Addresses.push(this.fb.control(address));

      });

      //  Populate Email
      this.Emails.removeAt(0);

      this.contact.emails.forEach(element => {
        let email = new ContactEmail();
        email.emailId = element.emailId;
        email.emailAddressType = element.emailAddressType;
        email.emailAddress = element.emailAddress;
        email.isPrimary = element.isPrimary;
        this.Emails.push(this.fb.control(email));
      });

      //  Populate Phones
      this.Phones.removeAt(0);

      this.contact.phones.forEach(element => {
        let phone = new ContactPhone();
        phone.phoneId = element.phoneId;
        phone.phoneType = element.phoneType;
        phone.phoneNumber = element.phoneNumber;
        phone.isPrimary = element.isPrimary;
        this.Phones.push(this.fb.control(phone));
      });
    }

  }

  handleChange(event) {
    console.log('clicked: in detail' + event.checked);
  }

  getGendersLookup() {
    let params = new HttpParams();
    params = params.append('name', 'Genders');
    this.lookupService.getLookupValues(params).subscribe((data: any[]) => {
      console.log(data);
      this.genders = data;
    });
  }

  getTitlesLookup() {
    let params = new HttpParams();
    params = params.append('name', 'Title');
    this.lookupService.getLookupValues(params).subscribe((data: any[]) => {
      console.log(data);
      this.titles = data;
    });
  }

  getPreferredContactLookup() {
    this.personService.getPreferredContactList().subscribe((data: any[]) => {
      console.log(data);
      this.preferredContact = data;
    });
  }

  getCompaniesList() {
    this.companyService.getCompaniesList().subscribe((data: any[]) => {
      console.log(data);
      this.companyList = data;
    });
  }


  getCountries() {
    this.countryService.getAllCountries().subscribe((data: any[]) => {
      this.countryList = data;
    });
  }

  getFormData() {
    var companyWebSite = '';
    if (this.profileForm.get('CompanyWebsite').value) {
      companyWebSite = this.profileForm.get('CompanyWebsite').value.indexOf('http://') === 0 || this.profileForm.get('CompanyWebsite').value.indexOf('https://') === 0
        ? this.profileForm.get('CompanyWebsite').value : 'http://' + this.profileForm.get('CompanyWebsite').value;
    }
    //Format Company
    const company = {
      CompanyId: this.profileForm.get('CompanyId').value,
      // CompanyName: "",
      // Email: this.profileForm.get('CompanyEmail').value,
      // PrimaryContactPhone :this.profileForm.get('CompanyPhone').value,
      // Website: companyWebSite
    }
    var personalWebSite = '';
    if (this.profileForm.get('Website').value) {
      personalWebSite = this.profileForm.get('Website').value.indexOf('https://') === 0 || this.profileForm.get('Website').value.indexOf('http://') === 0
        ? this.profileForm.get('Website').value : 'http://' + this.profileForm.get('Website').value;
    }
    const body = {
      EntityId: this.entityId,
      PersonId: this.profileForm.get('PersonId').value,
      Prefix: this.profileForm.get('Prefix').value,
      FirstName: this.profileForm.get('FirstName').value,
      LastName: this.profileForm.get('LastName').value,
      MiddleName: this.profileForm.get('MiddleName').value,
      CasualName: this.profileForm.get('CasualName').value,
      Suffix: this.profileForm.get('Suffix').value,
      Gender: this.profileForm.get('Gender').value,
      Designation: this.profileForm.get('Designation').value,
      PreferredContact: this.profileForm.get('PreferredContact').value,
      DateOfBirth: this.profileForm.get('DateOfBirth').value != null ? moment(this.profileForm.get('DateOfBirth').value).utc(true).format() : null,
      CompanyId: this.profileForm.get('CompanyId').value,
      // Company: company,
      CompanyName: '',
      TwitterName: this.profileForm.get('TwitterName').value,
      FacebookName: this.profileForm.get('FacebookName').value,
      LinkedinName: this.profileForm.get('LinkedinName').value,
      SkypeName: this.profileForm.get('SkypeName').value,
      Website: personalWebSite,
      Emails: this.profileForm.get('Emails').value,
      Phones: this.profileForm.get('Phones').value,
      Addresses: this.profileForm.get('Addresses').value,
      Status: 1,
      Title: this.profileForm.get('Title').value,
      AddRelationToContact: this.contactToRelation,
      RelationshipId: this.profileForm.get('RelationType').value,
      OrganizationId: this.currentUser.organizationId,
      AddBillableToContact: this.billableContactForId,
      EntityRoles: this.entityRoles
    };
    return body;
  }

  cancelEdit() {
    // this.activeTabEvent.emit(0);      

    if (this.isAddNewRecord) {
      if (this.currentAction == "AddCompanyBillableContact") {
        this.router.navigate(["/contactDetail"], {
          queryParams: { action: 'addCompanyBillableContact' },
        });
        this.showPerson = false;
        this.showCompany = true;
        let jsonObject = JSON.parse(sessionStorage.getItem('company-data'));
        this.companyForm.setValue(jsonObject, { emitEvent: false });
      }
      else if (this.currentAction == "AddNewPerson") {
        this.disallowSave = true;
        this.disableSectionButtons();
        this.redirectRoute = "/contacts";
        this.router.navigate([this.redirectRoute], {
          queryParams: { 'entityId': 0 },
        });
      }
      else if (this.currentAction == "addEventRegisterContact") {
        this.router.navigate(["/eventregistration/searchMember"]);
      }
      else {
        this.redirectRoute = "/contacts";
        this.router.navigate([this.redirectRoute], {
          queryParams: { 'entityId': 0 },
        });
      }
    }
    else {
      this.getPersonById(this.entity.personId);
      this.disallowSave = true;
      this.disableSectionButtons();
      console.log("zzzzzzzzzzzzzzzzzzz")
    }
  }

  cancelCompanyEdit() {
    // this.activeTabEvent.emit(0);
    sessionStorage.removeItem('company-data');
    this.redirectRoute = "/contacts";
    if (this.isAddNewRecord) {
      this.router.navigate([this.redirectRoute], {
        queryParams: { 'entityId': 0 },
      });
    }
    else {
      this.getCompanyById(this.entity.companyId);
      this.disallowSave = true;
      this.disableSectionButtons();
    }

  }

  saveContactPerson() {

    // if(!this.group1.valid) {
    //   this.group1.markAllAsTouched();
    //   return;
    // }
    // else
    // {
    //   this.saveCustomField();
    // }

    this.disableSaveButton = true;
    this.submitted = true;
    const body = this.getFormData();
    // var dd=document.getElementById("dd") as any;
    // var name=dd.selectedOption.name;
    // this.selectedCompany=name.trim();
    var addresses = body.Addresses;
    addresses.forEach(element => {
      element.zip = element.zip ? element.zip.replace(/[_-]/g, '') : element.zip;
      if (element.zip.length <= 0) {
        this.profileForm.setErrors({ "zipRequired": true });
      }
      var country = this.countryList.length > 0 ? this.countryList.filter(x => x.name == element.country)[0] : null;
      if (country && country.zipFormat) {
        var zipFormat = country.zipFormat.replace(/[_-]/g, '');
        if (zipFormat.length != element.zip.length) {
          this.profileForm.setErrors({ "zipErrorLength": true });
        }
      }
    });
    body.CompanyName = this.sCompany.trim();
    if (body.CompanyName != undefined || body.CompanyName != "")
      body.CompanyId = null;
    console.log('Form Data:' + JSON.stringify(body));
    //check if atleats one of email,phone & address i selected as primary
    if (!this.hasPrimarySelection()) {
      this.disableSaveButton = false;
      return;
    }
    if (this.billableContactForId) {
      body.AddBillableToContact = this.billableContactForId;
    }
    body.FirstName = body.FirstName.trim();
    body.MiddleName = body.MiddleName.trim();
    body.LastName = body.LastName.trim();
    if (this.profileForm.valid) {
      if(!this.group1.valid) {
        this.group1.markAllAsTouched();
        // this.group1.markAllAsDirty();
         this.disableSaveButton=false;
        return;
      }
      // else
      // {
      //   this.saveCustomField();
      // }
      if (this.isAddNewRecord) {
        console.log('Adding Contact:' + JSON.stringify(body));
        this.personService.createPerson(body).subscribe(
          response => {
            this.messageService.add({
              severity: 'success',
              summary: 'Successful',
              detail: 'Contact record added succesfully.',
              life: 3000
            });
            this.entityId=response.entityId;
            this.saveCustomField();
            this.submitted = false;
            console.log('Response:' + JSON.stringify(response));
            this.profileForm.reset();
            this.disableSectionButtons();
            this.newAddedCompanyBillablePersonId = response.personId;
            this.redirect(response.entityId);
          },
          error => {
            this.disableSaveButton = false;
            console.log(error);
            this.messageService.add({ severity: 'error', summary: 'Error', detail: error, life: 3000 });
          });
      }
      else {
        body.CompanyId = null;

        console.log('Updating Contact:' + JSON.stringify(body));
        this.personService.updatePerson(body).subscribe(
          response => {
            this.messageService.add({
              severity: 'success',
              summary: 'Successful',
              detail: 'Contact record updated succesfully.',
              life: 3000
            });

            this.saveCustomField();
            this.disallowSave = false; 
            this.enablePersonalInfoSave = false;
            this.disableSaveButton = false;
            this.disableSectionButtons();
          },
          error => {
            console.log(error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: error,
              life: 3000
            });
          });
      }
      console.log('Form Validation:' + this.profileForm.valid);
    }
    else {
      const invalid = [];
      const controls = this.profileForm.controls;
      for (const name in controls) {
        if (controls[name].invalid) {
          if (name == "Prefix" || name == "FirstName" || name == "LastName" || name == "Gender" || name == "PreferredContact" || name == "Designation") {
            invalid.push("Personal Info");
          }
          else {
            invalid.push(name);
          }
        }
      }
      this.disableSaveButton = false;
      this.messageService.add({
        severity: 'info',
        summary: 'Required Info',
        detail: 'Please enter required information of ' + invalid.join(', ') + '.',
        life: 3000
      });
    }
  }

  hasPrimarySelection() {
    let emails = this.profileForm.get('Emails').value;
    let phones = this.profileForm.get('Phones').value;
    let addresses = this.profileForm.get('Addresses').value;
    let errors = '';



    if (!emails.some(obj => obj.isPrimary === true)){
      errors = 'Email';
    }
    if (!phones.some(obj => obj.isPrimary === true)) {
      if (errors.length > 0) {
        errors += ', Phone';
      }
      else {
        errors = 'Phone';
      }
    }
    if (!addresses.some(obj => obj.isPrimary === true)) {
      if (errors.length > 0) {
        errors += ', Address';
      }
      else {
        errors = 'Address';
      }
    }
    if (errors.length > 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Required Info',
        detail: 'Please select Primary ' + errors,
        life: 3000
      });
      return false;
    }
    return true;
  }

  companyHasPrimarySelection() {
    let emails = this.companyForm.get('CompanyEmails').value;
    let phones = this.companyForm.get('CompanyPhones').value;
    let addresses = this.companyForm.get('CompanyAddresses').value;
    let errors = '';
    if (!emails.some(obj => obj.isPrimary === true)){
      errors = 'Email';
    }
    if (!phones.some(obj => obj.isPrimary === true)) {
      if (errors.length > 0) {
        errors += ', Phone';
      }
      else {
        errors = 'Phone';
      }
    }
    if (!addresses.some(obj => obj.isPrimary === true)) {
      if (errors.length > 0) {
        errors += ', Address';
      }
      else {
        errors = 'Address';
      }
    }
    if (errors.length > 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Required Info',
        detail: 'Please select Primary ' + errors,
        life: 3000
      });
      return false;
    }
    return true;
  }


  getPrefixLookup() {
    let params = new HttpParams();
    params = params.append('name', 'Prefix');
    this.lookupService.getLookupValues(params).subscribe((data: any[]) => {
      console.log(data);
      this.prefixList = data;
    });
  }

  getSelectedLabel(value) {
    const label = JSON.parse(value);

    if (typeof label === 'string') {
      return 'label';
    }
    if (label != null && typeof label === 'object') {
      return label.code;
    }
    return '';
  }

  getPersonById(personId) {
    let searchParams = new HttpParams();
    searchParams = searchParams.append('personId', personId);
    const opts = { params: searchParams };
    this.personService.getPersonById(opts).subscribe((data: any[]) => {
      console.log(data);
      this.contact = data;
      if (this.showBillableInfo) {
        this.setBillableInfo(this.contact);
      }
      else {
        this.showForm = true;
        this.showLoader = false;
        this.profileForm.get('PersonId').setValue(this.entity.personId);
        this.showCompany = false;
        this.showPerson = true;
        this.updateForm();
      }
      if (this.contact.company != null && this.contact.company.companyName != null) {
        this.sCompany = this.contact.company.companyName;
        this.companyId = this.contact.companyId;
      }
    });
  }

  isFieldValid(field: string) {
    if (this.showPerson) {
      if ((!this.profileForm.get(field).valid) && (this.submitted) && (this.profileForm.get(field).hasError('required'))) {
        if (field == 'FirstName')
          field = 'First Name'
        if (field == 'LastName')
          field = 'Last Name'
        if (field == 'DateOfBirth')
          field = 'Date Of Birth'
        this.addErrorMessages = { errorType: 'required', controlName: field };
        if ((field == 'Prefix') || (field == 'Gender')) {
          this.addErrorMessages = { errorType: 'dropdownrequired', controlName: field };
        }
        if ((field == 'PreferredContact')) {
          this.addErrorMessages = { errorType: 'dropdownrequired', controlName: 'Preferred Contact' };
        }
        return true;
      }
    }
    if (this.showCompany) {
      if ((!this.companyForm.get(field).valid) && (this.submitted) && (this.companyForm.get(field).hasError('required'))) {
        if (field == 'CompanyName')
          field = 'Company Name'
        this.addErrorMessages = { errorType: 'required', controlName: field };
        if (field == 'CompanyPhone')
          field = 'Phone'
        this.addErrorMessages = { errorType: 'required', controlName: field };
        return true;
      }
    }

  }

  errorIconCss(field: string) {
    return { 'has-feedback': this.isFieldValid(field) };
  }

  errorFieldCss(field: string) {
    return { 'ng-dirty': this.isFieldValid(field) };
  }

  resetSubmitted(field) {
    this.submitted = false;
    this.isFieldValid(field);
  }

  otherFormClicked(removeValidations: boolean) {
    if (removeValidations == false)
      this.submitted = false;
  }

  addressChanged(allowSave: boolean) {
    this.controlValueChanged.addresschanged = allowSave;
    this.allowEditSave();
    this.enableAddressInfoSave = true;
  }

  phoneChanged(allowSave: boolean) {
    this.controlValueChanged.phoneChanged = allowSave;
    this.allowEditSave();
    this.enablePhoneInfoSave = true;
  }

  emailChanged(allowSave: boolean) {
    this.controlValueChanged.emailChanged = allowSave;
    this.allowEditSave();
    this.enableEmailInfoSave = true;
  }

  matcher(event: ClipboardEvent, formControlName: string, formGroup: string): boolean {

    var allowedRegex = "";
    if ((formControlName == 'FirstName') || (formControlName == 'LastName'))
      allowedRegex = ("^[A-Za-z -.,']{0,30}$");
    if (formControlName == 'DateOfBirth') {
      var yearReg = '(195[0-9]|202[0-1])';
      var monthReg = '(0[1-9]|1[0-2])';               ///< Allows a number between 00 and 12
      var dayReg = '(0[1-9]|1[0-9]|2[0-9]|3[0-1])';
      var reg = new RegExp('^' + yearReg + '-' + monthReg + '-' + dayReg + '$', 'g');
    }
    if (event.type == "paste") {
      let clipboardData = event.clipboardData;
      let pastedText = '';
      if (formGroup == 'profileForm') {
        pastedText = clipboardData.getData('text') + this.profileForm.get(formControlName).value;
      }
      else if (formGroup == 'companyForm') {
        pastedText = clipboardData.getData('text') + this.companyForm.get(formControlName).value;
      }

      if (formControlName == 'DateOfBirth') {
        this.profileForm.get(formControlName).reset();
        pastedText = clipboardData.getData('text')
        if (pastedText && !pastedText.trim().match(reg)) {
          event.preventDefault();
          return false;
        } else {
          let birthDate = new Date();
          let currentDate = new Date();
          let birthYear = parseInt(pastedText.slice(0, 4));
          let birthMonth = parseInt(pastedText.slice(5, 7));
          let birthDateEntered = parseInt(pastedText.slice(8));
          birthDate.setFullYear(birthYear, birthMonth - 1, birthDateEntered);
          if (birthDate > currentDate) {
            event.preventDefault();
            return false;
          }
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

  enableSave(event, formControlName, dd) {
    //  var name=dd.selectedOption.name;
    // if(event.originalEvent.srcElement.innerText=="")
    // {
    //   this.sCompany=event.value;
    // }
    // else
    // {
    //   this.sCompany=event.originalEvent.srcElement.innerText;
    // }
    //console.log("Event value:" + JSON.stringify(event));
    //if (formControlName == "CompanyPhone") {
    //  this.companyPh = event.target.value;
    //}
    //if (formControlName == "CompanyEmail") {
    //  this.companyEm = event.target.value;
    //}

    if (this.router.url.includes("/contactProfile?entityId")) {
      switch (formControlName) {
        case 'Prefix':
          if (event.value == this.contact.prefix)
            this.controlValueChanged.prefixChanged = false;
          if (event.value != this.contact.prefix) {
            this.controlValueChanged.prefixChanged = true;
            this.enablePersonalInfoSave = true;
          }
          break;
        case 'FirstName':
          if (event.target.value == this.contact.firstName)
            this.controlValueChanged.firstNamechanged = false;
          if (event.target.value != this.contact.firstName) {
            this.controlValueChanged.firstNamechanged = true;
            this.enablePersonalInfoSave = true;
          }
          break;
        case 'MiddleName':
          if (((event.target.value == "") && (this.contact.middleName == null)) || (event.target.value == this.contact.middleName))
            this.controlValueChanged.middleNameChanged = false;
          else if (event.target.value != this.contact.middleName) {
            this.controlValueChanged.middleNameChanged = true;
            this.enablePersonalInfoSave = true;
          }
          break;
        case 'CasualName':
          if (((event.target.value == "") && (this.contact.casualName == null)) || (event.target.value == this.contact.casualName))
            this.controlValueChanged.casualNameChanged = false;
          else if (event.target.value != this.contact.casualName) {
            this.controlValueChanged.casualNameChanged = true;
            this.enablePersonalInfoSave = true;
          }
          break;
        case 'LastName':
          if (event.target.value == this.contact.lastName)
            this.controlValueChanged.lastNameChanged = false;
          if (event.target.value != this.contact.lastName) {
            this.controlValueChanged.lastNameChanged = true;
            this.enablePersonalInfoSave = true;
          }
          break;
        case 'Suffix':
          if (event.target.value == this.contact.suffix)
            this.controlValueChanged.suffixChanged = false;
          if (event.target.value != this.contact.suffix) {
            this.controlValueChanged.suffixChanged = true;
            this.enablePersonalInfoSave = true;
          }
          break;
        case 'DateOfBirth':
          if (event == this.contact.birthDate)
            this.controlValueChanged.birthDateChanged = false;
          if (event != this.contact.birthDate) {
            this.controlValueChanged.birthDateChanged = true;
            this.enablePersonalInfoSave = true;
          }
          break;
        case 'Gender':
          if (event.value == this.contact.gender)
            this.controlValueChanged.genderChanged = false;
          if (event.value != this.contact.gender) {
            this.controlValueChanged.genderChanged = true;
            this.enablePersonalInfoSave = true;
          }
          break;
        case 'PreferredContact':
          if (event.value == this.contact.preferredContact)
            this.controlValueChanged.preferredContactChanged = false;
          if (event.value != this.contact.gender) {
            this.controlValueChanged.preferredContactChanged = true;
            this.enablePersonalInfoSave = true;
          }
          break;
        case 'Designation':
          if (event.value == this.contact.designation)
            this.controlValueChanged.designationChanged = false;
          if (event.value != this.contact.gender) {
            this.controlValueChanged.designationChanged = true;
            this.enablePersonalInfoSave = true;
          }
          break;
        case 'CompanyId':
          if (event.value == this.contact.companyId)
            this.controlValueChanged.companyIdChanged = false;
          if (event.value != this.contact.companyId) {
            this.controlValueChanged.companyIdChanged = true;
            this.enableCompanyInfoSave = true;
          }
          break;
        case 'CompanyName':
          if (event.target.value == this.contact.company.companyName)
            this.controlValueChanged.companyNameChanged = false;
          if (event.target.value != this.contact.company.companyName) {
            this.controlValueChanged.companyNameChanged = true;
            this.enableCompanyInfoSave = true;
          }
          break;
        case 'Title':
          if (((event.target.value == "") && (this.contact.title == null)) || (event.target.value == this.contact.title))
            this.controlValueChanged.titleChanged = false;
          else if (event.target.value != this.contact.title) {
            this.controlValueChanged.titleChanged = true;
            this.enableCompanyInfoSave = true;
          }
          break;
        case 'CompanyWebsite':
          if (event.target.value == this.contact.company.website)
            this.controlValueChanged.websiteChanged = false;
          if (event.target.value != this.contact.company.website) {
            this.controlValueChanged.websiteChanged = true;
            this.enableCompanyInfoSave = true;
          }
          break;
        case 'CompanyPhone':
          let tempPhone = event.target.value.replace(/[x()_-]/g, '');
          tempPhone = tempPhone.split(/\s/).join('');
          let previousphoneNumber = this.contact.company.primaryContactPhone.replace(/[_()x-]/g, '');
          previousphoneNumber = previousphoneNumber.split(/\s/).join('');
          if (((tempPhone.length == 15) && (tempPhone == previousphoneNumber)) || (tempPhone.length < 15))
            this.controlValueChanged.companyPhoneChanged = false;
          if ((tempPhone.length == 15) && (tempPhone != previousphoneNumber)) {
            this.controlValueChanged.companyPhoneChanged = true;
            this.enableCompanyInfoSave = true;
          }
          break;
        case 'CompanyEmail':
          if (event.target.value == this.contact.company.email)
            this.controlValueChanged.companyEmailChanged = false;
          else if (event.target.value != this.contact.company.email) {
            this.controlValueChanged.companyEmailChanged = true;
            this.enableCompanyInfoSave = true;
          }
          break;
        case 'Website':
          if (event.target.value == this.contact.website)
            this.controlValueChanged.websiteChanged = false;
          else if (event.target.value != this.contact.website) {
            this.controlValueChanged.websiteChanged = true;
            this.enableSocialInfoSave = true;
          }
          break;
        case 'LinkedinName':
          if (event.target.value == this.contact.linkedinName)
            this.controlValueChanged.linkedinNameChanged = false;
          if (event.target.value != this.contact.linkedinName) {
            this.controlValueChanged.linkedinNameChanged = true;
            this.enableSocialInfoSave = true;
          }
          break;
        case 'TwitterName':
          if (event.target.value == this.contact.twitterName)
            this.controlValueChanged.twitterNameChanged = false;
          else if (event.target.value != this.contact.twitterName) {
            this.controlValueChanged.twitterNameChanged = true;
            this.enableSocialInfoSave = true;
          }
          break;
        case 'FacebookName':
          if (event.target.value == this.contact.facebookName)
            this.controlValueChanged.facebookNameChanged = false;
          if (event.target.value != this.contact.facebookName) {
            this.controlValueChanged.facebookNameChanged = true;
          }
          this.enableSocialInfoSave = true;
          break;
      }
      this.allowEditSave();
    }
  }
  setCompanyValue(event: any, formControlName, dd) {
    if (event.value)
      var data = this.companyList.filter(x => x.code == event.value);
    if (data.length != 0) {
      this.sCompany = data[0].name
      this.companyId = event.value;
    }
    else {
      this.sCompany = event.value;
    }
  }

  allowEditSave() {
    if ((this.controlValueChanged.firstNamechanged) || (this.controlValueChanged.prefixChanged) || (this.controlValueChanged.lastNameChanged)
      || (this.controlValueChanged.middleNameChanged) || (this.controlValueChanged.casualNameChanged) || (this.controlValueChanged.suffixChanged) || (this.controlValueChanged.birthDateChanged)
      || (this.controlValueChanged.genderChanged) || (this.controlValueChanged.companyIdChanged) || (this.controlValueChanged.companyNameChanged)
      || (this.controlValueChanged.titleChanged) || (this.controlValueChanged.websiteChanged) || (this.controlValueChanged.companyPhoneChanged)
      || (this.controlValueChanged.companyEmailChanged) || (this.controlValueChanged.websiteChanged) || (this.controlValueChanged.linkedinNameChanged)
      || (this.controlValueChanged.twitterNameChanged) || (this.controlValueChanged.facebookNameChanged) || (this.controlValueChanged.addresschanged)
      || (this.controlValueChanged.phoneChanged) || (this.controlValueChanged.emailChanged) || (this.controlValueChanged.preferredContactChanged))
      this.disallowSave = false;

    if ((!this.controlValueChanged.firstNamechanged) && (!this.controlValueChanged.prefixChanged) && (!this.controlValueChanged.lastNameChanged)
      && (!this.controlValueChanged.middleNameChanged) && (!this.controlValueChanged.casualNameChanged) && (!this.controlValueChanged.suffixChanged) && (!this.controlValueChanged.birthDateChanged)
      && (!this.controlValueChanged.genderChanged) && (!this.controlValueChanged.companyIdChanged) && (!this.controlValueChanged.companyNameChanged)
      && (!this.controlValueChanged.titleChanged) && (!this.controlValueChanged.websiteChanged) && (!this.controlValueChanged.companyPhoneChanged)
      && (!this.controlValueChanged.companyEmailChanged) && (!this.controlValueChanged.websiteChanged) && (!this.controlValueChanged.linkedinNameChanged)
      && (!this.controlValueChanged.twitterNameChanged) && (!this.controlValueChanged.facebookNameChanged) && (!this.controlValueChanged.addresschanged)
      && (!this.controlValueChanged.phoneChanged) && (!this.controlValueChanged.emailChanged) && (!this.controlValueChanged.preferredContactChanged))
      this.disallowSave = true;
  }

  disableSectionButtons() {
    this.enablePhoneInfoSave = false;
    this.enableEmailInfoSave = false;
    this.enableAddressInfoSave = false;
    this.enableCompanyInfoSave = false;
    this.enableSocialInfoSave = false;
    this.enablePersonalInfoSave = false;
  }

  redirect(parameter) {
    console.log('Redirecting to:' + this.redirectRoute);
    console.log('parameter:' + parameter);
    if (this.billableContactForId > 0) {
      this.router.navigate([this.redirectRoute], {
        queryParams: { 'entityId': this.billableContactForId, 'tab': 1 },
      });
    }
    if (parseInt(this.contactToRelation) > 0) {
      this.router.navigate([this.redirectRoute], {
        queryParams: { 'relatedContactforID': this.contactToRelation },
      });
    }
    else {
      if (this.currentAction == "AddCompanyBillableContact") {

        this.showPerson = false;
        this.showCompany = true;
        let jsonCompanyObject = JSON.parse(sessionStorage.getItem('company-data'));
        this.companyForm.setValue(jsonCompanyObject, { emitEvent: false });
        this.showBillableInfo = true;
        this.getPersonById(this.newAddedCompanyBillablePersonId);
        return;
      }
      if (this.currentAction == "addEventRegisterContact") {
        this.router.navigate([this.redirectRoute], {
          queryParams: { 'entityId': parameter },
        });
      }
      if (this.currentAction === 'AddNewPerson') {

      }
      this.router.navigate([this.redirectRoute], {
        queryParams: { 'entityId': parameter },
      });
    }
  }
  getRelationOptions() {
    this.personService.getRelationshipTypes()
      .subscribe((data: any[]) => {
        console.log(data);
        this.relations = data;
      });
  }

  addBillableContact() {
    this.showBillableContactSearch = true;
    this.parentControl = "Company";
  }


  closeSearchControl() {
    this.showBillableContactSearch = false;
  }

  getContactsByName(event: any) {

    let firstName = this.companyForm.get('BillableFirstName').value;

    let lastName = this.companyForm.get('BillableLastName').value;

    let searchParams = new HttpParams();
    searchParams = searchParams.append('firstName', firstName);
    searchParams = searchParams.append('lastName', lastName);
    console.log('billable search:' + this.showBillableSearch);
    console.log('Searching by first name:' + firstName + ' Last name:' + lastName);
    const opts = { params: searchParams };
    if (lastName.length > 2) {
      this.getPersonsByFirstAndLastName(opts);
    }


  }
  getPersonsByFirstAndLastName(params) {
    this.personService.getPersonsByFirstAndLastName(params).subscribe((data: any[]) => {
      console.log('Billable contact:' + JSON.stringify(data));
      this.$filtered.next([...data]);
    });
  }
  setBillableInfo(contact: any) {
    console.log("Selected value:" + JSON.stringify(contact));
    this.companyForm.get('BillableFirstName').setValue(contact.firstName);
    this.companyForm.get('BillableLastName').setValue(contact.lastName);
    this.companyForm.get('BillableContactId').setValue(contact.personId);
    this.companyForm.get('BillableContactId').setValue(contact.personId);
    this.companyForm.get('BillablePhone').setValue(contact.formattedPhoneNumber);
    this.companyForm.get('BillableEmail').setValue(contact.primaryEmail);
    this.companyForm.get('Title').setValue(contact.title);
  }

  getCompanyByName(event: any) {

    let companyName = this.profileForm.get('CompanyName').value;

    let searchParams = new HttpParams();
    searchParams = searchParams.append('companyName', companyName);

    const opts = { params: searchParams };
    if (companyName.length > 2) {
      this.companyService.getCompaniesByName(opts).subscribe((data: any[]) => {
        console.log('Company Name:' + JSON.stringify(data));
        this.$filtered.next([...data]);
      });
    }
  }
  setCompanyInfo(company: any) {
    console.log("Selected value:" + JSON.stringify(company));
    this.profileForm.get('CompanyWebsite').setValue(company.website);
    this.profileForm.get('CompanyPhone').setValue(company.phone);
    this.profileForm.get('CompanyEmail').setValue(company.email);
    this.profileForm.get('SelectedCompanyName').setValue(company.companyName);
    this.enableCompanyInfoSave = true;
  }

  smartSearch(event, formControlName) {
    this.showCompanyName = false;
  }

  saveCompany() {
    this.disableSave = true;
    this.submitted = true;
    const body = {
      EntityId: this.entityId,
      CompanyId: this.companyForm.get('CompanyId').value,
      CompanyName: this.companyForm.get('CompanyName').value,
      Phones: this.companyForm.get('CompanyPhones').value,
      Emails: this.companyForm.get('CompanyEmails').value,
      Website: this.companyForm.get('CompanyWebsite').value,
      BillableContactId: this.companyForm.get('BillableContactId').value,
      Title: this.companyForm.get('Title').value,
      BillablePhone: this.companyForm.get('BillablePhone').value,
      BillableEmail: this.companyForm.get('BillableEmail').value,
      OrganizationId: this.currentUser.organizationId,
      Addresses: this.companyForm.get('CompanyAddresses').value,
    };
    let addresses = this.companyForm.get('CompanyAddresses').value
    addresses.forEach(element => {
      element.zip = element.zip ? element.zip.replace(/[_-]/g, '') : element.zip;
      if (element.zip.length <= 0) {
        this.companyForm.setErrors({ "zipRequired": true });
      }
      var country = this.countryList.length > 0 ? this.countryList.filter(x => x.name == element.country)[0] : null;
      if (country && country.zipFormat) {
        var zipFormat = country.zipFormat.replace(/[_-]/g, '');
        if (zipFormat.length != element.zip.length) {
          this.companyForm.setErrors({ "zipErrorLength": true });
        }
      }
    });

    if (!this.companyHasPrimarySelection()) {
      this.disableSaveButton = false;
      return;
    }
    console.log('Comapny Form Data:' + JSON.stringify(body));
    if (this.companyForm.valid) {
      if (this.isAddNewRecord) {
        console.log('Adding Company:' + JSON.stringify(body));
        this.companyService.createCompany(body).subscribe(
          response => {
            this.messageService.add({
              severity: 'success',
              summary: 'Successful',
              detail: 'Company record added succesfully.',
              life: 3000
            });
            this.submitted = false;

            // this.companyForm.reset();
            this.redirectToCompanyProfile(response.entityId)
            
          },
          error => {
            console.log(error);
            this.messageService.add({ severity: 'error', summary: 'Error', detail: error, life: 3000 });
            this.disableSave = false;
          });
      }
      else {
        console.log('Updating Company:' + JSON.stringify(body));
        this.companyService.updateCompany(body).subscribe(
          response => {
            this.messageService.add({
              severity: 'success',
              summary: 'Successful',
              detail: this.currentUser.accountName + ' updated succesfully.',
              life: 3000
            });
            this.disableSave = false;
            this.disableSectionButtons();
          },
          error => {
            console.log(error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: error,
              life: 3000
            });
            this.disableSave = false;
          });
      }
    }
    else {
      this.messageService.add({
        severity: 'error',
        summary: 'Required Info',
        detail: 'Please enter required information.',
        life: 3000
      });
      this.disableSave = false;
    }
  }

  getdesignationLookup() {
    let params = new HttpParams();
    params = params.append('name', 'Designation');
    this.lookupService.getLookupValues(params).subscribe((data: any[]) => {
      console.log(data);
      this.designationList = data;
    });
  }

  getStatesLookup(input: string) {
    if (input != "" && input != null) {
      var country = this.countryList.filter((x) => x.name == input)[0];
      let params = new HttpParams();
      if (country && country.countryId) {
        params = params.append("countryId", country.countryId);
        this.stateService
          .getStateByCountry(params)
          .subscribe((data: any[]) => {
            this.stateList = data;
          });
      }
    }
  }

  countryCompanyFieldChangeEvent(event) {

    if (this.companyForm.controls["CompanyCity"].value != null && this.companyForm.controls["CompanyCity"].value != "")
      this.companyForm.controls["CompanyCity"].reset();
    if (this.companyForm.controls["CompanyZip"].value != null && this.companyForm.controls["CompanyZip"].value != "")
      this.companyForm.get('CompanyZip').setValue("");
    if (this.companyForm.controls["CompanyState"].value != null && this.companyForm.controls["CompanyState"].value != "")
      this.companyForm.controls["CompanyState"].reset();
    this.getZipFormat(event.value);
    this.getStatesLookup(event.value);
    this.enableSave(event, "country", "");
  }


  getCompanyById(companyId: any) {
    console.log('Get data for companyId:' + companyId);
    let searchParams = new HttpParams();
    searchParams = searchParams.append('companyId', companyId);
    const opts = { params: searchParams };
    this.companyService.getCompanyById(opts).subscribe((data: any[]) => {
      console.log('Company data:' + JSON.stringify(data));
      this.company = data;
      this.showForm = true;
      this.showLoader = false;
      this.companyForm.get('CompanyId').setValue(this.entity.companyId);
      this.updateCompanyForm();
    });
  }
  updateCompanyForm() {

    this.companyForm.get('CompanyId').setValue(this.company.companyId);
    this.companyForm.get('CompanyName').setValue(this.company.companyName);
    this.companyForm.get('CompanyWebsite').setValue(this.company.website);
    this.companyForm.get('BillableContactId').setValue(this.company.billableContactId);
    if (this.company.billablePerson != null) {
      this.companyForm.get('BillableFirstName').setValue(this.company.billablePerson.firstName);
      this.companyForm.get('BillableLastName').setValue(this.company.billablePerson.lastName);
      this.companyForm.get('Title').setValue(this.company.billablePerson.title);
      this.companyForm.get('BillablePhone').setValue(this.company.billablePerson.primaryPhone);
      this.companyForm.get('BillableEmail').setValue(this.company.billablePerson.primaryEmail);
    }
    else {
      this.companyForm.get('BillablePhone').setValue(this.company.phone);
      this.companyForm.get('BillableEmail').setValue(this.company.email);
    }
    // pupulate Address
    this.CompanyAddresses.removeAt(0);
    
    if (this.router.url.includes("/contactProfile?entityId=")) {
      this.CompanyAddresses.clear();
    }
    this.company.addresses.forEach(element => {
      let streetAddress = element.address1;
      if (element.address2) {
        streetAddress += ', ' + element.address2;
      }
      if (element.address3) {
        streetAddress += ', ' + element.address3;
      }

      const address = new ContactAddress();
      address.addressId = element.addressId;
      address.addressType = element.addressType;
      address.streetAddress = streetAddress;
      address.city = element.city;
      address.state = element.state;
      address.country = element.country;
      address.countryCode = element.countryCode;
      address.stateCode = element.stateCode;
      address.zip = element.zip;
      address.isPrimary = element.isPrimary;
      this.CompanyAddresses.push(this.fb.control(address));
    });

    //  Populate Email
    this.CompanyEmails.removeAt(0);

    this.company.emails.forEach(element => {
      let email = new ContactEmail();
      email.emailId = element.emailId;
      email.emailAddressType = element.emailAddressType;
      email.emailAddress = element.emailAddress;
      email.isPrimary = element.isPrimary;
      this.CompanyEmails.push(this.fb.control(email));
    });

    //  Populate Phones
    this.CompanyPhones.removeAt(0);

    this.company.phones.forEach(element => {
      let phone = new ContactPhone();
      phone.phoneId = element.phoneId;
      phone.phoneType = element.phoneType;
      phone.phoneNumber = element.phoneNumber;
      phone.isPrimary = element.isPrimary;
      this.CompanyPhones.push(this.fb.control(phone));
    });
  }
  addBillableMember(event) {
    console.log("Serach control sent Event for :" + event.billableContactId);
    this.showBillableInfo = true;
    this.getPersonById(event.billableContactId);
    this.closeSearchControl();
  }
  showBillableSearchControl() {
    this.showBillableSearch = true;
  }

  zipValidator(control: FormControl) {
    let zip = control.value.replace(/[_-]/g, '');
    const zipLength = (zip.length == 5) ? true : (zip.length == 9) ? true : false;
    console.log(zipLength)
    return zipLength ? null : { 'zipLengthError': true };
  }

  ngOnDestroy() {
    if (this.currentAction == "AddNewCompany" || this.currentAction == "AddCompanyBillableContact") {
      sessionStorage.setItem('company-data', JSON.stringify(this.companyForm.value));
    }
  }

  redirectToCompanyProfile(companyEntityId) {
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate(["/contactProfile"], {
        queryParams: { entityId: companyEntityId },
      });
    });
  }

  validateTitle(event: any) {
    if (event.target.value.trim().length == 0)
      this.profileForm.get('Title').reset();
  }

  setContactRoles(entityRole: EntityRole) {
    console.log('Set Contact Roles:' + JSON.stringify(entityRole))
    let newRole = { status: entityRole.status, contactRoleId: entityRole.contactRoleId, effectiveDate: entityRole.effectiveDate };
    this.entityRoles.push(newRole)
    console.log('Current Contact Roles:' + JSON.stringify(this.entityRoles))
    this.enableCompanyInfoSave = true;
  }
  getConfiguration(organizationId) {
    this.configurationService
      .getConfigurationByOrganizationId(organizationId)
      .subscribe((data: any) => {
        console.log("Configuration:" + JSON.stringify(data));
        this.configuration = data;

        //Show hide tabs
        console.log(
          "Configuration Role:" +
          JSON.stringify(this.configuration.displayRoles)
        );
      });
  }

  manageCustomFields()
  {
   this.group1 = this.fb.group({});
    this.customFieldService.getCustomFieldByModuleAndTab("Contact-CRM", "Details", this.entityId).subscribe((data: any[]) => {
      var data=data;
      if(data.length>0)
      {
      this.showAdditionalBlock=true;
    }
      this.controls=[];
    data.forEach(dat=>{
      var field=dat.customField;

      // var customControl=this.createControl(field);

      if(dat.customField.fieldType.type=="Text" || dat.customField.fieldType.type=="Short Text")
      {
       
        if(field.required)
        {
          this.group1.addControl(field.label, new FormControl('',[Validators.required]));
        }
        else
        {
          this.group1.addControl(field.label, new FormControl(''));
        }
        if(field.customfielddata.length>0)
        {
          this.group1.controls[field.label].setValue(JSON.parse(field.customfielddata[0].value??''));
        }
        var control={
          label:field.label,
          type:"Input",
          placeholder:field.placeholder,
          order:1,
          limit:field.characterLimit,
          fieldId:field.customFieldId
        }
        this.controls.push(control);
        this.setValidations(field);
      }
      if(dat.customField.fieldType.type=="Email Address")
      {
        if(field.required)
        {
          this.group1.addControl(field.label, new FormControl('',[Validators.required,Validators.email]));
        }
        else
        {
          this.group1.addControl(field.label, new FormControl('',Validators.email));
        }
        if(field.customfielddata.length>0)
        {
          this.group1.controls[field.label].setValue(JSON.parse(field.customfielddata[0].value??''));
        }
        var emailcontrol={
          label:field.label,
          type:"Input",
          placeholder:field.placeholder,
          order:1,
          fieldId:field.customFieldId,
        }
        this.controls.push(emailcontrol);
      }
      if(dat.customField.fieldType.type=="Phone Number")
      {
        if(field.required)
        {
          this.group1.addControl(field.label, new FormControl('',[Validators.required]));
        }
        else
        {
          this.group1.addControl(field.label, new FormControl(''));
        }
        if(field.customfielddata.length>0)
        {
          this.group1.controls[field.label].setValue(JSON.parse(field.customfielddata[0].value??''));
        }
        var phcontrol={
          label:field.label,
          type:"Input",
          placeholder:field.placeholder,
          order:1,
          fieldId:field.customFieldId
        }
        this.controls.push(phcontrol);
      }
      if(dat.customField.fieldType.type=="Date")
      {
        if(field.required)
        {
          this.group1.addControl(field.label, new FormControl('',[Validators.required]));
        }
        else
        {
          this.group1.addControl(field.label, new FormControl(''));
        }
        if(field.customfielddata.length>0)
        {
          this.group1.controls[field.label].setValue(field.customfielddata[0].value??'');
        }
        var dateControl={
          label:field.label,
          type:"Date",
          placeholder:field.placeholder,
          format:"yy/mm/dd",//field.dateFormat.toLowerCase(),
          order:1,
          fieldId:field.customFieldId
        }
        this.controls.push(dateControl);
      }
      if(dat.customField.fieldType.type=="Time")
      {
        if(field.required)
        {
          this.group1.addControl(field.label, new FormControl('',[Validators.required]));
        }
        else
        {
          this.group1.addControl(field.label, new FormControl(''));
        }
        if(field.customfielddata.length>0)
        {
          this.group1.controls[field.label].setValue(field.customfielddata[0].value??'');
        }
        var timeControl={
          label:field.label,
          type:"Time",
          placeholder:field.placeholder,
          //format:"yy/mm/dd",//field.dateFormat.toLowerCase(),
          order:1,
          fieldId:field.customFieldId
        }
        this.controls.push(timeControl);
      }
      if(dat.customField.fieldType.type=="Number")
      {
        if(field.required)
        {
          this.group1.addControl(field.label, new FormControl('',[Validators.required]));
        }
        else
        {
          this.group1.addControl(field.label, new FormControl(''));
        }
        if(field.customfielddata.length>0)
        {
          this.group1.controls[field.label].setValue(JSON.parse(field.customfielddata[0].value??''));
        }
        var numControl={
          label:field.label,
          type:"Number",
          placeholder:field.placeholder,
          //format:"yy/mm/dd",//field.dateFormat.toLowerCase(),
          order:1,
          fieldId:field.customFieldId
        }
        this.controls.push(numControl);
      }
      if(dat.customField.fieldType.type=="Long Text")
      {
        if(field.required)
        {
          this.group1.addControl(field.label, new FormControl('',[Validators.required]));
        }
        else
        {
          this.group1.addControl(field.label, new FormControl(''));
        }
        if(field.customfielddata.length>0)
        {
          this.group1.controls[field.label].setValue(JSON.parse(field.customfielddata[0].value??''));
        }
        var textAreaControl={
          label:field.label,
          type:"TextArea",
          placeholder:field.placeholder,
          //format:"yy/mm/dd",//field.dateFormat.toLowerCase(),
          order:1,
          fieldId:field.customFieldId
        }
        this.controls.push(textAreaControl);
      }
      if(dat.customField.fieldType.type=="Dropdown")
      {
        if(field.required)
        {
          this.group1.addControl(field.label, new FormControl('',[Validators.required]));
        }
        else
        {
          this.group1.addControl(field.label, new FormControl(''));
        }
        if(field.customfielddata.length>0)
        {
          this.group1.controls[field.label].setValue(field.customfielddata[0].value??'');
          var data=JSON.parse(field.customfielddata[0].value);
          if(field.multipleSelection!=1)
          {
          this.selectedDropValue=data;//field.customfielddata[0].value??'';
          }
          else
          {
            this.selectedDropValueMulti=data;
          }
        }
        var drpControl={
          label:field.label,
          type:"Dropdown",
          placeholder:field.placeholder,
          order:1,
          options:field.customfieldoptions,
          fieldId:field.customFieldId,
          multiselect:field.multipleSelection
        }
        this.controls.push(drpControl);
      }
      if(dat.customField.fieldType.type=="Single Choice Field")
      {
        if(field.required)
        {
          this.group1.addControl(field.label, new FormControl('',[Validators.required]));
        }
        else
        {
          this.group1.addControl(field.label, new FormControl(''));
        }
        if(field.customfielddata.length>0)
        {
          this.group1.controls[field.label].setValue(field.customfielddata[0].value??'');
        }
        var singleChControl={
          label:field.label,
          type:"Radio",
          placeholder:field.placeholder,
          order:1,
          options:field.customfieldoptions,
          fieldId:field.customFieldId
        }
        this.controls.push(singleChControl);
      }
      if(dat.customField.fieldType.type=="Multiple Choice Field")
      {
        if(field.required)
        {
          this.group1.addControl(field.label, new FormControl('',[Validators.required]));
        }
        else
        {
          this.group1.addControl(field.label, new FormControl(''));
        }
        if(field.customfielddata.length>0)
        {
          this.group1.controls[field.label].setValue(field.customfielddata[0].value??'');
        }
        var chkControl={
          label:field.label,
          type:"Checkbox",
          placeholder:field.placeholder,
          order:1,
          options:field.customfieldoptions,
          fieldId:field.customFieldId
        }
        this.controls.push(chkControl);
      }
      
    })
    });
  }
  setValidations(field)
  {
    var validations=field.validations;
    switch (validations) {
      case "Alphabetic":
          this.group1.controls[field.label].setValidators([Validators.pattern('^[a-zA-Z \-\']+')]);
        break;
      case "Alphanumeric":
        this.group1.controls[field.label].setValidators([Validators.pattern('^[A-Za-z0-9ñÑáéíóúÁÉÍÓÚ ]+$')]);
        break;
      case "Currency":
        //  this.group1.controls[field.label].setValidators([Validators.]);
          break;  
      case "Email":
        this.group1.controls[field.label].setValidators([Validators.email]);
        break;
      case "Numeric":
          this.group1.controls[field.label].  setValidators([Validators.pattern("^[0-9]*$")]);
          break;
      case "URL":
          this.group1.controls[field.label].setValidators([Validators.pattern('(https?://)?([\\da-z.-]+)\\.([a-z.]{2,6})[/\\w .-]*/?')]);
          break;    
      
    }
    if(field.required)
    {
      this.group1.controls[field.label].addValidators(Validators.required);
    }
  }
  isCustomFieldValid(field: string) {
    if(this.group1.controls[field].dirty || this.group1.controls[field].touched)
    {
      if ((!this.group1.get(field).valid) && (this.group1.get(field).hasError('required'))) {
        this.addErrorMessages = { errorType: 'required', controlName: field };
        return true;
      }
    }
  }
  saveCustomField()
  {
    var entityId=this.entityId;
    var bodyArray=[];
    // var dateValue=moment(this.group1.get('DateOfBirth').value).utc(true).format();
    Object.keys(this.group1.controls).forEach(key => {
      // var test=control;
      var data= this.group1.controls[key];
      var controlData=this.controls.find(x=>x.label==key);
      var fid=controlData.fieldId;
      var value="";//this.calendarValue;
      // var dateValue=moment(this.group1.get(key).value).utc(true).format();
      if(controlData.type=="Date")
      {
        value=moment(this.group1.get(key).value).utc(true).format();//this.group1.get(key).value
        //this.profileForm.get('DateOfBirth').value
      }
      else{
        value=data.value;
      }
      //if(value.trim()!="")
      var body={
        CustomFieldId:fid,
        Value:data.value!=""?JSON.stringify(data.value):"", //data.value,
        EntityId:entityId,
      }
      if(body.Value.trim()!="")
      {
      bodyArray.push(body);
      }
    });
    if(bodyArray.length>0)
    {
      this.customFieldService.saveCustomFieldData(bodyArray).subscribe(response =>
        {
          
          this.messageService.add({
            severity: 'success',
            summary: 'Successful',
            detail: 'Field saved succesfully.',
            life: 3000
          });
        },
          error =>
          {
            console.log(error);
            this.messageService.add({ severity: 'error', summary: 'Error', detail: error, life: 3000 });
          });
    }
  }

}