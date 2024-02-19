import { HttpParams } from '@angular/common/http';
import { Component, HostListener, OnInit } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { EventService } from 'src/app/services/event.service';
@Component({
  selector: 'app-event-main',
  templateUrl: './event-main.component.html',
  styleUrls: ['./event-main.component.scss']
})
export class EventMainComponent implements OnInit
{
  @HostListener('window:beforeunload', ['$event'])
    unloadHandler(event: Event) {
    return this.checkForChangesOnWindowClose();
  }
  
  addNewEventRecord: boolean = false;
  eventId: number = 0;
  index: number;
  event: any;
  loadHTML: boolean = false;
  futureTabIndex: number;
  previousTabIndex: number;
  hideAll: boolean = false;
  showConfirmDialog: boolean = false;
  
  disableEventsTab: boolean = false;
  disableQuestionsTab: boolean = false;
  disableSettingsTab: boolean = false;
  disableSessionsTab: boolean = false;
  disableSummarysTab: boolean = false;
  
  indexOfTabValueChanged: number = -1;

  constructor(private eventService: EventService,
    private messageService: MessageService,    
    private confirmationService: ConfirmationService) { }

  ngOnInit(): void
  {
    this.setActiveTab(0);
    this.addNewEventRecord = history.state.isNewRecord;
    this.eventId = this.addNewEventRecord ? 0 : history.state.eventId;
    if (this.eventId > 0)
    {
      this.getEventDetails();      
    }
  }
  
  setActiveTab(tabIndex: number) {
	  this.index = tabIndex;
    console.log('-< Active Tab Set to:' + tabIndex);
    
    if (tabIndex == 0)
    {
      this.disableEventsTab = false;
      this.disableQuestionsTab = true;
      this.disableSettingsTab = true;
      this.disableSessionsTab = true;
      this.disableSummarysTab = true;
    }
    else if (tabIndex == 1)
    {
      this.disableEventsTab = true;
      this.disableQuestionsTab = false;
      this.disableSettingsTab = true;
      this.disableSessionsTab = true;
      this.disableSummarysTab = true;
    }
    else if (tabIndex == 2)
    {
      this.disableEventsTab = true;
      this.disableQuestionsTab = true;
      this.disableSettingsTab = false;
      this.disableSessionsTab = true;
      this.disableSummarysTab = true;
    }
    else if (tabIndex == 3)
    {
      this.disableEventsTab = true;
      this.disableQuestionsTab = true;
      this.disableSettingsTab = true;
      this.disableSessionsTab = false;
      this.disableSummarysTab = true;
    }
    else if (tabIndex == 4)
    {
      this.disableEventsTab = true;
      this.disableQuestionsTab = true;
      this.disableSettingsTab = true;
      this.disableSessionsTab = true;
      this.disableSummarysTab = false;
    }
  }
  
  setActiveEventId(eventId: number)
  {
    if (eventId > 0)
    {
      console.log("entered main component" + eventId.toString());
      this.eventId = eventId;
      this.getEventDetails();      
    }
  }
  
  getEventDetails()
  {
    let searchParams = new HttpParams();
    searchParams = searchParams.append('eventId',  this.eventId);
    const opts = {params: searchParams};
    this.eventService.getEventBasicDetailsById(opts).subscribe((data: any[]) =>
    {
      console.log(data);
      this.event = data;
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
  
  handleTabChange(event: any)
  {
    let setUpForm = JSON.parse(sessionStorage.getItem("SetUpForm"));
    let eventQuestions = JSON.parse(sessionStorage.getItem("EventQuestions"));
    let settingsForm = JSON.parse(sessionStorage.getItem("SettingsForm"));
    let sessionsForm = JSON.parse(sessionStorage.getItem("SessionsForm"));
      
    if (setUpForm || eventQuestions || settingsForm || sessionsForm)
    {
      this.showConfirmDialog = true;
      //this.hideAll = true;
      this.futureTabIndex = event.index;
    }
  }
  
  accept()
  {
    this.showConfirmDialog = false;
    //this.hideAll = false;
    this.index = this.indexOfTabValueChanged; //this.futureTabIndex;
    // this.futureTabIndex=this.index
    //this.indexOfTabValueChanged = -1;
    // sessionStorage.removeItem("SetUpForm");
    // sessionStorage.removeItem("EventQuestions");
    // sessionStorage.removeItem("SettingsForm");    
    // sessionStorage.removeItem("SessionsForm");
  }
  
  reject()
  {
    this.showConfirmDialog = false;
    this.hideAll = false;
    this.index = this.futureTabIndex; //this.indexOfTabValueChanged;
    sessionStorage.removeItem("SetUpForm");
    sessionStorage.removeItem("EventQuestions");
     sessionStorage.removeItem("SettingsForm");    
     sessionStorage.removeItem("SessionsForm");
    // this.showConfirmDialog = false;
    // this.hideAll = false;
    // this.index = this.indexOfTabValueChanged;
  }
  
  tabValueChanged(indexOfTabValueChanged: number)
  {
    this.indexOfTabValueChanged = indexOfTabValueChanged;
  }
  
  checkForChangesOnWindowClose() : boolean
  {
    let setUpForm = JSON.parse(sessionStorage.getItem("SetUpForm"));
    let eventQuestions = JSON.parse(sessionStorage.getItem("EventQuestions"));
    let settingsForm = JSON.parse(sessionStorage.getItem("SettingsForm"));
    let sessionsForm = JSON.parse(sessionStorage.getItem("SessionsForm"));
      
    if (setUpForm || eventQuestions || settingsForm || sessionsForm)
    {
      return false;
    }
    return true;
  }
  
  
}
