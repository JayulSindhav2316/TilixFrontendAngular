import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { FeesComponent } from 'src/app/shared/fees/fees.component';
import { AppBreadcrumbService } from 'src/app/app.breadcrumb.service';
import { Router } from '@angular/router';
import { delay } from 'rxjs/operators';
import { MembershipFee } from '../../../models/membership-fee';
import { MembershipType } from '../../../models/membership-type';
import { MembershipService } from '../../../services/membership.service';
import { HttpParams, JsonpClientBackend } from '@angular/common/http';


@Component({
  selector: 'app-membership-details',
  templateUrl: './membership-details.component.html',
  styleUrls: ['./membership-details.component.scss'],
  providers: [MessageService, ConfirmationService, FeesComponent]
})
export class MembershipDetailsComponent implements OnInit {

  membershipDialog: boolean;
  feeDialog: boolean;
  membershipTypeList: MembershipType[];
  membershipType: MembershipType;
  selectedMemberships: MembershipType[];
  items: MenuItem[];
  selectedPeriod: { name: string; code: string; };
  selectedType: { name: string; code: string; };
  responseArray: any[];
  membershipFee: MembershipFee;
  submitted: boolean;
  isAddNewRecord: boolean;
  typeList: any[];
  cols: any[];

  periodList: any[];
  frequencyList: any[];
  categoryList: any[];
  frequencies: any[];
  glAccountList: any[];

  membershipDetailForm = this.formBuilder.group({
  MembershipTypeId: [0],

  Code: ['', [Validators.required, this.noBlankValidator]],
  Name: ['', [Validators.required, this.noBlankValidator]],
  Description: ['', [Validators.required, this.noBlankValidator]],

  Period: ['', Validators.required],
  Frequency: ['', Validators.required],
  Category: ['', Validators.required],
  Status: [true],
  Units:[1],
  Fees: this.formBuilder.array([])});
  addErrorMessages : any = {};

get Fees() {
    return this.membershipDetailForm.get('Fees') as FormArray;
  }

  constructor(private formBuilder: FormBuilder, 
              private messageService: MessageService, 
              private breadcrumbService: AppBreadcrumbService,
              private membershipService: MembershipService, 
              private router: Router) {
   if (this.router.url.includes("/setup/membershipDetails")) {
   this.breadcrumbService.setItems([
        {label: 'Home'},
        {label: 'Set Up'},
        {label: 'Membership Types', routerLink: ['/setup/membership']},
        {label: 'New Membership Type'}
    ]);}
    if (this.router.url.includes("/setup/membershipDetails/Update")) {
      this.breadcrumbService.setItems([
           {label: 'Home'},
           {label: 'Set Up'},
           {label: 'Membership Types', routerLink: ['/setup/membership']},
           {label: 'Edit Membership Type'}
       ]);}

}

ngOnInit(): void {
 
  this.getMemershipPeriodList();
  this.getMemershipCategoryList();
  this.getMemershipGlAccountList();
  
  if (history.state.isAddNewRecord == undefined)
    history.state.isAddNewRecord  = true;
  if (history.state.isAddNewRecord){
      this.membershipDetailForm.reset();
      this.membershipDetailForm.get('MembershipTypeId').setValue(0);
      this.membershipDetailForm.get('Status').setValue(true);
    }
    else
    {
      this.membershipType = history.state.membershipType;  
        this.getMembershipPaymentFrequencyList(this.membershipType.period.toString());
        console.log('Status:'+this.membershipType.status);
        let status=false;
        if(this.membershipType.status===1){
          status=true;
        }
        this.membershipDetailForm.get('MembershipTypeId').setValue(this.membershipType.membershipTypeId);
        this.membershipDetailForm.get('Code').setValue(this.membershipType.code);
        this.membershipDetailForm.get('Name').setValue(this.membershipType.name);
        this.membershipDetailForm.get('Description').setValue(this.membershipType.description);
        this.membershipDetailForm.get('Period').setValue(this.membershipType.period.toString());
        this.membershipDetailForm.get('Frequency').setValue(this.membershipType.paymentFrequency.toString());
        this.membershipDetailForm.get('Status').setValue(status);
        this.membershipDetailForm.get('Category').setValue(this.membershipType.category.toString());
        this.membershipDetailForm.get('Units').setValue(this.membershipType.units.toString());
        this.membershipType.membershipFees.forEach(fee => {
          const membershipFee: any =  {};
          membershipFee.Description = fee.description;
          membershipFee.Name = fee.name;
          membershipFee.FeeAmount = fee.feeAmount;
          membershipFee.GlAccountId = fee.glAccountId.toString();
          membershipFee.BillingFrequency =  fee.billingFrequency;
          membershipFee.IsRequired = fee.isRequired;
          membershipFee.FeeId = fee.feeId;
          this.Fees.push(this.formBuilder.control(membershipFee));
    });
 
    }
  }

  addFee() {
    this.submitted=false;
    if (this.Fees.length === 5){
      this.messageService.add({severity: 'info', summary: 'Info', detail: 'You can have only 5 fees for a membership.'});
    }
    else {
      this.Fees.push(this.formBuilder.control(''));
    }
  }

  removeFee(i: number) {
    if (this.Fees.length === 1){
      this.messageService.add({severity: 'error', summary: 'Error', detail: 'You need to have atleast one fee.', life: 3000});
    }
    else if (this.Fees.value[i]=='' || this.Fees.value[i].FeeId==undefined || this.Fees.value[i].FeeId === 0){
      this.messageService.add({ severity: 'success',
                                summary: 'Successful',
                                detail: 'Membership Fee deleted succesfully.',
                                life: 3000
                              });
      this.Fees.removeAt(i);
    }

    else if (this.Fees.value[i].FeeId > 0){
    const body = {
      FeeId: this.Fees.value[i].FeeId
    };
    console.log('Deleting Fee:'+  JSON.stringify(body));
    this.membershipService.deleteMembershpFee(body).subscribe(
      response => {
        this.messageService.add({ severity: 'success',
                                  summary: 'Successful',
                                  detail: 'Membership Fee deleted succesfully.',
                                  life: 3000
                                });
        this.Fees.removeAt(i);
      },
      error => {
        console.log(error);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: error, life: 3000 });
      });
    
    }
  }

  saveMembership(){
    
    this.submitted = true;
    if (this.membershipDetailForm.valid){

      if (this.Fees.length === 0) {
        this.messageService.add({severity: 'error', summary: 'Error', detail: 'You need to have atleast one fee.', life: 3000});
      }
      else {
        let status =  0;
        if(this.membershipDetailForm.get('Status').value){
          status  = 1;
        }
        const body = {
          MembershipTypeId: this.membershipDetailForm.get('MembershipTypeId').value,
          Code: this.membershipDetailForm.get('Code').value,
          Name: this.membershipDetailForm.get('Name').value,
          Description: this.membershipDetailForm.get('Description').value,
          Period: this.membershipDetailForm.get('Period').value,
          PaymentFrequency: this.membershipDetailForm.get('Frequency').value,
          Status: status,
          Category: this.membershipDetailForm.get('Category').value,
          MembershipFees: this.membershipDetailForm.get('Fees').value,
          Units: this.membershipDetailForm.get('Units').value??1
        };
        if (body.MembershipFees.filter(obj=>obj.IsRequired==true).length == 0){
          this.messageService.add({severity: 'error', summary: 'Error', detail: 'You need to have atleast one required fee.', life: 3000});
        }  else

        if (body.MembershipFees.filter(obj=>obj.GlAccountId=='All').length != 0){
          this.messageService.add({severity: 'error', summary: 'Error', detail: 'Please select a GL Account', life: 3000});
        }  else
             
        if (history.state.isAddNewRecord){
         console.log('Adding MembershipType:' +  JSON.stringify(body));
         this.membershipService.createMembershipType(body).subscribe(
          response => {
            
            this.messageService.add({ severity: 'success',
                                      summary: 'Successful',
                                      detail: 'Membership Type added successfully.',
                                      life: 3000
                                    }); 
                                    setTimeout(()=>                                       // navigate to main
                                    this.router.navigate(['setup/membership'], {
                                     state: { membershipType: '', isAddNewRecord: false }
                                   }), 3000)        

          },
          error => {
            console.log(error);
            this.messageService.add({ severity: 'error', summary: 'Error', detail: error, life: 3000 });
          });
        }
        else {
          console.log('Updating MembershipType:' +  JSON.stringify(body));
          this.membershipService.updateMembershipType(body).subscribe(
           response => {
             this.messageService.add({ severity: 'success',
                                       summary: 'Successful',
                                       detail: 'Membership Type updated successfully.',
                                       life: 3000
                                     });
                                     setTimeout(()=>  
            // navigate to main
             this.router.navigate(['setup/membership'], {
              state: { membershipType: '', isAddNewRecord: false }
            }), 3000)  ;
           },
           error => {
             console.log(error);
             this.messageService.add({ severity: 'error', summary: 'Error', detail: error, life: 3000 });
           });
        }
      }
    }
    else{
      this.messageService.add({severity: 'error', summary: 'Error', detail: 'Please fix the error(s) on the page.', life: 3000});
    }
  }
getPaymentFrequencyList(event){
  console.log("Selected Period:"+JSON.stringify(event));
  this.getMembershipPaymentFrequencyList(event.value)
}
async getMembershipPaymentFrequencyList(period: string){
  let params = new HttpParams();
  params = params.append('period',period);
  const opts = {params: params};
  this.membershipService.getMembershipPaymentFrequencyList(opts).subscribe((data: any[]) => {
    this.frequencyList = data;
  });
}
getMemershipPeriodList(){
  this.membershipService.getMembershipPeriodList().subscribe((data: any[]) => {
    this.periodList = data;
  });
}
getMemershipCategoryList(){
  this.membershipService.getMembershipCategoryList().subscribe((data: any[]) => {
    this.categoryList = data;
  });
}
getMemershipGlAccountList(){
  this.membershipService.getMembershipGlAccountList().subscribe((data: any[]) => {
    this.glAccountList = data;
  });
}

errorIconCss(field: string) {
  return { 'has-feedback': this.isFieldValid(field) };
}

errorFieldCss(field: string) {
  return { 'ng-dirty': this.isFieldValid(field) };
}

isFieldValid(field: string) {    
  if ((!this.membershipDetailForm.get(field).valid) && (this.submitted) && (this.membershipDetailForm.get(field).hasError('required'))){
    this.addErrorMessages =  { errorType: 'required', controlName: field };
    if (field=='Period') 
    this.addErrorMessages =  { errorType: 'dropdownrequired', controlName: field };
    if (field=='Category') {
      field = 'Membership Category'
    this.addErrorMessages =  { errorType: 'dropdownrequired', controlName: field };}
    return true;
  }
}

resetSubmitted(field){
  this.submitted = false;
  this.isFieldValid(field);
}

otherFormClicked(removeValidations: boolean){
  if (removeValidations==false)
      this.submitted = false;
}

matcher(event: ClipboardEvent, formControlName: string): boolean {
  var allowedRegex = "";
  if (formControlName == 'Name') 
      allowedRegex = ("^[A-Za-z ']{0,30}$");
  if (formControlName == 'Code') 
      allowedRegex = ("^[A-Za-z0-9-]{0,20}$");
  if (event.type == "paste") {
    let clipboardData = event.clipboardData;
    let pastedText = clipboardData.getData('text'); 
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

