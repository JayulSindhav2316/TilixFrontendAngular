import { Component, OnInit,  ChangeDetectorRef, AfterViewInit } from '@angular/core';
import { FormBuilder, Validators, FormControl } from '@angular/forms';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { AppBreadcrumbService } from 'src/app/app.breadcrumb.service';
import { DepartmentService } from 'src/app/services/department.service';
import { GLAccountTypeService } from 'src/app/services/glaccount-type.service';
import { GLChartOfAccountService } from 'src/app/services/glchart-of-account.service';

@Component({
  selector: 'app-glchartofaccounts',
  templateUrl: './glchartofaccounts.component.html',
  styleUrls: ['./glchartofaccounts.component.scss'],
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
export class GlchartofaccountsComponent implements OnInit, AfterViewInit
{
  glAccountForm = this.formBuilder.group({
    GLAccountID: [0],
    Name: ['', [Validators.required, this.noBlankValidator ]],     
    Code: ['', [Validators.required, this.noBlankValidator]],
    Type: ['', Validators.required],
    DetailType: ['', [Validators.required, this.noBlankValidator]],            
    CostCenter: ['', Validators.required],
    Status: [true]
  });

  glAccountDialog: boolean;
  items: MenuItem[];
  glaccountsList: any[];
  submitted: boolean;
  cols: any[];
  glAccount: any;
  glAccountTypesList: any[];
  costCenterList: any[];
  addNewRecord: boolean;
  addErrorMessages : any = {};
  headerName: string;
  constructor(private formBuilder: FormBuilder,
    private breadcrumbService: AppBreadcrumbService,
    private glChartOfAccountService: GLChartOfAccountService,
    private glAccountTypeService: GLAccountTypeService,
    private messageService: MessageService,
    private departmentService: DepartmentService,
    private confirmationService: ConfirmationService,
    private cdr: ChangeDetectorRef)
  {
    this.breadcrumbService.setItems([
      { label: 'Home', routerLink: ['/']},
      { label: 'Setup'},
      { label: 'GL Accounts'}
    ]);

  }

  ngAfterViewInit() {    
    this.cdr.detectChanges();
  }

  ngAfterViewChecked(){
    //your code to update the model
    this.cdr.detectChanges();
 }

  ngOnInit(): void
  {
    this.getAllGlChartOfAccounts();
    this.getAllGlAccountTypeSelectList();
    this.getAllCostCenterSelectList();

    this.items = [{
      label: 'Options',
      items: [{
        label: 'Edit GL Account',
        icon: 'pi pi-user-edit',
        command: () =>
        {
          this.editGLAccount();
        }
      },
      {
        label: 'Delete GL Account',
        icon: 'pi pi-trash',
        command: () =>
        {
          this.deleteGLAccount();
        }
      }

      ]
    }
    ];
  }

  openNew()
  {
    this.submitted = false;
    this.glAccountDialog = true;
    this.addNewRecord = true;
    this.headerName = "Add New GL Account";
  }

  editGLAccount()
  {
    this.submitted = false;
    this.glAccountDialog = true;
    this.addNewRecord = false;
    let status = this.glAccount.status === 1 ? true : false;
    this.headerName = "Edit GL Account '" + this.glAccount.name + "'";
    this.glAccountForm.get('GLAccountID').setValue(this.glAccount.glAccountId);
    this.glAccountForm.get('Name').setValue(this.glAccount.name);
    this.glAccountForm.get('Type').setValue(this.glAccount.type.toString());
    this.glAccountForm.get('DetailType').setValue(this.glAccount.detailType);
    this.glAccountForm.get('CostCenter').setValue(this.glAccount.costCenter.toString());
    this.glAccountForm.get('Status').setValue(status);
    this.glAccountForm.get('Code').setValue(this.glAccount.code);
  }


  saveGLAccount()
  {
    this.submitted = true;
    let statusValue = 0;
    if (this.glAccountForm.get('Status').value === true)
    {
      statusValue = 1;
    }

    if (this.glAccountForm.valid)
    {
      const body = {
        GlAccountId: this.glAccountForm.get('GLAccountID').value,
        Name: this.glAccountForm.get('Name').value,
        Type: Number(this.glAccountForm.get('Type').value),
        DetailType: this.glAccountForm.get('DetailType').value,
        CostCenter: Number(this.glAccountForm.get('CostCenter').value),
        Code: this.glAccountForm.get('Code').value,
        Status: statusValue,
      };

      if (this.addNewRecord)
      {
        console.log(this.glAccountForm.value);
        if (body.GlAccountId==null)
        body.GlAccountId=0;
        this.glChartOfAccountService.createGLAccount(body).subscribe(
          response =>
          {
            console.log(response);
            this.messageService.add({
              severity: 'success',
              summary: 'Successful',
              detail: 'GL account created succesfully.',
              life: 3000
            });
            this.glAccountForm.reset();
            this.hideDialog();
            this.getAllGlChartOfAccounts();
          },
          error =>
          {
            console.log(error);
            this.messageService.add({ severity: 'error', summary: 'Error', detail: error, life: 3000 });
          });

      }
      else
      {
        console.log(this.glAccountForm.value);
        this.glChartOfAccountService.updateGlAccount(body).subscribe(
          response =>
          {
            console.log(response);
            this.messageService.add({
              severity: 'success',
              summary: 'Successful',
              detail: 'GL account updated succesfully.',
              life: 3000
            });
            this.hideDialog();
            this.getAllGlChartOfAccounts();
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

  deleteGLAccount()
  {
    console.log('Deleteing:' + this.glAccount.glAccountId);
    const body = {
      GlAccountId: this.glAccount.glAccountId
    };

    this.confirmationService.confirm({
      message: 'Are you sure you want to delete this GL account ?',
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () =>
      {
        this.glChartOfAccountService.deleteGlAccount(body).subscribe(
          response =>
          {
            this.messageService.add({
              severity: 'success',
              summary: 'Successful',
              detail: 'GL account deleted succesfully.',
              life: 3000
            });
            this.hideDialog();
            this.getAllGlChartOfAccounts();
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
    this.glAccountDialog = false;
    this.glAccountForm.reset();
  }

  getAllGlChartOfAccounts()
  {
    this.glChartOfAccountService.getAllGlChartOfAccounts().subscribe((data: any[]) =>
    {
      console.log(data);
      this.glaccountsList = data;
    });
  }

  getAllGlAccountTypeSelectList()
  {
    this.glAccountTypeService.getAllGlAccountTypeSelectList().subscribe((data: any[]) =>
    {
      console.log('Gl Account Type:' + data);
      this.glAccountTypesList = data;
    });
  }

  getAllCostCenterSelectList()
  {
    this.departmentService.getAllDepartmentsSelectList().subscribe((data: any[]) =>
    {
      console.log(data);
      this.costCenterList = data;
    });
  }

  setActiveRow(glAccount: any)
  {
    console.log('Selected GL Account:' + JSON.stringify(glAccount));
    this.glAccount = glAccount;
  }

  errorIconCss(field: string) {
    return { 'has-feedback': this.isFieldValid(field) };
  }

  errorFieldCss(field: string) {
    return { 'ng-dirty': this.isFieldValid(field) };
  }

  resetSubmitted(field){
    this.submitted = false;
    this.isFieldValid(field);
    
  }

  isFieldValid(field: string) {    
    if ((!this.glAccountForm.get(field).valid) && (this.submitted) && (this.glAccountForm.get(field).hasError('required'))){
      if (field=='Name'){
        field='GL Name'
        this.addErrorMessages =  { errorType: 'required', controlName: field };}
      else if (field=='DetailType'){
        field='Detail'
        this.addErrorMessages =  { errorType: 'required', controlName: field };}
      else if (field=='Type'){
        field='GL Account Type'
        this.addErrorMessages =  { errorType: 'dropdownrequired', controlName: field };}
      else if (field=='CostCenter'){
        field='Cost Center '
        this.addErrorMessages =  { errorType: 'dropdownrequired', controlName: field };}
      else this.addErrorMessages =  { errorType: 'required', controlName: field };
      return true;
    }
  }

  matcher(event: ClipboardEvent, formControlName: string): boolean {    
    var allowedRegex = "";
    if (formControlName == 'Name') 
        allowedRegex = ("^[A-Za-z ]{0,64}$");
    if (formControlName == 'Code') 
        allowedRegex = ("^[A-Za-z0-9-]{0,50}$");
    if (formControlName == 'DetailType') 
        allowedRegex = ("^[A-Za-z0-9 ]{0,100}$");
  
    if (event.type == "paste") {
      let clipboardData = event.clipboardData;
      let pastedText = clipboardData.getData('text') + this.glAccountForm.get(formControlName).value; 
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
