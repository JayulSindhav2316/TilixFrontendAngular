import { HttpParams } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { LookupService } from 'src/app/services/lookup.service';
import { faEdit } from '@fortawesome/free-solid-svg-icons';
import { AppBreadcrumbService } from 'src/app/app.breadcrumb.service';
import { MessageService } from 'primeng/api';
import { OrganizationService } from 'src/app/services/organization.service';
import { Router,ActivatedRoute } from '@angular/router';
import { MembershipService } from 'src/app/services/membership.service';
import { GLChartOfAccountService } from 'src/app/services/glchart-of-account.service';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-organization-details',
  templateUrl: './organization-details.component.html',
  styleUrls: ['./organization-details.component.scss'],
  providers: [MessageService]
})
export class OrganizationDetailsComponent implements OnInit {
  organizationForm: FormGroup = this.fb.group({
    OrganizationId: [0],
    Name: ['',[Validators.required]],
    Title: ['',[Validators.required]],
    Code: ['',[Validators.required]],
    OrgPhoneNumber: ['',[Validators.required]],
    OrgEmailAddress: ['',[Validators.required, Validators.email]],
    Address1: ['',[Validators.required]],
    Address2: [''],
    Address3: [''],
    City: ['', [Validators.required]],
    State: ['', Validators.required],
    Zip: ['', [Validators.required]],
    Website: [''],
    Facebook: [''],
    Twitter: [''],
    LinkedIN: [''],
    AccountName: [''],
    PrintMessage: [''],
    WebMessage: [''],
    PhoneNumber: [''],
    ContactName:[''],
    EmailAddress:['',[Validators.email]],
    OnlineCreditGL: [0,[Validators.required]],
    OfflinePaymentGL: [0, [Validators.required]],
    ProcessingFeeGL: [0, [Validators.required]],
    SalesReturnGL: [0, [Validators.required]],
    WriteOffGL: [0, [Validators.required]],
    },
    {
    validator: this.zipValidator('Zip')}
    );
  
  faEdit = faEdit;
  stateList: any[];
  addErrorMessages : any = {};
  organizationId : any;
  isAddNewRecord: boolean;
  submitted: boolean;
  isViewOnly: boolean;
  headerImage: any;
  footerImage: any;
  logoImage: any;
  organization: any;
  glAccountList: any[];
  isPageValid: boolean;
  formData = new FormData();
  currentUser: any;
  isAccNameFieldDisabled : boolean;

  constructor(private fb: FormBuilder,
              private lookupService: LookupService,
              private breadcrumbService: AppBreadcrumbService,
              private organizationService: OrganizationService,
              private messageService: MessageService,
              private router: Router,
              private route: ActivatedRoute,
              private glChartOfAccountService: GLChartOfAccountService,
              private authService: AuthService) {
              this.breadcrumbService.setItems([
              {label: 'Home', routerLink: ['/']},
              {label: 'Organization List', routerLink: ['setup/organization']},
              {label: 'Organization Details'}
          ]);
     }

  ngOnInit(): void {
    this.currentUser = this.authService.currentUserValue;
    if(this.currentUser.isAdmin)
    {
      this.isAccNameFieldDisabled = false;
    }
    else
    {
      this.isAccNameFieldDisabled = true;
    }
    this.isViewOnly=false;
    this.isAddNewRecord=false;
    this.route.queryParams.subscribe(params => {
      if ( params['isViewOnly'] ==='true'){
        this.isViewOnly = true;
      };

      if ( params['isAddNewRecord'] ==='true'){
        this.isAddNewRecord = true;
      };

      this.organizationId = params['organization'];

      console.log('isViewOnly :' +this.isViewOnly )
      console.log('isAddNewRecord :' +this.isAddNewRecord )
		});

    if(this.organizationId> 0){
      this.getOrganizationById();
    }

    this.getStatesLookup();
    this.getGlAccountList();

    if (this.isAddNewRecord){
      this.organizationForm.reset();
      this.organizationForm.get('AccountName').setValue('Company');
    }
  }

  getOrganizationById(){
    let params = new HttpParams();
    params = params.append('organizationId',this.organizationId.toString());
    const opts = {params: params};
    this.organizationService.getOrganizationById(opts).subscribe((data: any[]) =>
    {
      console.log(data);
      this.organization = data;
      if(this.organization) {
        this.isAddNewRecord = false;
        this.getImage('header');
        this.getImage('footer');
        this.getImage('logo');
  
        this.organizationForm.get('OrganizationId').setValue(this.organization.organizationId);      
        this.organizationForm.get('Name').setValue(this.organization.name);
        this.organizationForm.get('Name').disable({ onlySelf: true });
        this.organizationForm.get('Title').setValue(this.organization.title);
        this.organizationForm.get('Code').setValue(this.organization.code);
        this.organizationForm.get('OrgPhoneNumber').setValue(this.organization.phone);      
        this.organizationForm.get('OrgEmailAddress').setValue(this.organization.email);
        this.organizationForm.get('Address1').setValue(this.organization.address1);
        this.organizationForm.get('Address2').setValue(this.organization.address2);
        this.organizationForm.get('Address3').setValue(this.organization.address3);
        this.organizationForm.get('State').setValue(this.organization.state.toString());
        this.organizationForm.get('City').setValue(this.organization.city);
        this.organizationForm.get('Zip').setValue(this.organization.zip);
        this.organizationForm.get('Website').setValue(this.organization.website);
        this.organizationForm.get('Facebook').setValue(this.organization.facebook);
        this.organizationForm.get('Twitter').setValue(this.organization.twitter);
        this.organizationForm.get('LinkedIN').setValue(this.organization.linkedIn);
        this.organizationForm.get('AccountName').setValue(this.organization.accountName!='' ? this.organization.accountName : 'Company');
        this.organizationForm.get('PrintMessage').setValue(this.organization.printMessage);
        this.organizationForm.get('WebMessage').setValue(this.organization.webMessage);
        this.organizationForm.get('ContactName').setValue(this.organization.primaryContactName);
        this.organizationForm.get('PhoneNumber').setValue(this.organization.primaryContactPhone);
        this.organizationForm.get('EmailAddress').setValue(this.organization.primaryContactEmail);
        this.organizationForm.get('OnlineCreditGL').setValue(this.organization.accountingsetups[0].onlineCreditGlAccount.toString());
        this.organizationForm.get('OfflinePaymentGL').setValue(this.organization.accountingsetups[0].offLinePaymentGlAccount.toString());
        this.organizationForm.get('SalesReturnGL').setValue(this.organization.accountingsetups[0].salesReturnGlAccount.toString());
        this.organizationForm.get('ProcessingFeeGL').setValue(this.organization.accountingsetups[0].processingFeeGlAccount.toString());
        this.organizationForm.get('WriteOffGL').setValue(this.organization.accountingsetups[0].writeOffGlAccount.toString());
      }
    });
  }

  getStatesLookup()
  {
    let params = new HttpParams();
    params = params.append('name','States');
    this.lookupService.getLookupValues(params).subscribe((data: any[]) =>
    {
      console.log(data);
      this.stateList = data;
    });
  }

  getGlAccountList(){
    this.glChartOfAccountService.getGlAccountsSelectList().subscribe((data: any[]) => {
      console.log(data);
      this.glAccountList = data;
    });
  }

  saveOrganization(){
    this.submitted = true;
    const body  = this.getFormData();
    console.log('Form Data:' + JSON.stringify(body));

    if (this.organizationForm.valid)
    {
      this.isPageValid = true;

      if (this.isAddNewRecord)
      {
        console.log('Adding Organization:' +  JSON.stringify(body));
        this.organizationService.createOrganization(body).subscribe(
          response => {
            this.organizationId = response.organizationId;
            console.log(response.organizationId);
            
            this.messageService.add({ severity: 'success',
                                      summary: 'Successful',
                                      detail: 'Organization record added succesfully.',
                                      life: 3000
                                    });
            this.submitted = false;
            
            this.formData.append('organizationId', this.organizationId.toString());
            this.organizationService.uploadOrganizationImage(this.formData).subscribe((data: any) =>
            {

              this.organizationForm.reset();
              this.formData = new FormData();
              setTimeout(()=> 
              this.router.navigate(['setup/organization']), 3000);
            });
          },
          error => {
            console.log(error);
            this.messageService.add({ severity: 'error', summary: 'Error', detail: error, life: 3000 });
          });
      }
      else
      {
        if(body.AccountName == '')
        {
          body.AccountName='Company';
        }
        console.log('Updating Organization:' +  JSON.stringify(body));
        this.organizationService.updateOrganization(body).subscribe(
          response => {
            let user = JSON.parse(localStorage.getItem('currentUser'));
            if(user.organizationId == body.OrganizationId)
            {
              user.accountName = body.AccountName;
              localStorage.setItem('currentUser', JSON.stringify(user));
            }
            this.messageService.add({ severity: 'success',
                                      summary: 'Successful',
                                      detail: 'Organization record updated succesfully.',
                                      life: 3000
                                    });
            this.submitted = false;
            this.organizationForm.reset();
            setTimeout(()=> 
            this.router.navigate(['setup/organization']), 3000); 
          },
          error => {
            console.log(error);
            this.messageService.add({ severity: 'error', summary: 'Error', detail: error, life: 3000 });
          });
      }

    }
  }

  getFormData()
  {
    const  accountingSetUpModel = {
      OnlineCreditGlAccount: this.organizationForm.get('OnlineCreditGL').value ? parseInt(this.organizationForm.get('OnlineCreditGL').value) : 0,
      OffLinePaymentGlAccount: this.organizationForm.get('OfflinePaymentGL').value ? parseInt(this.organizationForm.get('OfflinePaymentGL').value) : 0,
      SalesReturnGlAccount: this.organizationForm.get('SalesReturnGL').value ? parseInt(this.organizationForm.get('SalesReturnGL').value) : 0,
      ProcessingFeeGlAccount: this.organizationForm.get('ProcessingFeeGL').value ? parseInt(this.organizationForm.get('ProcessingFeeGL').value) : 0,
      WriteOffGlAccount: this.organizationForm.get('WriteOffGL').value ? parseInt(this.organizationForm.get('WriteOffGL').value) : 0,
    }

    const zip = this.organizationForm.get('Zip').value.replace(/[_]/g, '').length === 6 ? 
                this.organizationForm.get('Zip').value.replace(/[_-]/g, '') : this.organizationForm.get('Zip').value;

    const body = {
      OrganizationId: this.organizationForm.get('OrganizationId').value??0,
      Name: this.organizationForm.get('Name').value,
      Title: this.organizationForm.get('Title').value,
      Code: this.organizationForm.get('Code').value,
      Phone: this.organizationForm.get('OrgPhoneNumber').value,
      Email: this.organizationForm.get('OrgEmailAddress').value,
      Address1: this.organizationForm.get('Address1').value,
      Address2: this.organizationForm.get('Address2').value,
      Address3: this.organizationForm.get('Address3').value,
      State: this.organizationForm.get('State').value,
      City: this.organizationForm.get('City').value,
      Zip: zip,
      Website: this.organizationForm.get('Website').value,
      Facebook: this.organizationForm.get('Facebook').value,
      Twitter: this.organizationForm.get('Twitter').value,
      AccountName : this.organizationForm.get('AccountName').value,
      LinkedIn: this.organizationForm.get('LinkedIN').value,
      PrintMessage: this.organizationForm.get('PrintMessage').value,
      WebMessage: this.organizationForm.get('WebMessage').value,
      PrimaryContactName: this.organizationForm.get('ContactName').value,
      PrimaryContactPhone: this.organizationForm.get('PhoneNumber').value,
      PrimaryContactEmail: this.organizationForm.get('EmailAddress').value,
      AccountingSetUpModel: accountingSetUpModel  
    };
    return body;
  }

  isFieldValid(field: string) { 
    if ((!this.organizationForm.get(field).valid) && (this.submitted) && (this.organizationForm.get(field).hasError('required'))){
      if (field=='Name')
        field = 'Organization Name'
      if (field=='Title')
        field = 'Organization Title'
      if (field=='Code')
        field = 'Code'
      if (field=='OrgPhoneNumber')
        field = 'Organization Phone Number'
      if (field=='City')
        field = 'City'
      if (field=='Zip')
        field = 'Zip'
      if (field=='OrgEmailAddress')
        field = 'Organization Email'
      if (field=='Address1')
        field = 'Address 1'
        if (field=='AccountName')
        field = 'Account Name'
      this.addErrorMessages =  { errorType: 'required', controlName: field };
      if ((field=='State') || (field=='OnlineCreditGL') || (field=='OfflinePaymentGL') || (field=='ProcessingFeeGL') || (field=='SalesReturnGL')){
        this.addErrorMessages =  { errorType: 'dropdownrequired', controlName: field };
      }
      return true;
    }
    if (!this.organizationForm.get(field).valid && this.organizationForm.get(field).hasError('email')){
      this.addErrorMessages =  { errorType: 'email', controlName: field };
      return true;
    }
    if (!this.organizationForm.get(field).hasError('required') && this.organizationForm.get(field).hasError('zipLengthError')){    
      this.addErrorMessages =  {errorType: 'creditcardminlength', controlName: field, errorMessage: "Enter 5 or 9 digits" };
      return true;
    }
  }

  errorIconCss(field: string) {
    return {      
      'has-feedback': this.isFieldValid(field)
    };
  }

  errorFieldCss(field: string) {
    return {           
      'ng-dirty': this.isFieldValid(field)
    };
  }

  onFileSelected(event, imageType: string) {
    const file: File = event.target.files[0];

    if (file) {
      this.uploadImage(file, imageType);
      let reader = new FileReader();
        reader.addEventListener('load', () => {
          if(imageType === 'header') {this.headerImage = [reader.result];}
          if(imageType === 'footer') {this.footerImage = [reader.result];}
          if(imageType === 'logo') {this.logoImage = [reader.result];}
        }, false);
        reader.readAsDataURL(file);
    }
  }

  uploadImage(file, imageType: string){

    this.formData.append(imageType, file);

    if(!this.isAddNewRecord){        
      this.formData.append('organizationId', this.organizationId.toString());
      this.organizationService.uploadOrganizationImage(this.formData).subscribe((data: any) =>
      {
        console.log(data);
        this.getImage(imageType);
      });
      this.formData = new FormData();
    }
  }

  getImage(title: string)
  {
    this.organizationService.getOrganizationImage(this.organizationId, title).subscribe(data => {
        return new Promise((resolve, reject) => {
          let reader = new FileReader();
          reader.addEventListener('load', () => {
            if(title === 'header') {this.headerImage = [reader.result];}
            if(title === 'footer') {this.footerImage = [reader.result];}
            if(title === 'logo') {this.logoImage = [reader.result];}
          }, false);
          if (data) {
            reader.readAsDataURL(data);
          }
        }
        );
      }, error => {
        console.log(error);
      });
  }

  zipValidator(controlName: string)
  {
    return (formGroup: FormGroup) =>
    {
      const control = formGroup.controls[controlName];
      if(control.errors && !control.errors.zipLengthError)
      {
        // return if another validator has already found an error
        return;
      }
      let zip = control.value.replace(/[_-]/g, '');     
      const zipLength = (zip.length == 5) ? true : (zip.length == 9) ? true : false;  
      return zipLength ? control.setErrors(null) : control.setErrors({ 'zipLengthError': true });
    }    
  }

}
