import { Component, OnInit, ViewChild } from '@angular/core';
import { RoleService } from '../../services/role.service';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { AppBreadcrumbService } from '../../app.breadcrumb.service';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-role',
  templateUrl: './role.component.html',
  styleUrls: ['./role.component.scss'],
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
export class RoleComponent implements OnInit
{
  roleForm = this.formBuilder.group({
    RoleId: [0],
    RoleName: ['', [Validators.required, this.noBlankValidator]],
    Description: ['', [Validators.required, this.noBlankValidator]],
    Status: [true]
  }
  );

  roleDialog: boolean;
  roles: any[];
  role: any;
  items: MenuItem[];
  submitted: boolean;
  isAddNewRecord: boolean;
  cols: any[];
  showTable: boolean;
  showLoader: boolean;
  IsDuplicateName:boolean;
  addErrorMessages : any = {};

  constructor(private roleService: RoleService,
    private breadcrumbService: AppBreadcrumbService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private formBuilder: FormBuilder)
  {
    this.breadcrumbService.setItems([
      { label: 'Home', routerLink: ['/']},
      { label: 'Staff Management'},
      { label: 'Manage Roles'}
    ]);
    this.showTable=false;
    this.showLoader=true;
  }

  ngOnInit(): void
  {
    this.IsDuplicateName = false;
    this.getAllRoles();
    this.cols = [
      { field: 'roleId', header: 'Role Name' },
      { field: 'roleName', header: 'Role Name' },
      { field: 'roleDescription', header: 'Description' },
      { field: 'roleStatus', header: 'Status' }
    ];

    this.items = [{
      label: 'Options',
      items: [{
        label: 'Edit Role',
        icon: 'pi pi-user-edit',
        command: () =>
        {
          this.update();
        }
      },
      {
        label: 'Delete Role',
        icon: 'pi pi-trash',
        command: () =>
        {
          this.deleteRole();
        }
      }

      ]
    }
    ];
  }

  openNew()
  {
    this.submitted = false;
    this.roleDialog = true;
    this.isAddNewRecord = true;
    this.IsDuplicateName = false;
  }

  update()
  {
    this.editRole();
    this.isAddNewRecord = false;
  }

  editRole()
  {
    this.roleDialog = true;
    this.roleForm.get('RoleId').setValue(this.role.roleId);
    this.roleForm.get('RoleName').setValue(this.role.name);
    this.roleForm.get('Description').setValue(this.role.description);
    this.roleForm.get('Status').setValue(this.role.active);
  }

  deleteRole()
  {
    const rolename = this.role.name;
    this.confirmationService.confirm({
      message: 'Deleteing a Role will delete all asignments for this role.Are you sure you want to delete role: <B>' + rolename + '</B> ?',
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () =>
      {
        const body = {
          RoleId: this.role.roleId
        };
        this.roleService.deleteRole(body).subscribe(response =>
        {
          this.messageService.add({
            severity: 'success',
            summary: 'Successful',
            detail: 'Role deleted succesfully.',
            life: 3000
          });
          this.getAllRoles();
        },
          error =>
          {
            console.log(error);
            this.messageService.add({ severity: 'error', summary: 'Error', detail: error, life: 3000 });
          });

      }
    });
  }
  hideDialog()
  {
    this.roleDialog = false;
    this.submitted = false;
    this.roleForm.reset();
  }

  saveRole()
  {
    
    this.submitted = true;
    if (this.roleForm.valid)
    {      
      const body = {
        Name: this.roleForm.get('RoleName').value,
        Description: this.roleForm.get('Description').value,
        Active: this.roleForm.get('Status').value,
        RoleId: this.isAddNewRecord ? 0 : this.role.roleId
      };

      if (this.isAddNewRecord)
      {
        this.roleService.createRole(body).subscribe(response =>
        {
          this.messageService.add({
            severity: 'success',
            summary: 'Successful',
            detail: 'Role Added succesfully.',
            life: 3000
          });
          this.getAllRoles();
          this.hideDialog();
        },
          error =>
          {
            if (error=='Duplicate Name.')                
              this.IsDuplicateName = true;              
            console.log(error);
            this.messageService.add({ severity: 'error', summary: 'Error', detail: error, life: 3000 });
          });
      }
      else
      {
        this.roleService.updateRole(body).subscribe(response =>
        {
          this.messageService.add({
            severity: 'success',
            summary: 'Successful',
            detail: 'Role updated succesfully.',
            life: 3000
          });
          this.getAllRoles();
          this.hideDialog();
        },
          error =>
          {
            if (error=='Duplicate Name.')                
              this.IsDuplicateName = true;
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

  setActiveRow(role: any)
  {
    console.log('Selected User:' + JSON.stringify(role));
    this.role = role;
  }

  getAllRoles()
  {
    this.roleService.getRoles().subscribe((data: any[]) =>
    {
      console.log(data);
      this.roles = data;
      this.showTable=true;
      this.showLoader=false;
    });
  }

  errorIconCss(field: string) {
    return {'has-feedback': this.isFieldValid(field)};
  }

  errorFieldCss(field: string) {
    return {'ng-dirty': this.isFieldValid(field)};
  }

  isFieldValid(field: string) {    
    if ((!this.roleForm.get(field).valid) && (this.submitted) && (this.roleForm.get(field).hasError('required'))){
      if (field=='RoleName')
          field = 'Name'
      this.addErrorMessages =  { errorType: 'required', controlName: field };
      return true;
    }
  }

  resetSubmitted(field:string){
    this.submitted = false;
    this.isFieldValid(field);
  }

  matcher(event: ClipboardEvent, formControlName: string): boolean {
   
    var allowedRegex = "";
    if (formControlName == 'RoleName')
        allowedRegex = ("^[A-Za-z ]{0,64}$");
    if (event.type == "paste") {
      let clipboardData = event.clipboardData;
      let pastedText = clipboardData.getData('text') + this.roleForm.get(formControlName).value;
      console.log(pastedText, pastedText.length);
      if (!pastedText.match(allowedRegex))  {
        event.preventDefault();
        return false;
     }
     return true;
  }
}

noBlankValidator(control: FormControl)
{
  const isWhitespace = (control.value || '').trim().length === 0;
  const isValid = !isWhitespace;
  return isValid ? null : { 'required': true };
}


}
