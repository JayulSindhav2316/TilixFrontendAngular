import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { AppBreadcrumbService } from 'src/app/app.breadcrumb.service';
import { AuthService } from 'src/app/services/auth.service';
import { GroupService } from 'src/app/services/group.service';

@Component({
  selector: 'app-group-details',
  templateUrl: './group-details.component.html',
  styleUrls: ['./group-details.component.scss'],  
  providers: [MessageService, ConfirmationService]
})
export class GroupDetailsComponent implements OnInit {

  group: any;
  organizationId: number;
  currentUser: any;
  items: MenuItem[];
  groupForm: FormGroup;
  termEnabled: boolean = true;
  addErrorMessages : any = {};
  date= new Date();
  minDate= new Date();
  minEndDate= new Date();
  endDate= new Date();
  submitted : boolean = false;
  addNewGroupRecord: boolean;

  selectedRole: any;
  isDefaultRole: boolean;
  roleForm: FormGroup;
  roleList : any[]=[];
  roleDialog: boolean = false;
  addNewRoleRecord: boolean;
  roleRecordTouched: boolean;
  roleformSubmitted : boolean = false;
  selectedRoleIndex : number;
  editing: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private groupService: GroupService,
    private messageService: MessageService,
    private router: Router,
    private authService: AuthService,
    private breadcrumbService: AppBreadcrumbService) {
      if (this.router.url.includes("/setup/groupsDetails")) {
        this.breadcrumbService.setItems([
        {label: 'Home', routerLink: ['/']},
        {label: 'Set Up'},
        {label: 'Groups', routerLink: ['/setup/groups']},
        {label: 'New Group'}
    ]);}
    if (this.router.url.includes("/setup/groupsDetails/Edit")) {
      this.breadcrumbService.setItems([
          {label: 'Home', routerLink: ['/']},
          {label: 'Set Up'},
          {label: 'Groups', routerLink: ['/setup/groups']},
          {label: 'Edit group'}
      ]);}

  
   }

  ngOnInit(): void {
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
    // this.groupForm.get('EndDate').setValue(currentDate);
    this.currentUser = this.authService.currentUserValue;
    this.organizationId = this.currentUser.organizationId;
    this.initializeForm();
    this.initialiseRoleForm();
    this.setMenuItems();

    if(history.state.isNewRecord || history.state.group)
    {      
      const jsonGroupData = JSON.stringify(history.state);
      sessionStorage.setItem("GroupData", jsonGroupData);     
      this.initializePage(history.state);
    }
    else{
      const groupData = JSON.parse(sessionStorage.getItem("GroupData"));
      this.initializePage(groupData);
    }    
  }

  initializePage(groupObject: any){
    if (groupObject.isNewRecord == true){ 
      this.addNewGroupRecord = true;
      this.getDefaultRolesList();
    }
    else{
      this.addNewGroupRecord = false;
      this.group = groupObject.group;
      console.log(this.group);
      this.setFormData();
      this.getLinkedRolesList();
    }
  }

  initializeForm(){
    this.groupForm = this.formBuilder.group({
      GroupId: [0],
      Name: ['', [Validators.required]],
      Description: [''],
      Units: [1],
      Term: [true],
      StartDate: [this.minDate],
      EndDate: [this.endDate],
      Status: [true],
      Sync: [true]
    });
  }

  initialiseRoleForm(){
    this.roleForm = this.formBuilder.group({
    RoleId: [0],
    PositionName: ['', [Validators.required]],
    Status: [false]
    });
  }

  setFormData(){
    this.groupForm.get('GroupId').setValue(this.group.groupId);
    this.groupForm.get('Name').setValue(this.group.groupName);
    this.groupForm.get('Description').setValue(this.group.groupDescription);
    this.groupForm.get('Units').setValue(this.group.preferredNumbers);
    this.groupForm.get('Term').setValue(this.group.isTermApplied);
    this.groupForm.get('StartDate').setValue(this.group.isTermApplied ? new Date(this.group.terrmStartDate) : new Date());
    this.groupForm.get('EndDate').setValue(this.group.isTermApplied ? new Date(this.group.termEndDate) : this.endDate);
    this.groupForm.get('Status').setValue(this.group.isActive);
    this.groupForm.get('Sync').setValue(this.group.isSynced);
    this.termEnabled = this.group.isTermApplied;
  }

  saveGroups(){
    this.submitted = true;
    let blankRoleName = this.roleList.filter(x => x.groupRoleName.trim() == '');
    if(blankRoleName.length > 0){
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Position name cannot be blank.', life: 3000 });
      return false;
    }
    if(this.groupForm.valid){

      const body = {
        groupId: this.addNewGroupRecord ? 0 : this.group.groupId,
        groupName: this.groupForm.get('Name').value,
        groupDescription : this.groupForm.get('Description').value,
        preferredNumbers: parseInt(this.groupForm.get('Units').value),
        applyTerm: this.groupForm.get('Term').value == true ? 1 : 0,
        terrmStartDate: this.groupForm.get('Term').value == true ? moment(this.groupForm.get('StartDate').value).utc(true).format() : null,
        termEndDate: this.groupForm.get('Term').value == true ? moment(this.groupForm.get('EndDate').value).utc(true).format() : null,
        status: this.groupForm.get('Status').value == true ? 1 : 0,
        sync: this.groupForm.get('Sync').value == true ? 1 : 0,
        organizationId: this.currentUser.organizationId,
        roles: this.roleList
      }

      if(this.addNewGroupRecord){
        this.groupService.createGroup(body).subscribe(response =>
        {
          this.messageService.add({
            severity: 'success',
            summary: 'Successful',
            detail: 'Board / Group Added succesfully.',
            life: 3000
          });
          setTimeout(()=>  this.router.navigate(['/setup/groups']), 3000); 
        },
        error =>
        {            
          this.messageService.add({ severity: 'error', summary: 'Error', detail: error, life: 3000 });
        });
      }
      else{
        this.groupService.updateGroup(body).subscribe(response =>
        {
          this.messageService.add({
            severity: 'success',
            summary: 'Successful',
            detail: 'Board / Group updated succesfully.',
            life: 3000
          });
          setTimeout(()=>  this.router.navigate(['/setup/groups']), 3000); 
        },
        error =>
        {            
          this.messageService.add({ severity: 'error', summary: 'Error', detail: error, life: 3000 });
        });
      }
    }
  }

  errorIconCss(field: string) {
    return { 'has-feedback': this.isFieldValid(field) };
  }

  errorFieldCss(field: string) {
    return { 'ng-dirty': this.isFieldValid(field) };
  }

  isFieldValid(field: string) {  
    if ((!this.groupForm.get(field).valid) && (this.submitted) && (this.groupForm.get(field).hasError('required'))){
      if (field=='Name') 
        field = 'Group / Board / Committee Name'
      this.addErrorMessages =  { errorType: 'required', controlName: field };
      return true;
    }
  }

  errorRoleIconCss(field: string) {
    return { 'has-feedback': this.isRoleFieldValid(field) };
  }

  errorRoleFieldCss(field: string) {
    return { 'ng-dirty': this.isRoleFieldValid(field) };
  }

  isRoleFieldValid(field: string) {  
    if ((!this.roleForm.get(field).valid) && (this.roleformSubmitted) && (this.roleForm.get(field).hasError('required'))){
      this.addErrorMessages =  { errorType: 'required', controlName: field };
      return true;
    }
  }

  enableTermFields(event:any){
    this.termEnabled = event.checked;
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
    this.groupForm.get('EndDate').setValue(date);
  }

  addRole(){
    this.addNewRoleRecord = true;
    this.initialiseRoleForm();
    this.roleDialog = true;
  }

  hideRoleDialog(){
    this.roleDialog = false;
  }

  setMenuItems(){
    this.items = [{
      label: 'Options',
      items: [{
        label: 'Edit Position',
        icon: 'pi pi-user-edit',
        command: () =>
        {
          this.editRole();
        }
      }
      ]
    }];
  }

  setActiveRow(role: any, index: number)
  {
    console.log('Selected Role:' + JSON.stringify(role));
    this.selectedRole = role;
    this.selectedRoleIndex = index;
  }

  getDefaultRolesList(){
    this.groupService.getDefaultGroupRoles(this.organizationId).subscribe((data: any[]) =>{
      console.log(data);
      this.roleList = data;
    });
  }

  getDefaultRolesListAfterNewRole(roleName: string, roleStatus: number){
    let previousRoleList = this.roleList; 
    this.groupService.getDefaultGroupRoles(this.organizationId).subscribe((data: any[]) =>{
      console.log(data);
      this.roleList = data;
      let roleIndex = this.roleList.findIndex(x => x.groupRoleName == roleName);
      this.roleList[roleIndex].isLinked = roleStatus;

      previousRoleList.forEach((role) => {      
        let index = this.roleList.findIndex(x => x.groupRoleName == role.groupRoleName);
        this.roleList[index].isLinked = role.isLinked;
      });
    }); 
  }

  getLinkedRolesList(){
    this.groupService.GetLinkedRolesByGroupId(this.group.groupId, this.organizationId).subscribe((data: any[]) =>{
      console.log(data);
      this.roleList = data;      
    });
  }

  saveRole(){    
    this.roleformSubmitted = true;       
    const roleModel = {
      groupRoleId : 0,
      groupRoleName :  this.roleForm.get('PositionName').value,
      organizationId : this.organizationId
    }

    let linkGroupRoleModel = {
      linkGroupRoleId : 0,
      groupId: this.addNewGroupRecord ? 0 : this.group.groupId,
      groupRoleId : 0,
      groupRoleName : this.roleForm.get('PositionName').value,
      isLinked : this.roleForm.get('Status').value == true ? 1 : 0,
      organizationId : this.organizationId,
      isDefault: 0
    };

     
    this.groupService.addGroupRole(roleModel).subscribe(response =>
    {
      if(this.addNewGroupRecord){
        let newRoleName = this.roleForm.get('PositionName').value;
        let newRoleStatus = this.roleForm.get('Status').value ? 1 : 0;
        this.getDefaultRolesListAfterNewRole(newRoleName, newRoleStatus);        
      }
      else{
        linkGroupRoleModel.groupRoleId = response.groupRoleId;
        this.createLinkGroupRoleRecord(linkGroupRoleModel);
      }
      this.hideRoleDialog();
    },
    error =>
    {            
      this.messageService.add({ severity: 'error', summary: 'Error', detail: error, life: 3000 });
    });
  }

  editRole(){
    this.addNewRoleRecord = false;
    this.initialiseRoleForm();
    this.roleDialog = true;

    if(this.selectedRole.isDefault)
    {
      this.roleForm.get('PositionName').disable();
    }
    this.roleForm.get('RoleId').setValue(this.selectedRole.groupRoleId);
    this.roleForm.get('PositionName').setValue(this.selectedRole.groupRoleName);
    this.roleForm.get('Status').setValue(this.selectedRole.isLinked==1 ? true : false);
  }  

  roleNameValidation(event: any) {
    if(event.target.value.trim().length == 0){
      this.roleForm.get('PositionName').reset();
    }
  }

  nameValidation(event) {
    if(event.target.value.trim().length == 0)
      this.groupForm.get('Name').reset();
  }

  createLinkGroupRoleRecord(linkGroupRoleModel: any){
    this.groupService.addLinkGroupRole(linkGroupRoleModel).subscribe(response =>
    {
      if(response.linkGroupRoleId > 0){
        this.getLinkedRolesList();
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Position updated successfully.', life: 3000 });
      }
    },
    error =>
    {            
      this.messageService.add({ severity: 'error', summary: 'Error', detail: error, life: 3000 });
    });
  }

  updateLinkGroupRoleRecord(linkGroupRoleModel: any){
    
    this.groupService.updateLinkGroupRole(linkGroupRoleModel).subscribe(response =>
    {
      if(response){
        this.getLinkedRolesList();
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Position updated successfully.', life: 3000 });
      }
    },
    error =>
    {            
      this.messageService.add({ severity: 'error', summary: 'Error', detail: error, life: 3000 });
    });
  }

  setActiveRole(event: any, role: any, index: number){
    if(event.target.value.trim().length == 0){
      this.selectedRoleIndex = -1;
      role.groupRoleName = '';
    }
    else{      
      this.selectedRole = role;
      this.selectedRoleIndex = index;
    }
  }

  saveExistingRole(role: any, index: number){
    if(role.groupRoleName.length == 0){
      this.selectedRoleIndex = -1;
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Please enter Position name.', life: 3000 });
    }
    else{      
      this.selectedRole = role;
      this.selectedRoleIndex = index;
      this.addNewRoleRecord = false;
      this.updateRole();
    }

  }

  resetExistingRole(){
    this.selectedRole = null;
    this.selectedRoleIndex = -1;
    if (!this.addNewGroupRecord){
      this.getLinkedRolesList();
    }
    else{
      this.getDefaultRolesList();      
    }
  }

  toggleStatus(event: any, role: any, index: number){
    if(role.groupRoleName.length == 0){
      role.isLinked = !event.checked;
      this.selectedRoleIndex = -1;
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Please enter Position name.', life: 3000 });
    }
    else{
      role.isLinked = role.isLinked ? 1 : 0;
      this.selectedRole = role;
      if(!this.addNewGroupRecord){
        this.updateRole();      
      }
    }
  }

  updateRole(){
    const roleModel = {
      groupRoleId : this.selectedRole.groupRoleId,
      groupRoleName :  this.selectedRole.groupRoleName,
      organizationId : this.organizationId
    }

    let linkGroupRoleModel = {
      linkGroupRoleId : this.addNewGroupRecord ? 0 : this.selectedRole.linkGroupRoleId,
      groupId: this.addNewGroupRecord ? 0 : this.group.groupId,
      groupRoleId : this.selectedRole.groupRoleId,
      groupRoleName : this.selectedRole.groupRoleName,
      isLinked : this.selectedRole.isLinked ? 1 : 0,
      organizationId : this.organizationId,
      isDefault: this.selectedRole.isDefault
    };

    this.groupService.updateGroupRole(roleModel).subscribe(response =>
    {
      if(linkGroupRoleModel.linkGroupRoleId > 0){
        this.updateLinkGroupRoleRecord(linkGroupRoleModel);
      }
      else{
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Position updated successfully.', life: 3000 });
      }
    },
    error =>
    {            
      this.messageService.add({ severity: 'error', summary: 'Error', detail: error, life: 3000 });
    });
  }

  onModelChange(event: any){
  console.log(event);
  }

  cancelGroup(){
    this.router.navigate(['setup/groups']);
    sessionStorage.removeItem("GroupData");
  }
}
