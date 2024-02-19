import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { AppBreadcrumbService } from 'src/app/app.breadcrumb.service';
import { PromoCodeService } from 'src/app/services/promo-code.service';
import { GLChartOfAccountService } from 'src/app/services/glchart-of-account.service';
import { FormBuilder, Validators, FormControl } from '@angular/forms';
import * as moment from 'moment';

@Component({
  selector: 'app-promo-code',
  templateUrl: './promo-code.component.html',
  styleUrls: ['./promo-code.component.scss'],
  providers: [MessageService, ConfirmationService]
})
export class PromoCodeComponent implements OnInit {
  promoCodeList: any[]
  showTable: boolean;
  items: MenuItem[];
  selectedPromoCode: any;
  promoCodeDialog: boolean;
  submitted: boolean;
  addErrorMessages : any = {};
  headerName: string;
  addNewRecord: boolean;
  glAccountsList: { name: string; code: string; }[];
  discountTypes: { name: string; code: string; }[];
  transactionTypes: { name: string; code: string; }[];

  selectedType: { name: string; code: string; }
  selectedTransactionType: { name: string; code: string; }
  currentDate: Date = new Date();
  maxDate: Date = new Date("12/31/9999");
  premiumDiscount: boolean;
  promoCodeForm = this.formBuilder.group({
    PromoCodeId: [0],
    Code: ['', [Validators.required]],     
    Description: ['', [Validators.required]],
    Type: [0],
    Discount: ['', [Validators.required]],            
    GlAccount: ['', Validators.required],
    Status: [true],
    StartDate:[this.currentDate, []],
    EndDate:[this.maxDate, []],
    TransactionType:[0]
  });
  discountTypeAmount: boolean;
  editRecord: boolean;
  constructor(private router: Router,
    private formBuilder: FormBuilder,
    private promoCodeService: PromoCodeService,
    private breadcrumbService: AppBreadcrumbService,
    private messageService: MessageService,
    private gLChartOfAccountService: GLChartOfAccountService,
    private confirmationService: ConfirmationService) { this.breadcrumbService.setItems([
{label: 'Home', routerLink: ['/']},
{label: 'Promo Codes'}
]);
this.showTable=false;
this.promoCodeDialog = false;
this.submitted = false;
this.addNewRecord = false;
this.editRecord = false;
this.premiumDiscount = false;
  this.selectedType = {name: 'Percentage', code: '0'};
  this.promoCodeForm.get('Type').setValue(this.selectedType);
}

  ngOnInit(): void {
    this.getAllPromoCodes();
    this.getGlAccounts();
    this.getDiscountTypes();
    this.getTransactionTypes();
    this.discountTypeAmount=false;
    this.items = [{
      label: 'Options',
      items: [
      {
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
            this.delete();
        }
      }
    ]}
    ];
  }

  changeDiscountType(){
    if(this.promoCodeForm.get('Type').value === 1){
      this.discountTypeAmount=true;
    }
    else {
      this.discountTypeAmount=false;
    }
    //Premium Discount is defined at checkout so disable it
    if(this.promoCodeForm.get('Type').value === 2){
      this.premiumDiscount=true;
      this.promoCodeForm.get('Discount').setValue(0);
    }
    else {
      this.premiumDiscount=false;
    }
  }
  update(){
    this.discountTypeAmount=false;
    this.promoCodeForm.get('Type').setValue(this.selectedType);

    if(this.selectedPromoCode.discountType === 1){
      this.discountTypeAmount=true;
    } 
    this.promoCodeForm.reset();
    this.submitted = false;
    this.promoCodeDialog = true;
    this.addNewRecord = false;
    this.editRecord = true;
    this.headerName = "Edit Promo Code :" + this.selectedPromoCode.code;
    this.promoCodeForm.get('PromoCodeId').setValue(this.selectedPromoCode.promoCodeId);
    this.promoCodeForm.get('Code').setValue(this.selectedPromoCode.code);
    this.promoCodeForm.get('Description').setValue(this.selectedPromoCode.description);
    this.promoCodeForm.get('Type').setValue(this.selectedPromoCode.discountType);
    this.promoCodeForm.get('Discount').setValue(this.selectedPromoCode.discount);
    this.promoCodeForm.get('GlAccount').setValue(this.selectedPromoCode.glAccountId.toString());
    this.promoCodeForm.get('StartDate').setValue(new Date (this.selectedPromoCode.startDate));
    this.promoCodeForm.get('EndDate').setValue(new Date (this.selectedPromoCode.expirationDate));
    this.promoCodeForm.get('TransactionType').setValue(this.selectedPromoCode.transactionType);

    if(this.promoCodeForm.get('Type').value === 2){
      this.premiumDiscount=true;
      this.promoCodeForm.get('Discount').setValue(0);
    }
    else {
      this.premiumDiscount=false;
    }
    if (this.selectedPromoCode.status === 1)
    {
      this.promoCodeForm.get('Status').setValue(true);
    }
    
  }

  delete(){
    console.log('Deleteing:' + this.selectedPromoCode.promoCodeId);
    const body = {
      PromoCodeId: this.selectedPromoCode.promoCodeId
    };

    this.confirmationService.confirm({
      message: 'Are you sure you want to delete this Promo Code ?',
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () =>
      {
        this.promoCodeService.deletePromoCode(body).subscribe(
          response =>
          {
            this.messageService.add({
              severity: 'success',
              summary: 'Successful',
              detail: 'Promo Code deleted succesfully.',
              life: 3000
            });
            this.getAllPromoCodes();
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
    this.submitted=false;
    this.addNewRecord=true;
    this.promoCodeForm.reset();
    this.promoCodeDialog = true;
    this.editRecord = false;
    this.promoCodeForm.get('Status').setValue(true);
    this.headerName = "Add Promo Code";
    this.promoCodeForm.get('StartDate').setValue(new Date (this.currentDate));
    this.promoCodeForm.get('EndDate').setValue(new Date (this.maxDate));
    this.promoCodeForm.get('TransactionType').setValue(0);
    this.promoCodeForm.get('Type').setValue(0);
  }
  setActiveRow(promoCode: any){
    this.selectedPromoCode = promoCode;
    console.log(JSON.stringify(promoCode));
  }


  getAllPromoCodes(){
    this.promoCodeService.getAllPromoCodes().subscribe((data: any[]) => {
      console.log(data);
      if ((data.length > 0)) {
        this.promoCodeList = data;
        this.showTable=true;
        
      }
      
    });
  }

  getDiscountTypes(){
    this.promoCodeService.getDiscountTypes().subscribe((data: any[]) => {
      console.log(data);
      if ((data.length > 0)) {
        this.discountTypes = data;
      }
    });
  }

  getTransactionTypes(){
    this.promoCodeService.getTransactionTypes().subscribe((data: any[]) => {
      console.log(data);
      if ((data.length > 0)) {
        this.transactionTypes = data;
      }
    });
  }

  getGlAccounts(){
    this.gLChartOfAccountService.getGlAccountsSelectList().subscribe((data: any[]) => {
      console.log(data);
      if ((data.length > 0)) {
        this.glAccountsList = data;
      }
    });
  }

  getPromoCode(){
    this.promoCodeService.getNewPromoCode().subscribe((data: any) => {
      console.log(data);
      if ((data.code.length > 0)) {
        this.promoCodeForm.get('Code').setValue(data.code);
        
      }
      
    });
  }

  

  savePromoCode(){
    this.submitted = true;
    let statusValue = 0;
    var discountType = 0;
    let discount = parseFloat(this.promoCodeForm.get('Discount').value);
    discountType = this.promoCodeForm.get('Type').value;
    console.log('Discount Type:' + JSON.stringify(this.promoCodeForm.get('Type').value));

    if (this.promoCodeForm.get('Status').value === true)
    {
      statusValue = 1;
    }
    if(discountType === 0){
      if(discount > 100){
        this.messageService.add({ severity: 'warn', summary: 'Warning', detail: 'Discount can not be more than 100%', life: 3000 });
        return;
      }
    }

    if (this.promoCodeForm.valid)
    {
      const body = {
        PromoCodeId: this.promoCodeForm.get('PromoCodeId').value,
        Code: this.promoCodeForm.get('Code').value,
        Description: this.promoCodeForm.get('Description').value,
        DiscountType: discountType,
        Discount: this.promoCodeForm.get('Discount').value,
        GlAccountId: this.promoCodeForm.get('GlAccount').value,
        Status: statusValue,
        StartDate: moment(this.promoCodeForm.get('StartDate').value).utc(true).format(),
        ExpirationDate: moment(this.promoCodeForm.get('EndDate').value).utc(true).format(),
        TransactionType: this.promoCodeForm.get('TransactionType').value,
      };

      
      if (this.addNewRecord)
      {
        console.log('form:'+ JSON.stringify(body));
        if (body.PromoCodeId==null)
        body.PromoCodeId=0;
        this.promoCodeService.createPromoCode(body).subscribe(
          response =>
          {
            console.log(response);
            this.messageService.add({
              severity: 'success',
              summary: 'Successful',
              detail: 'Promo Code created succesfully.',
              life: 3000
            });
            this.hideDialog();
            this.getAllPromoCodes();
          },
          error =>
          {
            console.log(error);
            this.messageService.add({ severity: 'error', summary: 'Error', detail: error, life: 3000 });
          });

      }
      else
      {
        console.log(this.promoCodeForm.value);
        this.promoCodeService.updatePromoCode(body).subscribe(
          response =>
          {
            console.log(response);
            this.messageService.add({
              severity: 'success',
              summary: 'Successful',
              detail: 'Promo Code updated succesfully.',
              life: 3000
            });
            this.hideDialog();
            this.getAllPromoCodes();
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
  
  hideDialog()
  {
    this.promoCodeDialog = false;
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
    if ((!this.promoCodeForm.get(field).valid) && (this.submitted) && (this.promoCodeForm.get(field).hasError('required'))){
      if (field=='Code'){
        this.addErrorMessages =  { errorType: 'required', controlName: field };}
      else if (field=='Description'){
        this.addErrorMessages =  { errorType: 'required', controlName: field };}
      else if (field=='Discount'){
        let discountType = this.promoCodeForm.get('Type').value;
        if(discountType != 2){
          this.addErrorMessages =  { errorType: 'required', controlName: field };
        }
      }
      else if (field=='GlAccount'){
        this.addErrorMessages =  { errorType: 'dropdownrequired', controlName: field };}
      return true;
    }
  }

  matcher(event: ClipboardEvent, formControlName: string): boolean {    
    var allowedRegex = "";
    if (formControlName == 'Code') 
        allowedRegex = ("^[A-Za-z ]{0,64}$");
    if (formControlName == 'Description') 
        allowedRegex = ("^[a-zA-Z0-9~@#$^*%()_+=[\]{}|\\,.?: -]*$");
    if (event.type == "paste") {
      let clipboardData = event.clipboardData;
      let pastedText = clipboardData.getData('text') + this.promoCodeForm.get(formControlName).value; 
      if (!pastedText.match(allowedRegex))  {
        event.preventDefault();
        return false;
     }
     return true;
    }
  }

}
