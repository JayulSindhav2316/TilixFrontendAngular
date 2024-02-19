import { HttpParams } from '@angular/common/http';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import * as moment from 'moment';
import { ConfirmationService, MessageService } from 'primeng/api';
import { AuthService } from 'src/app/services/auth.service';
import { CompanyService } from 'src/app/services/company.service';
import { EntityService } from 'src/app/services/entity.service';
import { InvoiceItemService } from 'src/app/services/invoice-item.service';
import { InvoiceService } from 'src/app/services/invoice.service';
import { PersonService } from 'src/app/services/person.service';
import { Router } from '@angular/router';
import { faEdit } from '@fortawesome/free-solid-svg-icons';
@Component({
  selector: 'app-general-edit-invoice',
  templateUrl: './general-edit-invoice.component.html',
  styleUrls: ['./general-edit-invoice.component.scss']
})
export class GeneralEditInvoiceComponent implements OnInit {

  @Input() entity: any;
  @Input() invoiceId: number;
  @Input() previousInvoiceId: number;
  @Output() closeEvent = new EventEmitter<string>();

  // entity: any;
  company: any;
  person: any;
  billablePerson: any;
  billableCompany: any;

  submitted: boolean;
  companyInvoice: boolean;
  invoice: any;
  headerName: string;
  dueDate: Date;
  minDate: Date;
  addNew: boolean;
  currentUser: any;
  entityName: string;
  createNewInvoice: boolean = false;
  invalidQty: boolean = false;
  errorMessage: string;

  existingInvoiceDetailsList: any[];
  employeesList: { name: string; code: string; }[] = [];
  disabled: boolean = false;
  showRelatedContacts: boolean = false;
  faEdit = faEdit;
  invoiceForm = this.formBuilder.group({
    InvoiceId: [0],
    BillableEntityId: [0],
    InvoiceDueDate: ['', [Validators.required]],
    TotalAmount: [0],
    Note: [''],
    MemberEntityId: [0],
    Items: this.formBuilder.array([])
  }
  );
  relationsList: any;

  get Items() {
    return this.invoiceForm.get('Items') as FormArray;
  }

  entityForm = this.formBuilder.group({
    EntityId: [0],
    ContactEntity: ['', [Validators.required]],
    Phone: [''],
    Title: [''],
  });

  itemModel: {
    InvoiceDetailId: any;
    ItemId: any;
    Description: any;
    Quantity: any;
    UnitRate: any;
    BillableEntityId: any;
    Amount: any;
  };

  itemInvoice: boolean;
  showReceipt: boolean;
  newInvoiceId: number;

  constructor(
    private formBuilder: FormBuilder,
    private personService: PersonService,
    private companyService: CompanyService,
    private entityService: EntityService,
    private invoiceService: InvoiceService,
    private invoiceItemService: InvoiceItemService,
    private messageService: MessageService,
    private authService: AuthService,
    private confirmationService: ConfirmationService,
    private router: Router) {
    this.itemInvoice = true;
  }

  ngOnInit(): void {
    console.log(this.entity);
    if (this.invoiceId > 0) {
      this.addNew = false;
      this.headerName = "INVOICE #" + this.invoiceId;
      this.getInvoiceDetails(this.invoiceId);
    }
    else {
      this.addNew = true;
      this.headerName = "INVOICE";
      this.invoiceForm.get('InvoiceDueDate').setValue(new Date());
      this.addInvoiceItem();
    }
    if (this.entity.personId) {
      this.companyInvoice = false;
      this.person = this.entity;
      this.billablePerson = this.entity;
      this.entityName = this.entity.fullName;
      this.invoiceForm.get("MemberEntityId").setValue(this.entity.entityId.toString());
    }
    else {
      this.companyInvoice = true;
      this.company = this.entity;
      this.billableCompany = this.entity;
      this.entityName = this.entity.companyName;
      this.getByEmployeesByEntity();
    }
    this.getRelations();
    this.currentUser = this.authService.currentUserValue;
  }

  getInvoiceDetails(invoiceId: number) {
    console.log('Fetching Invoice data for Id:' + invoiceId.toString());
    let searchParams = new HttpParams();
    searchParams = searchParams.append('invoiceId', invoiceId.toString());
    const opts = { params: searchParams };
    this.invoiceService.getInvoiceDetail(opts).subscribe((data: any) => {
      console.log(data);
      let billableEntity = data.billableEntity;
      this.entityName = billableEntity.name ?? this.entityName;
      if (billableEntity.personId) {
        this.getPersonById(billableEntity.personId);
        this.companyInvoice = false;
      }
      // else {
      //   this.getCompanyById(billableEntity.companyId);
      //   this.companyInvoice=true;
      // }
      this.invoice = data;
      this.existingInvoiceDetailsList = this.invoice.invoiceDetails;
      this.dueDate = new Date(this.invoice.dueDate);
      this.minDate = new Date();
      this.invoiceForm.get('InvoiceDueDate').setValue(this.dueDate);
      // if (this.companyInvoice) {
      //   this.entityForm.get('ContactEntity').setValue(this.invoice.entityId.toString());
      // }
      // else
      if (!this.companyInvoice) {
        this.invoiceForm.get('MemberEntityId').setValue(this.invoice.billableEntityId.toString());
      }
      this.bindItems();
    });
  }

  bindItems() {
    this.existingInvoiceDetailsList.forEach(item => {
      let searchParams = new HttpParams();
      searchParams = searchParams.append('itemId', item.itemId);
      const opts = { params: searchParams };

      this.invoiceItemService.getInvoiceItemById(opts).subscribe((data: any) => {
        const generalInvoiceItem: any = {};
        generalInvoiceItem.InvoiceDetailId = item.invoiceDetailId;
        generalInvoiceItem.LineItemId = item.itemId;
        generalInvoiceItem.ItemCode = data.itemCode;
        generalInvoiceItem.ItemCodeSearch = data.itemCode;
        generalInvoiceItem.Description = data.name;
        generalInvoiceItem.DescriptionSearch = data.description;
        generalInvoiceItem.Quantity = item.quantity;
        generalInvoiceItem.Rate = item.price;
        generalInvoiceItem.Amount = item.amount;
        generalInvoiceItem.StockCount = data.stockCount;
        generalInvoiceItem.ItemType = data.itemType;
        generalInvoiceItem.EnableStock = data.enableStock;
        generalInvoiceItem.BillableEntityId = item.billableEntityId.toString();
        generalInvoiceItem.Status = item.status;
        this.Items.push(this.formBuilder.control(generalInvoiceItem));
        this.otherFormClicked({ validation: false, itemId: 0 });
      });

    });

  }

  async getInvoiceItemsById(itemId: number) {
    let searchParams = new HttpParams();
    searchParams = searchParams.append('itemId', itemId);
    const opts = { params: searchParams };

    this.invoiceItemService.getInvoiceItemById(opts).subscribe((data: any) => {
      return data;
    });
  }

  saveItemInvoice(isSave) {
    this.disabled = true;
    console.log("Saving Invoice:" + JSON.stringify(this.Items.length));
    console.log("Invoice Form:" + this.invoiceForm.valid);
    let contactId = this.entity.entityId.toString();
    let contactEntityId = this.entity.entityId.toString();
    if (!this.companyInvoice) {
      var memberEntityId = this.invoiceForm.get("MemberEntityId").value;
      contactId = memberEntityId > 0 ? memberEntityId : contactId;
      contactEntityId = memberEntityId > 0 ? memberEntityId : contactEntityId;

    }
    console.log("Selected:" + JSON.stringify(contactId));
    this.submitted = true;
    let lineItems = [];
    if (!this.invoiceForm.valid || this.invalidQty) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: this.errorMessage,
        life: 3000
      });
      this.disabled = false;
    }
    else if (!this.invoiceForm.valid) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Please fix the error(s) on the page.',
        life: 3000
      });
      this.disabled = false;
    }
    else {

      for (let i = 0; i < this.Items.length; i++) {
        this.itemModel = {
          InvoiceDetailId: this.Items.value[i].InvoiceDetailId,
          ItemId: this.Items.value[i].LineItemId,
          Description: this.Items.value[i].Description,
          UnitRate: this.Items.value[i].Rate,
          Quantity: this.Items.value[i].Quantity,
          Amount: this.Items.value[i].Amount,
          BillableEntityId: this.Items.value[i].BillableEntityId
        }
        lineItems.push(this.itemModel);
      }

      const body = {
        InvoiceId: this.addNew ? 0 : this.invoiceId,
        BillableEntityId: contactId,
        EntityId: contactEntityId,
        DueDate: moment(this.invoiceForm.get('InvoiceDueDate').value).utc(true).format(),
        Notes: this.invoiceForm.get('Note').value,
        Items: lineItems,
        userId: this.currentUser.id
      };
      if (this.addNew) {
        console.log('Creating Invoice:' + JSON.stringify(body));
        this.invoiceService.createItemInvoice(body).subscribe(
          (response: any) => {
            this.messageService.add({
              severity: 'success',
              summary: 'Successful',
              detail: 'Invoice created successfully.',
              life: 3000
            });
            console.log("Invoice details:" + response.invoiceId);
            this.newInvoiceId = response.invoiceId;
            this.showReceipt = true;
            this.itemInvoice = false;
            //  if(this.createNewInvoice && !isSave){
            //   this.invoiceForm.reset();
            //   this.entityForm.reset();  
            //   const arr = <FormArray>this.invoiceForm.controls.Items;
            //   arr.controls = [];
            //   this.addInvoiceItem(); 
            //   this.invoiceForm.get('InvoiceDueDate').setValue(new Date());
            //   this.disabled=false;
            // }
            // else{
            //   this.closeEvent.emit();
            // }
          },
          error => {
            console.log(error);
            this.messageService.add({ severity: 'error', summary: 'Error', detail: error, life: 3000 });
            this.disabled = false;
          });
      }
      else {
        console.log('Creating Invoice:' + JSON.stringify(body));
        this.invoiceService.updateItemInvoice(body).subscribe(
          response => {
            this.messageService.add({
              severity: 'success',
              summary: 'Successful',
              detail: 'Invoice updated successfully.',
              life: 3000
            });
            this.previousInvoiceId = response.invoiceId;
            if (this.createNewInvoice && !isSave) {
              this.invoiceForm.reset();
              this.entityForm.reset();
              const arr = <FormArray>this.invoiceForm.controls.Items;
              arr.controls = [];
              this.headerName = "INVOICE";
              this.addInvoiceItem();
              this.invoiceForm.get('InvoiceDueDate').setValue(new Date());
              this.disabled = false;
              this.addNew = true;

            }
            else {
              this.closeEvent.emit();
            }
            // this.disabled=false;
            // this.closeEvent.emit();
          },
          error => {
            console.log(error);
            this.messageService.add({ severity: 'error', summary: 'Error', detail: error, life: 3000 });
            this.disabled = false;
          });
      }

    }
  }

  addInvoiceItem() {
    const generalInvoiceItem: any = {};
    generalInvoiceItem.LineItemId = 0;
    this.Items.push(this.formBuilder.control(''));
  }

  removeInvoiceItem(i: number) {
    if (this.Items.length === 1) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'You need to have atleast one item.', life: 3000 });
    }
    else {
      this.messageService.add({
        severity: 'success',
        summary: 'Successful',
        detail: 'Item deleted succesfully.',
        life: 3000
      });
      this.Items.removeAt(i);
    }
    this.calculateTotalAmount();
  }

  closeItemInvoice(event: any) {
    if (event.which == 13) {
      return false;
    }
    if (this.invoiceId != 0) {
        this.confirmationService.confirm({
          message: 'Are you sure that you want to Cancel, This will delete your invoice',
          accept: () => {
            const body = {
              InvoiceId: this.invoiceId,
            };
            this.invoiceService.deleteInvoice(body).subscribe(
              (response: any) => {
                this.closeEvent.emit();
              },
              error => {
                console.log(error);
                this.messageService.add({ severity: 'error', summary: 'Error', detail: error, life: 3000 });
                this.disabled = false;
              });
          }
      });
    }
    else {
      this.closeEvent.emit("close");
    }
  }

  otherFormClicked(receivedObject: any) {
    let removeValidations: boolean = receivedObject.validation;
    let itemId: number = receivedObject.itemId;
    let billableEntityId: number = receivedObject.billableEntityId;
    this.invalidQty = receivedObject.invalidQty;
    this.errorMessage = receivedObject.errorMessage;

    if (itemId > 0) {
      this.validateExistingAddedItems(itemId, billableEntityId);
    }
    console.log("Other form clicked");
    if (removeValidations == false)
      this.submitted = false;
    let totalAmount = 0;
    for (let i = 0; i < this.Items.length; i++) {
      if (this.Items.value[i].Rate != null && this.Items.value[i].Quantity != null) {
        if (this.Items.value[i].Quantity == 1) {
          totalAmount = totalAmount + parseFloat(this.Items.value[i].Quantity) * parseFloat(this.Items.value[i].Amount);
        }
        else {
          totalAmount = totalAmount + parseFloat(this.Items.value[i].Amount);
        }
      }
    }
    this.invoiceForm.get('TotalAmount').setValue(totalAmount.toFixed(2));
  }

  calculateTotalAmount() {
    let totalAmount = 0;
    for (let i = 0; i < this.Items.length; i++) {
      if (this.Items.value[i].Rate != null && this.Items.value[i].Quantity != null) {
        if (this.Items.value[i].Quantity == 1) {
          totalAmount = totalAmount + parseFloat(this.Items.value[i].Quantity) * parseFloat(this.Items.value[i].Amount);
        }
        else {
          totalAmount = totalAmount + parseFloat(this.Items.value[i].Amount);
        }
      }
    }
    this.invoiceForm.get('TotalAmount').setValue(totalAmount.toFixed(2));
  }

  getByEmployeesByEntity() {

    let searchParams = new HttpParams();
    searchParams = searchParams.append('entityId', this.entity.entityId.toString());
    const opts = { params: searchParams };
    console.log('Search Name:' + JSON.stringify(opts));
    this.entityService.getEmployeesByEntityId(opts).subscribe((data: any) => {
      console.log(data);
      //let billablePersonName = this.company.billablePerson.prefix + ' ' + this.company.billablePerson.firstName + ' ' + this.company.billablePerson.lastName
      this.employeesList = data;
      this.employeesList.push({ code: this.entity.entityId.toString(), name: this.entity.companyName });
      //this.employeesList.push({code: this.company.billablePerson.entityId, name:billablePersonName });
    });
  }

  validateExistingAddedItems(itemId: number, billableEntityId?: number) {
    let itemExistArray;
    if (billableEntityId != null && billableEntityId > 0) {
      itemExistArray = this.Items.value.filter(x => x.LineItemId === itemId && x.BillableEntityId == billableEntityId);
    }
    else {
      itemExistArray = this.Items.value.filter(x => x.LineItemId === itemId);
    }
    if (itemExistArray.length > 1) {
      this.Items.removeAt(this.Items.length - 1);
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Item already added..', life: 3000 });
    }
  }

  saveAndCreateNewItemInvoice() {
    this.createNewInvoice = true;
    this.saveItemInvoice(false);
  }
  closeReceipt(event: any) {
    this.closeEvent.emit();
  }
  getRelations() {
    console.log('Get relations:' + this.entity.entityId.toString());
    let searchParams = new HttpParams();
    searchParams = searchParams.append('entityId', this.entity.entityId.toString());
    const opts = { params: searchParams };
    this.entityService.getRelationListByEntityId(opts).subscribe((data: any) => {
      console.log(data);
      if (data) {
        this.relationsList = data;
      }
    });
  }

  getPersonById(personId) {
    let searchParams = new HttpParams();
    searchParams = searchParams.append('personId', personId.toString());
    const opts = { params: searchParams };
    this.personService.getPersonById(opts).subscribe((data: any[]) => {
      console.log(data);
      // this.person = data;
      this.billablePerson = data;
    });
  }

  changeBillableMember(event: any) {
    var entityId = event.value;
    this.getEntityById(entityId);
  }

  getEntityById(entityId) {
    let searchParams = new HttpParams();
    searchParams = searchParams.append('entityId', entityId.toString());
    const opts = { params: searchParams };
    this.entityService.getEntityById(opts).subscribe((data: any[]) => {
      console.log(data);
      let result: any = data;
      if (result.personId) {
        this.getPersonById(result.personId);
      }
      else {
        this.getCompanyById(result.companyId);
      }
    });
  }

  getCompanyById(companyId: any) {
    let searchParams = new HttpParams();
    searchParams = searchParams.append('companyId', companyId.toString());
    const opts = { params: searchParams };
    this.companyService.getCompanyById(opts).subscribe((data: any[]) => {
      console.log(data);
      this.billablePerson = data;
    });
  }
}
