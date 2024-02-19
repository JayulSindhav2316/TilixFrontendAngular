import { Component, OnInit } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ActivatedRoute } from '@angular/router';
import { PersonService } from '../../../services/person.service';
import { HttpParams } from '@angular/common/http';
import { MembershipSession } from '../../../models/membership-session';
import { AppBreadcrumbService } from "../../../app.breadcrumb.service";
import { EntityService } from '../../../services/entity.service';
@Component({
selector: 'app-createmembership',
templateUrl: './createmembership.component.html',
styleUrls: ['./createmembership.component.scss'],
styles: [`
       :host ::ng-deep .p-dialog {
            width: 150px;
            margin: 0 auto 2rem auto;
            display: block;
        }
        @media screen and (max-width: 960px) {
            :host ::ng-deep .p-datatable .p-datatable-tbody > tr > td:last-child {
                text-align: center;
            }
            :host ::ng-deep .p-datatable .p-datatable-tbody > tr > td:nth-child(6) {
                display: flex;
            }
        }
    `],
	providers: [MessageService, ConfirmationService]
})

export class CreatemembershipComponent implements OnInit {
	
	entityId: number;
	member: any;
	coMember: any

	age: number;
	coMemberAge: number;
	profileLoaded: boolean;
	showLoader: boolean;
	membershipStatus: string;
	index: number = 0;
	isAdditionalMember: boolean;
	closeSearchClose: boolean;
	closeSearchOpen: boolean;
	profileImage: any;
	primaryContact: any;
	membershipSession: MembershipSession;

	membershipList: any[];
	fees: any[];

	disableMembership: boolean;
	disableFee: boolean;
	disableAdditional: boolean;
	disableReview: boolean;
	disableInvoice: boolean;

	selectedMembershipsRequiredFees: Array<any> = [];
	selectedMembershipsOptionalFees: Array<any> = [];
	selectedMembershipsAllFees: Array<any> = [];
	selectedNonMandateFees: Array<any> = [];
	selectedMembershipNames: { name: string; code: number; }[];
	membertype: { name: string; code: number; }[];
	memberDetails: { firstName: string; lastName: string; age: number; gender: string; action: string }[];

	additionalMemberDetails: Array<any> = [];
	fullMembers: Array<any> = [];
	memberShipName: string;
	membershipPeriod: string;
	memberShipTotalFee: number = 0;
	additionalMembersControl: string;
	additionalMembersID: number;



	constructor(
		private breadcrumbService: AppBreadcrumbService,
		private route: ActivatedRoute,
		private messageService: MessageService,
		private confirmationService: ConfirmationService,
		private entityService: EntityService,
		private personService: PersonService) { this.additionalMembersControl = 'additionalMembersControl'; 
	
		this.disableMembership = false;
		this.disableFee = true;
		this.disableAdditional = true;
		this.disableReview = true;
		this.disableInvoice = true;

			this.breadcrumbService.setItems([
			  { label: "Home" },
			  { label: "Membership" },
			  { label: "Create New Membership"}
			]);

	}

	ngOnInit(): void {
		this.profileLoaded = false;
		this.showLoader = true;
		this.isAdditionalMember = false;
		this.closeSearchClose = false;
		this.closeSearchOpen = true;
		this.route.queryParams.subscribe(params => {
			this.entityId = params['entityId'];
		});
		this.membershipSession = {	billableEntityId: this.entityId, 
									entityId:this.entityId,
                  					primaryMemberEntityId: this.entityId,
									currentTab: 0,
									membershipId: 0,
									additionalMembers: [],
									membershipTypeId: 0,
									membershipFeeIds: [],
									membershipFees: []};

		const jsonData = JSON.stringify(this.membershipSession);
		localStorage.setItem('NewMembershipSession', jsonData);

		this.getProfileImage();
		this.getEntityById(this.entityId);
	}


	public CalculateAge(): void {
		// tslint:disable-next-line:indent
		console.log('DOB:' + this.primaryContact.dateOfBirth);
		if (this.primaryContact.dateOfBirth) {
			var timeDiff = Math.abs(Date.now() - new Date(this.primaryContact.dateOfBirth).getTime());
			this.age = Math.floor(timeDiff / (1000 * 3600 * 24) / 365.25);
			console.log('Age:' + this.age);
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
      if(data.companyId){
        this.membershipSession.isCompanyBillable = true;
      }
      else if(data.personId){
        this.membershipSession.isCompanyBillable = false;
      }
      localStorage.setItem("NewMembershipSession", JSON.stringify(this.membershipSession));
			this.showLoader = false;
			this.profileLoaded = true;
			this.CalculateAge();
		});
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
	
  setActiveTab(tabIndex: number) {
	  this.index = tabIndex;
	  console.log('-< Active Tab Set to:' + tabIndex);

	  this.disableMembership = false;

	  if(tabIndex == 1){
		this.disableFee = false;
	  }
	  if(tabIndex == 2){
		this.disableAdditional = false;
	  }
	  if(tabIndex == 3){
		this.disableReview = false;
		this.disableMembership = false;
		this.disableFee = false;
		this.disableAdditional = false;
		this.disableInvoice = true;
	  }
	  if(tabIndex == 4){
		this.disableInvoice = false;
		this.disableMembership = true;
		this.disableFee = true;
		this.disableAdditional = true;
		this.disableReview = true;
	  }
	
  }
}