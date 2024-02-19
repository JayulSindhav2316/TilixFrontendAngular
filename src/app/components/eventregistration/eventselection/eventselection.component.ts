import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { EventSession } from 'src/app/models/event-session';
import { EventService } from 'src/app/services/event.service';

@Component({
  selector: 'app-eventselection',
  templateUrl: './eventselection.component.html',
  styleUrls: ['./eventselection.component.scss']
})
export class EventselectionComponent implements OnInit {
  @Output() activeTabEvent = new EventEmitter<number>();
  selectedEvents: any;
  selectedEvent: any;
  events:any[];
  searchText: string;
  eventSession : EventSession;
  eventId : number = 0;
  openEventDetailsView : boolean;
  constructor(private eventService: EventService,private router: Router,
    private messageService: MessageService) { }

  ngOnInit(): void {
    this.searchEvents();
  }

  searchEvents()
  {
    this.eventService.getAllActiveEvents().subscribe((data: any[]) =>{
      this.events = this.sortData(data);
      this.events.forEach((e) => {
        e.eventType = this.getEventTypeName(e.eventTypeId);
      });
      console.log(this.events);
    });
  }

    sortData(data:any) {
    return data.sort((a, b) => {
      return <any>new Date(b.fromDate) - <any>new Date(a.fromDate);
    });
  }

  SelectEvent(event)
  {
    this.selectedEvents=[];
    console.log('Selected Membership:' + JSON.stringify(event));
    this.selectedEvents.push(event);
    this.selectedEvent = event;
  }

  selectEvent()
  {
    if(!this.selectedEvent && this.eventId == 0){
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Please select an event.', life: 3000 });
      return;
    }
    console.log('Selected events:' + JSON.stringify(this.selectEvent));
    this.eventSession = JSON.parse(localStorage.getItem('NewEventRegistrationSession'));
    if(this.selectedEvent)
    {
      this.eventSession.eventId = this.selectedEvent.eventId;
      this.eventSession.eventName = this.selectedEvent.name;
      this.eventSession.eventTypeId = this.selectedEvent.eventTypeId;
      this.eventSession.currentTab = 1;
    }
    else if(this.eventId != 0)
    {
      var event = this.events.filter(x => x.eventId == this.eventId)[0];
      this.eventSession.eventId = event.eventId;
      this.eventSession.eventName = event.name;
      this.eventSession.eventTypeId = event.eventTypeId;
      this.eventSession.currentTab = 1;
    }
    console.log('Current Session Info:' + JSON.stringify(this.eventSession));
    localStorage.setItem('NewEventRegistrationSession', JSON.stringify(this.eventSession));
    this.setActiveTab(1);
  }

  getEventTypeName(eventTypeId: number)
  {
    return eventTypeId == 1 ? "In-Person" : eventTypeId == 2 ? "Virtual" : "Pre Recorded";
  }

  goBack(){
    this.router.navigate(['eventregistration/searchMember'], {
      queryParams: {  }
    });
  }

  setActiveTab(value: number) {
    this.activeTabEvent.emit(value);
    console.log('Set Active Tab ->:' + value);
  }

  openEventDetails(evenId)
  {
    this.eventId = evenId;
    this.openEventDetailsView = true;
  }

  closeEventSummary()
  {
    this.eventId = 0;
    this.openEventDetailsView = false;
  }
}
