import { Component, OnInit, ViewChild } from '@angular/core';
import { DepartmentService } from '../../services/department.service'
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { AppBreadcrumbService } from '../../app.breadcrumb.service';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { Router } from '@angular/router';
import { FormBuilder, Validators, FormControl } from '@angular/forms';

@Component({
  selector: 'app-department',
  templateUrl: './department.component.html',
  styleUrls: ['./department.component.scss'],
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
 animations: [
 trigger('rowExpansionTrigger', [
     state('void', style({
         transform: 'translateX(-10%)',
         opacity: 0
     })),
     state('active', style({
         transform: 'translateX(0)',
         opacity: 1
     })),
     transition('* <=> *', animate('400ms cubic-bezier(0.86, 0, 0.07, 1)'))
 ])
 ],
providers: [MessageService, ConfirmationService]
})
export class DepartmentComponent implements OnInit {
  departmentForm = this.formBuilder.group({
    departmentId: [0],
    departmentName: ['', [Validators.required, this.noBlankValidator]],
    Description: ['', [Validators.required, this.noBlankValidator]],
    costCenterCode: [''],
    Status: [true]
  }
  );
  departmentDialog: boolean;
  departments: any[];
  department: any;
  items: MenuItem[];
  submitted: boolean;
  isAddNewRecord: boolean;
  cols: any[];
  showTable: boolean;
  showLoader: boolean; 
  addErrorMessages : any = {};

  constructor(private departmentService: DepartmentService,
    private breadcrumbService: AppBreadcrumbService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private formBuilder: FormBuilder) {       this.breadcrumbService.setItems([
      {label: 'Home', routerLink: ['/']},
      {label: 'Set Up'},
      {label: 'Departments'},
  ]);
  this.showTable=false;
  this.showLoader=true;}

  ngOnInit(): void {
    this.getAllDepartments();
    this.cols = [
      { field: 'departmentId', header: 'Department Id' },
      { field: 'departmentName', header: 'Department Name' },
      { field: 'Description', header: 'Description' },
      { field: 'CostCenterCode', header: 'Cost Center Code' },
      { field: 'OrganizationId', header: 'OrganizationId' },
      { field: 'Active', header: 'Status' }
    ];
  
    this.items = [{
      label: 'Options',
      items: [{
          label: 'Edit',
          icon: 'pi pi-pencil',
          command: () => {
              this.update();
          }
      },
      {
          label: 'Delete',
          icon: 'pi pi-trash',
          command: () => {
              this.deleteDepartment();
          }
      }
    ]}
    ];
  }

  openNew() {
    this.departmentDialog = true;
    this.isAddNewRecord = true;
  }
  update() {
    this.editDepartment();
    this.isAddNewRecord = false;
  }

  editDepartment()
  {
    
    this.departmentDialog = true;
    this.departmentForm.get('departmentId').setValue(this.department.departmentId);
    this.departmentForm.get('departmentName').setValue(this.department.name);
    this.departmentForm.get('Description').setValue(this.department.description);
    this.departmentForm.get('Status').setValue((this.department.status==null||this.department.status==0) ?false:true);
    this.departmentForm.get('costCenterCode').setValue(this.department.costCenterCode);
  }
  
  deleteDepartment()
  {
    const departmentname = this.department.name;
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete department: <B>' + departmentname + '</B> ?',
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () =>
      {
        const body = {
          DepartmentId: this.department.departmentId
        };
        this.departmentService.deleteDepartment(body).subscribe(response =>
        {
          this.messageService.add({
            severity: 'success',
            summary: 'Successful',
            detail: 'department deleted succesfully.',
            life: 3000
          });
          this.getAllDepartments();
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
    this.departmentDialog = false;
    this.submitted = false;
    this.departmentForm.reset();
  }  
  saveDepartment()
  {
    
    this.submitted = true;
    if (this.departmentForm.valid)
    {      
      const body = {
       
        Name: this.departmentForm.get('departmentName').value,
        Description: this.departmentForm.get('Description').value,
        costCenterCode: this.departmentForm.get('costCenterCode').value,
        Active: (this.departmentForm.get('Status').value == null|| this.departmentForm.get('Status').value == 0) ? false:true,
        DepartmentId: this.isAddNewRecord ? 0 : this.department.departmentId
      };

      if (this.isAddNewRecord)
      {
        this.departmentService.createDepartment(body).subscribe(response =>
        {
          this.messageService.add({
            severity: 'success',
            summary: 'Successful',
            detail: 'Department Added succesfully.',
            life: 3000
          });
          this.getAllDepartments();
          this.hideDialog();
        },
          error =>
          {
            console.log(error);
            this.messageService.add({ severity: 'error', summary: 'Error', detail: error, life: 3000 });
          });
      }
      else
      {
        this.departmentService.updateDepartment(body).subscribe(response =>
        {
          this.messageService.add({
            severity: 'success',
            summary: 'Successful',
            detail: 'Department updated succesfully.',
            life: 3000
          });
          this.getAllDepartments();
          this.hideDialog();
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

  setActiveRow(department: any)
  {
    console.log('Selected Department:' + JSON.stringify(department));
    this.department = department;
  }

  getAllDepartments(){
    this.departmentService.getAllDepartments().subscribe((data: any[]) => {
      this.departments = data;
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
    if ((!this.departmentForm.get(field).valid) && (this.submitted) && (this.departmentForm.get(field).hasError('required'))){
      if (field=='departmentName')
          field = 'Name'
      this.addErrorMessages =  { errorType: 'required', controlName: field };
      return true;
    }
  }

  resetSubmitted(field){
    this.submitted = false;
    this.isFieldValid(field);
  }

  matcher(event: ClipboardEvent, formControlName: string): boolean {
   
    var allowedRegex = "";
    if (formControlName == 'departmentName')
        allowedRegex = ("^[A-Za-z ]{0,45}$");
    if (event.type == "paste") {
      let clipboardData = event.clipboardData;
      let pastedText = clipboardData.getData('text') + this.departmentForm.get(formControlName).value;
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
  


