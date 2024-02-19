import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, AfterViewChecked } from '@angular/core';
import { ContactRoleService } from '../../services/contact-role.service';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { AppBreadcrumbService } from '../../app.breadcrumb.service';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';
import { ContactRole } from 'src/app/models/contact-role';
@Component({
  selector: 'app-contact-role',
  templateUrl: './contact-role.component.html',
  styleUrls: ['./contact-role.component.scss'],
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
export class ContactRoleComponent implements OnInit {

  contactRoleList = [];
  items: MenuItem[];
  contactRole: any;
  submitted: boolean;
  cols: any[];
  showTable: boolean;
  showLoader: boolean;
  showForm: boolean;
  addErrorMessages : any = {};
  contactRoleForm: FormGroup;
  formData = new FormData();
  addNew: boolean;
  constructor(
    private contactRoleService:ContactRoleService,
    private breadcrumbService: AppBreadcrumbService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private formBuilder: FormBuilder,
    private authService: AuthService,) { 
      this.breadcrumbService.setItems([
        { label: 'Setup', routerLink: ['/']},
        { label: 'Manage Contact Roles'}
      ]);
      this.showTable=false;
      this.showLoader=true;
    }

  ngOnInit(): void {
    this.getContactRoles();
    this.initializeForm();
    this.showForm=false;

    this.cols = [
      { field: 'name', header: 'Name' },
      { field: 'description', header: 'Description' },
      { field: 'active', header: 'Active' }
    ];

    const body = {};
    

    this.items = [{
      label: 'Options',
      items: [{
        label: 'Edit',
        icon: 'pi pi-user-edit',
        command: () =>
        {
          this.update();
        }
      },
      {
        label: 'Delete',
        icon: 'pi pi-trash',
        command: () =>
        {
          this.delete();
        }
      }
      ]
    }
    ];
    
  }
  update()
  {
    this.editRole();
    this.addNew = false;
  }

  editRole()
  {
    this.showForm = true;
    this.contactRoleForm.get('ContactRoleId').setValue(this.contactRole.contactRoleId);
    this.contactRoleForm.get('Name').setValue(this.contactRole.name);
    this.contactRoleForm.get('Description').setValue(this.contactRole.description);
    if(this.contactRole.active===1){
      this.contactRoleForm.get('Active').setValue(true);
    } else {
      this.contactRoleForm.get('Active').setValue(false);
    }
    
  }
  delete()
  {
    this.deleteRole();
  }
  deleteRole()
  {
    const rolename = this.contactRole.name;
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete role: <B>' + rolename + '</B> ?',
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () =>
      {
        const body = {
          contactRoleId: this.contactRole.contactRoleId
        };
        this.contactRoleService.deleteContactRole(body).subscribe(response =>
        {
          this.messageService.add({
            severity: 'success',
            summary: 'Successful',
            detail: 'Contact Role deleted succesfully.',
            life: 3000
          });
          this.getContactRoles();
        },
          error =>
          {
            console.log(error);
            this.messageService.add({ severity: 'error', summary: 'Error', detail: error, life: 3000 });
          });

      }
    });
  }
  openNew(){
    this.showForm=true;
    this.initializeForm();
    this.addNew=true;
  }
  
  initializeForm(){
    this.contactRoleForm = this.formBuilder.group({
      ContactRoleId: [0],
      Name: ['', [Validators.required, this.noBlankValidator]],
      Description: ['', [Validators.required, this.noBlankValidator]],
      Active: [true]
    });
  }
  noBlankValidator(control: FormControl)
  {
    const isWhitespace = (control.value || '').trim().length === 0;
    const isValid = !isWhitespace;
    return isValid ? null : { 'required': true };
  }
  getContactRoles()
  {
    this.contactRoleService.getAllContactRoles().subscribe((data: any[]) =>
    {
      this.contactRoleList = [];
      console.log(data);
      this.contactRoleList = data;
      this.showTable=true;
    });
  }
  errorIconCss(field: string) {
    return {'has-feedback': this.isFieldValid(field)};
  }

  errorFieldCss(field: string) {
    return {'ng-dirty': this.isFieldValid(field)};
  }
  resetSubmitted(field:string){
    this.submitted = false;
    this.isFieldValid(field);
  }
  isFieldValid(field: string) {    
    if ((!this.contactRoleForm.get(field).valid) && (this.submitted) && (this.contactRoleForm.get(field).hasError('required'))){
      if (field=='Name'){
        field = 'Name'
      }
      if (field=='Description'){
        field = 'Description'
      }  
      this.addErrorMessages =  { errorType: 'required', controlName: field };
      return true;
    }
  }
  setActiveRow(contactRole: any)
  {
    console.log('Selected Contact ROle:' + JSON.stringify(contactRole));
    this.contactRole = contactRole;
  }
  hideForm(){
    this.showForm=false;
    this.showTable=true;
  }
  saveContactRole()
  {
    this.submitted = true;
    console.log(this.contactRoleForm.value);
    if (this.contactRoleForm.valid)
    {
      let activeValue = 0;
      if (this.contactRoleForm.get('Active').value === true)
      {
        activeValue = 1;
      }
      const body = {
        contactRoleId: this.contactRoleForm.get('ContactRoleId').value,
        name: this.contactRoleForm.get('Name').value,
        description: this.contactRoleForm.get('Description').value,
        active: activeValue
      };
      if (this.addNew)
      {
        console.log(this.contactRoleForm.value);
        this.contactRoleService.createContactRole(body).subscribe(
        response =>
        {
            this.messageService.add({
              severity: 'success',
              summary: 'Successful',
              detail: 'Contact Role added succesfully.',
              life: 3000
            });
            this.hideForm();
            this.getContactRoles();
        },
        error =>
        {
          console.log(error);
          this.messageService.add({ severity: 'error', summary: 'Error', detail: error, life: 3000 });
        });
      }
      else
      {
        this.contactRoleService.updateContactRole(body).subscribe(
          response =>
          {
            this.messageService.add({
              severity: 'success',
              summary: 'Successful',
              detail: 'Contact role updated succesfully.',
              life: 3000
            });
            this.hideForm();
            this.getContactRoles();
          },
          error =>
          {
            console.log(error);
            this.messageService.add({ severity: 'error', summary: 'Error', detail: error, life: 3000 });
          });
      }
    }
    else
    {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Please fix the error(s) on the page.', life: 3000 });
    }
  }
  

}
