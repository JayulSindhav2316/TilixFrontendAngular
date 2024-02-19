import { HttpParams } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AppBreadcrumbService } from 'src/app/app.breadcrumb.service';
import { EventSession, selectedSessions } from 'src/app/models/event-session';
import { EntityService } from 'src/app/services/entity.service';

@Component({
  selector: 'app-createeventregistration',
  templateUrl: './createeventregistration.component.html',
  styleUrls: ['./createeventregistration.component.scss']
})
export class CreateeventregistrationComponent implements OnInit {
  entityId: number;
  profileLoaded: boolean;
  profileImage: any;
  primaryContact: any;
  age : number;
  showLoader: boolean;
  index: number = 0;
  isPerson : boolean;
  isCompany : boolean;

  disableEvents: boolean;
	disableSession: boolean;
	disableQuestions: boolean;
	disableReview: boolean;
	disableInvoice: boolean;

  eventSession : EventSession;

  constructor(private breadcrumbService: AppBreadcrumbService,
    private route: ActivatedRoute,
		private entityService: EntityService) {
      
      this.disableEvents = false;
      this.disableSession=true;
      this.disableQuestions =true;
      this.disableReview = true;
      this.disableInvoice = true;
      
      this.breadcrumbService.setItems([
			  { label: "Home" },
			  { label: "Event Registration" },
			  { label: "Create New Event Registration"}
			]);
    }

  ngOnInit(): void {
    this.profileLoaded = false;
    this.route.queryParams.subscribe(params => {
			this.entityId = params['entityId'];
		});
    this.eventSession = {billableEntityId: this.entityId, 
      entityId:this.entityId,
      currentTab: 0,
      eventId:0,
	  eventName:"",
	  eventTypeId:0,
	  selectedSession : [],
	  selectedQuestion:[],
	  invoiceId:0,currentUserId : 0	};
    const jsonData = JSON.stringify(this.eventSession);
    localStorage.setItem('NewEventRegistrationSession', jsonData);
    this.getProfileImage();
    this.getEntityById(this.entityId);
  }

  getProfileImage() {
		this.entityService.getProfileImage(this.entityId).subscribe(data => {
			if (data.size === 0) {
				this.profileImage = 'assets/layout/images/no-profile-pic.jpg';
				console.log(' no image data');
			}
			else {
				this.createImageFromBlob(data);
				console.log(data);
			}
		}, error => {
			console.log(error);
		});
	}

	createImageFromBlob(image: Blob) {
		let reader = new FileReader();
		reader.addEventListener('load', () => {
			this.profileImage = [reader.result];
		}, false);
		if (image) {
			reader.readAsDataURL(image);
		}
	}

  getEntityById(entityId) {
		console.log('Fetcing data for EntiyId:' + entityId);
		let searchParams = new HttpParams();
		searchParams = searchParams.append('entityId', entityId);
		const opts = { params: searchParams };
		this.entityService.getEntityProfileById(opts).subscribe((data: any) => {
			console.log(data);
			this.primaryContact = data;
			if(this.primaryContact.personId!=null || this.primaryContact.personId!=undefined)
			{
				this.isPerson = true;
			}
			else if(this.primaryContact.companyId!=null || this.primaryContact.companyId!=undefined)
			{
				this.isCompany = true;
			}
			this.showLoader = false;
			this.profileLoaded = true;
			this.CalculateAge();
		});
	}

  public CalculateAge(): void {
		console.log('DOB:' + this.primaryContact.dateOfBirth);
		if (this.primaryContact.dateOfBirth) {
			var timeDiff = Math.abs(Date.now() - new Date(this.primaryContact.dateOfBirth).getTime());
			this.age = Math.floor(timeDiff / (1000 * 3600 * 24) / 365.25);
			console.log('Age:' + this.age);
		}
	}

  setActiveTab(tabIndex: number) {
	  this.index = tabIndex;
	  console.log('-< Active Tab Set to:' + tabIndex);

	  this.disableEvents = false;

	  if(tabIndex == 1){
		this.disableSession = false;
	  }
	  if(tabIndex == 2){
		this.disableQuestions = false;
	  }
	  if(tabIndex == 3){
		this.disableReview = false;
		this.disableEvents = false;
		this.disableSession = false;
		this.disableQuestions = false;
		this.disableInvoice = true;
	  }
	  if(tabIndex == 4){
		this.disableInvoice = false;
		this.disableEvents = true;
		this.disableSession = true;
		this.disableQuestions = true;
		this.disableReview = true;
	  }
  }
}
