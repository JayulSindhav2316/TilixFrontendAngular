import { Component, EventEmitter, HostListener, Input, OnInit, Output } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { identifierName } from '@angular/compiler';
import { LookupService } from 'src/app/services/lookup.service';
import { GroupRegistrationService } from 'src/app/services/group-registration.service';
import { EventSettings } from 'src/app/models/event';
import { EventService } from 'src/app/services/event.service';
import { group } from 'console';
import * as moment from 'moment';
import { Router } from '@angular/router';
import { AppBreadcrumbService } from 'src/app/app.breadcrumb.service';

@Component({
  selector: 'app-event-settings',
  templateUrl: './event-settings.component.html',
  styleUrls: ['./event-settings.component.scss'],
  providers: [MessageService, ConfirmationService]
})
export class EventSettingsComponent implements OnInit {
  // @HostListener('window:beforeunload', ['$event'])
  // unloadHandler(event: Event) {
  //   alert('are you sure you want to leave this page?');
  // }
  
  @Input() eventId: number;
  @Input() addNewEventRecord: boolean;
  @Output() activeTabEvent = new EventEmitter<number>();
  @Output() tabValueChangedEvent = new EventEmitter<number>();
  @Input() futureIndex:number;
  
  sourceGroups: any[]=[];
  linkedGroups: any[] = [];
  changedSourceGroups: any[]=[];
  changedLinkedGroups: any[] = [];
  linkedGroupsParameter: any[]=[];
  currentDate: Date = new Date();
  allowMultipleRegistration: boolean = false;
  allowNonMember: boolean = false;
  allowWaitlist: boolean = false;
  eventTypeList: any[] = [];
  event: any;
  selectedFeeTypes: any[] = [];
  feeTypes: any[] = [];
  chkEnableOnlineRegistrationForAll: boolean;
  eventFromDate: Date = new Date();
  eventToDate: Date = new Date();
  formValueChanged: boolean = false;
  loadHTML: boolean = false;
  
  regStartDate: Date = new Date();
  regEndDate: Date = new Date();
  
  regGroupHeader: string = "";

  constructor(
    private http: HttpClient,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private lookUpService: LookupService,
    private registrationGroupService: GroupRegistrationService,
    private eventService: EventService,
    private router: Router,
    private breadcrumbService: AppBreadcrumbService,)
    {
      this.breadcrumbService.setItems([
        { label: 'Home', routerLink: ['/'] },
        {label: 'Events', routerLink: ['/events/events']},
        {label: 'Settings'}
      ]);    
    }

  ngOnInit()
  {    
      this.getRegistrationFeeTypes();
      this.getEventSettings();
      let setUpForm = JSON.parse(sessionStorage.getItem("SettingsForm"));
    // if (setUpForm)
    // {
    //   this.formValueChanged=true;
    //   this.updateEventSettings();
    //   // this.continue();
    // }    
  }
  ngAfterViewInit()
  {
    let setUpForm = JSON.parse(sessionStorage.getItem("SettingsForm"));
    if (setUpForm)
    {
      setTimeout(() => {
        var ele=document.getElementById("settingContinue");
        ele.click();
      }, 500);
    }    
  }
  
  compareNumbers(a, b) {
  return a - b;
  }
  
  onFeeSelect(feeType: any)
  {
    this.selectedFeeTypes = this.selectedFeeTypes.sort((a, b) => a.registrationFeeTypeId - b.registrationFeeTypeId);
    console.log(this.selectedFeeTypes);
    var feeAdded = this.selectedFeeTypes.find(x => x.registrationFeeTypeId == feeType.registrationFeeTypeId);
    if (feeAdded)
    {      
      this.sourceGroups.forEach((group) =>
      {
        this.selectedFeeTypes.forEach((fee) =>
        { 
          let feeFound = group.groupPriorityDateSettings.find(x => x.registrationFeeTypeId == fee.registrationFeeTypeId);
          if (!feeFound)
          {                 
            const feeSettings = {
              linkRegistrationGroupFee1: 0,
              registrationFeeTypeId: fee.registrationFeeTypeId,
              registrationGroupId: group.registrationGroupId,
              registrationGroupDateTime: this.regStartDate,
              registrationGroupEndDateTime: this.regEndDate,
              registrationFeeTypeName: fee.registrationFeeTypeName
            }
            group.groupPriorityDateSettings.push(feeSettings);
          } 
        });
      });
    }
    else
    {
      this.sourceGroups.forEach((group) =>
      {
        let feeIndex = group.groupPriorityDateSettings.findIndex(x => x.registrationFeeTypeId == feeType.registrationFeeTypeId);
        group.groupPriorityDateSettings.splice(feeIndex, 1);          
      });
    }
    this.enableSave();
  }
  
  isSelected(group: any) {
    return this.linkedGroups.includes(group);
  }
  
  onGroupSelect(group: any)
  {    
    console.log(this.sourceGroups);
    let isGroupSelected = this.linkedGroups.includes(group);
    if (isGroupSelected)
    {
      group.isGroupLinked = 1;
    }
    else
    {
      group.isGroupLinked = 0;
    }
    this.selectedFeeTypes.forEach((fee) =>
    {    
      let feeFound = group.groupPriorityDateSettings.find(x => x.registrationFeeTypeId == fee.registrationFeeTypeId);
      if (!feeFound)
      {
        const feeSettings = {
          linkRegistrationGroupFee1: 0,
          registrationFeeTypeId: fee.registrationFeeTypeId,
          registrationGroupId: group.registrationGroupId,
          registrationGroupDateTime: this.regStartDate,
          registrationGroupEndDateTime: this.regEndDate,
          registrationFeeTypeName: fee.registrationFeeTypeName
        }
        group.groupPriorityDateSettings.push(feeSettings);
      }
    });
    this.enableSave();
  }
  
  toggleStatus(event: any, group: any){
    console.log(this.sourceGroups);
    group.enableOnlineRegistration = event.checked ? 1 : 0;
    if (!event.checked)
    {
      this.chkEnableOnlineRegistrationForAll = false;
    }
    if (event.checked)
    {
      var isEnableOnlineRegistrationForAllLength = this.linkedGroups.filter(x => x.enableOnlineRegistration == 1).length;
      if (isEnableOnlineRegistrationForAllLength == this.linkedGroups.length)
      {
        this.chkEnableOnlineRegistrationForAll = true;
      }
    }
    this.enableSave();
  }
  
  enableOnlineRegistrationForAll(event: any)  { 
    console.log(event);
    if (event.checked)
    {
      this.linkedGroups.forEach((group) => {
        group.enableOnlineRegistration = 1;      
      });
    }
    else
    {
      this.linkedGroups.forEach((group) => {
        group.enableOnlineRegistration = 0;      
      });
    }   
    this.enableSave();
  }
  
   getRegistrationFeeTypes()  {
    this.lookUpService.getRegistrationFeeTypes().subscribe((data: any[]) =>
    {
      console.log(data);
      this.feeTypes = data;
      // this.getEventSettings();
      let settingsForm = JSON.parse(sessionStorage.getItem("SettingsForm"));
      if (settingsForm)
      {
        this.selectedFeeTypes = settingsForm.linkedFeeTypes;
      }
      else
      { 
        this.selectedFeeTypes = data.filter(x => x.registrationFeeTypeName == "Regular");
      }
    });
  }
    
  setActiveTab(value: number)
  {
    this.activeTabEvent.emit(value);
    console.log("Set Active Tab ->:" + value);
  }
  
  continue()
  {
    console.log(this.linkedGroups);
    this.updateEventSettings();
  }  
  
  enableMultipleRegistration(event: any)
  {
    this.allowMultipleRegistration = event.checked;
    this.enableSave();
  }
  
  enableWaitlist(event: any)
  {
    this.allowWaitlist = event.checked;
    this.enableSave();
  }
  
  getEventSettings()
  {
     let searchParams = new HttpParams();
    searchParams = searchParams.append('eventId',  this.eventId);
    const opts = {params: searchParams};
    this.eventService.getEventSettingsById(opts).subscribe((data: any[]) =>
    {
      console.log(data);
      this.event = data;
      this.eventFromDate = new Date(this.event.fromDate);
      this.eventToDate = new Date(this.event.toDate);

      if (this.event.regStartDate && this.event.regEndDate)
      {
        this.regStartDate = new Date(this.event.regStartDate);
        this.regEndDate = new Date(this.event.regEndDate);
      }
      
      console.log(this.sourceGroups);
      
      let settingsForm = JSON.parse(sessionStorage.getItem("SettingsForm"));
      if (settingsForm)
      { 
        this.formValueChanged = true;        
        this.selectedFeeTypes = settingsForm.linkedFeeTypes; 
        
        this.sourceGroups = settingsForm.sourceGroups;
        this.sourceGroups.forEach((group) =>
        {
          if (group.groupPriorityDateSettings.length > 0)
          {
            group.groupPriorityDateSettings = group.groupPriorityDateSettings.sort((a, b) => a.registrationFeeTypeId - b.registrationFeeTypeId);
            group.groupPriorityDateSettings.forEach((fee) =>
            {
              fee.registrationGroupDateTime = new Date(fee.registrationGroupDateTime);
              fee.registrationGroupEndDateTime = new Date(fee.registrationGroupEndDateTime);
            });
          }
        }); 
        
        this.linkedGroups = this.sourceGroups.filter(x => x.isGroupLinked == 1);  
        
        this.allowMultipleRegistration = settingsForm.allowMultipleRegistration;
        this.allowWaitlist = settingsForm.allowWaitlist;
        this.allowNonMember = settingsForm.allowNonMember;
      }
      else
      {
        this.sourceGroups = this.event.linkedGroups;
      
        // ngmodel throws error if date passed in string format. so have to convert the date type in angular as API returns date in string format.
        this.sourceGroups.forEach((group) =>
        {
          if (group.groupPriorityDateSettings.length > 0)
          {
            group.groupPriorityDateSettings.forEach((fee) =>
            {
              fee.registrationGroupDateTime = new Date(fee.registrationGroupDateTime);
              fee.registrationGroupEndDateTime = new Date(fee.registrationGroupEndDateTime);
            });
          }
        });
        
        this.linkedGroups = this.sourceGroups.filter(x => x.isGroupLinked == 1);   
        if (this.event.linkedFeeTypes.length > 0)
        {
          this.selectedFeeTypes = this.event.linkedFeeTypes;
        }
        else
        {        
          this.selectedFeeTypes = this.feeTypes.filter(x => x.registrationFeeTypeName == "Regular");
        }
        this.allowMultipleRegistration = this.event.allowMultipleRegistration == 1 ? true : false;
        this.allowWaitlist = this.event.allowWaitlist == 1 ? true : false;
        this.allowNonMember = this.event.allowNonMember == 1 ? true : false;        
        
      }
      this.loadHTML = true;
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
  
  updateEventSettings()
  {
    this.getFormData();
    var isOnlineRegistrationSelected = this.linkedGroups.find(x => x.enableOnlineRegistration == 1);
    if (this.linkedGroups.length == 0)
    {
      this.messageService.add({
        severity: "error",
        summary: "Error",
        detail: "You need to select atleast one registration group.",
        life: 3000,
      });
      return;
    }
    
    if (this.formValueChanged)
    {
      let body = this.getFormData();
      this.eventService.updateEventSettings(body).subscribe((data) =>
      {
        console.log(data);
        this.messageService.add({
          severity: "success",
          summary: "Success",
          detail: "Event settings updated successfully.",
          life: 3000,
        });
        sessionStorage.removeItem("SettingsForm");
        if(this.futureIndex!=undefined && this.futureIndex!=0)
        {
          this.setActiveTab(this.futureIndex); 
        }
        else
        {
        setTimeout(() => {
          if(this.futureIndex>=0)
          {
            this.setActiveTab(this.futureIndex); 
          }
          else
          {
          this.setActiveTab(3); 
        }
        }, 1000);
      }
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
    else
    {
      this.setActiveTab(3);
    }
      
  }
  
  getSelectedFeeTypeModel()
  {
    let linkedFeeTypes = [];
    this.selectedFeeTypes.forEach((fee) =>
    {
      const feeTypeBody = {
        eventId: this.eventId,
        registrationFeeTypeId: fee.registrationFeeTypeId
      }
      linkedFeeTypes.push(feeTypeBody);
    });
    return linkedFeeTypes;
  }
  
  getFormData() : any
  {
    this.linkedGroupsParameter = [];
    
    this.linkedGroups.forEach((group) =>
    {
      let priorityFeeSettings = [];
     
      if (group.groupPriorityDateSettings.length > 0)
      {
        group.groupPriorityDateSettings.forEach((fee) =>
        {
          const prioritySetting = {
            linkEventGroupId: fee.linkEventGroupId,
            linkRegistrationGroupFeeId: fee.linkRegistrationGroupFeeId,
            registrationFeeTypeId: fee.registrationFeeTypeId,
            registrationGroupDateTime: moment(fee.registrationGroupDateTime).utc(true).format(),
            registrationGroupEndDateTime: moment(fee.registrationGroupEndDateTime).utc(true).format(),
            registrationGroupId: fee.registrationGroupId
          }
          priorityFeeSettings.push(prioritySetting);
        });
      }
      
      const currentgroup = {
        enableOnlineRegistration: group.enableOnlineRegistration,
        eventId: group.eventId,
        groupName: group.groupName,
        isGroupLinked: group.isGroupLinked,
        linkEventGroupId: group.linkEventGroupId,
        registrationGroupId: group.registrationGroupId,
        groupPriorityDateSettings: priorityFeeSettings
      }
      
      this.linkedGroupsParameter.push(currentgroup);      
    });
    
    console.log(this.linkedGroupsParameter);
    
    const body = {
      eventId: this.eventId,
      allowNonMember: this.allowNonMember ? 1 : 0, 
      allowWaitlist: this.allowWaitlist ? 1 : 0, 
      allowMultipleRegistration: this.allowMultipleRegistration ? 1 : 0,      
      linkedFeeTypes: this.getSelectedFeeTypeModel(),      
      linkedGroups: this.linkedGroupsParameter
    }
    
    return body;
  }
  
  enableSave()
  {
    this.formValueChanged = true;
    this.tabValueChangedEvent.emit(2);
    // let formData = this.getFormData();
    const body = {
      eventId: this.eventId,
      allowNonMember: this.allowNonMember, 
      allowWaitlist: this.allowWaitlist, 
      allowMultipleRegistration: this.allowMultipleRegistration,      
      linkedFeeTypes: this.selectedFeeTypes,      
      linkedGroups: this.linkedGroups,
      sourceGroups: this.sourceGroups
    }
    sessionStorage.setItem("SettingsForm", JSON.stringify(body));
  }
  
  cancel()
  {
    if (this.formValueChanged)
    {      
      this.confirmationService.confirm({
        message: 'You have unsaved changes. Are you sure you want to exit?',
        header: 'Confirm',
        icon: 'pi pi-exclamation-triangle',
        accept: () =>
        {
          this.router.navigate(['events/events']);
          sessionStorage.removeItem("SettingsForm");
        }
      });
    }
    else
    {
      this.router.navigate(['events/events']);
      sessionStorage.removeItem("SettingsForm");
    }
  }
  goBack()
  {
    let questionSetUp = JSON.parse(sessionStorage.getItem("AllowQuestionSetUp"));
    let tabIndex = 0;
    if (questionSetUp == null || questionSetUp)
    {
      tabIndex = 1;
    }
    
    if (this.formValueChanged)
    {      
      this.confirmationService.confirm({
        message: 'You have unsaved changes. Are you sure you want to continue?',
        header: 'Confirm',
        icon: 'pi pi-exclamation-triangle',
        accept: () =>
        {
          sessionStorage.removeItem("SettingsForm");
          this.setActiveTab(tabIndex);
          this.formValueChanged = false;
        }
      });
    }
    else
    { 
      sessionStorage.removeItem("SettingsForm");      
      this.setActiveTab(tabIndex);
      this.formValueChanged = false;
    }
  }
}
