import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { AppBreadcrumbService } from 'src/app/app.breadcrumb.service';
import { GroupService } from 'src/app/services/group.service';

@Component({
  selector: 'app-manage-group-members',
  templateUrl: './manage-group-members.component.html',
  styleUrls: ['./manage-group-members.component.scss'],
  providers: [MessageService, ConfirmationService]
})
export class ManageGroupMembersComponent implements OnInit {
  items: MenuItem[];
  groupMembersList: any[]=[];
  contact: any;
  openSearch: boolean = false;
  group: any;
  groupMemberDialog: boolean = false;
  groupMemberForm: FormGroup;
  headerName: string;
  roleList: any[]=[];
  minDate = new Date();
  minEndDate = new Date();
  startDate = new Date();
  endDate= new Date();
  addNewMemberRecord: boolean;
  selectedGroupMember: any;
  addErrorMessages : any = {};
  submitted : boolean = false;
  statusToggleButtonClass: boolean = true;
  @ViewChild('tb') span:ElementRef;
  enableTerm: boolean = false;
  loadHtml: boolean = true;

  constructor(
    private formBuilder: FormBuilder,
    private breadcrumbService: AppBreadcrumbService,
    private groupService: GroupService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private router: Router) { 
    this.breadcrumbService.setItems([
      {label: 'Home', routerLink: ['/']},
      {label: 'Boards & Groups', routerLink: ['manage/groups']},
      {label: 'Manage Members'}
    ]);
  }

  ngOnInit(): void {
    if(history.state.group){
      this.group = history.state.group;    
      this.getGroupMembersList();
      this.setMenuItems();
      this.initializeForm();
      this.getRoleList();
      this.loadHtml = true;
      this.getStartDate();
      this.getEndDate();
    }
    else{
      this.router.navigate(['manage/groups']);
      this.initializeForm();
      this.loadHtml = false;
    }    
  }

  initializeForm(){
    this.groupMemberForm = this.formBuilder.group({
      GroupMemberId: [0],
      MemberName: [''],
      Role:['', [Validators.required]],
      StartDate: [this.startDate],
      EndDate: [this.endDate],
      Status: [true],
      Term:[false]
    });
  }

  getGroupMembersList(){
    this.groupService.getAllGroupMembersByGroupId(this.group.groupId).subscribe((data: any[]) =>{
      console.log(data);
      this.groupMembersList = data;
    });
  }

  setMenuItems(){
    this.items = [{
      label: 'Options',
      items: [{
        label: 'Edit Member',
        icon: 'pi pi-user-edit',
        command: () =>
        {
          this.editMemberRecord();
        }
      },
      {
        label: 'Remove Member',
        icon: 'pi pi-trash',
        command: () =>
        {
          this.deleteMemberRecord();
        }
      }
      ]
    }];
  }

  addMemberToGroup(contact: any){
    if(this.groupMembersList.length >= parseInt(this.group.preferredNumbers)){
      this.messageService.add({ severity: 'warn', summary: 'Warning', detail: 'Group limit reached.', life: 3000 });
    }
    this.contact = contact;
    console.log("Manage Group page:" + JSON.stringify(contact));
    this.openSearch = false;    
    this.groupMemberDialog = true;
    this.headerName = "Add member";
    this.initializeForm();
    this.addNewMemberRecord = true;
    this.groupMemberForm.get('MemberName').setValue(this.contact.name);
    this.getMemberRoleCode();
  }

  openSearchFunction(){
    this.openSearch = !this.openSearch;
  }

  hideDialog(){
    this.groupMemberDialog = false;
    this.enableTerm = false;
  }

   getRoleList(){
    this.groupService.GetRolesSelectListByGroupId(this.group.groupId).subscribe((data: any[]) =>{
      console.log(data);
      this.roleList = data;
    });
  }

  setMinEndDate(event:any){
    this.minEndDate = event;
    let date = new Date(event);
    let year = date.getFullYear();
    let days = 365;
    if((year % 4 == 0 && year % 100 != 0) || (year % 400 == 0)){
      days = 365;
    }
    else{
      days = 364;
    }
    date.setDate(date.getDate() + days);
    this.groupMemberForm.get('EndDate').setValue(date);
  }

  saveGroupMember(){
    this.submitted = true;
    if(this.groupMemberForm.valid){
      const body = {
        groupMemberId : this.addNewMemberRecord ? 0 : this.selectedGroupMember.groupMemberId,
        personId : this.addNewMemberRecord ? this.contact.personId : this.selectedGroupMember.personId,
        entityId: this.addNewMemberRecord ? this.contact.entityId  : this.selectedGroupMember.entityId,
        groupId: this.group.groupId,
        roleId: this.groupMemberForm.get('Role').value,
        startDate: this.enableTerm ? moment(this.groupMemberForm.get('StartDate').value).utc(true).format() : null,
        endDate: this.enableTerm ? moment(this.groupMemberForm.get('EndDate').value).utc(true).format() : null,
        status: this.groupMemberForm.get('Status').value == true ? 1 : 0
      }

      if(this.addNewMemberRecord){
        this.groupService.addGroupMember(body).subscribe(response =>
        {
          this.messageService.add({
            severity: 'success',
            summary: 'Successful',
            detail: 'Member Added succesfully.',
            life: 3000
          });
          this.hideDialog();
          this.getGroupMembersList();
        },
        error =>
        {            
          this.messageService.add({ severity: 'error', summary: 'Error', detail: error, life: 3000 });
        });
      }
      else{
        this.groupService.updateGroupMember(body).subscribe(response =>
        {
          this.messageService.add({
            severity: 'success',
            summary: 'Successful',
            detail: 'Member Updated succesfully.',
            life: 3000
          });
          this.hideDialog();
          this.getGroupMembersList();
        },
        error =>
        {            
          this.messageService.add({ severity: 'error', summary: 'Error', detail: error, life: 3000 });
        });
      }
    }
    
  }

  editMemberRecord(){
    this.initializeForm();
    let role = this.selectedGroupMember.roleId.toString();
    let isValidRole = this.validateInactiveRole(role);
    if(!isValidRole){
      role = '';
    }
    this.groupMemberDialog = true;
    this.addNewMemberRecord = false;
    this.headerName = "Edit member";
    this.enableTerm = this.selectedGroupMember.startDate || this.selectedGroupMember.endDate ? true : false;
    this.groupMemberForm.get('MemberName').setValue(this.selectedGroupMember.firstName + " " + this.selectedGroupMember.lastName);
    this.groupMemberForm.get('Role').setValue(role);
    this.groupMemberForm.get('StartDate').setValue(this.selectedGroupMember.startDate ? new Date(this.selectedGroupMember.startDate): new Date());
    this.groupMemberForm.get('EndDate').setValue(this.selectedGroupMember.endDate ? new Date(this.selectedGroupMember.endDate): this.endDate);
    this.groupMemberForm.get('Status').setValue(this.selectedGroupMember.isActive);
    this.groupMemberForm.get('Term').setValue(this.enableTerm);
    this.statusToggleButtonClass = this.selectedGroupMember.isActive;
  }

  deleteMemberRecord(){
    this.confirmationService.confirm({
      message: 'Removing a member is an irreversible process. Are you sure you want proceed ?',
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () =>
      {        
        this.groupService.deleteGroupMember(this.selectedGroupMember.groupMemberId).subscribe((data: any[]) => {
          console.log(data);
          this.messageService.add({
            severity: "success",
            summary: "Successful",
            detail: "Member removed succesfully.",
            life: 3000
          });
          this.getGroupMembersList();
        },
        error => {
          this.messageService.add({
            severity: "error",
            summary: "Error",
            detail: error,
            life: 3000,
          });
        });
      },
      reject: () =>{}
    });
  }

  confirmDeleteMember(){
    this.confirmationService.confirm({
      message: 'This is an irreversible process. Are you sure you want proceed ?',
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () =>
      {        
        this.groupService.deleteGroupMember(this.selectedGroupMember.groupMemberId).subscribe((data: any[]) => {
          console.log(data);
          this.messageService.add({
            severity: "success",
            summary: "Successful",
            detail: "Member removed succesfully.",
            life: 3000
          });
          this.getGroupMembersList();
        },
        error => {
          this.messageService.add({
            severity: "error",
            summary: "Error",
            detail: error,
            life: 3000,
          });
        });
      },
      reject: () =>{}
    });
  }

  setActiveRow(groupMember: any)
  {
    console.log('Selected Group Member:' + JSON.stringify(groupMember));
    this.selectedGroupMember = groupMember;
  }

  errorIconCss(field: string) {
    return { 'has-feedback': this.isFieldValid(field) };
  }

  errorFieldCss(field: string) {
    return { 'ng-dirty': this.isFieldValid(field) };
  }

  isFieldValid(field: string) {  
    if ((!this.groupMemberForm.get(field).valid) && (this.submitted) && (this.groupMemberForm.get(field).hasError('required'))){
      this.addErrorMessages =  { errorType: 'dropdownrequired', controlName: field };
      return true;
    }
  }

  toggleStatus(event){
    this.statusToggleButtonClass = event.checked;
  }

  toggleTerm(event){
    this.enableTerm = event.checked;
  }

  validateInactiveRole(roleId: any){
    let role = this.roleList.find(x => x.code === roleId);
    if(role){
      return true;
    }
    else{
      return false;
    }
    console.log(role);
  }

  getEndDate(){
    if(this.group.termEndDate){
      this.endDate = new Date(this.group.termEndDate);
    }
    else{      
      let currentDate = new Date();  
      let year = currentDate.getFullYear();
      let days = 365;
      if((year % 4 == 0 && year % 100 != 0) || (year % 400 == 0)){
        days = 365;
      }
      else{
        days = 364;
      }
      this.endDate.setDate(currentDate.getDate() + days);
    }
  }

  getStartDate(){
    if(this.group.terrmStartDate){
      this.startDate = new Date(this.group.terrmStartDate);
    }
  }

  getMemberRoleCode(){
    let memberCode = this.roleList.filter(x => x.name == 'Member')[0].code;
    // alert(memberCode);
    this.groupMemberForm.get('Role').setValue(memberCode);

  }



}
