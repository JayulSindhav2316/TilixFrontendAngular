import { Component, OnInit, Input } from "@angular/core";
import { ConfirmationService, MessageService } from "primeng/api";
import { AppBreadcrumbService } from "../../../app.breadcrumb.service";
import { Router } from "@angular/router";
import { ActivatedRoute } from "@angular/router";
import { PersonService } from "../../../services/person.service";
import { HttpParams } from "@angular/common/http";
import { MembershipSession } from "../../../models/membership-session";
import { Output, EventEmitter } from "@angular/core";
import { EntityService } from '../../../services/entity.service';
import * as moment from "moment";
@Component({
  selector: "app-add-member",
  templateUrl: "./add-member.component.html",
  styleUrls: ["./add-member.component.scss"],
})
export class AddMemberComponent implements OnInit {
  @Output() activeTabEvent = new EventEmitter<number>();
  checked: boolean;
  showAdditionalMemberTable: boolean;
  showSearchControl: boolean;
  members: { entityId: string; name: string;  age: string; gender: string; isBillable: boolean }[] = [];
  addedMemberIds:any[]=[];
  closeSearchClose: boolean;
  closeSearchOpen: boolean;
  membershipSession: MembershipSession;
  public cols: any[];
  nonBillable = false;
  billableEntityId: any;
  isDuplicateMember: false;
  mainMemberId: number;
  removedCoMember: number;
  addAdditionalMembers: boolean;
  maxUnits: number;
  relations: any[];
  hasRelations:boolean = false;
  isRelatedContact: boolean = false;
  slotLeft: number;

  constructor(
    private breadcrumbService: AppBreadcrumbService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private router: Router,
    private route: ActivatedRoute,
    private entityService: EntityService,
    private personService: PersonService
  ) {

    this.addAdditionalMembers = false;
  }

  ngOnInit(): void {
    this.checked = true;
    this.showAdditionalMemberTable = false;
    this.showSearchControl = false;
    this.membershipSession = JSON.parse(localStorage.getItem("NewMembershipSession"));
    this.maxUnits = this.membershipSession.maxUnits;
    this.billableEntityId = this.membershipSession.billableEntityId;
    if (this.membershipSession.currentTab >= 1) {
      this.getMembers();
      this.getRelationsByEntityId();
    }
    if(this.membershipSession.maxUnits > 1){
      this.addAdditionalMembers = true;
    }
  }

  addMember(event) {
    console.log("Billable Member:" + JSON.stringify(this.membershipSession.billableEntityId));
    this.showSearchControl = true;
  }

  addAdditionalMember(event) {
    this.showSearchControl = false;
    console.log("Serach control sent Event for :" + event.additionalEntityId);
    if (event.isDuplicatePerson) {
      console.log("Duplicate found.");
      this.messageService.add({
        severity: "warn",
        summary: "Warning",
        detail: "You cannot add a person multiple times in same membership.",
        life: 3000,
      });
    }
    this.getMembers();
    this.getRelationsByEntityId();
  }

  getMembers() {
    this.membershipSession = JSON.parse(localStorage.getItem("NewMembershipSession"));
    this.route.queryParams.subscribe(params => {this.mainMemberId = params['entityId'];});
    let members = [];
    members.push(this.mainMemberId);

    if (this.membershipSession.additionalMembers.length > 0) 
        members.push(this.membershipSession.additionalMembers);

    console.log("Fetcing data for Persons:" + members.toString());

    let searchParams = new HttpParams();
    searchParams = searchParams.append("entityIds", members.toString());
    
    const opts = { params: searchParams };
  
    this.entityService.getEntitiesByIds(opts).subscribe((data: any) => {
      this.members = [];
      this.addedMemberIds=[];
      console.log(data);
      data.forEach((element) => {
        let isBillable = false;
        console.log("EntityId:" + element.entityId + " Billable:" + this.billableEntityId);
        if (parseInt(element.entityId) === parseInt(this.billableEntityId)) 
          {console.log("EntityId:" + element.entityId + " Billable:" + this.billableEntityId + " is set to true");
         
        }
        if (this.members.findIndex((item) => parseInt(item.entityId) === parseInt(element.entityId)) < 0 ) {
          let item = {
            entityId: element.entityId,
            name: element.name,
            gender: element.gender,
            age: element.age,
            isBillable: isBillable
          };
          this.addedMemberIds.push(element.entityId);
          this.members.push(item);
          console.log("Members added" + JSON.stringify(this.members));
          console.log("Members length" + this.members.length);
        } else {
          console.log("Duplicate found.");
          this.messageService.add({
            severity: "warn",
            summary: "Warning",
            detail: "You cannot add a person multiple times in same membership.",
            life: 3000,
          });
        }
      });
      localStorage.setItem("NewMembershipSession", JSON.stringify(this.membershipSession));
      this.slotLeft = this.maxUnits - this.members.length;
      if(this.members.length >= this.maxUnits){
        this.addAdditionalMembers=false;
      } 
      else {
        this.addAdditionalMembers=true;
      }

      this.isRelatedContact = false;
    });
   
  }

  removeMember(contact) {
    console.log("Remove contact:"+ JSON.stringify(contact));
    this.membershipSession = JSON.parse(localStorage.getItem("NewMembershipSession"));
    this.membershipSession.additionalMembers.forEach((element) => {
        console.log("Elementt:"+ JSON.stringify(element));
        if (element === parseInt(contact.entityId)) 
                this.membershipSession.additionalMembers = this.membershipSession.additionalMembers.filter(item=>item!=parseInt(contact.entityId));
      });
    localStorage.setItem("NewMembershipSession", JSON.stringify(this.membershipSession));
    this.getMembers();
    this.getRelationsByEntityId();
  }

  setActiveTab(value: number) {
    this.activeTabEvent.emit(value);
    console.log("Set Active Tab ->:" + value);
  }
  goBack() {
    this.setActiveTab(1);
  }
  goToNext() {
    this.setActiveTab(3);
  }
  goToSearch(){  
    this.router.navigate(['/membership/searchMember'], {
      queryParams: {  }
    });
  }

  getRelationsByEntityId(){    
    let searchParams = new HttpParams();
    searchParams = searchParams.append('entityId',  this.billableEntityId);
    const opts = {params: searchParams};
    this.entityService.getRelationsByEntityId(opts).subscribe((data: any[]) =>
    {
      console.log(data);
      this.relations = data.filter(x => x.relationshipType != "Company");
      if (this.relations.length > 0) {
        this.hasRelations= true;
        this.membershipSession = JSON.parse(localStorage.getItem("NewMembershipSession"));
        if(this.membershipSession.additionalMembers.length > 0){
          this.membershipSession.additionalMembers.forEach((entityId) => {
            this.relations = this.relations.filter(item => entityId != parseInt(item.relatedEntityId));
            this.hasRelations= this.relations.length > 0 ? true : false;
          });
        }       
      }      
    });
  }

  addRelationalContact(member: any){
    if(this.addAdditionalMembers){
      this.membershipSession = JSON.parse(localStorage.getItem("NewMembershipSession"));
      let relatedConactAlreadyAdded = this.membershipSession.additionalMembers.includes(member.relatedEntityId);
      if(!relatedConactAlreadyAdded){
        this.membershipSession.additionalMembers.push(member.relatedEntityId);
      }
      localStorage.setItem("NewMembershipSession", JSON.stringify(this.membershipSession));
      this.getMembers();
      this.getRelationsByEntityId();
    }
    else{
      this.messageService.add({
        severity: "warn",
        summary: "Warning",
        detail: "Cannot add more person to this membership as the max limit has reached.",
        life: 3000,
      });
    }
    
  }

  calculateAge(dateOfBirth: any){
    
    let years = moment().diff(moment(dateOfBirth), 'year');
    let months = moment().diff(moment(dateOfBirth), 'month');
    console.log(months);
    
    return years;
  }
}
