import { Component, OnInit, ViewChild } from '@angular/core';
import { InvoiceItemService } from '../../services/invoice-item.service'
import { GeneralLedgerService } from '../../services/general-ledger.service'
import { LookupService } from '../../services/lookup.service'
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { AppBreadcrumbService } from '../../app.breadcrumb.service';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { Router } from '@angular/router';
import { FormBuilder, Validators, FormControl, FormGroup } from '@angular/forms';
import { HttpParams } from '@angular/common/http';
@Component({
  selector: 'app-invoice-item',
  templateUrl: './invoice-item.component.html',
  styleUrls: ['./invoice-item.component.scss'],
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

export class InvoiceItemComponent implements OnInit {
  
  itemForm: FormGroup;
  itemList: any[];
  itemDialog: boolean;
  items: MenuItem[];
  glAccountsList: any[];
  submitted: boolean;
  cols: any[];
  glAccount: any;
  costCenterList: any[];
  addNewRecord: boolean;
  addErrorMessages : any = {};
  headerName: string;
  itemTypeList: any[];
  item: any;
  enableStock: boolean = true;

  constructor(private formBuilder: FormBuilder,
      private invoiceItemService: InvoiceItemService, 
      private breadcrumbService: AppBreadcrumbService,
      private messageService: MessageService, 
      private confirmationService: ConfirmationService,
      private router: Router,
      private generalLedgerService: GeneralLedgerService,
      private lookupService: LookupService) {
        this.breadcrumbService.setItems([
        {label: 'Home', routerLink: ['/']},
        {label: 'Set Up'},
        {label: 'Invoice Items'},
        ]);

        this.items = [{
          label: 'Options',
          items: [{
            label: 'Edit Item',
            icon: 'pi pi-user-edit',
            command: () =>
            {
              this.editItem();
            }
          },
          {
            label: 'Delete Item',
            icon: 'pi pi-trash',
            command: () =>
            {
              this.deleteItem();
            }
          }
    
          ]
        }
        ];
}

  ngOnInit(): void {
    this.initializeForm();    
    this.getGlAccountList();
    this.getInvoiceItems();
    this.getItemTypes();
  }

  getGlAccountList(){
    this.generalLedgerService.getGlAccountList().subscribe((data: any[]) => {
      console.log('GL Accounts:'+ JSON.stringify(data));
      this.glAccountsList = data;
    });
  }
  getItemTypes(){
    this.invoiceItemService.getInvoiceItemTypes().subscribe((data: any[]) => {
      console.log('Item Types:'+ JSON.stringify(data));
      this.itemTypeList = data;
    });
  }

  getInvoiceItems()
  {
    let searchParams = new HttpParams();
    searchParams = searchParams.append('status', 2);
    const opts = {params: searchParams};
    this.invoiceItemService.getInvoiceItems(opts).subscribe((data: any[]) =>
    {
      console.log(data);
      this.itemList = data;
    });
  }
  setActiveRow(item: any)
  {
    console.log('Selected Item:' + JSON.stringify(item));
    this.item = item;
  }
  openNew()
  {
    this.submitted = false;
    this.itemDialog = true;
    this.addNewRecord = true;
    this.headerName = "Add New Invoice Item";
    this.initializeForm();
  }

  editItem()
  {
    let validGL = this.validateInactiveGLAccount(this.item.itemGlAccount.toString());
    let glAccount = this.item.itemGlAccount.toString()
    if(!validGL){
      glAccount = '';
    }
    this.submitted = false;
    this.itemDialog = true;
    this.addNewRecord = false;
    let status = this.item.status === 1 ? true : false;
    let enableMemberPortal = this.item.enableMemberPortal === 1 ? true : false;
    this.enableStock = this.item.enableStock === 1 ? true : false;
    this.headerName = "Edit Invoice Item '" + this.item.itemCode + "'";
    this.itemForm.get('ItemId').setValue(this.item.itemId);
    this.itemForm.get('ItemCode').setValue(this.item.itemCode);
    this.itemForm.get('Name').setValue(this.item.name);
    this.itemForm.get('ItemType').setValue(this.item.itemType.toString());
    this.itemForm.get('Description').setValue(this.item.description);
    this.itemForm.get('GlAccount').setValue(glAccount);
    this.itemForm.get('Status').setValue(status);
    this.itemForm.get('Price').setValue(this.item.unitRate.toFixed(2));
    this.itemForm.get('TotalStock').setValue(this.item.totalStock);
    this.itemForm.get('EnableMemberPortal').setValue(enableMemberPortal);
    this.itemForm.get('EnableStock').setValue(this.enableStock);
  }

  hideDialog()
  {
    this.itemDialog = false;
  }

  saveItem()
  {
    this.submitted = true;

    let totalStock=0;
    if(this.itemForm.get('TotalStock').value){
      totalStock=this.itemForm.get('TotalStock').value;
    }
    
    if (this.itemForm.valid)
    {
      const body = {
        ItemId: this.itemForm.get('ItemId').value,
        Name: this.itemForm.get('Name').value,
        ItemType: this.itemForm.get('ItemType').value,
        Description: this.itemForm.get('Description').value,
        ItemGlAccount: Number(this.itemForm.get('GlAccount').value),
        ItemCode: this.itemForm.get('ItemCode').value,
        UnitRate: this.itemForm.get('Price').value,
        Status: this.itemForm.get('Status').value === true ? 1 : 0,
        TotalStock : this.itemForm.get('EnableStock').value == true ? totalStock : "0",
        EnableMemberPortal : this.itemForm.get('EnableMemberPortal').value === true ? 1 : 0,
        EnableStock : this.itemForm.get('EnableStock').value === true ? 1 : 0,
      };

      if (this.addNewRecord)
      {
        console.log('Item:'+JSON.stringify(body));
        if (body.ItemId==null)
        body.ItemId=0;
        this.invoiceItemService.createItem(body).subscribe(
          response =>
          {
            console.log(response);
            this.messageService.add({
              severity: 'success',
              summary: 'Successful',
              detail: 'Item created succesfully.',
              life: 3000
            });
            this.itemForm.reset();
            this.hideDialog();
            this.getInvoiceItems();
          },
          error =>
          {
            console.log(error);
            this.messageService.add({ severity: 'error', summary: 'Error', detail: error, life: 3000 });
          });

      }
      else
      {
        console.log(this.itemForm.value);
        this.invoiceItemService.updateItem(body).subscribe(
          response =>
          {
            console.log(response);
            this.messageService.add({
              severity: 'success',
              summary: 'Successful',
              detail: 'Item updated succesfully.',
              life: 3000
            });
            this.hideDialog();
            this.getInvoiceItems();
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

  deleteItem()
  {
    console.log('Deleteing:' + this.item.itemId);
    const body = {
      ItemId: this.item.itemId
    };

    this.confirmationService.confirm({
      message: 'Are you sure you want to delete this Item ?',
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () =>
      {
        this.invoiceItemService.deleteItem(body).subscribe(
          response =>
          {
            this.messageService.add({
              severity: 'success',
              summary: 'Successful',
              detail: 'Item deleted succesfully.',
              life: 3000
            });
            this.hideDialog();
            this.getInvoiceItems();
          },
          error =>
          {
            console.log(error);
            this.messageService.add({ severity: 'error', summary: 'Error', detail: error, life: 3000 });
          });
      }
    });
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
    if ((!this.itemForm.get(field).valid) && (this.submitted) && (this.itemForm.get(field).hasError('required'))){
      if (field=='ItemCode'){
        field='Item Code'
        this.addErrorMessages =  { errorType: 'required', controlName: field };}
      else if (field=='ItemType'){
        field='Item Type'
        this.addErrorMessages =  { errorType: 'required', controlName: field };}
      else if (field=='Description'){
        field='Description'
        this.addErrorMessages =  { errorType: 'required', controlName: field };}
      else if (field=='GlAccount'){
        field='Gl Account'
        this.addErrorMessages =  { errorType: 'dropdownrequired', controlName: field };}
      else if (field=='Price'){
          field='Price'
          this.addErrorMessages =  { errorType: 'required', controlName: field };}
       else if (field=='TotalStock'){
          field='Stock'
          this.addErrorMessages =  { errorType: 'required', controlName: field };}
      else this.addErrorMessages =  { errorType: 'required', controlName: field };
      return true;
    }
  }

  matcher(event: ClipboardEvent, formControlName: string): boolean {    
    var allowedRegex = "";
    if (formControlName == 'ItemCode') 
        allowedRegex = ("^[A-Za-z ]{0,64}$");
    if (formControlName == 'ItemType') 
        allowedRegex = ("^[A-Za-z0-9-]{0,50}$");
    if (formControlName == 'Description') 
        allowedRegex = ("^[A-Za-z0-9 ]{0,100}$");
  
    if (event.type == "paste") {
      let clipboardData = event.clipboardData;
      let pastedText = clipboardData.getData('text') + this.itemForm.get(formControlName).value; 
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

  validateInactiveGLAccount(glAacounCode: any){
    let glaccount = this.glAccountsList.find(x => x.code === glAacounCode);
    if(glaccount){
      return true;
    }
    else{
      return false;
    }
    console.log(glaccount);
  }

  validateStock(event: any){
    let totalStock : number = parseInt(event.target.value)
    if(totalStock < 0){
      if(this.addNewRecord){
        this.itemForm.get('TotalStock').setValue(1);
        this.itemForm.get('TotalStock').setValidators([Validators.min(1)]);
      }
      else{
        this.itemForm.get('TotalStock').setValue(this.item.totalStock);
        this.itemForm.get('TotalStock').setValidators([Validators.min(0)]);
      }
    }    
  }

  enableStockField(event: any){
    this.enableStock = event.checked;
    if(this.addNewRecord){
      this.itemForm.get('TotalStock').setValue(1);
      this.itemForm.get('TotalStock').setValidators([Validators.min(1)]);
    }
    else{
      this.itemForm.get('TotalStock').setValue(this.item.totalStock);
      this.itemForm.get('TotalStock').setValidators([Validators.min(0)]);
    }
  }

  initializeForm(){
    this.itemForm = this.formBuilder.group({
      ItemId: [0],
      Name: ['', [Validators.required, this.noBlankValidator ]],  
      ItemCode: ['', [Validators.required, this.noBlankValidator ]],     
      ItemType: ['', [Validators.required, this.noBlankValidator]],
      GlAccount: ['', Validators.required],
      Description: ['', [Validators.required, this.noBlankValidator]],            
      Price: [0.00],
      Status: [true],
      TotalStock: [1],
      EnableMemberPortal: [true],
      EnableStock: [true],
    });	
  }

   amountValidation(event) {
    if (event.target.value.trim().length == 0) {
      this.itemForm.get('Price').setValue(0);
    }

  }
}
