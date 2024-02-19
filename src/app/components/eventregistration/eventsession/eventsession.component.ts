import { HttpParams } from '@angular/common/http';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { event } from 'jquery';
import { MessageService } from 'primeng/api';
import { Session } from 'protractor';
import { EventSession, selectedSessions } from 'src/app/models/event-session';
import { EventService } from 'src/app/services/event.service';
import { SessionService } from 'src/app/services/session.service';

@Component({
  selector: 'app-eventsession',
  templateUrl: './eventsession.component.html',
  styleUrls: ['./eventsession.component.scss']
})
export class EventsessionComponent implements OnInit {
  @Output() activeTabEvent = new EventEmitter<number>();
  eventSession : EventSession;
  sessions : any;
  showTable : boolean;
  selectedSessions : any;
  sessionPricingAndGroup:any;
  eventTypeId : number;

  constructor(private eventService: EventService,private router: Router,
    private messageService: MessageService,
    private route: ActivatedRoute, private sessionService : SessionService) { }

  ngOnInit(): void {
    this.getEventDetails();
  }


  getEventDetails()
  {
    this.selectedSessions= [];
    let searchParams = new HttpParams();
    this.eventSession = JSON.parse(localStorage.getItem('NewEventRegistrationSession'));
    searchParams = searchParams.append('eventId',  this.eventSession.eventId);
    const opts = {params: searchParams};
    this.eventService.getEventDetailsById(opts).subscribe((data: any) =>
    {
      console.log(data);
      this.eventTypeId = data.eventTypeId;
      this.sessions = data.sessions;
      console.log(this.sessions);
      this.showTable = true;
      this.getSessionGroupAndPricing();
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

  setSessionPricingModel()
  {
      this.sessions.forEach((session) => {
       session.sessionGroupPriceModel = [];
       var sessionGroupPrice =  this.sessionPricingAndGroup.filter(s => s.sessionId == session.sessionId);
       if(sessionGroupPrice!=null && sessionGroupPrice.length > 0)
       {
          sessionGroupPrice.forEach((s) => {
            const sessionGroupPriceItem: any = {}
            sessionGroupPriceItem.sessionId = s.sessionId;
             sessionGroupPriceItem.groupPricing = s.groupPricing;
            sessionGroupPriceItem.groupName = s.groupName;
            sessionGroupPriceItem.pricing = s.pricing;
            sessionGroupPriceItem.sessionRegistrationGroupPricingId = s.sessionRegistrationGroupPricingId;
            sessionGroupPriceItem.selectedItem = s.selectedItem;
            if(sessionGroupPriceItem.selectedItem == null)
            {
              sessionGroupPriceItem.disabled = true;
            }
            else
            {
              sessionGroupPriceItem.disabled = false;
            }
            session.sessionGroupPriceModel.push(sessionGroupPriceItem);
            if(s.selectedItem!=null)
            {
              session.selectedRegistrationGroupPricingId = s.selectedItem;
              session.selectedRegistrationGroupPrice = s.pricing;
            }
          });
       }
      });
      console.log(this.sessions);
  }

  bindSessionLeaders(sessionId:number)
  {    
    var session = this.sessions.filter(x => x.sessionId == sessionId);
    session.forEach((session) =>
    {
      session.sessionLeaders.forEach((leader) =>
      {
        let elementId = "imgLeader_" + leader.sessionId.toString() + "_" + leader.entityId.toString();
        let inputElement: HTMLImageElement = document.getElementById(elementId) as HTMLImageElement;
        
        let imagefile = this.base64toBlob(leader.base64ProfileImageData, 'image/jpeg');
        let reader = new FileReader();
        reader.addEventListener('load', () => {
          inputElement.src = reader.result.toString();
        }, false);
        if (imagefile) {
          reader.readAsDataURL(imagefile);
        }
      });
    });
  }

  private base64toBlob(base64Data, contentType): Blob {
    contentType = contentType || '';
    const sliceSize = 1024;
    const byteCharacters = atob(base64Data);
    const bytesLength = byteCharacters.length;
    const slicesCount = Math.ceil(bytesLength / sliceSize);
    const byteArrays = new Array(slicesCount);

    for (let sliceIndex = 0; sliceIndex < slicesCount; ++sliceIndex) {
      const begin = sliceIndex * sliceSize;
      const end = Math.min(begin + sliceSize, bytesLength);

      const bytes = new Array(end - begin);
      for (let offset = begin, i = 0; offset < end; ++i, ++offset) {
        bytes[i] = byteCharacters[offset].charCodeAt(0);
      }
      byteArrays[sliceIndex] = new Uint8Array(bytes);
    }
    return new Blob(byteArrays, { type: contentType });
  }

 setActiveTab(value: number) {
    this.activeTabEvent.emit(value);
    console.log('Set Active Tab ->:' + value);
  }

  sessionLeaders(event:any)
  {
    setTimeout(() => this.bindSessionLeaders(event.data.sessionId), 500);
  }

  SelectSession(session)
  {
    if((session.maxCapacity - session.registeredSessions) > 0 || this.eventTypeId == 3)
    {
      var checkExist = this.selectedSessions.filter(x => x.sessionId == session.sessionId);
      if(checkExist == undefined || checkExist == null || checkExist.length == 0)
      {
        session.checked = true;
        this.selectedSessions.push(session);
      }
      else
      {
        session.checked = false;
        this.selectedSessions.splice(this.selectedSessions.findIndex(x => x == session), 1);
      }
    }
    else
    {
      session.checked = false;
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'You have already reached maximum capacity.', life: 3000 });
      return;
    }
  }

  selectSession()
  {
    if(this.selectedSessions.length == 0)
    {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Please select a session.', life: 3000 });
      return;
    }
    this.getRegisteredSessions();
  }

  getSessionGroupAndPricing()
  {
    let entityid : number;
    this.route.queryParams.subscribe(params => {
			entityid = params['entityId'];
		});
    this.eventSession = JSON.parse(localStorage.getItem('NewEventRegistrationSession'));
    let searchParams = new HttpParams();
    searchParams = searchParams.append('eventId', this.eventSession.eventId);
    searchParams = searchParams.append('entityId', entityid);
    const opts = {params: searchParams};
    this.sessionService.getEventRegistrationSessionGroupAndPricing(opts).subscribe((data: any[]) =>{
      console.log(data);
    this.sessionPricingAndGroup = data;
    this.setSessionPricingModel();
    });
  }

  goBack(){
    this.setActiveTab(0);
  }

  goToSearch(){ 
    this.router.navigate(['eventregistration/searchMember'], {
      queryParams: {  }
    });
  }

  getRegisteredSessions()
  {
    let entityid : number;
    var sessionNames : string;
    this.route.queryParams.subscribe(params => {
			entityid = params['entityId'];
		});
    let searchParams = new HttpParams();
    searchParams = searchParams.append('eventId', this.eventSession.eventId);
    searchParams = searchParams.append('entityId', entityid);
    let sessionIds : any = [];
    this.selectedSessions.forEach((session) => { 
        sessionIds.push(session.sessionId);
     });
    searchParams = searchParams.append('sessionIds', sessionIds.toString());
    const opts = {params: searchParams};
    this.sessionService.getRegisteredSessionsByEntity(opts).subscribe((data: any[]) =>{
      sessionNames = data.toString();
      if(sessionNames == undefined || sessionNames == "")
      {
        this.eventSession.selectedSession = [];
        this.selectedSessions.forEach((session) =>
        {
            const selectedSessionItem: any = {}
            selectedSessionItem.session = session;
            selectedSessionItem.sessionId = session.sessionId;
            selectedSessionItem.price = session.selectedRegistrationGroupPrice;
            this.eventSession.selectedSession.push(selectedSessionItem);
        });
        const jsonData = JSON.stringify(this.eventSession);
        localStorage.setItem('NewEventRegistrationSession', jsonData);
        this.setActiveTab(2);
      }
      else
      {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: sessionNames + ' session(s) are already registered', life: 3000 });
        return;
      }
    });
  }

  setSessionPricing(sessionId,event:any)
  {
      if(event.target.value < 0 || Number.isNaN(event.target.value) || event.target.value == "")
      {
        var session = this.sessions.filter(x => x.sessionId == sessionId);
        session[0].selectedRegistrationGroupPrice = 0;
      }
  }
}