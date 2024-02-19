import { HttpClient, HttpParams } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { AppBreadcrumbService } from 'src/app/app.breadcrumb.service';
import { EventService } from 'src/app/services/event.service';
import { LoaderService } from 'src/app/services/loader.service';

@Component({
  selector: 'app-event-list',
  templateUrl: './event-list.component.html',
  styleUrls: ['./event-list.component.scss']
})
export class EventListComponent implements OnInit
{
  filterEventsList = [
    { code: 1, name: "Upcoming & Current" },
    { code: 2, name: "Past" },
    { code: 3, name: "Inactive" },
  ];
  showTable: boolean;
  showLoader: boolean=false;
  eventsList: any[];
  items: MenuItem[];
  addNewEventRecord: boolean;
  isViewSummary: boolean = false;
  eventId: number;
  selectedFilter:number;

  constructor(
    private router: Router,
    private http: HttpClient,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private eventService: EventService,   
    private loaderService: LoaderService,
    private breadcrumbService: AppBreadcrumbService,)
    {
      this.breadcrumbService.setItems([
        { label: 'Home', routerLink: ['/'] },
        {label: 'Events'}
      ]); 
    }

  ngOnInit(): void {
    this.getEventssList();
    this.items = [
        {
        label: 'Options',
        items: [{
          label: 'Edit Event',
          icon: 'pi pi-user-edit',
          command: () =>
          {
            this.editEvent();
          }
        },
        {
          label: 'Clone Event',
          icon: 'pi pi-copy',
          command: () =>
          {
            this.cloneEvent();
          }
        },
        {
          label: 'View Summary',
          icon: 'pi pi-info-circle',
          command: () =>
          {
            this.viewSummary();
          }
        },
        {
          label: 'Delete Event',
          icon: 'pi pi-trash',
          command: () =>
          {
            this.deleteEvent();
          }
        }

        ]
      }
    ];
  }  

  getEventssList() {
    // this.eventService.getAllEvents().subscribe((data: any[]) =>{
    //   console.log(data);
    //   this.eventsList = data;
    // });
    let searchParams = new HttpParams();
    searchParams = searchParams.append('filterDate', moment(new Date).utc(false).format());
    searchParams = searchParams.append('filter',  this.selectedFilter==undefined?1:this.selectedFilter);
    const opts = {params: searchParams};
     this.showLoader=true;
    this.eventService.getEventsByFilter(opts).subscribe((data: any[]) =>{
      console.log(data);
    this.eventsList = data;
  this.showLoader=false;
    });
  }

  addNewEvent(){
    this.router.navigate(['events/EventMain'], {
      state: { isNewRecord: true, eventId: 0 } 
    });
  }
  
  editEvent(){
    this.router.navigate(['events/EventMain/Edit'], {
      state: { isNewRecord: false, eventId: this.eventId } 
    });
  }

  cloneEvent(){
    this.confirmationService.confirm({
      message: 'Are you sure you want to clone this event?',
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () =>
      {
        let searchParams = new HttpParams();
        searchParams = searchParams.append('eventId',  this.eventId);
        const opts = {params: searchParams};
        this.eventService.cloneEvent(opts).subscribe((data: any[]) =>
        {
          console.log(data);
          this.messageService.add({ severity: 'success', summary: 'Success', detail: "Event cloned successfully.", life: 3000 });
          this.getEventssList();
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
    });
  }

  deleteEvent(){
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete this event ?',
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () =>
      {
        this.eventService.deleteEvent(this.eventId).subscribe((data: any[]) =>
        {
          console.log(data);
          this.messageService.add({ severity: 'success', summary: 'Success', detail: "Event deleted successfully.", life: 3000 });
          this.getEventssList();
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
    });
  }

  setActiveRow(event: any)
  {
    console.log('Selected User:' + JSON.stringify(event));
    this.eventId = event.eventId;
    // this.items[0].items[2].disabled = event.sessions.length == 0 ? true : false;
  }
  
  viewSummary()  {
    this.isViewSummary = true;
    this.addNewEventRecord = false;
  }

  getEventTypeName(eventTypeId: number)
  {
    return eventTypeId == 1 ? "In-Person" : eventTypeId == 2 ? "Virtual" : "Pre Recorded";
  }
  
  closeSummary()
  {  
    this.isViewSummary = false;
    this.getEventssList();
  }
  
  onEventFilterChange(event: any)
  {
    console.log(event);
    let searchParams = new HttpParams();
    searchParams = searchParams.append('filterDate', moment(new Date).utc(false).format());
    searchParams = searchParams.append('filter',  event.value);
    const opts = {params: searchParams};
    this.eventService.getEventsByFilter(opts).subscribe((data: any[]) =>{
      console.log(data);
      this.eventsList = data;
    });
  }
}
