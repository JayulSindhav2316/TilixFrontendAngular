import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { AppBreadcrumbService } from 'src/app/app.breadcrumb.service';
import { AuthService } from 'src/app/services/auth.service';
import { GroupService } from 'src/app/services/group.service';
import { GroupRoleComponent } from 'src/app/shared/group-role/group-role.component';

@Component({
  selector: 'app-manage-group',
  templateUrl: './manage-group.component.html',
  styleUrls: ['./manage-group.component.scss'],
  providers: [MessageService, ConfirmationService, GroupRoleComponent]
})
export class ManageGroupComponent implements OnInit {

  groupMemberForm: FormGroup;
  currentGroupId: number;
  groupMemberDialog: boolean = false;
  items: MenuItem[];
  groupsList : any[]=[];
  groupMembers: any[] = [];
  groupMemberRoles: any[]=[];
  activeGroupsList : any[]=[];
  group: any;
  currentUser: any;
  organizationId: number;
  includeInactive: boolean = false;
  openSearch: boolean = false;
  selectedGroup: any;
  selectedGroupMember: any;
  enableTerm: boolean = false;
  headerName: string;
  roleList: any[]=[];
  addNewMemberRecord: boolean;
  minDate = new Date();
  minEndDate = new Date();
  startDate = new Date();
  endDate= new Date();
  contact: any;
  addErrorMessages : any = {};
  submitted : boolean = false;
  expandedRows:any[] = [];
  selectedRoles:any[]=[];
  roleExpanded: boolean = false;
  expandedGroupMemberId: number;
  duplicateRolesSelected: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private groupService: GroupService,    
    private authService: AuthService, 
    private breadcrumbService: AppBreadcrumbService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private ref: ChangeDetectorRef) {
    this.breadcrumbService.setItems([
      {label: 'Home', routerLink: ['/']},
      {label: 'Boards & Groups'}
    ]); 
 }

  initializeForm(){
     this.groupMemberForm = this.formBuilder.group({
      GroupMemberId: [0],
      MemberName: [''],
      Status: [true],
      Term:[false],
      Roles: this.formBuilder.array([])
    });
  }

  get Roles() {
    return this.groupMemberForm.get('Roles') as FormArray;
  }

  ngAfterContentChecked() {
    this.ref.detectChanges();
  }
  
  ngOnInit(): void {
    this.initializeForm();
    this.currentUser = this.authService.currentUserValue;
    this.organizationId = this.currentUser.organizationId;
    this.getGroupList();    
    this.setMenuItems();
  }

  getGroupList(){
    this.groupService.getAllGroupDetailsByOrganizationId(this.organizationId).subscribe((data: any[]) =>{
      console.log(data);
      this.groupsList = data;
      this.activeGroupsList = this.groupsList.filter(x => x.isActive == true);
    });
  }
  
  // getGroupList(){
  //   this.groupService.getAllGroupsByOrganizationId(this.organizationId).subscribe((data: any[]) =>{
  //     console.log(data);
  //     this.groupsList = data;
  //     this.activeGroupsList = this.groupsList.filter(x => x.isActive == true);
  //   });
  // }

  goToGroup(group: any) {
    this.group = group;
    this.router.navigate(['manage/groupMembers'], {    
      state: { group: this.group }
    });
  }

  includeInactiveGroups(event){
    this.includeInactive = event.checked;
  }

  openSearchFunction(group: any){
    const thisRef = this;
    thisRef.expandedRows =[];
    this.groupsList.forEach(function(g) {
      if(g.groupId == group.groupId){
        thisRef.expandedRows[g.groupId] = true;
      }
    });
    this.openSearch = true;
    this.selectedGroup = group;
    this.currentGroupId = group.groupId;
    this.getGroupMembersList();
    this.getRoleList(this.currentGroupId);
  }

  closeSearchFunction(){
    this.openSearch = false;
    // this.selectedGroup = null;
  }

  expandGroupClick(group: any, expanded: boolean){
    console.log(group);
    this.selectedGroup = group;
    this.currentGroupId = group.groupId;
    if (!expanded)
    {
      this.getRoleList(this.currentGroupId);
      this.getGroupMembersList();    
    }
    if(this.openSearch){
      this.openSearchFunction(group);
    } 
    else{
      this.closeSearchFunction();
    }
  }

  setActiveMemberRow(groupMember: any)
  {
    console.log('Selected Group Member:' + JSON.stringify(groupMember));
    this.selectedGroupMember = groupMember;
    this.currentGroupId = this.selectedGroup.groupId;
    this.expandMemberRoleClick(groupMember.groupMemberId);
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
    this.addNewMemberRecord = true;
    this.getStartDate();
    this.getEndDate();
    this.initializeForm();
    if(this.selectedGroup.groupMembers.length >= parseInt(this.selectedGroup.preferredNumbers)){
      this.messageService.add({ severity: 'warn', summary: 'Warning', detail: 'Group limit reached.', life: 3000 });
    }
    this.contact = contact;
    console.log("Manage Group page:" + JSON.stringify(contact));
    // this.openSearch = false;    
    this.groupMemberDialog = true;
    this.headerName = "Add member";
    this.groupMemberForm.get('MemberName').setValue(this.contact.name);
    this.enableTerm = this.selectedGroup.isTermApplied;
    // this.getMemberRoleCode();
  }

  editMemberRecord()
  {    
    this.addNewMemberRecord = false;
    // this.getStartDate();
    // this.getEndDate();
    this.initializeForm();

    this.groupMemberDialog = true;
    this.headerName = "Edit member";
    this.groupMemberForm.get('MemberName').setValue(this.selectedGroupMember.entityName);
    this.groupMemberForm.get('Status').setValue(this.selectedGroupMember.isActive);


    this.groupMemberRoles.forEach(role => {
      const groupRoleItem: any =  {};
      
      groupRoleItem.GroupMemberRoleId = role.groupMemberRoleId;
      groupRoleItem.GroupRoleId = role.groupRoleId;
      groupRoleItem.Term = role.startDate && role.endDate ? true : false;
      groupRoleItem.StartDate = this.getRoleStartDate(role.startDate);
      groupRoleItem.EndDate = this.getRoleEndDate(role.endDate);
      groupRoleItem.IsActive = role.isActive;

      this.Roles.push(this.formBuilder.control(groupRoleItem));
    });
  }

  deleteMemberRecord(){
    this.confirmationService.confirm({
      message: 'Removing a member is an irreversible process. Are you sure you want to proceed ?',
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
          this.getGroupList();
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

  hideDialog(){
    this.groupMemberDialog = false;
    // this.enableTerm = false;
    this.initializeForm();
    this.endDate = new Date();
    this.submitted = false;
    // this.selectedGroupMember = null;
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

  getRoleList(groupId: number){
    this.groupService.GetRolesSelectListByGroupId(groupId).subscribe((data: any[]) =>{
      console.log(data);
      this.roleList = data;
    });
  }
  getMemberRoleCode(){
    this.selectedRoles = [];
     this.roleList.forEach(element => {
      if(element.groupRoleName == 'Member'){
        this.selectedRoles.push(element.groupRoleId);
      }
    });    
    this.groupMemberForm.get('Role').setValue(this.selectedRoles);
    // let memberCode = this.roleList.filter(x => x.groupRoleName == 'Member')[0].groupRoleId;
    // this.groupMemberForm.get('Role').setValue(memberCode);
  }

  getEndDate(){
    if(this.selectedGroup.isTermApplied){      
      return new Date(this.selectedGroup.termEndDate);
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
      return new Date(currentDate.setDate(currentDate.getDate() + days));
    }
  }

  getStartDate(){
    if(this.selectedGroup.isTermApplied){      
      return new Date(this.selectedGroup.terrmStartDate);
    }
    else{      
      return new Date(); 
    }
  }

  getRoleStartDate(startDate: any){
    if(startDate){
      return new Date(startDate);
    }
    else if (this.selectedGroupMember){ 
      if(this.selectedGroup.terrmStartDate){
        return new Date(this.selectedGroup.terrmStartDate);
      }
      else{
        return new Date();
      }
    }
    else{
      return new Date();
    }
  }

  getRoleEndDate(endDate: any){
    if(endDate){
      return new Date(endDate);
    }
    else if (this.selectedGroupMember){ 
      if(this.selectedGroup.termEndDate){
        return new Date(this.selectedGroup.termEndDate);
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
        return new Date(currentDate.setDate(currentDate.getDate() + days));
      }      
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
      return new Date(currentDate.setDate(currentDate.getDate() + days));
    }
  }

  saveGroupMember(){
    let roleItems = [];
    console.log(this.Roles.length);
    if (this.Roles.length === 0) {
      this.messageService.add({severity: 'error', summary: 'Error', detail: 'You need to have atleast one position.', life: 3000});
    }
    else if(this.duplicateRolesSelected){
      this.messageService.add({severity: 'error', summary: 'Error', detail: 'You have selected a position more than once.', life: 3000});
    }
    else if(this.groupMemberForm.valid){
      this.submitted = true;
      for (let i = 0; i < this.Roles.length; i++) {
        const groupRoleItem: any =  {};

        groupRoleItem.groupMemberId = this.addNewMemberRecord ? 0 : this.selectedGroupMember.groupMemberId,
        groupRoleItem.GroupMemberRoleId = this.Roles.value[i].GroupMemberRoleId;
        groupRoleItem.GroupRoleId = this.Roles.value[i].GroupRoleId;
        groupRoleItem.StartDate = this.Roles.value[i].Term ? moment(this.Roles.value[i].StartDate).utc(true).format() : null,
        groupRoleItem.EndDate = this.Roles.value[i].Term ? moment(this.Roles.value[i].EndDate).utc(true).format() : null,
        groupRoleItem.IsActive = this.Roles.value[i].IsActive;

        roleItems.push(groupRoleItem);
      }

      const body = {
        groupMemberId : this.addNewMemberRecord ? 0 : this.selectedGroupMember.groupMemberId,
        entityId: this.addNewMemberRecord ? this.contact.entityId  : this.selectedGroupMember.entityId,
        groupId: this.addNewMemberRecord ? this.selectedGroup.groupId : this.selectedGroupMember.groupId,
        groupMemberRoles: roleItems,
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
          this.getGroupList();
          this.getGroupMembersList();
        },
        error =>
        {            
          this.messageService.add({ severity: 'error', summary: 'Error', detail: error, life: 3000 });
          this.submitted = false;
          this.selectedGroupMember = null;
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
          this.getGroupList();
          this.getGroupMembersList();
          this.getRolesByGroupMembers(this.selectedGroupMember.groupMemberId);
        },
        error =>
        {            
          this.messageService.add({ severity: 'error', summary: 'Error', detail: error, life: 3000 });
          this.submitted = false;
          this.selectedGroupMember = null;
        });
      }
    }
    else{
      this.messageService.add({severity: 'error', summary: 'Error', detail: 'Please fix the error(s) on the page.', life: 3000});
    }
  }

  getSelectedRoles(roles: any[])
  {
    this.selectedRoles = [];
     roles.forEach(element => {
       this.selectedRoles.push(element.groupRoleId);
    });
  }

   removeRole(i: number) {
    if (this.Roles.length === 1){
      this.messageService.add({severity: 'error', summary: 'Error', detail: 'You need to have atleast one position.', life: 3000});
    }
    else{
      this.Roles.removeAt(i);
      this.duplicateRolesSelected = false;
    }
   }

  addRole(){
    const groupRoleItem: any =  {};

    groupRoleItem.groupId = this.selectedGroup.groupId;
    groupRoleItem.GroupMemberRoleId = 0;
    groupRoleItem.GroupRoleId = 0;
    groupRoleItem.Term = this.selectedGroup.isTermApplied;
    groupRoleItem.StartDate = this.getStartDate();
    groupRoleItem.EndDate = this.getEndDate();
    groupRoleItem.IsActive = true;

    this.Roles.push(this.formBuilder.control(groupRoleItem));
  }

  expandMemberRoleClick(groupMemberId:number){
    this.roleExpanded = !this.roleExpanded;
    this.expandedGroupMemberId = this.roleExpanded ? groupMemberId : 0;
    this.getRolesByGroupMembers(groupMemberId);
  }

  otherFormClicked(roleId: number){
    if(this.Roles.length > 1){
      let duplicateRoleArray = this.Roles.value.filter(x => x.GroupRoleId == roleId);
      if(duplicateRoleArray.length > 1){
        this.duplicateRolesSelected = true;
        this.messageService.add({severity: 'error', summary: 'Error', detail: 'You have selected a position more than once.', life: 3000});
      }
      else{
        this.duplicateRolesSelected = false;
      }
    }
    else{
      this.duplicateRolesSelected = false;
    }

  }

  getGroupMembersList(){
    this.groupService.getAllGroupMembersByGroupId(this.currentGroupId).subscribe((data: any[]) =>{
      console.log(data);
      this.groupMembers = data;
    });
  }
  
  getRolesByGroupMembers(groupMemberId: number) : any{
    this.groupService.getRolesByGroupMemberId(groupMemberId).subscribe((data: any[]) =>{
      console.log(data);
      this.groupMemberRoles = data;
    });
  }
}
