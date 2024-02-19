import { HttpParams } from '@angular/common/http';
import { Component, EventEmitter, Input, OnInit, Output, SecurityContext } from '@angular/core';
import { DomSanitizer, SafeHtml, SafeUrl } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { forkJoin } from 'rxjs';
import { AppBreadcrumbService } from 'src/app/app.breadcrumb.service';
import { SafePipe } from 'src/app/helpers/safepipe';
import { EntityService } from 'src/app/services/entity.service';
import { EventService } from 'src/app/services/event.service';
import { SessionService } from 'src/app/services/session.service';

@Component({
  selector: 'app-event-summary',
  templateUrl: './event-summary.component.html',
  styleUrls: ['./event-summary.component.scss'],
  providers: [SafePipe]
})
export class EventSummaryComponent implements OnInit{ 
  @Input() eventId: number;
  @Input() addEditWizard: boolean;
  @Input() isCallFromEventRegistration : boolean;
  @Output() activeTabEvent = new EventEmitter<number>();
  @Output() closeSummary = new EventEmitter<void>();
  @Output() Register = new EventEmitter<void>();
  
  event: any;
  eventImage: any;
  contactPersonEntity: any;
  sessionList: [] = [];
  items: MenuItem[];  
  expandAllTabs: boolean = false;
  linkedGroups: any[] = [];
  
  templateSafeHTML: SafeHtml;
  mySafeValue: SafeHtml;
  
  coverImageURL: SafeUrl;
  coverImage: any;
  
  constructor(
    private router: Router,
    private breadcrumbService: AppBreadcrumbService,
    private eventService: EventService,
    private messageService: MessageService,
    private entityService: EntityService,
    private sanitizer: DomSanitizer,
    private safePipe: SafePipe,
    private sessionService: SessionService,
    private confirmationService: ConfirmationService)
    {
      this.breadcrumbService.setItems([
        { label: 'Home', routerLink: ['/'] },
        { label: 'Events', routerLink: ['setup/EventMain'] },
        { label: 'Summary'}
      ]);    
    }

  ngOnInit(): void
  {
    this.getEvent();
  }
  
  getEvent()
  {
    let searchParams = new HttpParams();
    searchParams = searchParams.append('eventId',  this.eventId);
    const opts = {params: searchParams};
    this.eventService.getEventDetailsById(opts).subscribe((data: any[]) =>
    {
      console.log(data);
      this.event = data;
      this.eventImage = '\\assets\\lighting-bolt\\images\\empty-image.png';
      this.getEventImage();
      this.coverImage = '\\assets\\lighting-bolt\\images\\empty-image.png';
      this.getEventCoverImage();
      this.templateSafeHTML = this.safePipe.transform(this.event.description, 'html');
      // this.mySafeValue = this.sanitizer.sanitize(SecurityContext.HTML, this.templateSafeHTML);      
      this.linkedGroups = this.event.linkedGroups.filter(x => x.isGroupLinked === 1);
      setTimeout(() => this.bindSessionLeaders(), 3000);
      
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
  
  getEventImage()
  {
    if (this.event.eventImageId != null && this.event.eventImageId > 0)
    {
      this.eventService.getEventImage(this.eventId).subscribe((data: any) =>
      {
        console.log(data);
        let reader = new FileReader();
        reader.addEventListener('load', () => {
          this.eventImage = [reader.result];
        }, false);
        if (data) {
          reader.readAsDataURL(data);
        }
      });
    }
  }
  
  getEventCoverImage()
  {
    if (this.event.eventBannerImageId != null && this.event.eventBannerImageId > 0)
    {
      this.eventService.getEventCoverImage(this.eventId).subscribe((data: any) =>
      {
        console.log(data);
        this.coverImageURL = URL.createObjectURL(data);
        let reader = new FileReader();
        reader.addEventListener('load', () => {
          this.coverImage = [reader.result];
        }, false);
        if (data) {
          reader.readAsDataURL(data);
        }
      });
    }
  }
  
  getProfileImage(sessionId: number, entityId: number)
  {
    this.entityService.getProfileImage(entityId).subscribe((data: any) =>
    {
      console.log(data);
      let elementId = "imgLeader_" + sessionId.toString() + "_" + entityId.toString();
      let inputElement: HTMLImageElement = document.getElementById(elementId) as HTMLImageElement;
      let reader = new FileReader();
      reader.addEventListener('load', () => {
        inputElement.src = reader.result.toString();
      }, false);
      if (data) {
        reader.readAsDataURL(data);
      }
    });
  }
  
  goBack()
  {
    this.activeTabEvent.emit(3);
  }
  
  closeSummaryClick()
  {
    this.closeSummary.emit();
  }

  RegisterClick()
  {
    this.Register.emit();
  }
    
  clickExpandAll(event: boolean)
  {
    this.expandAllTabs = !event;
  }
  
  getSessionLeadersProfileImage()
  {
    let searchParams = new HttpParams();
    searchParams = searchParams.append('eventId',  this.event.eventId);
    const opts = {params: searchParams};
    this.sessionService.getSessionLeadersBySessionId(opts).subscribe((data: any) =>
    {       
      console.log(data);
      
        data.sessionLeaders.forEach((leader) =>
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
  
  bindSessionLeaders()
  {    
    this.event.sessions.forEach((session) =>
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
          this.closeSummaryClick();
          this.router.navigate(['events/events']);
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

}
