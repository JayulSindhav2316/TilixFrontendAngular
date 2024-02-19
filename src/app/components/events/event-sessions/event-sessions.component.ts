import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
import { QuestionBankService } from 'src/app/services/question-bank.service';
import { GLChartOfAccountService } from 'src/app/services/glchart-of-account.service';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { PersonService } from 'src/app/services/person.service';
import * as moment from 'moment';
import { SessionService } from 'src/app/services/session.service';
import { User } from 'src/app/models/user';
import { ConfigurationService } from 'src/app/services/configuration.service';
import { AuthService } from 'src/app/services/auth.service';
import { EntityService } from 'src/app/services/entity.service';
import { AppBreadcrumbService } from 'src/app/app.breadcrumb.service';
import { Router } from '@angular/router';
import { EventService } from 'src/app/services/event.service';

@Component({
  selector: 'app-event-sessions',
  templateUrl: './event-sessions.component.html',
  styleUrls: ['./event-sessions.component.scss']
})
export class EventSessionsComponent implements OnInit {
  @Input() addNewEventRecord: boolean;
  @Input() eventId: number;
  @Output() activeTabEvent = new EventEmitter<number>();
  @Output() tabValueChangedEvent = new EventEmitter<number>();
  @Input() futureIndex: number;

  sessionDetailForm = this.formBuilder.group({
    SessionId: [0],
    EventCode: [''],
    SessionCode: ['', [Validators.required, this.noBlankValidator]],
    SessionName: ['', [Validators.required, this.noBlankValidator]],
    StartDate: ['', [Validators.required]],
    EndDate: ['', [Validators.required]],
    SessionLeader: [''],
    MaxCapacity: [0],
    Status: [true],
    GlAccount: ['', [Validators.required]],
    Location: ['', [Validators.required, this.noBlankValidator]],
  });

  currentUser: User;
  configuration: any;
  displayCode: number;
  event: any;
  session: any;
  sessionId: number;
  showTable: boolean;
  sessionsList: any[] = [];
  alteredSessionsList: any[] = [];
  glAccountsList: any[] = [];
  linkedGroups: any[] = [];
  linkedFeeTypes: any[] = [];
  showSessionDetails: boolean;
  items: MenuItem[];
  addNewSessionRecord: boolean;
  addNewCloneSessionRecord: boolean;

  questionList: any[] = [];
  selectedQuestionList: any[] = [];
  selectedQuestionId: number;
  displayLeaderDetails: boolean = false;
  isMaxCapacityEnabled: boolean = false;
  filteredPersons: any[] = [];
  sessionLeadersList: any[] = [];
  selectedLeaderEntity: any;
  selectedLeaderProfileImage: any;

  submitted: boolean = false;
  hasErrors: boolean = false;
  addErrorMessages: any = {};

  sessionHeading: string;
  expandAllTabs: boolean = true;

  formValueChanged: boolean = false;
  eventType: number;
  existingSessionCapacity: number;

  constructor(
    private formBuilder: FormBuilder,
    private http: HttpClient,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private questionBankService: QuestionBankService,
    private gLChartOfAccountService: GLChartOfAccountService,
    private personService: PersonService,
    private sessionService: SessionService,
    private configurationService: ConfigurationService,
    private authService: AuthService,
    private enitityService: EntityService,
    private breadcrumbService: AppBreadcrumbService,
    private router: Router,
    private eventService: EventService) {
    this.breadcrumbService.setItems([
      { label: 'Home', routerLink: ['/'] },
      { label: 'Events', routerLink: ['/events/events'] },
      { label: 'Session' }
    ]);
  }

  async ngOnInit(): Promise<void> {
    this.getSessionsList();
    this.currentUser = this.authService.currentUserValue;
    this.setActiveTab(3);
    this.getConfiguration(this.currentUser.organizationId);
    this.getGLaccountsList();

    this.showTable = true;
    // let sessionsForm = JSON.parse(sessionStorage.getItem("SessionsForm"));
    // if(sessionsForm)
    // {
    //   this.saveSession();
    // }
  }
  ngAfterViewInit() {
    let sessionsForm = JSON.parse(sessionStorage.getItem("SessionsForm"));
    if (sessionsForm && sessionsForm.code == null) {
      this.addNewSessionRecord = true;
      this.formValueChanged = false;
    }
    if (sessionsForm) {
      setTimeout(() => {
        var ele = document.getElementById("SessionSave");
        ele.click();
      }, 500);

    }
  }

  addNewSession() {
    this.sessionDetailForm.reset();
    this.getNewsessionModel();
    this.sessionLeadersList = [];
    this.selectedQuestionList = [];
    this.showTable = false;
    this.addNewSessionRecord = true;
    this.expandAllTabs = true;
    this.sessionHeading = "Adding new session";
    this.linkedGroups = [];
    this.getQuestionList();
  }

  getSessionsList() {
    let searchParams = new HttpParams();
    searchParams = searchParams.append('eventId', this.eventId);
    const opts = { params: searchParams };
    this.sessionService.getSessionsByEventId(opts).subscribe((data: any[]) => {
      console.log(data);
      this.sessionsList = data;

      let sessionsForm = JSON.parse(sessionStorage.getItem("SessionsForm"));
      if (sessionsForm) {
        this.formValueChanged = true;
        this.editSession(sessionsForm);
      }
      else {
        this.formValueChanged = false;
      }
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

  saveSession() {
    if (this.session.event.fromDate && this.session.event.toDate) {
      this.sessionDetailForm.get('StartDate').setErrors({ required: true });
      this.sessionDetailForm.get('EndDate').setErrors({ required: true });
    }
    else {
      this.sessionDetailForm.get('StartDate').setErrors({ required: null });
      this.sessionDetailForm.get('EndDate').setErrors({ required: null });
    }
    this.submitted = true;
    this.hasErrors = true;
    // if (this.sessionLeadersList.length == 0)
    // {
    //   this.messageService.add({ severity: 'error', summary: 'Error', detail: 'You need to have atleast one session leader.', life: 3000 });
    //   this.hasErrors = true;
    //   return;
    // }
    let startDatetime = this.sessionDetailForm.get('StartDate').value;
    let endDateTime = this.sessionDetailForm.get('EndDate').value;

    if (this.session.event.eventTypeId != 3) {
      if (startDatetime > endDateTime) {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Start date should be earlier than End date.', life: 3000 });
        this.hasErrors = true;
        return;
      }
      if (startDatetime < new Date(this.session.event.fromDate) || startDatetime > new Date(this.session.event.toDate)) {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Session dates should fall between event dates.', life: 3000 });
        this.hasErrors = true;
        return;
      }
      if (endDateTime < new Date(this.session.event.fromDate) || endDateTime > new Date(this.session.event.toDate)) {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Session dates should fall between event dates.', life: 3000 });
        this.hasErrors = true;
        return;
      }
    }

    if ((this.displayCode == 1 && this.sessionDetailForm.valid) || (this.displayCode == 0 && this.sessionDetailForm.get('SessionName').valid && this.sessionDetailForm.get('GlAccount').valid && this.sessionDetailForm.get('Location').valid)) {
      this.hasErrors = false;
      this.getFormData();
      this.showTable = true;
      this.showSessionDetails = false;
      // return;
      if (this.addNewSessionRecord) {
        this.sessionService.createSession(this.session).subscribe((data: any[]) => {
          sessionStorage.removeItem("SessionsForm");
          this.formValueChanged = false;
          console.log(data);
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Session created successfully.', life: 3000 });
          this.closeSession();
          this.hasErrors = false;
          this.submitted = false;
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
        if (this.formValueChanged) {
          this.sessionService.updateSession(this.session).subscribe((data: any[]) => {
            sessionStorage.removeItem("SessionsForm");
            this.formValueChanged = false;
            console.log(data);
            this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Session updated successfully.', life: 3000 });
            this.closeSession();
            this.hasErrors = false;
            this.submitted = false;
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
          sessionStorage.removeItem("SessionsForm");
          this.formValueChanged = false;
          this.closeSession();
          this.hasErrors = false;
          this.submitted = false;
        }

      }

    }
  }

  closeSession() {
    if (this.formValueChanged) {
      this.confirmationService.confirm({
        message: 'You have unsaved changes. Are you sure you want to continue?',
        header: 'Confirm',
        icon: 'pi pi-exclamation-triangle',
        accept: () => {
          this.showTable = true;
          this.showSessionDetails = false;
          this.getSessionsList();
          this.session = {};
          this.sessionId = 0;
          this.expandAllTabs = true;
          sessionStorage.removeItem("SessionsForm");
        }
      });
    }
    else {
      this.showTable = true;
      this.showSessionDetails = false;
      this.getSessionsList();
      this.session = {};
      this.sessionId = 0;
      this.expandAllTabs = true;
      this.existingSessionCapacity = 0;
      sessionStorage.removeItem("SessionsForm");
      if (this.futureIndex >= 0) {
        this.setActiveTab(this.futureIndex);
      }
    }
  }

  editSession(session: any) {
    this.setActiveSessionRow(session);
    this.addNewSessionRecord = false;
    if (!this.formValueChanged) {
      let searchParams = new HttpParams();
      searchParams = searchParams.append('sessionId', session.sessionId);
      const opts = { params: searchParams };
      this.sessionService.getSessionsById(opts).subscribe((data: any[]) => {
        console.log(data);
        this.session = data;
        this.event = this.session.event;
        this.setFormData();
        this.sessionHeading = "Editing session " + this.session.name;
        this.showSessionDetails = true;
        this.existingSessionCapacity = this.session.maxCapacity;
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
      this.session = session;
      this.setFormData();
      this.sessionHeading = "Editing session " + this.session.name;
      this.showSessionDetails = true;
    }

    this.showTable = false;
    let sessionsForm = JSON.parse(sessionStorage.getItem("SessionsForm"));
    if (sessionsForm.code != null) {
      this.addNewSessionRecord = false;
    }
    this.alteredSessionsList = this.sessionsList.filter(x => x.sessionId == session.sessionId);
  }

  cloneSession(session: any) {
    this.confirmationService.confirm({
      message: 'Are you sure you want to clone this session ?',
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        let searchParams = new HttpParams();
        searchParams = searchParams.append('sessionId', session.sessionId);
        const opts = { params: searchParams };
        this.sessionService.cloneSession(opts).subscribe((data: any[]) => {
          console.log(data);
          this.messageService.add({ severity: 'success', summary: 'Success', detail: "Session cloned successfully.", life: 3000 });
          this.closeSession();
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
    });
  }

  deleteSession(session: any) {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete this session ?',
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.sessionService.deleteSession(session.sessionId).subscribe((data: any[]) => {
          console.log(data);
          this.messageService.add({ severity: 'success', summary: 'Success', detail: "Session deleted successfully.", life: 3000 });
          this.closeSession();
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
    });
  }

  setActiveSessionRow(session: any) {
    console.log('Selected User:' + JSON.stringify(session));
    this.sessionId = session.sessionId;
  }

  errorIconCss(field: string) {
    return { 'has-feedback': true };
  }

  errorFieldCss(field: string) {
    return { 'ng-dirty': true };
  }

  isFieldValid(field: string) {
    if ((!this.sessionDetailForm.get(field).valid) && (this.submitted) && (this.sessionDetailForm.get(field).hasError('required'))) {
      this.addErrorMessages = { errorType: 'required', controlName: field };
      if (field == 'MaxCapacity') {
        field = 'Max Capacity';
        this.addErrorMessages = { errorType: 'required', controlName: field };
      }
      else if (field == 'SessionName') {
        field = 'Session Name';
        this.addErrorMessages = { errorType: 'required', controlName: field };
      }
      else if (field == 'SessionCode') {
        field = 'Session Code';
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
      else if (field == 'GlAccount') {
        field = 'GL Account';
        this.addErrorMessages = { errorType: 'required', controlName: field };
      }
      else if (field == 'Location') {
        field = 'Session Location';
        this.addErrorMessages = { errorType: 'required', controlName: field };
      }
      return true;
    }
  }

  showLeaderDetails(leader: any) {
    let searchParams = new HttpParams();
    searchParams = searchParams.append('entityId', leader.entityId);
    const opts = { params: searchParams };
    this.displayLeaderDetails = true;
    this.enitityService.getEntitySummaryById(opts).subscribe((data: any[]) => {
      console.log(data);
      this.selectedLeaderEntity = data;
      this.getProfileImage(this.selectedLeaderEntity.entityId);
    });
  }

  getProfileImage(entityId: number) {
    this.enitityService.getProfileImage(entityId).subscribe(data => {
      this.createImageFromBlob(data);
      console.log(data);
    },
      error => {
        console.log(error);
      });
  }

  createImageFromBlob(image: Blob) {
    let reader = new FileReader();
    reader.addEventListener('load', () => {
      this.selectedLeaderProfileImage = [reader.result];
    }, false);
    if (image) {
      reader.readAsDataURL(image);
    }
  }

  enableMaxCapacity(event: any) {
    this.isMaxCapacityEnabled = event.checked;
  }

  setActiveTab(value: number) {
    this.activeTabEvent.emit(value);
    console.log("Set Active Tab ->:" + value);
  }

  goBack() {
    this.setActiveTab(2);
  }

  getFormData() {
    let startDate = null;
    let endDate = null;

    if (this.sessionDetailForm.get('StartDate').value && this.sessionDetailForm.get('StartDate').value != '') {
      startDate = moment(this.sessionDetailForm.get('StartDate').value).utc(true).format();
    }
    if (this.sessionDetailForm.get('EndDate').value && this.sessionDetailForm.get('EndDate').value != '') {
      endDate = moment(this.sessionDetailForm.get('EndDate').value).utc(true).format();
    }

    this.session = {
      sessionId: this.sessionId,
      event: this.session.event,
      eventId: this.eventId,
      code: this.sessionDetailForm.get('SessionCode').value,
      name: this.sessionDetailForm.get('SessionName').value,
      startDatetime: startDate,
      endDateTime: endDate,
      status: this.sessionDetailForm.get('Status').value == true ? 1 : 0,
      maxCapacity: this.sessionDetailForm.get('MaxCapacity').value,
      glAccountId: this.sessionDetailForm.get('GlAccount').value,
      location: this.sessionDetailForm.get('Location').value,
      linkedFeeTypes: this.session.linkedFeeTypes,
      sessionQuestions: this.selectedQuestionList,
      sourceQuestions: this.questionList,
      sessionLeaders: this.sessionLeadersList,
      groupPricing: this.linkedGroups
    }
    console.log(this.session);
  }

  setFormData() {
    let sessionStartDate;
    let sessionEndDate;
    if (this.session.event.eventTypeId != 3) {
      if (this.session.startDatetime && this.session.endDateTime) {
        sessionStartDate = new Date(this.session.startDatetime);
        sessionEndDate = new Date(this.session.endDateTime);
      }
      else {
        sessionStartDate = new Date(this.session.event.fromDate);
        sessionEndDate = new Date(this.session.event.toDate);
      }
    }

    this.sessionDetailForm.get('EventCode').setValue(this.session.event.code);
    this.sessionDetailForm.get('SessionCode').setValue(this.session.code);
    this.sessionDetailForm.get('SessionName').setValue(this.session.name);
    this.sessionDetailForm.get('StartDate').setValue(sessionStartDate);
    this.sessionDetailForm.get('EndDate').setValue(sessionEndDate);
    this.sessionDetailForm.get('Status').setValue(this.session.status == 1 ? true : false);
    this.sessionDetailForm.get('MaxCapacity').setValue(this.session.maxCapacity);
    this.sessionDetailForm.get('GlAccount').setValue(this.session.glAccountId.toString());
    this.sessionDetailForm.get('Location').setValue(this.session.location);
    this.sessionLeadersList = this.session.sessionLeaders;
    this.selectedQuestionList = this.session.sessionQuestions;
    this.getQuestionList();
    this.linkedGroups = this.session.groupPricing;
    this.linkedFeeTypes = this.session.linkedFeeTypes;
  }

  finish() {
    if (this.sessionsList.length == 0) {
      this.messageService.add({
        severity: "error",
        summary: "Error",
        detail: "You need to have atleast one session.",
        life: 3000,
      });
      return;
    }
    else {
      this.setActiveTab(4);
    }
  }

  getQuestionList() {
    let searchParams = new HttpParams();
    searchParams = searchParams.append('status', 1);
    const opts = { params: searchParams };
    this.questionBankService.getAllQuestions(opts).subscribe((data: any[]) => {
      console.log(data);
      this.questionList = data;
      this.removeLinkedFromAvailableQuestions();
    });
  }

  getQuestionOptionsListHTML(questionId: number) {
    let optionsHTML = "<ul>";
    let option = this.questionList.find(x => x.questionBankId == questionId).answerOptions;
    option.forEach((q) => {
      optionsHTML += "<li>" + q.option + "</li>"
    });
    optionsHTML += "</ul>";
    return optionsHTML;
  }

  removeLinkedFromAvailableQuestions() {
    if (this.selectedQuestionList.length > 0) {
      this.selectedQuestionList.forEach((question) => {
        var index = this.questionList.findIndex(x => x.questionBankId == question.questionBankId);
        this.questionList.splice(index, 1);
      });
    }
  }

  setActiveQuestionRow(questionId: number) {
    this.selectedQuestionId = questionId;
  }

  getGLaccountsList() {
    this.gLChartOfAccountService.getGlAccountsSelectList().subscribe((data: any[]) => {
      console.log(data);
      if ((data.length > 0)) {
        this.glAccountsList = data;
      }
    });
  }


  getPeopleByName(event: any) {
    console.log(event);
    let name = event.query;
    if (name.length >= 2) {
      let searchParams = new HttpParams();
      searchParams = searchParams.append('name', name);
      const opts = { params: searchParams };
      console.log('Search Name:' + JSON.stringify(opts));
      this.personService.getAllPersonsByName(opts).subscribe((data: any[]) => {
        console.log(data);
        this.filteredPersons = data;
      });
    }
  }

  selectContactPerson(person: any) {
    console.log(person);
    if (this.sessionLeadersList.length >= 5) {
      this.messageService.add({
        severity: "error",
        summary: "Error",
        detail: "You can have maximum 5 leaders per session.",
        life: 3000,
      });
      return;
    }
    else {
      this.formValueChangedEvent();
      const selectedLeader = {
        entityId: person.entityId,
        phone: person.formattedPhoneNumber,
        email: person.primaryEmail,
        entityName: person.fullName,
        sessionId: this.sessionId,
        sessionLeaderLinkId: 0
      }

      var index = this.sessionLeadersList.findIndex(x => x.entityId == selectedLeader.entityId);

      if (index != -1) {
        this.messageService.add({
          severity: "error",
          summary: "Error",
          detail: "Selected person is already a leader.",
          life: 3000,
        });
      }
      else {
        this.sessionLeadersList.push(selectedLeader);
      }
    }

    this.sessionDetailForm.get('SessionLeader').setValue("");
  }

  removeLeader(leader: any) {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete this session leader?',
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        var index = this.sessionLeadersList.findIndex(x => x.entityId == leader.entityId);
        this.sessionLeadersList.splice(index, 1);
        this.formValueChangedEvent();
      }
    });

    console.log(this.sessionLeadersList);
  }

  noBlankValidator(control: FormControl) {
    const isWhitespace = (control.value || '').trim().length === 0;
    const isValid = !isWhitespace;
    return isValid ? null : { 'required': true };
  }

  sessionLeaderValidator() {
    return this.sessionLeadersList.length > 0 ? null : { 'required': true };
  }

  getConfiguration(organizationId) {
    this.configurationService.getConfigurationByOrganizationId(organizationId).subscribe((data: any) => {
      console.log('Configuration:' + JSON.stringify(data));
      this.configuration = data;
      this.displayCode = this.configuration.displayCodes;
    });

  }

  getNewsessionModel() {
    let searchParams = new HttpParams();
    searchParams = searchParams.append('eventId', this.eventId);
    const opts = { params: searchParams };
    this.sessionService.getNewSessionModel(opts).subscribe((data: any[]) => {
      console.log(data);
      this.session = data;
      this.event = this.session.event;
      let capacityLeft = this.session.event.maxCapacity - this.session.event.totalSessionsCapacityCount;
      this.sessionDetailForm.get('EventCode').setValue(this.session.event.code);
      let fromDate = this.session.event.eventTypeId == 3 ? '' : new Date(this.session.event.fromDate);
      let toDate = this.session.event.eventTypeId == 3 ? '' : new Date(this.session.event.toDate);
      this.sessionDetailForm.get('StartDate').setValue(fromDate);
      this.sessionDetailForm.get('EndDate').setValue(toDate);
      this.sessionDetailForm.get('MaxCapacity').setValue(capacityLeft);
      this.sessionDetailForm.get('Status').setValue(true);
      this.linkedGroups = this.session.groupPricing;
      this.linkedFeeTypes = this.session.linkedFeeTypes;
      this.showSessionDetails = true;
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

  clickExpandAll(event: boolean) {
    this.expandAllTabs = !event;
  }

  priceChanged(pricing: any) {
    this.formValueChangedEvent();
    if (pricing.price < 0) {
      pricing.price = 0;
    }
  }

  enableSave(formControlName) {
    switch (formControlName) {
      case 'SessionCode':
        if (this.session.code != this.sessionDetailForm.get(formControlName).value) {
          this.formValueChanged = true;
        }
        break;

      case 'SessionName':
        if (this.session.name != this.sessionDetailForm.get(formControlName).value) {
          this.formValueChanged = true;
        }
        break;

      case 'StartDate':
        if (new Date(this.session.startDatetime) != new Date(this.sessionDetailForm.get(formControlName).value)) {
          this.formValueChanged = true;
        }
        break;

      case 'EndDate':
        if (new Date(this.session.endDateTime) != new Date(this.sessionDetailForm.get(formControlName).value)) {
          this.formValueChanged = true;
        }
        break;

      case 'SessionLeader':
        this.formValueChanged = true;
        break;

      case 'Status':
        if (this.session.status != this.sessionDetailForm.get(formControlName).value) {
          this.formValueChanged = true;
        }
        break;

      case 'MaxCapacity':
        if (this.session.maxCapacity != this.sessionDetailForm.get(formControlName).value) {
          this.formValueChanged = true;
        }
        break;

      case 'GlAccount':
        if (this.session.glAccountId != this.sessionDetailForm.get(formControlName).value) {
          this.formValueChanged = true;
        }
        break;

      case 'Location':
        if (this.session.location != this.sessionDetailForm.get(formControlName).value) {
          this.formValueChanged = true;
        }
        break;
    }
    if (this.formValueChanged) {
      this.formValueChangedEvent();
    }

  }

  formValueChangedEvent() {
    this.formValueChanged = true;
    this.getFormData();
    sessionStorage.setItem("SessionsForm", JSON.stringify(this.session));
    this.tabValueChangedEvent.emit(3);
  }

  capacityChanged(event: any) {
    let capacity = parseInt(this.sessionDetailForm.get('MaxCapacity').value);

    if (this.session.event.eventTypeId == 1 || this.session.event.eventTypeId == 2) {
      let eventCapacity = this.session.event.maxCapacity;
      let runningEventCapacity = 0;
      let capacityLeft = eventCapacity - this.session.event.totalSessionsCapacityCount + (this.addNewSessionRecord ? 0 : this.existingSessionCapacity);
      let currentRunningCapacity = this.session.event.totalSessionsCapacityCount + capacity;

      if (capacityLeft == 0) {
        this.messageService.add({ severity: "error", summary: "Error", detail: "There are 0 capacities left. Please increase the event capacity or adjust capacities of other session(s).", life: 3000 });
      }

      if (capacity < 0) {
        this.messageService.add({ severity: "error", summary: "Error", detail: "Capacity cannot be less than 0.", life: 3000 });
        this.sessionDetailForm.get('MaxCapacity').setValue(0);
      }

      if (capacity > eventCapacity) {
        this.messageService.add({ severity: "error", summary: "Error", detail: "Session capacity cannot exceed the event capacity.", life: 3000 });
        this.sessionDetailForm.get('MaxCapacity').setValue(capacityLeft);
        return;
      }

      // if (currentRunningCapacity > eventCapacity)
      // {
      //   this.messageService.add({ severity: "error", summary: "Error", detail: "Count of all session capacities cannot exceed the event capacity.", life: 3000 }); this.hasErrors = true;
      //   this.hasErrors = true;
      //   return;
      // }

      if (capacity > capacityLeft) {
        let message = "There are only " + capacityLeft.toString() + " capacities left";
        this.messageService.add({ severity: "error", summary: "Error", detail: message, life: 3000 });
        this.sessionDetailForm.get('MaxCapacity').setValue(capacityLeft);
      }
    }

    this.enableSave('MaxCapacity');
  }
}
