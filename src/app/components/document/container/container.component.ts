import { Component, OnInit, ViewChild } from '@angular/core';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { AppBreadcrumbService } from '../../../app.breadcrumb.service';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { Router } from '@angular/router';
import { FormBuilder, Validators, FormControl } from '@angular/forms';
import { MembershipService } from '../../../services/membership.service';
import { HttpParams } from '@angular/common/http';
import { ContainerService } from '../../../services/container.service';
import { AuthService } from '../../../services/auth.service';
import { ConfigurationService } from '../../../services/configuration.service';
import { GroupService } from '../../../services/group.service';
import { RoleService } from '../../../../app/services/role.service';
@Component({
  selector: 'app-container',
  templateUrl: './container.component.html',
  styleUrls: ['./container.component.scss']
})
export class ContainerComponent implements OnInit {

  containers: any[];
  showTable: boolean;
  showForm: boolean;
  showAccessControl: boolean;
  menuItems: MenuItem[];
  addErrorMessages: any = {};
  submitted: boolean;
  membershipCategory: { name: string; code: string; }[];
  membershipTypes: any[];
  selectedMembershipCategory: any[];
  selectedMembershipType: any;
  selectedMembership: any;
  showMembership: boolean;
  selectedMembershipArray: any[] = [];
  selectedStaffRoleArray: any[] = [];
  selectedGroupArray: any[] = [];
  showMembershipTable: boolean;
  showGroupTable: boolean;
  selectedContainer: any;
  editMode: boolean;
  configuration: any;
  selectedGroups: any[] = [];
  selectedStaff: any[] = [];
  groups: any[] = [];
  accessControl: string;
  currentUser: any;
  roles: any[];
  containerForm = this.formBuilder.group({
    containerId: [0],
    containerName: ['', [Validators.required, this.noBlankValidator]],
    description: ['', [Validators.required, this.noBlankValidator]],
    accessControlDisabled: [false],
    membershipCategory: ''
  }
  );

  constructor(private roleService: RoleService, private breadcrumbService: AppBreadcrumbService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private formBuilder: FormBuilder,
    private membershipService: MembershipService,
    private containerService: ContainerService,
    private authService: AuthService,
    private configurationService: ConfigurationService,
    private groupService: GroupService) {
    this.showTable = true;
    this.showForm = false;
    this.showAccessControl = true;
    this.showMembership = false;
    this.showMembershipTable = false;
    this.editMode = false;
    this.breadcrumbService.setItems([
      { label: "Home" },
      { label: "Documents" },
      { label: "Directories" }
    ]);

    this.menuItems = [{
      label: 'Options',
      items: [
        {
          label: 'Edit',
          icon: 'pi pi-pencil',
          command: () => {
            this.editContainer();
          }
        },
        {
          label: 'Delete',
          icon: 'pi pi-trash',
          command: () => {
            this.deleteContainer();
          }
        },
      ]
    }
    ];
  }

  ngOnInit(): void {
    this.currentUser = this.authService.currentUserValue;
    this.getDocumentContainers();
    this.getMembershipCategories();
    this.getConfiguration();
    this.getAllRoles();
  }

  getMembershipCategories() {

    console.log('Fetcing data for membership category:');

    this.membershipService.getMembershipCategoryList().subscribe((data: any) => {
      console.log(data);
      this.membershipCategory = data;

    });

  }
  getConfiguration() {
    console.log('Fetching Configuration:');

    this.configurationService.getConfigurationByOrganizationId(this.currentUser.organizationId).subscribe((data: any) => {
      console.log(data);
      this.configuration = data;
      this.accessControl = this.configuration.documentAccessControl;
      if (this.accessControl === "Membership") {
        this.showMembershipTable = true;
        this.showGroupTable = false;
        this.getMembershipCategories();
      }
      else {
        this.showGroupTable = true;
        this.showMembershipTable = false;
        this.getGroups();
      }
    });

  }
  getDocumentContainers() {

    console.log('Fetcing document Containers:');

    this.containerService.getDocumentContainers().subscribe((data: any) => {
      console.log(data);
      this.containers = data;

    });

  }

  getDocumentContainerById(containerId: any) {

    console.log('Fetcing document Container by Id:' + containerId);
    this.containerService.getDocumentContainerById(containerId).subscribe((data: any) => {
      console.log('Container data:' + JSON.stringify(data));
      this.selectedContainer = data;
      this.showEditForm();
    });
  }

  openNew() {
    this.selectedStaff = [];
    this.containerForm.reset();
    this.selectedMembershipCategory = [];
    this.showTable = false;
    this.showForm = true;
    this.showAccessControl = true;
    this.selectedMembershipType = [];
    this.selectedGroups = [];

    this.showMembershipTable = false;
    this.membershipTypes = [];
    this.groups = [];
    this.selectedMembershipCategory = [];
    this.containerForm.get('containerId').setValue(0);
    this.selectedMembershipArray = [];
    this.selectedGroupArray = [];
    this.editMode = false;
    this.submitted = false;
    if (this.accessControl === "Membership") {
      this.showMembershipTable = true;
      this.showGroupTable = false;
      this.getMembershipCategories();
    }
    else {
      this.showGroupTable = true;
      this.showMembershipTable = false;
      this.getGroups();
    }
  }
  cancel() {
    this.showTable = true;
    this.showForm = false;
  }

  editContainer() {
    this.selectedMembershipCategory = [];
    this.selectedMembershipArray = [];
    this.selectedMembershipType = [];
    this.showMembershipTable = false;
    this.membershipTypes = [];
    this.getDocumentContainerById(this.selectedContainer.containerId)
    this.editMode = true;
  }

  showEditForm() {
    this.showAccessControl = false;
    this.selectedMembershipType = [];
    this.selectedMembershipArray = [];
    this.containerForm.get('containerId').setValue(this.selectedContainer.containerId)
    this.containerForm.get('containerName').setValue(this.selectedContainer.name),
      this.containerForm.get('description').setValue(this.selectedContainer.description),
      this.containerForm.get('accessControlDisabled').setValue(this.selectedContainer.accessControlEnabled === 1 ? false : true),
      this.showTable = false;
    this.showForm = true;
    if (this.selectedContainer.accessControlEnabled === 1) {
      this.showAccessControl = true;

      if (this.accessControl === "Membership") {
        //Set category selection

        this.selectedMembershipCategory = [];
        this.selectedContainer.containerAccesss.forEach(element => {
          //const role = {'name': element.role.name, 'code':element.role.roleId.toString()};
          if (!this.selectedMembershipCategory.includes(element.membershipCategoryId.toString())) {
            this.selectedMembershipCategory.push(element.membershipCategoryId.toString());
          }

        });
        console.log('Membership Catgeories:' + JSON.stringify(this.selectedMembershipCategory));
        this.containerForm.get('membershipCategory').setValue(this.selectedMembershipCategory);
        this.serachMemberships();
      }
      else {
        this.selectedGroups = [];
        console.log('Setting selected groups:' + JSON.stringify(this.groups));
        this.groups.forEach(row => {
          this.selectedContainer.containerAccesss.forEach(element => {
            if (row.groupId === element.groupId) {
              this.selectedGroups.push(row)
            }
          });

        });
        console.log('Selected groups:' + JSON.stringify(this.selectedGroups));
      }
      this.selectedStaff = [];
      this.selectedContainer.containerAccesss.forEach(element => {
        var role = this.roles.find(x => x.roleId == element.staffRoles)
        if (role != undefined)
          this.selectedStaff.push(role);
      });


    }
  }
  deleteContainer() {
    const currentUser = this.authService.currentUserValue;
    const body = {
      containerId: this.selectedContainer.containerId,
      userId: currentUser.id.toString()
    }
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete directory ?',
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        console.log('Form Body:' + JSON.stringify(body));
        this.containerService.deleteContainer(body).subscribe(
          response => {
            this.messageService.add({
              severity: 'success',
              summary: 'Successful',
              detail: 'Directory has been deleted succesfully.',
              life: 3000
            });
            this.getDocumentContainers();
            this.showTable = true;
            this.showForm = false;
            this.containerForm.reset();
            this.submitted = false;
            this.editMode = false;
          },
          error => {
            console.log(error);
            this.messageService.add({ severity: 'error', summary: 'Error', detail: error, life: 3000 });
          });
      }
    });
  }
  showMembershipSearch() {
    if (this.showAccessControl) {
      this.showAccessControl = false;
    }
    else {
      this.showAccessControl = true;
    }

  }

  serachMemberships() {
    let selectedCategory = this.containerForm.get('membershipCategory').value;
    console.log('selected memberships catgeories;' + selectedCategory);
    this.showMembershipTable = false;

    let searchParams = new HttpParams();
    searchParams = searchParams.append('selectedCategories', selectedCategory.toString());
    const opts = { params: searchParams };
    this.membershipService.getMembershipTypeByCategories(opts).subscribe((data: any) => {
      console.log(data);
      this.membershipTypes = data;
      this.showMembershipTable = true;
      if (this.editMode) {
        //Set selection for rows 
        this.membershipTypes.forEach(row => {
          this.selectedContainer.containerAccesss.forEach(element => {
            if (row.membershipTypeId === element.membershipTypeId) {
              this.selectedMembershipType.push(row)
            }
          });

        });
      }
    });
  }

  getGroups() {
    this.groupService.getAllGroupsByOrganizationId(this.currentUser.organizationId).subscribe((data: any) => {
      console.log('group data:' + JSON.stringify(data));
      if (data.length > 0) {
        this.groups = data.filter(x => x.status == 1);
      }

    });
  }

  saveContainer() {
    this.submitted = true;
    const currentUser = this.authService.currentUserValue;
    if (this.containerForm.valid) {
      if (this.showAccessControl) {

        if (this.accessControl === 'Membership') {
          this.selectedMembershipArray = [];

          this.selectedMembershipType.forEach(element => {
            this.selectedMembershipArray.push(element.membershipTypeId);
          });
          if (this.selectedMembershipType.length === 0) {
            this.messageService.add({ severity: 'warn', summary: 'Error', detail: 'Please select membership types to allow access.', life: 3000 });
          }

        } else {
          this.selectedGroupArray = [];
          this.selectedGroups.forEach(element => {
            this.selectedGroupArray.push(element.groupId);
          });
          if (this.selectedGroups.length === 0 && this.selectedStaff.length === 0) {
            this.messageService.add({ severity: 'warn', summary: 'Error', detail: 'Please select groups to allow access.', life: 3000 });
          }
        }

      }
      this.selectedStaff.forEach(ele => {
        this.selectedStaffRoleArray.push(ele.roleId)
      });
      console.log('MembershipTypes:' + JSON.stringify(this.selectedMembershipArray));
      const body = {
        containerId: this.containerForm.get('containerId').value,
        organizationId: this.currentUser.organizationId,
        name: this.containerForm.get('containerName').value,
        description: this.containerForm.get('description').value,
        membershipTypes: this.selectedMembershipArray,
        groups: this.selectedGroupArray,
        membershipgroupsTypes: this.selectedGroupArray,
        userId: currentUser.id.toString(),
        accessControlEnabled: this.showAccessControl ? 1 : 0,
        staffRoles: this.selectedStaffRoleArray
      }
      console.log('Form Body:' + JSON.stringify(body));
      if (!this.editMode) {
        this.containerService.createContainer(body).subscribe(
          response => {
            this.messageService.add({
              severity: 'success',
              summary: 'Successful',
              detail: 'Directory has been created succesfully.',
              life: 3000
            });
            this.getDocumentContainers();
            this.showTable = true;
            this.showForm = false;
            this.containerForm.reset();
            this.submitted = false;
            this.editMode = false;
            this.selectedStaffRoleArray = [];
          },
          error => {
            console.log(error);
            this.messageService.add({ severity: 'error', summary: 'Error', detail: error, life: 3000 });
          });
      }
      else {
        this.containerService.updateContainer(body).subscribe(
          response => {
            this.messageService.add({
              severity: 'success',
              summary: 'Successful',
              detail: 'Directory has been updated succesfully.',
              life: 3000
            });
            this.getDocumentContainers();
            this.showTable = true;
            this.showForm = false;
            this.containerForm.reset();
            this.submitted = false;
            this.selectedStaffRoleArray = [];
          },
          error => {
            console.log(error);
            this.messageService.add({ severity: 'error', summary: 'Error', detail: error, life: 3000 });
          });
      }
    }
    else {
      this.messageService.add({ severity: 'warn', summary: 'Error', detail: 'Please fix the error(s) on the page.', life: 3000 });
    }
  }

  setActiveRow(container: any) {
    this.selectedContainer = container;

  }

  noBlankValidator(control: FormControl) {
    const isWhitespace = (control.value || '').trim().length === 0;
    const isValid = !isWhitespace;
    return isValid ? null : { 'required': true };
  }

  errorIconCss(field: string) {
    return { 'has-feedback': this.isFieldValid(field) };
  }

  errorFieldCss(field: string) {
    return { 'ng-dirty': this.isFieldValid(field) };
  }

  isFieldValid(field: string) {
    if ((!this.containerForm.get(field).valid) && (this.submitted) && (this.containerForm.get(field).hasError('required'))) {
      if (field == 'containerName')
        field = 'Name'
      this.addErrorMessages = { errorType: 'required', controlName: field };
      return true;
    }
  }

  resetSubmitted(field) {
    this.submitted = false;
    this.isFieldValid(field);
  }



  matcher(event: ClipboardEvent, formControlName: string): boolean {

    var allowedRegex = "";
    if (formControlName == 'containerName')
      allowedRegex = ("^[A-Za-z ]{0,45}$");
    if (event.type == "paste") {
      let clipboardData = event.clipboardData;
      let pastedText = clipboardData.getData('text') + this.containerForm.get(formControlName).value;
      console.log(pastedText, pastedText.length);
      if (!pastedText.match(allowedRegex)) {
        event.preventDefault();
        return false;
      }
      return true;
    }
  }
  getAllRoles() {
    this.roleService.getRoles().subscribe((data: any[]) => {
      this.roles = data.filter(x => x.status === 1);
    });
  }
}
