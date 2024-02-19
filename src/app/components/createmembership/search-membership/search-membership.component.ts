import { Component, OnInit } from '@angular/core';
import { CreateMembership } from 'src/app/models/create-membership';
import { Router } from '@angular/router';
import { Output, EventEmitter } from '@angular/core';
import { PersonService } from '../../../services/person.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { MembershipService } from '../../../services/membership.service';
import { HttpParams } from '@angular/common/http';
import { MembershipSession } from '../../../models/membership-session';
@Component({
  selector: 'app-search-membership',
  templateUrl: './search-membership.component.html',
  styleUrls: ['./search-membership.component.scss']
})
export class SearchMembershipComponent implements OnInit {

@Output() activeTabEvent = new EventEmitter<number>();
 membershipCategory: { name: string; code: string; }[];
 membershipTypes: any[];
 selectedMembershipCategory: any[];
 selectedMembershipType: any;
 selectedMembership: any;
 showTable: boolean;
 showLoader: boolean;
 cols: any[];
 membershipSession: MembershipSession;
 
  constructor( 
    private router: Router,
    private messageService: MessageService,
		private confirmationService: ConfirmationService,
		private personService:  PersonService,
    private membershipService:  MembershipService) {
    
  }

  ngOnInit(): void {
    this.getMembershipCategories();
    this.showTable=false;
    this.showLoader=false;
  }

 getMembershipCategories()
 {
 
  console.log('Fetcing data for membership category:');
  
  this.membershipService.getMembershipCategoryList().subscribe((data: any) =>
  {
    console.log(data);
    this.membershipCategory = data;
   
  });

 }

  selectMembership(){
    if(!this.selectedMembershipType){
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Please select a membership type.', life: 3000 });
    }
    console.log('Selected Memberships:' + JSON.stringify(this.selectedMembership));

    //Add it to localstoreage

    this.membershipSession = JSON.parse(localStorage.getItem('NewMembershipSession'));
    this.membershipSession.membershipTypeId = this.selectedMembership.membershipTypeId;
    this.membershipSession.currentTab = 1; // Membership Type Selected

    console.log('Current Session Info:' + JSON.stringify(this.membershipSession));
    this.membershipSession.membershipFeeIds = [];
    this.membershipSession.additionalMembers = [];
    this.membershipSession.startDate ="";
    this.membershipSession.endDate ="";
    this.membershipSession.maxUnits = this.selectedMembership.units;
    localStorage.setItem('NewMembershipSession', JSON.stringify(this.membershipSession));
    this.setActiveTab(1);
  }

  serachMemberships() {
    console.log('selected memberships catgeories;' + this.selectedMembershipCategory);
    this.showTable=false;
    this.showLoader=true;

		  let searchParams = new HttpParams();
		  searchParams = searchParams.append('selectedCategories', this.selectedMembershipCategory.toString());
		  const opts = { params: searchParams };
	  	this.membershipService.getMembershipTypeByCategories(opts).subscribe((data: any) => {
			console.log(data);
			this.membershipTypes = data;
      this.showTable=true;
      this.showLoader=false;
		});
  }
  goBack(){
    this.router.navigate(['membership/searchMember'], {
      queryParams: {  }
    });
  }
  setActiveTab(value: number) {
    this.activeTabEvent.emit(value);
    console.log('Set Active Tab ->:' + value);
  }
  SelectMembership(membershipType){
    this.selectedMembershipType=[];
    console.log('Selected Membership:' + JSON.stringify(membershipType));
    this.selectedMembershipType.push(membershipType);
    this.selectedMembership=membershipType;
  }
}
