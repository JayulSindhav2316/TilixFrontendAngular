import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { AppBreadcrumbService } from 'src/app/app.breadcrumb.service';
import { ImageModule } from 'primeng/image';
import { EventDetails, Events } from 'src/app/models/event';
import { LookupService } from 'src/app/services/lookup.service';
import { HttpParams } from '@angular/common/http';
import { EventService } from 'src/app/services/event.service';
import { BehaviorSubject } from 'rxjs';
import { PersonService } from 'src/app/services/person.service';
import { relativeTimeThreshold } from 'moment';
import { map } from 'rxjs/operators';
import * as moment from 'moment';
import { EntityService } from 'src/app/services/entity.service';
import { User } from 'src/app/models/user';
import { ConfigurationService } from 'src/app/services/configuration.service';
import { AuthService } from 'src/app/services/auth.service';
import { StaffService } from 'src/app/services/staff.service';
import { StringDecoder } from 'string_decoder';
import { CountryService } from 'src/app/services/country.service';
import { StateService } from 'src/app/services/state.service';

@Component({
  selector: 'app-event-set-up',
  templateUrl: './event-set-up.component.html',
  styleUrls: ['./event-set-up.component.scss']
})
export class EventSetUpComponent implements OnInit {
  @Input() addNewEventRecord: boolean;
  @Input() eventId: number;
  @Output() activeTabEvent = new EventEmitter<number>();
  @Output() activeEventId = new EventEmitter<number>();
  @Output() tabValueChangedEvent = new EventEmitter<number>();
  @Input() futureIndex: number;

  eventDetailForm = this.formBuilder.group({
    EventId: [0],
    Code: ['', [Validators.required, this.noBlankValidator]],
    Name: ['', [Validators.required, this.noBlankValidator]],
    Type: ['', [Validators.required]],
    Status: [false],

    WebinarLiveLink: ['', [Validators.required, this.noBlankValidator]],
    PreRecordedWebinarLink: ['', [Validators.required, this.noBlankValidator]],

    Location: ['', [Validators.required, this.noBlankValidator]],
    Area: ['', [Validators.required, this.noBlankValidator]],
    City: ['', [Validators.required, this.noBlankValidator]],
    State: ['', [Validators.required]],
    Country: ['', [Validators.required]],
    // Zip: ['', [Validators.required, this.zipValidator]],
    Zip: ['', [Validators.required]],
    StartDate: ['', [Validators.required]],
    EndDate: ['', [Validators.required]],
    RegStartDate: ['', [Validators.required]],
    RegEndDate: ['', [Validators.required]],
    TimeZone: ['', [Validators.required]],

    ContactNameSearch: ['', [Validators.required]],
    ContactName: ['', [Validators.required]],
    ContactEmail: ['', [Validators.required]],
    ContactPhone: ['', [Validators.required]],

    MaxCapacity: ['', [Validators.required]],

    ShortDescription: [''],
    LongDescription: [''],

    EnableQuestions: [true],
    DueDate: ['', [Validators.required]],
  });

  event: any;
  addErrorMessages: any = {};
  eventStorage = <Events>{};
  eventTypeList: any[] = [];
  timeZoneList: any[] = [];
  stateList: any[] = [];
  countryList: any[] = [];
  feeTypes: any[] = [];
  selectedFeeTypes: any[] = [];
  filteredPersons: any[] = [];
  eventType: number;
  submitted: boolean = false;
  shortDescriptionCharactersLeft: number = 300;
  longDescriptionCharactersLeft: number = 1000;
  formData = new FormData();
  eventImage: any;
  eventCoverImage: any;
  showContactSearch: boolean;
  displayContactDetails: boolean = false;
  allowQuestionSetUp: boolean = true;
  hasNoErrors: boolean = false;
  eventImageFile: File;
  eventCoverImageFile: File;
  displayCode: number;
  currentUser: User;
  configuration: any;

  formValueChanged: boolean = false;

  contactPersonsList: any[] = [];
  selectedContact: any;
  isContactPersonAddMode: boolean;

  currentDate: Date = new Date();
  zipFormat: string = "999999";
  zipFormatLength: any;
  existingEventDue : any;

  constructor(
    private formBuilder: FormBuilder,
    private messageService: MessageService,
    private router: Router,
    private lookUpService: LookupService,
    private eventService: EventService,
    private personService: PersonService,
    private entityService: EntityService,
    private confirmationService: ConfirmationService,
    private breadcrumbService: AppBreadcrumbService,
    private configurationService: ConfigurationService,
    private authService: AuthService,
    private staffService: StaffService,
    private countryService: CountryService,
    private stateService: StateService) {
    this.breadcrumbService.setItems([
      { label: 'Home', routerLink: ['/'] },
      { label: 'Events', routerLink: ['/events/events'] },
      { label: 'Details' }
    ]);
  }

  ngOnInit(): void {
    this.currentUser = this.authService.currentUserValue;
    this.getConfiguration(this.currentUser.organizationId);
    let questionSetUp = JSON.parse(sessionStorage.getItem("AllowQuestionSetUp"));
    this.allowQuestionSetUp = questionSetUp == null || questionSetUp ? true : false;
    this.eventDetailForm.get('EnableQuestions').setValue(this.allowQuestionSetUp);
    this.eventDetailForm.get('Country').setValue("United States");
    this.eventImage = '\\assets\\lighting-bolt\\images\\empty-image.png';
    this.eventCoverImage = '\\assets\\lighting-bolt\\images\\empty-image.png';
    this.getEventTypesList();
    this.getTimeZonesList();
    this.getCountries();
    this.getStatesLookup("");
    this.getRegistrationFeeTypes();
    let setUpForm = JSON.parse(sessionStorage.getItem("SetUpForm"));
    if (setUpForm) {
      this.event = setUpForm;
      this.setFormData();
      this.eventImage = this.event.eventImage;
      this.eventCoverImage = this.event.eventCoverImage;
      // this.getEventImage();
      this.formValueChanged = true;
      this.contactPersonsList = setUpForm.eventContacts;
      this.continue(true);
    }
    else if (this.addNewEventRecord && this.eventId == 0) {
      this.getEventModel();
    }
    else if (this.addNewEventRecord && this.eventId > 0) {
      this.getEventDetails(true);
    }
    else if (!this.addNewEventRecord && this.eventId > 0) {
      this.getEventDetails(false);
    }
    else {
      this.router.navigate(['events/events']);
    }
  }

  setActiveTab(value: number) {
    this.activeTabEvent.emit(value);
    console.log("Set Active Tab ->:" + value);
  }

  errorIconCss(field: string) {
    return { 'has-feedback': this.isFieldValid(field) };
  }

  errorFieldCss(field: string) {
    return { 'ng-dirty': this.isFieldValid(field) };
  }

  isFieldValid(field: string) {
    if ((!this.eventDetailForm.get(field).valid) && (this.submitted) && (this.eventDetailForm.get(field).hasError('required'))) {
      this.addErrorMessages = { errorType: 'required', controlName: field };

      if (field == 'Type') {
        field = 'Event type';
        this.addErrorMessages = { errorType: 'dropdownrequired', controlName: field };
      }
      else if (field == 'MaxCapacity') {
        field = 'Max Capacity';
        this.addErrorMessages = { errorType: 'required', controlName: field };
      }
      else if (field == 'ContactNameSearch') {
        field = 'Contact Name';
        this.addErrorMessages = { errorType: 'required', controlName: field };
      }
      else if (field == 'PreRecordedWebinarLink') {
        field = 'Pre-Recorded Webinar Link';
        this.addErrorMessages = { errorType: 'required', controlName: field };
      }
      else if (field == 'WebinarLiveLink') {
        field = 'Webinar Live Link';
        this.addErrorMessages = { errorType: 'required', controlName: field };
      }
      else if (field == 'StartDate') {
        field = 'Start Date & Time';
        this.addErrorMessages = { errorType: 'required', controlName: field };
      }
      else if (field == 'EndDate') {
        field = 'End Date & Time';
        this.addErrorMessages = { errorType: 'required', controlName: field };
      }
      else if (field == 'RegStartDate') {
        field = 'Reg. Start Date & Time';
        this.addErrorMessages = { errorType: 'required', controlName: field };
      }
      else if (field == 'RegEndDate') {
        field = 'Reg. End Date & Time';
        this.addErrorMessages = { errorType: 'required', controlName: field };
      }
      if (field == 'TimeZone') {
        field = 'Time Zone';
        this.addErrorMessages = { errorType: 'dropdownrequired', controlName: field };
      }
      return true;
    }

    if (field == 'Zip') {
      if ((!this.eventDetailForm.get('Zip').valid) && (this.submitted) && (this.eventDetailForm.get('Zip').hasError('zipLengthError'))) {
        this.addErrorMessages = { errorType: 'creditcardminlength', controlName: field, errorMessage: "Enter 9 or 5 digits" };
        return true;
      }
    }
    field = "";
  }

  noBlankValidator(control: FormControl) {
    const isWhitespace = (control.value || '').trim().length === 0;
    const isValid = !isWhitespace;
    return isValid ? null : { 'required': true };
  }

  zipValidator(control: FormControl) {
    let zip = control.value?.replace(/[_-]/g, '');
    const zipLength = (zip.length == 5) ? true : (zip.length == 9) ? true : false;
    console.log(zipLength)
    return zipLength ? null : { 'zipLengthError': true };
  }

  dateValidator() {
    let fromDate = this.eventDetailForm.get('StartDate').value;
    let toDate = this.eventDetailForm.get('EndDate').value;
    let regStartDate = this.eventDetailForm.get('RegStartDate').value;
    let regEndDate = this.eventDetailForm.get('RegEndDate').value;
    let timeZone = this.eventDetailForm.get('TimeZone').value;
    if (this.eventType == 3) {
      if (regStartDate && regEndDate) {
        if (!fromDate) {
          this.eventDetailForm.get('StartDate').setErrors({ required: true });
          return false;
        }
        else {
          this.eventDetailForm.get('StartDate').setErrors({ required: null });
        }
        if (!toDate) {
          this.eventDetailForm.get('EndDate').setErrors({ required: true });
          return false;
        }
        else {
          this.eventDetailForm.get('EndDate').setErrors({ required: null });
        }
        if (!timeZone || timeZone == 0) {
          this.eventDetailForm.get('TimeZone').setErrors({ required: true });
          return false;
        }
        else {
          this.eventDetailForm.get('TimeZone').setErrors(null);
        }
      }
      if (fromDate && toDate == null) {
        this.messageService.add({
          severity: "error",
          summary: "Error",
          detail: "Please enter Event End Date.",
          life: 3000,
        });
        return false;
      }
      if (fromDate == null && toDate) {
        this.messageService.add({
          severity: "error",
          summary: "Error",
          detail: "Please enter Event Start Date.",
          life: 3000,
        });
        return false;
      }
      if (regStartDate && regEndDate == null) {
        this.messageService.add({
          severity: "error",
          summary: "Error",
          detail: "Please enter Reg End Date.",
          life: 3000,
        });
        return false;
      }
      if (regStartDate == null && regEndDate) {
        this.messageService.add({
          severity: "error",
          summary: "Error",
          detail: "Please enter Reg Start Date.",
          life: 3000,
        });
        return false;
      }
    }
    if (fromDate && toDate) {
      if (!timeZone || timeZone == 0) {
        this.eventDetailForm.get('TimeZone').setErrors({ required: true });
        return false;
      }
      else {
        this.eventDetailForm.get('TimeZone').setErrors(null);
      }
      if (fromDate > toDate) {
        this.messageService.add({
          severity: "error",
          summary: "Error",
          detail: "Event End Date cannot be less than Event Start Date.",
          life: 3000,
        });
        return false;
      }
    }
    if (regStartDate && regEndDate) {
      if (regEndDate < regStartDate) {
        this.messageService.add({
          severity: "error",
          summary: "Error",
          detail: "Reg End Date cannot be less than Reg Start Date.",
          life: 3000,
        });
        return false;
      }
      if (regEndDate > toDate) {
        this.messageService.add({
          severity: "error",
          summary: "Error",
          detail: "Reg End Date cannot be beyond Event end date.",
          life: 3000,
        });
        return false;
      }
    }

    return true;
  }

  getEventTypesList() {
    this.lookUpService.getEventTypeLookup().subscribe((data: any[]) => {
      console.log(data);
      this.eventTypeList = data;
    });
  }

  getTimeZonesList() {
    this.lookUpService.getTimeZonesLookup().subscribe((data: any[]) => {
      console.log(data);
      this.timeZoneList = data;
    });
  }

  // getStatesLookup()  {
  //   let params = new HttpParams();
  //   params = params.append('name','States');
  //   this.lookUpService.getLookupValues(params).subscribe((data: any[]) =>
  //   {
  //     console.log(data);
  //     this.stateList = data;
  //   });
  // }

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

  getCountries() {
    this.countryService.getAllCountries().subscribe((data: any[]) => {
      this.countryList = data;
      if (this.eventDetailForm.value) {
        var countryFieldValue = this.eventDetailForm.value.Country;
        if (countryFieldValue != "" && countryFieldValue != null) {
          this.getStatesLookup(countryFieldValue);
          this.getZipFormat(countryFieldValue);
        }
      }
    });
  }
  getZipFormat(name: string) {
    this.zipFormat = this.countryList.filter(
      (x) => x.name == name
    )[0].zipFormat;
  }

  eventTypeChanged() {
    this.eventType = this.eventDetailForm.get('Type').value;
    if (this.eventType == 1) {
      if (this.eventDetailForm.value?.Country == null) {
        this.eventDetailForm.get("Country").setValue("United States");
        this.getStatesLookup(this.eventDetailForm.value?.Country);
      }
    }
  }

  getEventModel() {
    // this.showContactName = false;
    this.showContactSearch = true;
  }

  getRegistrationFeeTypes() {
    this.lookUpService.getRegistrationFeeTypes().subscribe((data: any[]) => {
      console.log(data);
      this.feeTypes = data;
      this.selectedFeeTypes = data.filter(x => x.registrationFeeTypeName == "Regular");
    });
  }

  getPeopleByName(event: any) {
    console.log(event);
    let value = event.query;
    if (value.length >= 2) {
      let searchParams = new HttpParams();
      searchParams = searchParams.append('value', value);
      const opts = { params: searchParams };
      console.log('Search Name:' + JSON.stringify(opts));
      this.staffService.getStaffByNameAndEmail(opts).subscribe((data: any[]) => {
        console.log(data);
        this.filteredPersons = data;
      });
    }
  }

  continue(isContinue: boolean) {

    let newEventDue = this.eventDetailForm.get('DueDate');
    
    if(this.existingEventDue != newEventDue.value)
    {
      let searchParams = new HttpParams();
      searchParams = searchParams.append('eventId', this.eventId);
      const opts = { params: searchParams };
      this.eventService.checkEventRegistrationByEventId(opts).subscribe((data: any) => {
        if(data == true)
        {
          this.confirmationService.confirm({
            message: 'Updating Due date will reflect on all existing invoices, Do you want to continue?',
            header: 'Confirm',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
              this.saveEventDetails(isContinue);
            }
        });
        }
        else
        {
          this.saveEventDetails(isContinue);
        }
      });
    }
    else
    {
      this.saveEventDetails(isContinue);
    }
  }

  saveEventDetails(isContinue: boolean)
  {
    this.submitted = true;
    // this.checkIfNameExists();

    if (this.contactPersonsList.length == 0) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'You need to have atleast one contact person.', life: 3000 });
      this.eventDetailForm.get('ContactNameSearch').setErrors({ required: true });
      return;
    }
    this.eventDetailForm.get('ContactNameSearch').setErrors({ required: null });
    this.eventDetailForm.get('ContactName').setErrors({ required: null });
    this.eventDetailForm.get('ContactEmail').setErrors({ required: null });
    this.eventDetailForm.get('ContactPhone').setErrors({ required: null });

    if (this.commonFormControlsValid()) {
      if ((this.eventType == 1 && this.inPersonFormControlsValid()) || (this.eventType == 2 && this.virtualFormControlsValid()) || (this.eventType == 3 && this.hybridFormControlsValid())) {
        if (!this.dateValidator()) {
          return;
        }
        if (this.formValueChanged) {
          this.hasNoErrors = true;
          this.getFormData();
          if (this.addNewEventRecord && this.eventId == 0) {
            this.eventService.createEvent(this.event).subscribe((data: any[]) => {
              console.log(data);
              this.event = data;
              this.postEventSaveCallback(true, isContinue);
            },
              error => {
                this.submitted = false;
                this.messageService.add({
                  severity: "error",
                  summary: "Error",
                  detail: error,
                  life: 3000,
                });
              });
          }
          else {
            this.eventService.updateteEvent(this.event).subscribe((data: any[]) => {
              console.log(data);
              this.postEventSaveCallback(false, isContinue);
            },
              error => {
                this.submitted = false;
                this.messageService.add({
                  severity: "error",
                  summary: "Error",
                  detail: error,
                  life: 3000,
                });
              });
          }
        }
        else {
          sessionStorage.setItem("AllowQuestionSetUp", this.allowQuestionSetUp.toString());
          if (isContinue) {
            if (this.allowQuestionSetUp) {
              this.setActiveTab(1);
            }
            else {
              this.setActiveTab(2);
            }
          }
          else {
            this.messageService.add({
              severity: "warn",
              summary: "Warning",
              detail: "No changes detected.",
              life: 3000,
            });
          }
        }


      }
      else {
        // this.submitted = false;
        console.log('false');
      }
    }
    else {
      // this.submitted = false;      
      console.log('false');
    }
    console.log(this.event);
  }

  onAllFeeSelect() {
    if (this.selectedFeeTypes.length == 0) {
      this.selectedFeeTypes = this.feeTypes.filter(x => x.registrationFeeTypeName == "Regular");
    }
  }

  commonFormControlsValid() {
    if ((this.displayCode == 1 && !this.eventDetailForm.get('Code').valid) || (!this.eventDetailForm.get('Name').valid) || (!this.eventDetailForm.get('Type').valid)) {
      return false;
    }
    return true;
  }

  inPersonFormControlsValid() {
    if ((!this.eventDetailForm.get('StartDate').valid) || (!this.eventDetailForm.get('EndDate').valid) || (!this.eventDetailForm.get('RegStartDate').valid) || (!this.eventDetailForm.get('RegEndDate').valid) ||
      (!this.eventDetailForm.get('TimeZone').valid) || (!this.eventDetailForm.get('Location').valid) || (!this.eventDetailForm.get('Area').valid) || (!this.eventDetailForm.get('City').valid) ||
      (!this.eventDetailForm.get('State').valid) || (!this.eventDetailForm.get('Country').valid) || (!this.eventDetailForm.get('Zip').valid) || (!this.eventDetailForm.get('MaxCapacity').valid)) {
      return false;
    }
    return true;
  }

  virtualFormControlsValid() {
    if ((!this.eventDetailForm.get('StartDate').valid) || (!this.eventDetailForm.get('EndDate').valid) || (!this.eventDetailForm.get('RegStartDate').valid) || (!this.eventDetailForm.get('RegEndDate').valid) ||
      (!this.eventDetailForm.get('TimeZone').valid) || (!this.eventDetailForm.get('Location').valid) || (!this.eventDetailForm.get('WebinarLiveLink').valid)) {
      return false;
    }
    return true;
  }

  hybridFormControlsValid() {
    if ((!this.eventDetailForm.get('PreRecordedWebinarLink').valid)) {
      return false;
    }
    return true;
  }

  getFormData() {
    let fromDate = null;
    let endDate = null;
    let regStartDate = null;
    let regEndDate = null;
    let eventDueDate = null;

    if (this.eventDetailForm.get('StartDate').value && this.eventDetailForm.get('StartDate').value != '') {
      fromDate = moment(this.eventDetailForm.get('StartDate').value).utc(true).format();
    }
    if (this.eventDetailForm.get('EndDate').value && this.eventDetailForm.get('EndDate').value != '') {
      endDate = moment(this.eventDetailForm.get('EndDate').value).utc(true).format();
    }
    if (this.eventDetailForm.get('RegStartDate').value && this.eventDetailForm.get('RegStartDate').value != '') {
      regStartDate = moment(this.eventDetailForm.get('RegStartDate').value).utc(true).format();
    }
    if (this.eventDetailForm.get('RegEndDate').value && this.eventDetailForm.get('RegEndDate').value != '') {
      regEndDate = moment(this.eventDetailForm.get('RegEndDate').value).utc(true).format();
    }
    if (this.eventDetailForm.get('DueDate').value && this.eventDetailForm.get('DueDate').value != '') {
      eventDueDate = moment(this.eventDetailForm.get('DueDate').value).utc(true).format();
    }

    this.event = {
      eventId: this.eventId,
      code: this.eventDetailForm.get('Code').value,
      name: this.eventDetailForm.get('Name').value,
      eventTypeId: this.eventDetailForm.get('Type').value,
      status: this.eventDetailForm.get('Status').value == true ? 1 : 0,
      fromDate: fromDate,
      toDate: endDate,
      regStartDate: regStartDate,
      regEndDate: regEndDate,
      timeZoneId: this.eventDetailForm.get('TimeZone').value,
      location: this.eventType == 1 || this.eventType == 2 ? this.eventDetailForm.get('Location').value : null,
      area: this.eventType == 1 ? this.eventDetailForm.get('Area').value : null,
      city: this.eventType == 1 ? this.eventDetailForm.get('City').value : null,
      state: this.eventType == 1 ? this.eventDetailForm.get('State').value : null,
      country: this.eventType == 1 ? this.eventDetailForm.get('Country').value : null,
      zip: this.eventType == 1 ? this.eventDetailForm.get('Zip').value : "",
      maxCapacity: this.eventType == 1 || this.eventType == 2 ? this.eventDetailForm.get('MaxCapacity').value : null,
      summary: this.eventDetailForm.get('ShortDescription').value,
      description: this.eventDetailForm.get('LongDescription').value,
      eventImageId: 0,
      eventImage: this.eventImage,
      eventCoverImage: this.eventCoverImage,
      webinarLiveLink: this.eventType == 2 ? this.eventDetailForm.get('WebinarLiveLink').value : null,
      webinarRecordedLink: this.eventType == 3 ? this.eventDetailForm.get('PreRecordedWebinarLink').value : null,
      eventContacts: this.contactPersonsList,
      organizationId: this.currentUser.organizationId,
      dueDate : eventDueDate
    }
    if (this.formValueChanged) {
      sessionStorage.setItem("SetUpForm", JSON.stringify(this.event));
    }
    else {
      sessionStorage.removeItem("SetUpForm");
    }
    console.log(this.event);
  }

  setFormData() {
    let fromDate = null;
    let endDate = null;
    let regStartDate = null;
    let regEndDate = null;
    let eventDueDate = null;

    if (this.event.fromDate) {
      fromDate = new Date(this.event.fromDate);
    }
    if (this.event.toDate) {
      endDate = new Date(this.event.toDate)
    }
    if (this.event.regStartDate) {
      regStartDate = new Date(this.event.regStartDate);
    }
    if (this.event.regEndDate) {
      regEndDate = new Date(this.event.regEndDate);
    }
    if (this.event.dueDate) {
      eventDueDate = new Date(this.event.dueDate);
      this.existingEventDue = eventDueDate;
    }

    this.eventDetailForm.get('Code').setValue(this.event.code);
    this.eventDetailForm.get('Name').setValue(this.event.name);
    this.eventType = this.event.eventTypeId;
    this.eventDetailForm.get('Type').setValue(this.event.eventTypeId);
    this.eventDetailForm.get('Status').setValue(this.event.status == 1 ? true : false);
    this.eventDetailForm.get('StartDate').setValue(fromDate);
    this.eventDetailForm.get('EndDate').setValue(endDate);
    this.eventDetailForm.get('RegStartDate').setValue(regStartDate);
    this.eventDetailForm.get('RegEndDate').setValue(regEndDate);
    this.eventDetailForm.get('TimeZone').setValue(this.event.timeZoneId);
    this.eventDetailForm.get('Location').setValue(this.event.location);
    this.eventDetailForm.get('Area').setValue(this.event.area);
    this.eventDetailForm.get('City').setValue(this.event.city);
    this.eventDetailForm.get('State').setValue(this.event.state);
    this.eventDetailForm.get('Country').setValue(this.event.country);
    this.eventDetailForm.get('Zip').setValue(!this.event.zip ? '' : this.event.zip);
    this.eventDetailForm.get('MaxCapacity').setValue(this.event.maxCapacity);
    this.eventDetailForm.get('ShortDescription').setValue(this.event.summary);
    this.characterCount('ShortDescription');
    this.eventDetailForm.get('LongDescription').setValue(this.event.description);
    this.characterCount('LongDescription');
    this.eventDetailForm.get('DueDate').setValue(eventDueDate);
    this.eventImage = '\\assets\\lighting-bolt\\images\\empty-image.png',
      this.eventCoverImage = '\\assets\\lighting-bolt\\images\\empty-image.png',
      this.eventDetailForm.get('WebinarLiveLink').setValue(this.event.webinarLiveLink);
    this.eventDetailForm.get('PreRecordedWebinarLink').setValue(this.event.webinarRecordedLink);
    this.eventDetailForm.get('PreRecordedWebinarLink').setValue(this.event.webinarRecordedLink);

    // this.showContactName = true;
    this.showContactSearch = false;
    this.contactPersonsList = this.event.eventContacts;
    if (this.eventDetailForm.value?.Country) {
      this.getStatesLookup(this.eventDetailForm.value.Country);
      this.getZipFormat(this.eventDetailForm.value.Country);
    }
  }

  characterCount(control: string) {
    if (control == 'ShortDescription') {
      let description = this.eventDetailForm.get('ShortDescription').value;
      this.shortDescriptionCharactersLeft = 300 - description.length;
    }
    else if (control == 'LongDescription') {
      let description = this.eventDetailForm.get('LongDescription').value;
      this.longDescriptionCharactersLeft = 1000 - description.length;
    }
  }

  onFileSelected(event: any, imageFor: string) {
    //this.eventImageFile = event.target.files[0];

    var file = event.target.files[0];

    if (file) {
      let imageSize = file.size / 1000000;
      let imageType = file.type;
      if (imageSize > 5) {
        this.messageService.add({ severity: 'warn', summary: 'Warning', detail: 'Image size should not be greater than 5 Mb.', life: 3000 });
        event.target.value = null;
        return;
      }
      else if (imageType != 'image/jpeg' && imageType != 'image/jpg' && imageType != 'image/png' && imageType != 'image/gif' && imageType != 'image/bmp') {
        this.messageService.add({ severity: 'warn', summary: 'Warning', detail: 'Please select image of type .jpeg, .jpg, .gif, .bmp or .png.', life: 3000 });
        event.target.value = null;
        return;
      }
      if (imageFor == "eventImage") {
        this.uploadImage(file);
        let reader = new FileReader();
        reader.addEventListener('load', () => {
          this.eventImage = [reader.result];
        }, false);
        reader.readAsDataURL(file);
        // event.target.value = null;
      }
      else if (imageFor == 'coverImage') {
        this.eventCoverImageFile = file;
        this.uploadCoverImage(file);
        let reader = new FileReader();
        reader.addEventListener('load', () => {
          this.eventCoverImage = [reader.result];
        }, false);
        reader.readAsDataURL(file);
        // event.target.value = null;
      }
    }
  }

  uploadImage(file) {
    if (this.eventId > 0) {
      this.formData.append('File', file);
      this.formData.append('eventId', this.eventId.toString());

      this.eventService.uploadEventImage(this.formData).subscribe((data: any) => {
        console.log(data);
        this.messageService.add({
          severity: "success",
          summary: "Success",
          detail: "Event Image updated.",
          life: 3000,
        });
      });
      this.formData = new FormData();
    }
    else {
      this.eventImageFile = file;
    }
  }

  uploadCoverImage(file) {
    if (this.eventId > 0) {
      this.formData.append('File', file);
      this.formData.append('eventId', this.eventId.toString());
      this.formData.append('eventBannerImageId', this.eventId.toString());

      this.eventService.uploadCoverImage(this.formData).subscribe((data: any) => {
        console.log(data);
        this.messageService.add({
          severity: "success",
          summary: "Success",
          detail: "Event Cover Image updated.",
          life: 3000,
        });
      });
      this.formData = new FormData();
    }
    else {
      this.eventCoverImageFile = file;
    }
  }

  openContactSearch() {
    // this.showContactName = false;
    this.showContactSearch = true;
  }

  removeEventImage() {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete event image?',
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.eventImage = '\\assets\\lighting-bolt\\images\\empty-image.png';
        if (this.eventId) {
          this.eventService.deleteEventImage(this.eventId).subscribe((data: any) => {
            this.messageService.add({
              severity: "success",
              summary: "Success",
              detail: "Event Image deleted.",
              life: 3000,
            });
          },
            error => {
              this.messageService.add({
                severity: "error",
                summary: "Error",
                detail: error,
                life: 3000,
              });
            });
        }
      }
    });
  }

  removeCoverImage() {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete event cover image?',
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.eventCoverImage = '\\assets\\lighting-bolt\\images\\empty-image.png';
        if (this.eventId) {
          this.eventService.deleteEventCoverImage(this.eventId).subscribe((data: any) => {
            this.messageService.add({
              severity: "success",
              summary: "Success",
              detail: "Event Cover Image deleted.",
              life: 3000,
            });
          },
            error => {
              this.messageService.add({
                severity: "error",
                summary: "Error",
                detail: error,
                life: 3000,
              });
            });
        }
      }
    });
  }

  setMinEndDate(event: any) {
    // this.minEndDate = event;
  }

  enableQuestionSetUp(event: any) {
    this.allowQuestionSetUp = event.checked;
  }

  getEventDetails(isClone: boolean) {
    let searchParams = new HttpParams();
    searchParams = searchParams.append('eventId', this.eventId);
    const opts = { params: searchParams };
    this.eventService.getEventBasicDetailsById(opts).subscribe((data: any[]) => {
      console.log(data);
      this.event = data;
      this.setFormData();
      this.getEventImage();
      this.getCoverImage();
    },
      error => {
        this.messageService.add({
          severity: "error",
          summary: "Error",
          detail: error,
          life: 3000,
        });
      });
  }

  getEventImage() {
    if (this.event.eventImageId != null && this.event.eventImageId > 0) {
      this.eventService.getEventImage(this.event.eventId).subscribe((image: any) => {
        console.log(image);
        let reader = new FileReader();
        reader.addEventListener('load', () => {
          this.eventImage = [reader.result];
        }, false);
        if (image) {
          reader.readAsDataURL(image);
        }
      });
    }
  }

  getCoverImage() {
    if (this.event.eventBannerImageId != null && this.event.eventBannerImageId > 0) {
      this.eventService.getEventCoverImage(this.event.eventId).subscribe((image: any) => {
        console.log(image);
        let reader = new FileReader();
        reader.addEventListener('load', () => {
          this.eventCoverImage = [reader.result];
        }, false);
        if (image) {
          reader.readAsDataURL(image);
        }
      });
    }
  }

  postEventSaveCallback(isNewRecord: boolean, isContinue: boolean) {
    sessionStorage.removeItem("SetUpForm");
    this.formValueChanged = false;
    this.eventId = this.event.eventId;
    this.messageService.add({
      severity: "success",
      summary: "Successful",
      detail: isNewRecord ? "Event created succesfully." : "Event updated succesfully.",
      life: 3000
    });

    if (isNewRecord) {
      this.uploadImage(this.eventImageFile);
      this.uploadCoverImage(this.eventCoverImageFile);
    }
    sessionStorage.setItem("AllowQuestionSetUp", this.allowQuestionSetUp.toString());

    this.activeEventId.emit(this.eventId);
    if (isContinue) {
      if (this.allowQuestionSetUp) {
        if (this.futureIndex >= 0) {
          this.setActiveTab(this.futureIndex)
        }
        else {
          this.setActiveTab(1);
        }
        // this.setActiveTab(1);
      }
      else {
        if (this.futureIndex != 0) {
          this.setActiveTab(this.futureIndex)
        }
        else {
          this.setActiveTab(2);
        }
        // this.setActiveTab(2);
      }
    }
    setTimeout(() => this.submitted = false, 1000);
  }

  getConfiguration(organizationId) {
    this.configurationService.getConfigurationByOrganizationId(organizationId).subscribe((data: any) => {
      console.log('Configuration:' + JSON.stringify(data));
      this.configuration = data;
      this.displayCode = this.configuration.displayCodes;
    });

  }

  onTextChanged(changeEvent) {
    console.log(changeEvent);
    //  this.eventDetailForm.get("LongDescription").setValue(changeEvent.htmlValue);
  }

  capacityChanged(event: any) {
    let capacity = parseInt(this.eventDetailForm.get('MaxCapacity').value);
    if (capacity < 0) {
      capacity = 0;
      this.eventDetailForm.get('MaxCapacity').setValue(capacity);
    }
  }

  enableSave(formControlName) {
    switch (formControlName) {
      case 'Code':
        if (this.event.code != this.eventDetailForm.get(formControlName).value) {
          this.formValueChanged = true;
        }
        break;

      case 'Name':
        if (this.event.name != this.eventDetailForm.get(formControlName).value) {
          this.formValueChanged = true;
        }
        break;

      case 'Type':
        this.formValueChanged = true;
        break;

      case 'WebinarLiveLink':
        if (this.event.webinarLiveLink != this.eventDetailForm.get(formControlName).value) {
          this.formValueChanged = true;
        }
        break;

      case 'PreRecordedWebinarLink':
        if (this.event.webinarRecordedLink != this.eventDetailForm.get(formControlName).value) {
          this.formValueChanged = true;
        }
        break;

      case 'Status':
        this.formValueChanged = true;
        break;

      case 'StartDate':
        this.formValueChanged = true;
        break;

      case 'EndDate':
        this.formValueChanged = true;
        break;

      case 'RegStartDate':
        this.formValueChanged = true;
        break;

      case 'RegEndDate':
        this.formValueChanged = true;
        break;

      case 'TimeZone':
        if (this.event.timeZoneId != this.eventDetailForm.get(formControlName).value) {
          this.formValueChanged = true;
        }
        break;

      case 'Location':
        if (this.event.location != this.eventDetailForm.get(formControlName).value) {
          this.formValueChanged = true;
        }
        break;

      case 'Area':
        if (this.event.area != this.eventDetailForm.get(formControlName).value) {
          this.formValueChanged = true;
        }
        break;

      case 'City':
        if (this.event.city != this.eventDetailForm.get(formControlName).value) {
          this.formValueChanged = true;
        }
        break;

      case 'State':
        if (this.event.state != this.eventDetailForm.get(formControlName).value) {
          this.formValueChanged = true;
        }
        break;
      case 'Country':
        if (this.event.state != this.eventDetailForm.get(formControlName).value) {
          this.formValueChanged = true;
        }
        break;

      case 'Zip':
        if (this.event.zip != this.eventDetailForm.get(formControlName).value) {
          this.formValueChanged = true;
        }
        break;

      case 'MaxCapacity':
        if (this.event.maxCapacity != this.eventDetailForm.get(formControlName).value) {
          this.formValueChanged = true;
        }
        break;

      case 'ContactNameSearch':
        this.formValueChanged = true;
        break;

      case 'ContactName':
        this.formValueChanged = true;
        break;

      case 'ShortDescription':
        if (this.event.summary != this.eventDetailForm.get(formControlName).value) {
          this.formValueChanged = true;
        }
        break;

      case 'LongDescription':
        if (this.event.description != this.eventDetailForm.get(formControlName).value) {
          this.formValueChanged = true;
        }
        break;

      case 'DueDate':
          this.formValueChanged = true;
          break;
    }
    if (this.formValueChanged) {
      this.tabValueChangedEvent.emit(0);
      this.getFormData();
    }
  }

  cancel() {
    if (this.formValueChanged) {
      this.confirmationService.confirm({
        message: 'You have unsaved changes. Are you sure you want to exit?',
        header: 'Confirm',
        icon: 'pi pi-exclamation-triangle',
        accept: () => {
          this.router.navigate(['events/events']);
          sessionStorage.removeItem("SetUpForm");
        }
      });
    }
    else {
      this.router.navigate(['events/events']);
      sessionStorage.removeItem("SetUpForm");
    }
  }

  selectContactPerson(person: any) {
    console.log(person);
    this.formValueChanged = true;
    if (this.contactPersonsList.length >= 3) {
      this.messageService.add({
        severity: "error",
        summary: "Error",
        detail: "You can have maximum 3 contact persons.",
        life: 3000,
      });
      return;
    }
    else {
      const selectedContact = {
        eventContactId: 0,
        staffId: person.userId,
        phoneNumber: person.cellPhoneNumber,
        email: person.email,
        name: person.firstName + " " + person.lastName,
        eventId: this.eventId,
      }

      var index = this.contactPersonsList.findIndex(x => x.staffId == selectedContact.staffId);

      if (index != -1) {
        this.messageService.add({
          severity: "error",
          summary: "Error",
          detail: "Contact already selected.",
          life: 3000,
        });
      }
      else {
        this.showContactDetails(selectedContact, true);
      }
    }

    this.eventDetailForm.get('ContactNameSearch').setValue("");
  }

  showContactDetails(person: any, isaddNew: boolean) {
    this.formValueChanged = true;
    this.isContactPersonAddMode = isaddNew;
    this.selectedContact = person;
    this.displayContactDetails = true;
    this.eventDetailForm.get('ContactNameSearch').setValue("");
    this.eventDetailForm.get('ContactName').setValue(person.name);
    this.eventDetailForm.get('ContactEmail').setValue(person.email);
    this.eventDetailForm.get('ContactPhone').setValue(person.phoneNumber);

  }

  addToContactDetails() {
    this.selectedContact.phoneNumber = this.eventDetailForm.get('ContactPhone').value;
    this.selectedContact.email = this.eventDetailForm.get('ContactEmail').value;
    this.selectedContact.name = this.eventDetailForm.get('ContactName').value;

    if (this.isContactPersonAddMode) {
      this.contactPersonsList.push(this.selectedContact);
    }
    this.isContactPersonAddMode = false;
    this.displayContactDetails = false;
    console.log(this.contactPersonsList);
    this.getFormData();
  }

  hideContactDetails() {
    this.displayContactDetails = false;
    this.isContactPersonAddMode = false;
  }

  getEventType(): boolean {
    if (this.eventType === 1 || this.eventType === 2) {
      this.eventDetailForm.get('StartDate').setErrors({ required: true });
      return true;
    }
    return null;
  }

  removeContact(contact: any) {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete this contact person?',
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        var index = this.contactPersonsList.findIndex(x => x.staffId == contact.staffId);
        this.contactPersonsList.splice(index, 1);
        this.formValueChanged = true;
      }
    });
  }

  countryFieldChangeEvent(event) {
    this.getStatesLookup(event.value);
    this.eventDetailForm.controls["State"].reset();
    this.eventDetailForm.controls["Zip"].reset();
    this.enableSave("Country");
    var country = this.countryList?.filter((x) => x.name == event.value)[0];
    if (country) {
      // this.addressFormGroup.controls.countryCode.setValue(
      //     country.shortName
      // );
      if (country.zipFormat) {
        this.zipFormat = country.zipFormat;
        this.zipFormatLength = this.zipFormat.length;
      }
    }
  }
  stateFieldChangeEvent(event) {
    this.enableSave("State");
    this.eventDetailForm.controls["Zip"].reset();
    if (event.value != null && this.stateList.length > 0) {
      var state = this.stateList?.filter((x) => x.name == event.value)[0];
      if (state) {
        // this.eventDetailForm.controls.stateCode.setValue(
        //   state.shortName
        // );
      }
    }
  }

  zipBlurEvent(event, id) {
    var input = this.eventDetailForm.value?.Zip;
    if (input) {
      let zip = input.replace(/[_-]/g, "");
      var zipLength = zip.length;
      var country = this.eventDetailForm.value?.Country;
      if (country && this.countryList?.length > 0) {
        var res = this.countryList.filter((x) => x.name == country)[0];
        if (res && res.zipFormat) {
          var zipFormat = res.zipFormat.replace(/[_-]/g, "");
          var zipFormatlength = zipFormat.length;
          if (zipLength != zipFormatlength) {
            this.eventDetailForm.controls.zip.setErrors({
              zipLengthError: true,
            });
            this.eventDetailForm.setErrors({ zipLengthError: true });
          }
        }
      }
    }
  }

  setDueDate(event:any)
  {
    this.eventDetailForm.get('DueDate').setValue(moment(new Date(event)).format('MM/DD/yyyy hh:mm a'));
  }
}
