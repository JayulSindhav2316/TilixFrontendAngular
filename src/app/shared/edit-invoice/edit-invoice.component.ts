import { HttpParams } from '@angular/common/http';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { AppBreadcrumbService } from 'src/app/app.breadcrumb.service';
import { CompanyService } from 'src/app/services/company.service';
import { EntityService } from 'src/app/services/entity.service';
import { InvoiceService } from 'src/app/services/invoice.service';
import { MembershipService } from 'src/app/services/membership.service';
import { OrganizationService } from 'src/app/services/organization.service';
import { PersonService } from 'src/app/services/person.service';
import * as moment from 'moment';

@Component({
  selector: 'app-edit-invoice',
  templateUrl: './edit-invoice.component.html',
  styleUrls: ['./edit-invoice.component.scss']
})
export class EditInvoiceComponent implements OnInit {
  @Input() invoiceId: number;
  @Input() paperInvoiceId: number;
  @Output() closeEvent = new EventEmitter<string>();

  invoice: any;
  invoiceEditForm:FormGroup;
  existingFees: any[];
  optionalFees: any[];
  membershipFees: any[];
  newInvoiceDetailsList: any[]=[];
  existingInvoiceDetailsList: any[];
  finalInvoiceDetailsList: any[]=[];
  billableEntityList: {entityId: number; Name: string}[]=[];
  selectedExistingFees: any[]=[];
  selectedOptionalFees: any[]=[];
  showOptionalFee: boolean;
  headerName: string;
  invoiceDate: Date;
  dueDate: Date;
  minDate: Date;
  billableEntityId: number;
  isPaperInvoice: boolean;
  showInvoice : boolean;

  invoiceModel:{
    InvoiceId: number;
    EntityId: number;
    BillableEntityId: number;
    Date: any;
    DueDate: any;
    MembershipId: number;
    Notes: string;
    InvoiceDetails: any[];
    Status: number;
  }
  invoiceDetailModel:{ 
    InvoiceDetailId: number; 
    InvoiceId: number;
    Description: string;
    Amount: number;
    FeeId: number;
    GLAccountId: number;
    FeeAmount: number;
    IsMandatory: number;
  };

  constructor(private formBuilder: FormBuilder,
              private breadcrumbService: AppBreadcrumbService,
              private messageService: MessageService,
              private confirmationService: ConfirmationService, 
              private personService:  PersonService,
              private membershipService: MembershipService,
              private invoiceService: InvoiceService, 
              private entityService: EntityService,
              private organizationService: OrganizationService,
              private companyService: CompanyService) {
                this.showInvoice =false;
               }

  ngOnInit(): void {
  this.isPaperInvoice = this.paperInvoiceId > 0 ? true : false;
  this.invoiceEditForm = this.formBuilder.group({
      InvoiceDate: [],
      DueDate: [],
      BillableEntityId:[0],
      EntityId:[0],
      Note:['']
    });

    this.getInvoiceDetails(this.invoiceId);
  }

  getInvoiceDetails(invoiceId: number){
    console.log('Fetching Invoice data for Id:' + invoiceId.toString());
    let searchParams = new HttpParams();
    searchParams = searchParams.append('invoiceId', invoiceId.toString());
    const opts = {params: searchParams};
    this.invoiceService.getInvoiceDetail(opts).subscribe((data: any) =>
    {
      console.log(data);
      this.invoice = data;
      this.headerName = "EDIT INVOICE #"+ this.invoice.invoiceId;
      this.existingInvoiceDetailsList = this.invoice.invoiceDetails;
      this.invoiceDate = new Date(this.invoice.date);
      this.dueDate = new Date(this.invoice.dueDate);
      this.minDate = new Date();
      console.log(this.minDate);
      this.invoiceEditForm.get('InvoiceDate').setValue(this.invoiceDate);
      this.invoiceEditForm.get('DueDate').setValue(this.dueDate);
      if(this.invoice.notes)
      {
        if(this.invoice.notes.length > 0)
        {
          this.invoiceEditForm.get('Note').setValue(this.invoice.notes);
        }
      }
      else
      {
        if(this.invoice.organization.printMessage)
        {
          this.invoiceEditForm.get('Note').setValue(this.invoice.organization.printMessage);
        }
      }
      if(this.invoice.eventId == null || this.invoice.eventId == 0)
      {
        this.getMembershipFee();
        this.getAllMembersByMembershipId();
      }
      this.invoiceEditForm.get('BillableEntityId').setValue(this.invoice.billableEntityId);  
      this.showInvoice = true;
    });
  }

  getMembershipFee()
  {      
      let searchParams = new HttpParams();
      searchParams = searchParams.append('membershipTypeId', this.invoice.membership.membershipTypeId.toString());
      const opts = { params: searchParams };
      console.log('Get Fee:' + JSON.stringify(opts));
      this.membershipService.getMembershipFeeByType(opts).subscribe((data: any) => {
      console.log(data);
      this.membershipFees = data;
      if(this.membershipFees.length > 0){
          this.membershipFees.forEach(mf => {
          let invoiceDetail = this.existingInvoiceDetailsList.filter(obj => obj.feeId === mf.feeId);
          console.log(invoiceDetail);
          if(invoiceDetail.length === 1)
          {
            this.invoiceDetailModel = {
              InvoiceDetailId: invoiceDetail[0].invoiceDetailId,
              InvoiceId: this.invoice.invoiceId,
              Description: mf.description,
              Amount: invoiceDetail[0].amount,
              FeeId: mf.feeId,
              GLAccountId: mf.glAccountId,
              FeeAmount: mf.feeAmount,
              IsMandatory:mf.isMandatory
            }
            console.log(this.invoiceDetailModel);          
            this.newInvoiceDetailsList.push(this.invoiceDetailModel);
            console.log(this.newInvoiceDetailsList);
          }
          else
          {
            this.invoiceDetailModel = {
              InvoiceDetailId: 0,
              InvoiceId: this.invoice.invoiceId,
              Description: mf.description,
              Amount: mf.feeAmount,
              FeeId: mf.feeId,
              GLAccountId: mf.glAccountId,
              FeeAmount: mf.feeAmount,
              IsMandatory:mf.isMandatory
            }
            console.log(this.invoiceDetailModel);
            this.newInvoiceDetailsList.push(this.invoiceDetailModel);
            console.log(this.newInvoiceDetailsList);
          }   
        });
        this.existingFees = this.newInvoiceDetailsList.filter(obj => obj.InvoiceDetailId > 0);
        this.optionalFees = this.newInvoiceDetailsList.filter(obj => obj.InvoiceDetailId === 0);
        console.log('Required Fee:' + JSON.stringify( this.existingFees));
        console.log('Optional Fee:' + JSON.stringify( this.optionalFees));
        
        // Make required fee preselected
        this.selectedExistingFees=this.existingFees;

        if(this.optionalFees.length > 0){
          this.showOptionalFee=true;
        }
      }

      
		});
  }

  getAllMembersByMembershipId()
  {
    let searchParams = new HttpParams();
		searchParams = searchParams.append('membershipId', this.invoice.membershipId.toString());
		const opts = { params: searchParams };
    this.entityService.getMembershipConnectionsByMembershipId(opts).subscribe((data: any) =>
    {
      console.log(data);
      data.forEach(element => {
        this.billableEntityList.push({entityId: element.entity.entityId, Name: element.entity.name})
      });
      console.log(this.billableEntityList);
      
    });

  }

  saveInvoice()
  {
    console.log(this.selectedOptionalFees);
    console.log(this.selectedExistingFees);
    this.finalInvoiceDetailsList = [];

    // Add All Selected Fees
    if(this.invoice.membershipId!=null)
    {
      this.selectedExistingFees.forEach(element => {
        this.finalInvoiceDetailsList.push(element);      
      });

      this.selectedOptionalFees.forEach(element => {
        this.finalInvoiceDetailsList.push(element);      
      });
    }
    else if(this.invoice.eventId!=null)
    {
      this.finalInvoiceDetailsList = this.invoice.invoiceDetails;
    }
    console.log(this.finalInvoiceDetailsList);

    this.invoiceModel = {
      InvoiceId: this.invoice.invoiceId,
      EntityId: this.invoice.entityId,
      BillableEntityId: this.invoiceEditForm.get('BillableEntityId').value,
      Date: moment(this.invoiceEditForm.get('InvoiceDate').value).utc(true).format(),
      DueDate: moment(this.invoiceEditForm.get('DueDate').value).utc(true).format(),
      Notes: this.invoiceEditForm.get('Note').value,
      MembershipId: this.invoice.membershipId,
      InvoiceDetails: this.finalInvoiceDetailsList,
      Status:1
    }

    console.log(this.invoiceModel);
    this.invoiceService.updateInvoice(this.invoiceModel).subscribe((data: any) =>
    {
      console.log(data);
      if(data) {
        if(this.isPaperInvoice){          
          this.updatePaperInvoice();
        }
        else{
          this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Invoice updated succesfully.', life: 3000 });
          this.hideEditInvoice();
        }
      }
      else {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to update invoice.', life: 3000 });
      }     
    });
  }

  hideEditInvoice() {
    this.existingFees = [];
    this.optionalFees = [];
    this.newInvoiceDetailsList = [];
    this.billableEntityList = [];
    this.closeEvent.emit();
  }

  amountValidation(event, feeType: string, fee: any, index: number) {
    if (event.target.value.trim().length == 0) {
      if(feeType == 'existing'){
        this.existingFees[index].Amount = 0;
      }
      if(feeType == 'optional'){
        this.optionalFees[index].Amount = 0;
      }
    }
    else{
      let feeAmount = parseFloat(event.target.value.trim());
        if(feeAmount < 0){
          if(feeType == 'existing'){
          this.existingFees[index].Amount = 0.00;
        }
        if(feeType == 'optional'){
          this.optionalFees[index].Amount = 0.00;
        }
      }

    }

    
    // if (parseInt(event.target.value.trim()) > 0) {
    //   let feeAmount = parseInt(event.target.value.trim());
    //   if(feeType == 'existing' && feeAmount > this.existingFees[index].FeeAmount){
    //     this.existingFees[index].Amount = this.existingFees[index].FeeAmount;
    //     this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Entered amount exceeds orginal fee amount.', life: 3000 });
    //   }
    //   if(feeType == 'optional' && feeAmount > this.optionalFees[index].FeeAmount){
    //     this.optionalFees[index].Amount = feeAmount;
    //     this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Entered amount exceeds orginal fee amount.', life: 3000 });
    //   }
    // }

  }

  eventamountValidation(event, index: number) {
      let eventFeeAmount = parseFloat(event.target.value.trim());
        if(eventFeeAmount < 0 || Number.isNaN(eventFeeAmount)){
          this.existingInvoiceDetailsList[index].amount = 0.00;
      }
    }

  updatePaperInvoice(){
    let paperInvoiceAmount = this.finalInvoiceDetailsList.reduce((sum, p) => sum + (p.Amount), 0).toFixed(2);
    const body = {
      paperInvoiceId: this.paperInvoiceId,
      Amount: paperInvoiceAmount
    }
    this.invoiceService.updatePaperInvoice(body).subscribe((data: any) =>
    {
      console.log(data);
      if(data) {
        this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Invoice updated succesfully.', life: 3000 });
        setTimeout(()=> this.hideEditInvoice(), 3000);
      }
      else {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to update invoice.', life: 3000 });
      }     
    });
  }

}
