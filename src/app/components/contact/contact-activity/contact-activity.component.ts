import { DatePipe } from '@angular/common';
import { HttpParams } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { faExpand } from '@fortawesome/free-solid-svg-icons';
import * as moment from 'moment';
import { faEdit, faPenAlt, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import { User } from 'src/app/models/user';
import { AuthService } from 'src/app/services/auth.service';
import { CompanyService } from 'src/app/services/company.service';
import { ContactActivityService } from 'src/app/services/contact-activity.service';
import { PersonService } from 'src/app/services/person.service';
import { ConfirmationService, MessageService } from 'primeng/api';

@Component({
  selector: 'app-contact-activity',
  templateUrl: './contact-activity.component.html',
  styleUrls: ['./contact-activity.component.scss']
})
export class ContactActivityComponent implements OnInit {
  @Input() entity: any;
  @Input() isPerson: boolean;
  @Input() isCompany: boolean;
  @Input() isRoleActivity: boolean;
  @Input() roleId: number;
  showAddActivityDialog: boolean;

  interactionTypes: any[] = [];
  searchableInteractionTypes: any[] = [];
  searchList: any[] = [];
  searchByDayForm: FormGroup;
  searchByDateRangeForm: FormGroup;
  selectedSearch: { name: string; code: string; };
  addActivityFormGroup: FormGroup;
  accountList: any = [];
  contactLists: any = [];
  currentUser: User;
  contactListDisabled: boolean = true;
  accountName: any;
  contactName: any;
  enabledAddButton: boolean = true;
  disabledSaveButton: boolean = false;
  addNewInteractionFields: boolean = false;
  addErrorMessages: any = {};
  formSubmitted: boolean = false;
  contactId: any;
  accountId: any;
  contactActivities: any[] = [];
  pagedActivities: any[] = [];
  totalRecords: number = 0;
  currentPage: number = 0;
  itemsPerPage: number = 5;
  maxDate: Date;
  minFromDate: Date;
  minToDate: Date;
  dateFilterSelected: boolean = false;
  interactionTypeFilterSelected: boolean = false;
  contactFilterSelected: boolean = false;
  monthStart: Date;
  monthEnd: Date;
  interactionTypeFilterValue: any;
  interactionContactFilterValue: any
  people: any[] = [];
  visiblePeople: any[] = [];
  expanded: boolean = false;
  menuItems: { label: string; items: { label: string; icon: string; command: () => void; }[]; }[];
  expandedRows: any = [];
  selectedContactActivity: any;
  addActivityBtnDisabled: boolean = false;
  noRecordsMessage: string = '';

  constructor(private formBuilder: FormBuilder,
    private authService: AuthService,
    private contactActivityService: ContactActivityService,
    private messageService: MessageService,
    private companyService: CompanyService,
    private personService: PersonService,
    private datePipe: DatePipe, private confirmationService: ConfirmationService) {

    this.interactionTypes = [
      { 'name': 'Phone', 'code': 0 },
      { 'name': 'In Person', 'code': 1 },
      { 'name': 'Email', 'code': 2 },
      { 'name': 'Other', 'code': 3 }];

    this.searchableInteractionTypes = [
      { 'name': 'Phone', 'code': 0 },
      { 'name': 'Role Change', 'code': 4 },
      { 'name': 'In Person', 'code': 1 },
      { 'name': 'Email', 'code': 2 },
      { 'name': 'Other', 'code': 3 }];

    this.searchList = [
      { name: "Day", code: "Day" },
      { name: "Date Range", code: "DateRange" }];

    this.initializePagination();
    this.initializeSearchForm();
    this.getAllPeopleList();
  }

  ngOnInit(): void {
    this.menuItems = [{
      label: 'Options',
      items: [{
        label: 'Edit Activity',
        icon: 'pi pi-times',
        command: () => {
        }
      },
      {
        label: 'Delete Activity',
        icon: 'pi pi-times',
        command: () => {
          this.deleteContactActivity();
        }
      },]
    }
    ];
    this.noRecordsMessage = 'No Activities';
    this.currentUser = this.authService.currentUserValue;
    if (this.entity.person?.company != null) {
      this.accountId = this.entity.person?.company?.companyId;
    }
    else if (this.entity.company != null) {
      this.accountId = this.entity.company.companyId;
    }
    this.contactId = this.entity.entityId;
    this.getCompanies();
    if (this.isPerson) {
      let person = this.entity.person;
      this.accountName = person.company.companyName;
      this.contactName = person.firstName + " " + person.lastName;
    }
    else {
      let company = this.entity.company;
      this.accountName = company.companyName;
      this.contactName = this.entity.name;
    }
    this.initializeForm();
    this.selectedSearch = { name: "Day", code: "Day" };

    if (!this.isRoleActivity) {
      this.getAllActivityByEntityId();
    }
    else {
      this.getAllRoleActivity();
    }
  }

  initializeSearchForm() {
    this.searchByDayForm = this.formBuilder.group({ Day: ["", [Validators.required]] });
    this.searchByDateRangeForm = this.formBuilder.group({ FromDate: ["", Validators.required], ToDate: ["", Validators.required] });
    this.setDateRangeFilters();
  }

  setDateRangeFilters() {
    let today = new Date();
    let month = today.getMonth();
    let year = today.getFullYear();
    let prevMonth = (month === 0) ? 11 : month - 1;
    let prevYear = (prevMonth === 11) ? year - 1 : year;
    let nextMonth = (month === 11) ? 0 : month + 1;
    let nextYear = (nextMonth === 0) ? year + 1 : year;
    let dateString = '2000-01-01T00:00:00'
    this.minFromDate = new Date(dateString);
    this.minFromDate.setMonth(1);
    this.minFromDate.setFullYear(2000);
    this.minToDate = this.minFromDate;
    this.maxDate = new Date();
    this.maxDate.setMonth(month);
    this.maxDate.setFullYear(year);

    this.monthStart = new Date(this.minFromDate.getFullYear(), this.minFromDate.getMonth(), 1);
    this.monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    this.searchByDayForm.get('Day').setValue(today);
    this.searchByDateRangeForm.get('FromDate').setValue(today);
    this.searchByDateRangeForm.get('ToDate').setValue(today);
  }

  initializeForm() {
    this.addActivityFormGroup = this.formBuilder.group({
      subject: ['', [Validators.required, this.noBlankValidator]],
      description: ['', [Validators.required, this.noBlankValidator]],
      accountId: this.accountId ?? 0,
      contactId: this.contactId ?? 0,
      interactionType: 0,
      activityDate: [new Date, Validators.required],
      activityConnection: ['0'],
      interactionTypeFields: this.formBuilder.array([]),
    })

    if (this.isRoleActivity) {
      this.enabledAddButton = true;
      this.addNewInteractionFields = true;
      this.interactionTypeFields.push(this.formBuilder.group(
        {
          interactionAccountId: ['', Validators.required],
          interactionContactId: ['', Validators.required]
        }));
      this.interactionTypeFields.controls[0].get('interactionAccountId').setValue(this.entity.company.companyId.toString());
      this.onAccountSelect(this.entity.company.companyId.toString(), 0);
    }
  }

  initializePagination() {
    this.totalRecords = 0;
    this.currentPage = 0;
    this.itemsPerPage = 5;
    this.pagedActivities = [];
  }
  addActivity() {
    this.enabledAddButton = true;
    this.showAddActivityDialog = true;
    this.formSubmitted = false;
    this.initializeForm();
  }

  getAllActivityByEntityId() {

    let searchParams = new HttpParams();
    searchParams = searchParams.append('id', this.entity.entityId);
    const opts = { params: searchParams };

    this.contactActivityService.getContactActivitiesByEntityId(opts).subscribe((res) => {
      this.contactActivities = [];
      if (res?.length > 0) {
        res.forEach((activity: any) => {
          activity.expandDescription = activity.description.replace(/\\n/g, '<br>');
          activity.description = activity.description.replace(/\\n/g, ' ');
          this.contactActivities.push(activity);
        });
      } else {
        this.noRecordsMessage = "No Activities.";
      }
      this.updatePagination();
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

  getAllRoleActivity() {

    let searchParams = new HttpParams();
    searchParams = searchParams.append('id', this.entity.entityId);
    searchParams = searchParams.append('roleId', this.roleId);
    const opts = { params: searchParams };

    this.contactActivityService.getRoleActivitiesByEntityId(opts).subscribe((res) => {
      this.contactActivities = [];
      if (res?.length > 0) {
        res.forEach((activity: any) => {
          activity.expandDescription = activity.description.replace(/\\n/g, '<br>');
          activity.description = activity.description.replace(/\\n/g, ' ');
          this.contactActivities.push(activity);
        });
      } else {
        this.noRecordsMessage = "No Activities.";
      }
      this.updatePagination();
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
  filterActivities() {
    let fromDate = null;
    let toDate = null;
    let interactionType = null;
    let interactionContact = null;
    if (this.dateFilterSelected) {
      if (this.selectedSearch.code == 'Day') {
        let from = this.searchByDayForm.value.Day;
        fromDate = this.datePipe.transform(from, 'MM/dd/yyyy');
      }
      else if (this.selectedSearch.code == 'DateRange') {
        let from = this.searchByDateRangeForm.value.FromDate;
        let to = this.searchByDateRangeForm.value.ToDate;
        fromDate = this.datePipe.transform(from, 'MM/dd/yyyy');
        toDate = this.datePipe.transform(to, 'MM/dd/yyyy');
        if (fromDate > toDate) {
          this.messageService.add({
            severity: "error",
            summary: "Error",
            detail: "Please select valid date range.",
            life: 3000,
          });
        }
        fromDate = this.datePipe.transform(from, 'MM/dd/yyyy');
        toDate = this.datePipe.transform(to, 'MM/dd/yyyy');
      }
    }
    else if (this.interactionTypeFilterSelected) {
      interactionType = this.interactionTypeFilterValue;
    }
    else if (this.contactFilterSelected) {
      interactionContact = this.interactionContactFilterValue;
    }
    if (interactionContact != null || interactionType != null || fromDate != null || toDate != null) {
      if (this.isRoleActivity == false) {
        this.getActivitiesBySearchCondtion(fromDate, toDate, interactionType, interactionContact);

      }
      else {
        this.getRoleActivitiesBySearchCondtion(fromDate, toDate, interactionType, interactionContact);
      }
    }

  }
  getActivitiesBySearchCondtion(fromDate?, toDate?, interactionType?, interactionContact?) {
    let searchParams = new HttpParams();
    searchParams = searchParams.append('entityId', this.entity.entityId);
    searchParams = searchParams.append('fromDate', fromDate);
    searchParams = searchParams.append('toDate', toDate);
    searchParams = searchParams.append('interactionType', interactionType);
    searchParams = searchParams.append('interactionEntityId', interactionContact);
    const opts = { params: searchParams };
    this.contactActivityService.getContactActivitiesBySearchCondition(opts).subscribe((result) => {
      this.contactActivities = [];
      if (result?.length > 0) {
        result.forEach((activity: any) => {
          activity.expandDescription = activity.description.replace(/\\n/g, '<br>');
          activity.description = activity.description.replace(/\\n/g, ' ');
          this.contactActivities.push(activity);
        });
      } else {
        this.noRecordsMessage = "No Activities Found.";
      }
      this.initializePagination();
      this.updatePagination();
    })
  }

  getRoleActivitiesBySearchCondtion(fromDate?, toDate?, interactionType?, interactionContact?) {
    let searchParams = new HttpParams();
    searchParams = searchParams.append('entityId', this.entity.entityId);
    searchParams = searchParams.append('fromDate', fromDate);
    searchParams = searchParams.append('toDate', toDate);
    searchParams = searchParams.append('interactionType', interactionType);
    searchParams = searchParams.append('interactionEntityId', interactionContact);
    searchParams = searchParams.append('roleId', this.roleId);
    const opts = { params: searchParams };
    this.contactActivityService.getRoleActivitiesBySearchCondition(opts).subscribe((result) => {
      this.contactActivities = [];
      if (result?.length > 0) {
        result.forEach((activity: any) => {
          activity.expandDescription = activity.description.replace(/\\n/g, '<br>');
          activity.description = activity.description.replace(/\\n/g, ' ');
          this.contactActivities.push(activity);
        });
      } else {
        this.noRecordsMessage = "No Activities Found.";
      }
      this.initializePagination();
      this.updatePagination();
    })
  }

  saveActivity() {
    this.formSubmitted = true;
    this.disabledSaveButton = true;
    if (this.addActivityFormGroup.invalid) {
      this.disabledSaveButton = false;
      return;
    }
    let formData = this.addActivityFormGroup.value;
    let interactionAccountItems = [];
    let interactionContactItems = [];
    interactionAccountItems.push(formData.accountId);
    interactionContactItems.push(formData.contactId);
    for (let i = 0; i < this.interactionTypeFields.length; i++) {
      let interactionContactId = this.interactionTypeFields.value[i].interactionContactId;
      let interactionAccountId = this.interactionTypeFields.value[i].interactionAccountId;
      interactionAccountItems.push(interactionAccountId);
      interactionContactItems.push(interactionContactId);
    }

    const body = {
      subject: formData.subject,
      description: formData.description.replace(/\n/g, '\\n').replace(/\r/g, '\\r'),
      accountId: formData.accountId,
      entityId: formData.contactId,
      interactionType: formData.interactionType,
      activityDate: formData.activityDate,
      staffUserId: this.currentUser.id,
      status: 1,
      activityConnection: formData.activityConnection,
      interactionAccountList: interactionAccountItems,
      interactionEntityList: interactionContactItems
    }
    this.contactActivityService.createContactActivity(body).subscribe((res) => {
      if (res) {
        this.messageService.add({
          severity: 'success',
          summary: 'Successful',
          detail: 'The contact activity has been added succesfully.',
          life: 3000
        });
        this.showAddActivityDialog = false;
        this.disabledSaveButton = false;
        if (!this.isRoleActivity) {
          this.getAllActivityByEntityId();
        }
        else {
          this.getAllRoleActivity();
        }
      }
    }, error => {
      console.log(error);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: error,
        life: 3000
      });
    }
    );
  }

  cancelAddActivityDialog() {
    this.showAddActivityDialog = false;
    this.addActivityFormGroup.reset();
  }

  get interactionTypeFields() {
    return this.addActivityFormGroup.get('interactionTypeFields') as FormArray;
  }

  addInteractionTypeFields() {
    this.enabledAddButton = false;
    this.addNewInteractionFields = true;
    this.interactionTypeFields.push(this.formBuilder.group(
      {
        interactionAccountId: ['', Validators.required],
        interactionContactId: ['', Validators.required]
      }));
  }

  removeInteractionTypeFields(i: number) {
    this.interactionTypeFields.removeAt(i);
    if (this.interactionTypeFields.length <= 0) {
      this.enabledAddButton = true;
    }
  }

  getCompanies() {
    this.companyService.getCompaniesList().subscribe((res) => {
      this.accountList = res;
    })
  }

  onAccountSelect(value: any, index: number,) {
    const field = this.interactionTypeFields.controls[index];
    const contactIdControl = field.get('interactionContactId');

    if (value) {
      contactIdControl.enable();
      this.contactLists[index] = [];
      this.getPersonByCompanyId(Number.parseInt(value), index)
    }
    else {
      contactIdControl.disable();
    }
  }

  getPersonByCompanyId(companyId, i: number) {
    let searchParams = new HttpParams();
    searchParams = searchParams.append('companyId', companyId);
    const opts = { params: searchParams };
    let entityId = this.entity.entityId.toString();
    this.personService.getPeopleByCompanyId(opts).subscribe((result) => {
      if (result.length > 0) {
        var data = result.filter(x => x.code !== entityId);
        this.contactLists[i] = data;
      }
    })
  }

  getAllPeopleList() {
    this.personService.getAllPeopleList().subscribe((result) => {
      this.people = result;
    })
  }

  editContactActivity() {

  }
  deleteContactActivity() {
    if (!this.selectedContactActivity) {
      return;
    }
    this.confirmationService.confirm({
      message: "Are you sure you want to Delete the activity " + this.selectedContactActivity?.subject + " ?",
      header: "Confirm",
      icon: "pi pi-exclamation-triangle",
      accept: () => {
        this.contactActivityService.deleteContactActivity(this.selectedContactActivity).subscribe((result) => {
          if (result) {
            this.messageService.add({
              severity: 'success',
              summary: 'Successful',
              detail: 'The contact activity has been deleted succesfully.',
              life: 3000
            });
            if (!this.isRoleActivity) {
              this.getAllActivityByEntityId();
            }
            else {
              this.getAllRoleActivity();
            }
          }
        })
      },
      reject: () => {
        this.confirmationService.close();
      }
    });
  }

  isContactListDisabled(i: number): boolean {
    let value = this.interactionTypeFields.controls[i].get('interactionAccountId').value;
    if (value === '' || value == null) {
      return true;
    }
    return false;
  }

  resetSubmitted(field) {
    this.formSubmitted = false;
    this.isFieldValid(field);
  }

  resetDropdownSubmitted(field, i) {
    this.formSubmitted = false;
    this.isDropdownFieldValid(field, i);
  }

  noBlankValidator(control: FormControl) {
    const isWhitespace = (control.value || '').trim().length === 0;
    const isValid = !isWhitespace;
    return isValid ? null : { 'required': true };
  }

  isFieldValid(field: string) {
    if (this.addActivityFormGroup.get(field)) {
      if (!this.addActivityFormGroup.get(field)?.valid &&
        this.formSubmitted &&
        this.addActivityFormGroup.get(field)?.hasError("required")
      ) {
        if (field == "subject") { field = "Subject" }
        if (field == "description") { field = "Description" }
        if (field == "activityDate") { field = "Activity Date" }
        this.addErrorMessages = {
          errorType: "required",
          controlName: field,
        };
        return true;
      }
    }
  }
  isDropdownFieldValid(field: string, i: number) {
    if (!this.interactionTypeFields.controls[i].get(field).valid
      && this.formSubmitted
      && this.interactionTypeFields.controls[i].get(field).hasError('required')) {
      if (field == "interactionAccountId") {
        field = "Interaction Account"
      }
      if (field == "interactionContactId") {
        field = "Interaction Contact"
      }
      this.addErrorMessages = {
        errorType: "dropdownrequired",
        controlName: field,
      };
      return true;

    }
  }

  errorIconCss(field: string, i?: number) {
    if (i == null) {
      return {
        "has-feedback": this.isFieldValid(field),
      };
    }
    else if (i != null) {
      return {
        "has-feedback": this.isDropdownFieldValid(field, i),
      };
    }
  }

  errorFieldCss(field: string, i?: number) {
    if (i == null) {
      return {
        "ng-dirty": this.isFieldValid(field),
      };
    }
    else if (i != null) {
      return {
        "ng-dirty": this.isDropdownFieldValid(field, i),
      };
    }
  }

  disableInteractionFieldAddButton(i: number): boolean {
    if (!this.interactionTypeFields.controls[i].get('interactionAccountId').value) {
      return true;
    }
    else if (!this.interactionTypeFields.controls[i].get('interactionContactId').value) {
      return true;
    }
    return false;
  }
  fromDateSelectEvent(date) {
    this.minToDate = new Date(date);
  }

  onPageChange(event: any) {
    this.currentPage = event.page;
    this.updatePagedActivities();
  }

  updatePagedActivities() {
    const startIndex = (this.currentPage) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.pagedActivities = this.contactActivities.slice(startIndex, endIndex);
  }

  updatePagination() {
    this.totalRecords = this.contactActivities.length ?? 0;
    this.updatePagedActivities();
  }


  dateFilterSelectEvent() {
    this.addActivityBtnDisabled = true;
    this.dateFilterSelected = true;
    this.interactionTypeFilterSelected = false;
    this.contactFilterSelected = false;
  }
  interactionFilterSelectEvent() {
    this.addActivityBtnDisabled = true;
    this.dateFilterSelected = false;
    this.interactionTypeFilterSelected = true;
    this.contactFilterSelected = false;
  }
  contactFilterSelectEvent() {
    this.addActivityBtnDisabled = true;
    this.dateFilterSelected = false;
    this.interactionTypeFilterSelected = false;
    this.contactFilterSelected = true;
  }
  resetSearch() {
    if (this.isRoleActivity == false) {
      this.getAllActivityByEntityId();
    }
    else {
      this.getAllRoleActivity();
    }
    // this.setDateRangeFilters();
    this.addActivityBtnDisabled = false;
    this.dateFilterSelected = false;
    this.interactionTypeFilterSelected = false;
    this.contactFilterSelected = false;
    this.interactionTypeFilterValue = null;
    this.interactionContactFilterValue = null;
  }

  setActiveRow(activity) {
    this.selectedContactActivity = activity;
  }

  expandButtonClick(activity) {
    const index = this.expandedRows.indexOf(activity);
    if (index === -1) {
      this.expandedRows.push(activity);
    } else {
      this.expandedRows.splice(index, 1);
    }
    this.expanded = true;
  }
}
