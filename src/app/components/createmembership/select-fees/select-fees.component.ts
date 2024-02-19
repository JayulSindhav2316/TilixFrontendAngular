import { Component, OnInit } from '@angular/core';
import { Output, EventEmitter } from '@angular/core';
import { CreateMembership } from 'src/app/models/create-membership';
import { ConfirmationService, MessageService } from 'primeng/api';
import { MembershipService } from '../../../services/membership.service';
import { HttpParams } from '@angular/common/http';
import { MembershipSession } from '../../../models/membership-session';
import { Router } from '@angular/router';

@Component({
  selector: 'app-select-fees',
  templateUrl: './select-fees.component.html',
  styleUrls: ['./select-fees.component.scss']
})
export class SelectFeesComponent implements OnInit {
  @Output() activeTabEvent = new EventEmitter<number>();
  membershipFees: any[];

  requiredFees: any[];
  optionalFees: any[];
  checked: boolean = true;
  showOptionalFee: boolean;

  selectedRequiredFees: any[]=[];
  selectedOptionalFees: any[]=[];
  membershipSession: MembershipSession;


  constructor( private messageService: MessageService,
		           private confirmationService: ConfirmationService,
               private membershipService:  MembershipService, 
               private router: Router) {
    
   }

  ngOnInit(): void {
    this.showOptionalFee=false;
    this.getMembershipFee();
  }

  setActiveTab(value: number) {
    this.activeTabEvent.emit(value);
    console.log('Set Active Tab ->:' + value);
  }

  getMembershipFee()
  {
      this.membershipSession  = JSON.parse(localStorage.getItem('NewMembershipSession'));
      let searchParams = new HttpParams();
      searchParams = searchParams.append('membershipTypeId', this.membershipSession.membershipTypeId.toString());
      const opts = { params: searchParams };
      console.log('Get Fee:' + JSON.stringify(opts));
      this.membershipService.getMembershipFeeByType(opts).subscribe((data: any) => {
      console.log(data);
      this.membershipFees = data;
      if(this.membershipFees.length > 0){
        this.requiredFees = this.membershipFees.filter(obj => obj.isMandatory === 1);
        this.optionalFees = this.membershipFees.filter(obj => obj.isMandatory === 0);
        console.log('Required Fee:' + JSON.stringify( this.requiredFees));
        console.log('Optional Fee:' + JSON.stringify( this.optionalFees));
        
        // Make required fee preselected
        this.selectedRequiredFees=this.requiredFees;

        if(this.optionalFees.length > 0){
          this.showOptionalFee=true;
        }
      }
      
      if(this.membershipSession.membershipFeeIds.length >0){
        this.selectedRequiredFees=[];
        this.membershipSession.membershipFeeIds.forEach(memfeeid => {
          this.optionalFees.forEach(optfee => {if (optfee.feeId == memfeeid)
              this.selectedOptionalFees.push(optfee);});
  
          this.requiredFees.forEach(requiredFee => {if (requiredFee.feeId == memfeeid)
                this.selectedRequiredFees.push(requiredFee);});
        });
      }
     
		});
  }
 
  selectMembershipFee(){
    this.membershipSession  = JSON.parse(localStorage.getItem('NewMembershipSession'));
    // Initialize Fee Ids
    this.membershipSession.membershipFeeIds = [];
    this.membershipSession.membershipFees = [];
    
    // Add All Selected Fees
    this.selectedRequiredFees.forEach(element => {
      this.membershipSession.membershipFeeIds.push(element.feeId);
    });
    
    this.selectedOptionalFees.forEach(element => {
      this.membershipSession.membershipFeeIds.push(element.feeId);
    });
    
    //check if atleast one fee has been selected

    if( this.selectedRequiredFees.length==0){
      this.messageService.add({
        severity: "warn",
        summary: "Warning",
        detail: "All Required fee must be selected to continue.",
        life: 3000,
      });
    }
    else if(this.membershipSession.membershipFeeIds.length==0){
      this.messageService.add({
        severity: "warn",
        summary: "Warning",
        detail: "Please select at least one fee to continue.",
        life: 3000,
      });
    }
    else {
      this.membershipSession.currentTab = 2; // Membership Fee Selected
      console.log('Current Session Info:' + JSON.stringify(this.membershipSession));
  
      localStorage.setItem('NewMembershipSession', JSON.stringify(this.membershipSession));
      this.setActiveTab(2);
    }
    
  }
  goBack(){
    this.setActiveTab(0);
  }

  goToSearch(){ 
    this.router.navigate(['membership/searchMember'], {
      queryParams: {  }
    });
  }
  

}
