import { Component, OnInit, Input } from '@angular/core';
import { Table } from 'primeng/table';
import { MenuItem, MessageService } from 'primeng/api';
import { AppBreadcrumbService } from '../../../app.breadcrumb.service';
import { Router } from '@angular/router';
import { HttpParams } from '@angular/common/http';
import { PersonService } from '../../../services/person.service';
import { DatePipe } from '@angular/common';
import { ShoppingCartService } from '../../../services/shopping-cart.service';
import { AuthService } from '../../../services/auth.service';
import { MembershipService } from 'src/app/services/membership.service';
import { InvoiceService } from 'src/app/services/invoice.service';
import { InvoiceItemService } from 'src/app/services/invoice-item.service';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import * as moment from 'moment';
import { OrganizationService } from 'src/app/services/organization.service';
import { LineItemComponent } from 'src/app/shared/line-item/line-item.component';
import { EntityService } from '../../../services/entity.service';
import { CompanyService } from '../../../services/company.service';
import { ReceiptService } from '../../../services/receipt.service';
import { BehaviorSubject } from 'rxjs';
@Component({
  selector: 'app-invoices',
  templateUrl: './invoices.component.html',
  styleUrls: ['./invoices.component.scss'],
  styles: [`
       :host ::ng-deep .p-dialog {
            width: 150px;
            margin: 0 auto 2rem auto;
            display: block;
        }

        :host ::ng-deep .p-datatable table {
          width : 100% !important;
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
  providers: [MessageService]
})

export class InvoicesComponent implements OnInit {
  @Input() entityId: number;
  searchList: any[];
  person: any;
  company:any;
  showTable: boolean;
  showLoader: boolean;
  editInvoiceDialog: boolean;
  itemInvoice: boolean;
  selectedEntityId: any;
  companyInvoice: boolean;
  selectedSearch: { name: string; code: string; };

  public cols: any[];
  public invoices: any[];
  employees: { name: string; code: string; }[]=[];
  selectedEmployee: { name: string; code: string; };
  menuItems: MenuItem[];
  lastName: string;
  firstName: string;
  email: string;
  phone: string;
  companyName: string;
  invoiceItem: any;
  startDate: Date;
  endDate: Date;
  item: string;
  shoppingCart: any;
  pipe = new DatePipe('en-US');
  selectedInvoice: any;
  membershipFees: any[];
  showOptionalFee: boolean;
  invoiceDate: Date;
  dueDate: Date;
  minDate: Date;
  billableEntityId: number;
  printInvoice:boolean;
  printInvoiceId: number;
  existingFees: any[];
  optionalFees: any[];
  startDateErrorMessages: any;
  noRecords: boolean;
  addErrorMessages : any = {};
  editInvoiceForm:FormGroup;
  showrefundDialog: boolean;
  refundModes: any[];
  
  headerName: string;
  refundFormSubmitted: boolean;
  refundInoiceItem: any;
  currentUser: any;
  searchbyDateFormSubmitted: boolean;
  disableCancel: boolean;
  refundError: string;
  showError: boolean;
  organization: any;
  writeOffFormSubmitted: boolean;
  voidFormSubmitted: boolean;
  voidInoiceItem: any;
  voidError: string;
  showVoidDialog: boolean;
  isMembershipInvoice: boolean = false;
  receipt: any;
  receiptDetails: any;
  entity: any;
  billingAddress: any;
  itemModel: {
    ItemId: any;
    Description: any;
    Quantity: any;
    UnitRate: any;
  };

  invoiceDueDate: Date;
  submitted: boolean;
  showWriteOffDialog: boolean;
  writeOffError: any;
  invoiceForm = this.formBuilder.group({
  InvoiceId: [0],
  BillableEntityId: [0],
  InvoiceDueDate: ['', [Validators.required]],
  TotalAmount:[0],
  Note:[''],
  MemberEntityId:[0],
  Items: this.formBuilder.array([])});

  openMembershipEditInvoiceForm: boolean;
  openEventEditInvoiceForm: boolean;
  

get Items() {
    return this.invoiceForm.get('Items') as FormArray;
}

searchbyDateForm = this.formBuilder.group({
  startDate: ['', Validators.required],
  endDate: ['', Validators.required],
} , {
  validator: this.endDateValidator('startDate', 'endDate')
});

refundForm = this.formBuilder.group({
  receipDetailId: [0],    
  reasonRefund: ['', Validators.required],
  feePaidAmount: ['', Validators.required],
  processingFee: ['0',Validators.pattern('^[+]?([0-9]+(?:[\.][0-9]*)?|\.[0-9]+)$')],
  refundAmount: ['', Validators.required],
  refundMode: ['', Validators.required]
});

voidForm = this.formBuilder.group({
  receipId: [0],
  paymentMode: [''],    
  reasonVoid: ['', Validators.required],
  feePaidAmount: [''],
});

writeOffForm = this.formBuilder.group({
  invoiceDetailId: [0],
  reasonWriteOff: ['', Validators.required],
  writeOffAmount: ['', Validators.required],
});

entityForm = this.formBuilder.group({
  EntityId: [0],
  ContactEntity: [''],
  Phone: [''],
  Title: [''],
});
$filtered = new BehaviorSubject([]);

  constructor(private breadcrumbService: AppBreadcrumbService,
              private messageService: MessageService,
              private personService:  PersonService,
              private router: Router,
              private shoppingCartService: ShoppingCartService,
              private authService: AuthService,
              private membershipService: MembershipService,
              private invoiceService: InvoiceService, 
              private formBuilder: FormBuilder,
              private entityService: EntityService,
              private organizationService: OrganizationService,
              private companyService: CompanyService,
              private receiptService: ReceiptService) {
    this.itemInvoice = false;
    this.printInvoice = false;
    this.openMembershipEditInvoiceForm = false;
    this.openEventEditInvoiceForm = false;
    this.invoiceDueDate = new Date();
    this.invoiceForm.get('InvoiceDueDate').setValue(this.invoiceDueDate);
    this.searchList = [
      { name: 'Last 20', code: 'Last' },
      { name: 'Date', code: 'Date' },
      { name: 'Item', code: 'Item' }
    ];
    this.refundError='';
    this.showError=false;
    this.item='';
    this.printInvoiceId=0;
    this.noRecords = false;
    this.companyInvoice=false;
    this.menuItems = [{
      label: 'Options',
      items: [
       {
          label: 'Edit',
          icon: 'pi pi-pencil',
          command: () => {
              this.editInvoice();
          }
      },
      {
          label: 'Pay',
          icon: 'pi pi-credit-card',
          command: () => {
              this.addToCart();
          }
      },
      {
        label: 'Write Off',
        icon: 'pi pi-arrow-circle-down',
        command: () => {
            this.writeOffInvoice();
        }
    },
      {
        label: 'Print',
        icon: 'pi pi-print',
        command: () => {
            this.showInvoice();
        }
    }
    
    ]}
    ];
    this.showrefundDialog=false;
    this.refundFormSubmitted=false;
    this.showVoidDialog=false;
    this.voidFormSubmitted=false;
    this.showWriteOffDialog=false;
    this.writeOffFormSubmitted=false;
  }


  ngOnInit(): void {
    this.selectedSearch = { name: 'Last 20', code: 'Last' };
    this.disableCancel=false;
    this.showLoader = true;
    this.showTable = false;
    this.getEntityById();
    this.searchInvoices();
    
    
    this.currentUser = this.authService.currentUserValue;
    
  }
  setActiveRow(invoice: any){
    this.selectedInvoice = invoice;    
    this.menuItems[0].items[0].disabled = this.selectedInvoice.paid > 0 ? true : false;
    this.menuItems[0].items[1].disabled = (this.selectedInvoice.balance === 0 || this.selectedInvoice.isPaperInvoiceFinalized == false) ? true : false;
    this.menuItems[0].items[2].disabled = this.selectedInvoice.balance === 0 ? true : false;
    if(this.selectedInvoice.writeOff > 0)
    {
      this.menuItems[0].items[0].disabled = true;
    }
    
  }

  refund(invoiceDetail: any){
    this.showError=false;
    this.refundError='';
    this.refundForm.reset();
    this.refundFormSubmitted = false;
    this.refundInoiceItem =invoiceDetail;
    console.log('Selected item:'+ JSON.stringify(invoiceDetail))
    if(invoiceDetail.paid <= 0){
      this.messageService.add({ severity: 'warn', summary: 'Warning', detail: 'There is no payment to refund for.', life: 3000 });
      return;
    }
    this.getRefundModes(invoiceDetail.paymentMode);
    this.refundForm.get('processingFee').setValue('0.00');
    this.refundForm.get('feePaidAmount').setValue(parseFloat(invoiceDetail.amount).toFixed(2));
    this.refundForm.get('receipDetailId').setValue(parseFloat(invoiceDetail.receiptDetailId));
    this.disableCancel=false;
    this.showrefundDialog=true;
  }

  void(invoiceDetail: any){
    this.showError=false;
    this.voidError='';
    this.voidForm.reset();
    this.voidFormSubmitted = false;
    console.log('Selected item:'+ JSON.stringify(invoiceDetail))
    if(invoiceDetail.paid <= 0){
      this.messageService.add({ severity: 'warn', summary: 'Warning', detail: 'There is no payment to void for.', life: 3000 });
      return;
    }
    this.voidForm.get('receipId').setValue(parseFloat(invoiceDetail.receiptId));

    this.getReceiptDetailById(invoiceDetail.receiptId);
  
  }

  getReceiptDetailById(receiptId: any){
    let searchParams = new HttpParams();
    searchParams = searchParams.append('id',  receiptId);
    const opts = {params: searchParams};
    this.receiptService.getReceiptDetailById(opts).subscribe((data: any[]) =>
    {
      console.log(data);
      this.receipt = data;
      //this.receiptDetails = this.receipt.receiptDetails;
      this.disableCancel=false;
      this.voidForm.get('paymentMode').setValue(this.receipt.paymentMode);
      this.voidForm.get('feePaidAmount').setValue(this.receipt.totalAmount);
      this.showVoidDialog=true;
    });
  }

  cancelVoidDialog(){
    this.showError=false;
    this.voidError='';
    this.voidForm.reset();
    this.voidFormSubmitted = false;
    this.showVoidDialog=false;
  }

  closePrint(event){
    this.printInvoice = false;
    console.log('Event:'+event);
  }

  closeEditInvoice(){
    this.openMembershipEditInvoiceForm = false;
    this.searchInvoices();
  }

  closeEventEditInvoice(){
    this.openEventEditInvoiceForm = false;
    this.searchInvoices();
  }

  closeItemInvoice(){
    this.itemInvoice=false;
    this.searchInvoices();
  }

  createInvoice(){
    this.selectedInvoice = null;
    this.itemInvoice=true;
    this.invoiceForm.reset();
    for (let i = 0; i < this.Items.length; i++) {
      this.Items.removeAt(i);
    }
    this.invoiceForm.get('InvoiceDueDate').setValue(this.invoiceDueDate);
    this.addInvoiceItem();
  }
  getPersonById()
  {
    let searchParams = new HttpParams();
    searchParams = searchParams.append('personId',  this.entity.personId.toString());
    const opts = {params: searchParams};
    this.personService.getPersonById(opts).subscribe((data: any[]) =>
    {
      console.log(data);
      this.person = data;
    });
  }
  getEntityById()
  {
    let searchParams = new HttpParams();
    searchParams = searchParams.append('entityId',  this.entityId.toString());
    const opts = {params: searchParams};
    this.entityService.getEntityById(opts).subscribe((data: any[]) =>
    {
      console.log(data);
      this.entity = data;
      if(this.entity.personId){
        this.getPersonById();
        this.companyInvoice=false;
      }
      else {
        this.getCompanyById();
        this.companyInvoice=true;
      }
    });
  }
  getCompanyById()
  {
    let searchParams = new HttpParams();
    searchParams = searchParams.append('companyId',  this.entity.companyId.toString());
    const opts = {params: searchParams};
    this.companyService.getCompanyById(opts).subscribe((data: any[]) =>
    {
      console.log(data);
      this.company = data;
      this.getByEmployeesByEntity();
    });
  }
  searchInvoices() {
    if(this.selectedSearch.name == "Date"){
      this.searchbyDateFormSubmitted = true;
      if (this.searchbyDateForm.invalid){
        this.showLoader = false;
        this.messageService.add({ severity: 'warn', summary: 'Invalid Search', detail: 'Please enter valid dates.', life: 3000 });
        return;}
    }
    if(this.selectedSearch.name == "Item"){
      if(this.item == null || this.item =='') {
        this.showLoader = false;
        this.messageService.add({ severity: 'warn', summary: 'Invalid search', detail: 'Please enter the search criteria.', life: 3000 });
        return
      }
    }
    this.showTable = false;
    this.showLoader = true;
    const startDate =  this.pipe.transform(this.startDate, 'MM/dd/yyyy');
    const endDate =  this.pipe.transform(this.endDate, 'MM/dd/yyyy');
    
    let searchParams = new HttpParams();
    searchParams = searchParams.append('entityId', this.entityId.toString());
    searchParams = searchParams.append('serachBy', this.selectedSearch.name);
    searchParams = searchParams.append('itemDescription', this.item);
    searchParams = searchParams.append('startDate', startDate);
    searchParams = searchParams.append('endDate', endDate);
    const opts = {params: searchParams};
    console.log('Search Paramse:' + JSON.stringify(opts));
    this.invoiceService.getInvoicesBySearchCondition(opts).subscribe((data: any) =>
    {
      console.log(data);
      this.invoices = data;
      if( this.invoices.length > 0) {
        this.showLoader = false;
        this.showTable = true;
      }
      else {
        this.showLoader = false;
        this.noRecords=true;
        
      }
      
      this.getOrganizationDetails();
    });
  } 
  addToCart(){
    this.invoiceService.CheckInvoiceIsInCart(this.selectedInvoice.invoiceId).subscribe((data: any) =>{
      if(data==true)
      {
        this.messageService.add({ severity: 'warn', summary: 'Warning',
        detail: 'The invoice is already in the cart.', 
        life: 3000 });
        return;
      }
      else
      {
        let invoice = this.selectedInvoice;
        if(invoice.balance ===0){
          this.messageService.add({ severity: 'warn', summary: 'Warning', detail: 'There is no balance to pay for.', life: 3000 });
          return;
        }
        console.log('Adding invoice to cart for Id:' + invoice.invoiceId.toString());
        const formData = new FormData();
        formData.append('invoiceId', invoice.invoiceId.toString());
        this.shoppingCartService.addInvoiceToCart(formData).subscribe((data: any) =>
        {
          console.log(data);
          this.shoppingCart = data;
          if(this.shoppingCart.shoppingCartId > 0){
    
            //Set cartId in session
            this.authService.addCart(this.shoppingCart.shoppingCartId);
            this.breadcrumbService.setCart(this.shoppingCart.shoppingCartId);
            this.messageService.add({ severity: 'success',
                                      summary: 'Successful',
                                      detail: 'Invoice has been added to Shopping Cart succesfully.',
                                      life: 500
                                    });
          }
          else {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to add invoice to cart.', life: 3000 });
          }
        }, error => {
          console.log(error);
          this.messageService.add({ severity: 'error', summary: 'Error', detail: error, life: 3000 });
        });
      }
  })
  }

  editInvoice()
  {
    this.invoiceService.CheckInvoiceIsInCart(this.selectedInvoice.invoiceId).subscribe((data: any) =>{
      if(data==true)
      {
      this.messageService.add({ severity: 'warn', summary: 'Warning',
      detail: 'The invoice is already in the cart.', 
      life: 3000 });
      return;
      }
    else
    {
      if(this.selectedInvoice.membershipTypeId > 0){
        this.isMembershipInvoice = true;
        this.openMembershipEditInvoiceForm = true;
      }
      else if(this.selectedInvoice.eventId != null && this.selectedInvoice.eventId != 0)
      {
        this.isMembershipInvoice = false;
        this.openMembershipEditInvoiceForm = false;
        this.itemInvoice = false;
        this.openEventEditInvoiceForm = true;
      }
      else{
        this.isMembershipInvoice = false;
        this.itemInvoice = true;
      }
    }
    });
  }

  getRefundModes(paymentMode: string){
    let searchParams = new HttpParams();
		searchParams = searchParams.append('paymentMode', paymentMode);
		const opts = { params: searchParams };
    this.invoiceService.getRefundModes(opts).subscribe((data: any) =>
    {
      console.log(data);
      this.refundModes = data;
    });
  }
  showInvoice(){
    let invoice = this.selectedInvoice;
    this.printInvoice = true;
    console.log('Selected Invoice:'+JSON.stringify(invoice));
    this.printInvoiceId = parseInt(invoice.invoiceId);
    this.getBillingAddress(invoice.entityId);
    console.log('Set;'+this.printInvoiceId.toString() );
  }

  refundPayment(){
    this.showError=false;
    this.refundError='';
    // this.disableCancel=true;
    this.refundFormSubmitted = true;
    if (this.refundForm.valid){
      let feePaid = parseFloat(this.refundForm.get('feePaidAmount').value).toFixed(2);
      let processingFee = parseFloat(this.refundForm.get('processingFee').value??0).toFixed(2);
      let refundAmount = parseFloat(this.refundForm.get('refundAmount').value).toFixed(2);
      // let balance = feePaid-refundAmount;
      console.log('Fee Paid:'+feePaid);
      console.log('processingFee:'+processingFee);
      console.log('refundAmount:'+refundAmount);
      let totalPaid = parseFloat(feePaid);
      let totalRefund = parseFloat(processingFee) + parseFloat(refundAmount);
      if(totalPaid < totalRefund){
        this.messageService.add({ severity: 'warn', summary: 'Warning', detail: 'Please correct refund amount.', life: 3000 });
        this.disableCancel=false;
        return;
      } 
      this.disableCancel=true;
      let body = {
        ReceiptId: this.refundInoiceItem.receiptId,
        ReceiptDetailId:this.refundForm.get('receipDetailId').value,
        ProcessingFee:this.refundForm.get('processingFee').value??0,
        RefundAmount:this.refundForm.get('refundAmount').value,
        Reason:this.refundForm.get('reasonRefund').value,
        RefundMode:this.refundForm.get('refundMode').value.code,
        UserId:this.currentUser.id
      }
      
       console.log('Refund:'+JSON.stringify(body));
       this.invoiceService.refundPayment(body).subscribe((data: any) =>{
          console.log(data);
          if(data) {
            if(data.responseCode === "1"){
              this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Invoice updated succesfully.', life: 3000 });
              this.refundFormSubmitted = false;
              this.cancelRefundDialog();  
              this.searchInvoices();
            }
            else {
              this.showError=true;
              this.refundError=data.responseMessage;
              this.messageService.add({ severity: 'error', summary: 'Error', detail: 'An error has occured while processing the refund. Please try again.', life: 5000 });
              this.disableCancel=false;
            }
           
          }
          else {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to update invoice.', life: 3000 });
            this.disableCancel=false;
          }     
        });
    }
    else{      
      this.messageService.add({ severity: 'info', 
                                    summary: 'Required Info', 
                                    detail: 'Please enter required information.', 
                                    life: 3000 });
      // this.disableCancel=true;
    }
  }

  voidPayment(){
    this.showError=false;
    this.voidError='';
    // this.disableCancel=true;
    this.voidFormSubmitted = true;
    if (this.voidForm.valid){
      this.disableCancel=true;
      let body = {
        ReceiptId: this.voidForm.get('receipId').value,
        Reason:this.voidForm.get('reasonVoid').value,
        UserId:this.currentUser.id
      }
      
       console.log('Void:'+JSON.stringify(body));
       this.receiptService.voidReceipt(body).subscribe((data: any) =>{
          console.log(data);
          if(data) {
            if(data.isAlreadyVoided == true){
              this.refundError=data.responseMessage;
              this.messageService.add({ severity: 'error', summary: 'Error', detail: data.responseMessage, life: 5000 });
              this.voidFormSubmitted = false;
              this.cancelVoidDialog();  
              this.searchInvoices();
            }
            else if(data.responseCode === "1"){
              this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Receipt has been voided succesfully.', life: 3000 });
              this.voidFormSubmitted = false;
              this.cancelVoidDialog();  
              this.searchInvoices();
            }
            else {
              this.showError=true;
              this.refundError=data.responseMessage;
              this.messageService.add({ severity: 'error', summary: 'Error', detail: 'An error has occured while processing the void. Please try again.', life: 5000 });
              this.disableCancel=false;
            }
           
          }
          else {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to void the payment.', life: 3000 });
            this.disableCancel=false;
          }     
        });
    }
    else{      
      this.messageService.add({ severity: 'info', 
                                    summary: 'Required Info', 
                                    detail: 'Please enter required information.', 
                                    life: 3000 });
      // this.disableCancel=true;
    }
  }

  cancelRefundDialog(){
    this.refundForm.reset();
    this.showrefundDialog=false;
    this.disableCancel=false;
  }

  onProcessingFeeEvent(event: any){
    if(event.target.value<0)
    {
      return;
    }
    console.log('processing Fee;'+JSON.stringify(event.target.value));
    let feePaid = this.refundForm.get('feePaidAmount').value;
    let refundAmount = this.refundForm.get('feePaidAmount').value - event.target.value;
    if(refundAmount < 0){
      refundAmount=0;
      //this.refundForm.get('processingFee').setValue(feePaid.toFixed(2));
    }
    this.refundForm.get('refundAmount').setValue(refundAmount.toFixed(2));
  }
  errorIconCss(field: string) {
    return {'has-feedback': this.isFieldValid(field)};
  }

  errorFieldCss(field: string) {
    return {'ng-dirty': this.isFieldValid(field)};
  }

  resetSubmitted(field){
    if (this.showrefundDialog)
      this.refundFormSubmitted = false;
    if (!this.showrefundDialog)
      this.searchbyDateFormSubmitted = false;
    this.isFieldValid(field); 
  }

  isFieldValid(field: string) { 
    if (this.showrefundDialog){ 
      if (field=='startDate' || field=='endDate'){ 
        return true;
      }
    if ((!this.refundForm.get(field).valid) && (this.refundFormSubmitted) && (this.refundForm.get(field).hasError('required'))){
      if (field=='reasonRefund'){
          field = 'Reason'
          this.addErrorMessages =  { errorType: 'required', controlName: field };}
      if (field=='processingFee'){
          field = 'Processing Fee';
          let feepaidAmount = this.refundForm.get('feePaidAmount').value;
          let processingFee = this.refundForm.get('processingFee').value
          if(feepaidAmount <= processingFee){
            this.addErrorMessages =  { errorType: 'required', controlName: field };
          }
          this.addErrorMessages =  { errorType: 'required', controlName: field };}
      if (field=='refundAmount'){
          field = 'Refund Amount'
          this.addErrorMessages =  { errorType: 'required', controlName: field };}
      if (field=='refundMode'){
          field = 'Refund Mode'
          this.addErrorMessages =  { errorType: 'dropdownrequired', controlName: field };}
      return true;
    }}

    if (!this.showrefundDialog && !this.showVoidDialog && !this.showWriteOffDialog){
      if(this.selectedSearch.name == "Date"){
      if ((!this.searchbyDateForm.get(field).valid) && (this.searchbyDateFormSubmitted) && (this.searchbyDateForm.get(field).hasError('required'))){
        if (field=='startDate'){
          field = 'Start Date'
          this.addErrorMessages =  { errorType: 'required', controlName: field };}
      if (field=='endDate'){
          field = 'End Date'
          this.addErrorMessages =  { errorType: 'required', controlName: field };}
      return true;
      }
      if ((!this.searchbyDateForm.get(field).valid) && (this.searchbyDateFormSubmitted) && (this.searchbyDateForm.get(field).hasError('lesserEndDate'))){
        this.addErrorMessages =  { errorType: 'lesserEndDate', controlName: field };
        return true;
      }
      }
    }
    }

  endDateValidator(controlName: string, matchingControlName: string)
  {
    return (formGroup: FormGroup) =>
    {
      const control = formGroup.controls[controlName];
      const matchingControl = formGroup.controls[matchingControlName];
      this.startDate = control.value;
      this.endDate = matchingControl.value;
      if (matchingControl.errors && !matchingControl.errors.lesserEndDate)
      {
        // return if another validator has already found an error on the matchingControl
        return;
      }
      // set error on matchingControl if validation fails
      if (this.startDate > this.endDate)
      {
        matchingControl.setErrors({ lesserEndDate: true });
      } else
      {
        matchingControl.setErrors(null);
      }
    }
  }

  getOrganizationDetails()
  {
     let params = new HttpParams();
    params = params.append('organizationId',this.currentUser.organizationId.toString());
    const opts = {params: params};
    this.organizationService.getOrganizationById(opts).subscribe((data: any[]) =>
    {
      console.log(data);
      this.organization = data;
    });
  }
  
noBlankValidator(control: FormControl)
{
  const isWhitespace = (control.value || '').trim().length === 0;
  const isValid = !isWhitespace;
  return isValid ? null : { 'required': true };
}
 // Invoice Item functions
 addInvoiceItem() {
  this.Items.push(this.formBuilder.control('')); 
}

removeInvoiceItem(i: number) {
  if (this.Items.length === 1){
    this.messageService.add({severity: 'error', summary: 'Error', detail: 'You need to have atleast one item.', life: 3000});
  }
  else{
    this.messageService.add({ severity: 'success',
                              summary: 'Successful',
                              detail: 'Item deleted succesfully.',
                              life: 3000
                            });
    this.Items.removeAt(i);
  }
}
otherFormClicked(removeValidations: boolean){
  console.log("Other form clicked");
  if (removeValidations==false)
      this.submitted = false;
  let totalAmount = 0;
  for (let i = 0; i < this.Items.length; i++) {
      
    totalAmount = totalAmount + parseFloat(this.Items.value[i].Quantity) * parseFloat(this.Items.value[i].Rate);
  }
  this.invoiceForm.get('TotalAmount').setValue(totalAmount.toFixed(2));
}

saveItemInvoice(){
  console.log("Saving Invoice:" + JSON.stringify(this.Items.length));
  console.log("Invoice Form:" + this.invoiceForm.valid);
  let contactId = this.entityId.toString();
  if(this.companyInvoice){
    let selectedName = this.entityForm.get('ContactEntity').value;
    let selectedEntity = this.employees.filter(i => i.name === selectedName)[0];
    contactId = selectedEntity.code
  }
  
  console.log("Selected:"+JSON.stringify(contactId));
  this.submitted = true;
  let lineItems = [];
  if (this.invoiceForm.valid){
    if (this.Items.length === 0) {
      this.messageService.add({severity: 'error', summary: 'Error', detail: 'You need to have atleast one item.', life: 3000});
    }
    else {
        for (let i = 0; i < this.Items.length; i++) {
              this.itemModel = {
               ItemId: this.Items.value[i].LineItemId,
               Description: this.Items.value[i].Description,
               UnitRate: this.Items.value[i].Rate,
               Quantity: this.Items.value[i].Quantity
             }
            lineItems.push(this.itemModel);
        }
      
        const body = {
        //InvoiceId:this.invoiceForm.get('InvoiceId').value,
        InvoiceId:0,
        BillableEntityId: this.entityId,
        EntityId: contactId,
        DueDate: moment(this.invoiceForm.get('InvoiceDueDate').value).utc(true).format(),
        Notes: this.invoiceForm.get('Note').value,
        Items: lineItems,
        userId:this.currentUser.id
      };
       console.log('Creating Invoice:' +  JSON.stringify(body));
       this.invoiceService.createItemInvoice(body).subscribe(
        response => {
          this.messageService.add({ severity: 'success',
                                    summary: 'Successful',
                                    detail: 'Invoice successfully.',
                                    life: 3000
                                  }); 
          this.itemInvoice=false;
          this.searchInvoices();
        },
        error => {
          console.log(error);
          this.messageService.add({ severity: 'error', summary: 'Error', detail: error, life: 3000 });
        });
    }
  }
  else{
    if (this.Items.length === 0) {
      this.messageService.add({severity: 'error', summary: 'Error', detail: 'You need to have atleast one item.', life: 3000});
    }
    else
    {
      this.messageService.add({severity: 'error', summary: 'Error', detail: 'Please fix the error(s) on the page.', life: 3000});
    }
   
  }
}

getEntitiesByName(event: any){
 
  }
  getByEmployeesByEntity(){

    let searchParams = new HttpParams();
    searchParams = searchParams.append('entityId', this.entityId.toString());
    const opts = {params: searchParams};
    console.log('Search Name:' + JSON.stringify(opts));
    this.entityService.getEmployeesByEntityId(opts).subscribe((data: any) =>
    {
      console.log(data);
      this.employees = data;
      if(this.company.billablePerson!=null){
        this.entityForm.get('ContactEntity').setValue(this.company.billablePerson.firstName + ' ' + this.company.billablePerson.lastName);
      }
    });
    
  }
  setEntity(item: any){
    console.log("Selected value:"+JSON.stringify(item));
    this.selectedEntityId = item.entityId;
  }
  getBillingAddress(entityId: any){
    console.log('Fetching Address for Id:' + entityId);
    let searchParams = new HttpParams();
    searchParams = searchParams.append('entityId', entityId);
    const opts = {params: searchParams};
    this.entityService.getBillingAddressByEntityId(opts).subscribe((data: any) =>
    {
      console.log(data);
      this.billingAddress = data;
      //this.invoice.billingAddress=data;
    });
  }

  //WriteOff Recevable

  writeOffInvoice()
  {
      console.log("Selected Invoice:"+ JSON.stringify(this.selectedInvoice));
      this.writeOffError='';
      this.writeOffForm.reset();
      this.writeOffFormSubmitted = false;
      if(this.selectedInvoice.balance === 0){
        this.messageService.add({ severity: 'warn', summary: 'Warning', detail: 'There is no recevable to write off for.', life: 3000 });
        return;
      }
      this.writeOffForm.get('invoiceDetailId').setValue(parseFloat(this.selectedInvoice.invoiceDetailId));
      this.writeOffForm.get('writeOffAmount').setValue(parseFloat(this.selectedInvoice.balance));
      this.showWriteOffDialog = true;
  }

  writeOffPayment(){  this.showError=false;
    this.writeOffError='';
    let balance = parseFloat(this.selectedInvoice.balance);
    let writeOff = parseFloat(this.writeOffForm.get('writeOffAmount').value);

    if(writeOff <= balance){
      this.writeOffFormSubmitted = true;
   
      if (this.writeOffForm.valid){
        this.disableCancel=true;
        let body = {
          InvoiceDetailId: this.writeOffForm.get('invoiceDetailId').value,
          Reason:this.writeOffForm.get('reasonWriteOff').value,
          Amount: this.writeOffForm.get('writeOffAmount').value,
          UserId:this.currentUser.id,
          OrganizationId: this.currentUser.organizationId
        }
        
         console.log('Void:'+JSON.stringify(body));
         this.invoiceService.writeOffReceivable(body).subscribe((data: any) =>{
            console.log(data);
            if(data) {
              if(data.writeOffId > 0){
                this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Write Off has been added succesfully.', life: 3000 });
                this.voidFormSubmitted = false;
                this.cancelWriteOffDialog();  
                this.searchInvoices();
              }
              else {
                this.showError=true;
                this.writeOffError=data.responseMessage;
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'An error has occured while processing the write off. Please try again.', life: 5000 });
                this.disableCancel=false;
              }
             
            }
            else {
              this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to write off the receivable.', life: 3000 });
              this.disableCancel=false;
            }     
          });
      }
      else{      
        this.messageService.add({ severity: 'info', 
                                      summary: 'Required Info', 
                                      detail: 'Please enter required information.', 
                                      life: 3000 });
        // this.disableCancel=true;
      }
    }
    else{      
      this.messageService.add({ severity: 'warng', 
                                    summary: 'Warning', 
                                    detail: 'Write off amount can not be more than balance due.', 
                                    life: 3000 });
  }
}

  cancelWriteOffDialog(){
    this.writeOffForm.reset();
    this.showWriteOffDialog=false;
    this.disableCancel=false;
  }
  addToMemberPortalCart(){
   
    console.log('Adding invoice to cart');
    let body = {
      MemberPortalUserId: 'scottmather',
      InvoiceIds:'8621'
    }
    this.shoppingCartService.addInvoiceToMemberPortalCart(body).subscribe((data: any) =>
    {
      console.log(data);
      this.shoppingCart = data;
      if(this.shoppingCart.shoppingCartId > 0){

        //Set cartId in session
        this.authService.addCart(this.shoppingCart.shoppingCartId);
        this.breadcrumbService.setCart(this.shoppingCart.shoppingCartId);
        this.messageService.add({ severity: 'success',
                                  summary: 'Successful',
                                  detail: 'Invoice has been added to Shopping Cart succesfully.',
                                  life: 500
                                });
      }
      else {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to add invoice to cart.', life: 3000 });
      }
    }, error => {
      console.log(error);
      this.messageService.add({ severity: 'error', summary: 'Error', detail: error, life: 3000 });
    });
  }
}
