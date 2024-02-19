import { HttpParams } from '@angular/common/http';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { EventSession } from 'src/app/models/event-session';
import { AuthService } from 'src/app/services/auth.service';
import { EntityService } from 'src/app/services/entity.service';
import { EventService } from 'src/app/services/event.service';

@Component({
  selector: 'app-eventreview',
  templateUrl: './eventreview.component.html',
  styleUrls: ['./eventreview.component.scss']
})
export class EventreviewComponent implements OnInit {
  @Output() activeTabEvent = new EventEmitter<number>();
  eventSession : EventSession;
  entity : any;
  showDetails : boolean = false;
  memberEmail : string;
  memberPhone : string; 
  disableBack : boolean = false;
  currentUser : any;
  isPerson : boolean;
  isCompany : boolean;

  constructor(private entityService: EntityService,private router: Router,
    private eventService: EventService,
    private messageService: MessageService,
    private authService: AuthService) { }

  ngOnInit(): void {
    this.eventSession = JSON.parse(localStorage.getItem('NewEventRegistrationSession'));
    this.getEntityById(this.eventSession.billableEntityId);
    this.currentUser = this.authService.currentUserValue;
  }

  getEntityById(entityId) {
		let searchParams = new HttpParams();
		searchParams = searchParams.append('entityId', entityId);
		const opts = { params: searchParams };
		this.entityService.getEntityProfileById(opts).subscribe((data: any) => {
			this.entity = data;
      if(this.entity.personId!=null && this.entity.person!=null)
      {
        this.isPerson = true;
        var primaryEmail =  this.entity.person.emails.filter(x => x.isPrimary);
        if(primaryEmail != undefined && primaryEmail != null && primaryEmail.length > 0)
        {
          this.memberEmail = primaryEmail[0].emailAddress;
        }
        this.memberPhone =  this.entity.person.formattedPhoneNumber;
      }
      else if(this.entity.companyId!=null && this.entity.company!=null)
      {
        this.isCompany = true;
        this.memberEmail = this.entity.company.email;
        this.memberPhone = this.entity.company.phone;
      }
      this.showDetails = true;
      setTimeout(() => this.bindSessionLeaders(), 1000);
		});
  }

 setActiveTab(value: number) {
  this.activeTabEvent.emit(value);
  console.log('Set Active Tab ->:' + value);
}

bindSessionLeaders()
  {    
    this.eventSession.selectedSession.forEach((session) =>
    {
      session.session.sessionLeaders.forEach((leader) =>
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

getEventTypeName(eventTypeId: number)
{
  return eventTypeId == 1 ? "In-Person" : eventTypeId == 2 ? "Virtual" : "Pre Recorded";
}

goToSearch(){
  this.router.navigate(['eventregistration/searchMember'], {
    queryParams: {  }
  });
}

save()
{
  this.eventSession.currentUserId = this.currentUser.id;
  this.eventService.createEventRegister(this.eventSession).subscribe((data: number) => {
    this.disableBack =true;
    this.eventSession.invoiceId = data;
    console.log(this.eventSession.invoiceId);
    const jsonData = JSON.stringify(this.eventSession);
    localStorage.setItem('NewEventRegistrationSession', jsonData);
    this.setActiveTab(4);
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

goBack(){
  this.setActiveTab(2);
}
}
