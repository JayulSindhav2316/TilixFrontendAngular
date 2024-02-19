import { Component, OnInit, Input,Inject,LOCALE_ID  } from '@angular/core';
import { Table } from 'primeng/table';
import { AppBreadcrumbService } from '../../app.breadcrumb.service';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { HttpParams } from '@angular/common/http';
import { PersonService } from '../../services/person.service';
import { DatePipe } from '@angular/common';
import { ShoppingCartService } from '../../services/shopping-cart.service';
import { AuthService } from '../../services/auth.service';
import { MembershipService } from 'src/app/services/membership.service';
import { InvoiceService } from 'src/app/services/invoice.service';
import { InvoiceItemService } from 'src/app/services/invoice-item.service';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import * as moment from 'moment';
import { OrganizationService } from 'src/app/services/organization.service';
import { LineItemComponent } from 'src/app/shared/line-item/line-item.component';
import { EntityService } from '../../services/entity.service';
import { CompanyService } from '../../services/company.service';
import { BehaviorSubject } from 'rxjs';
import { formatDate } from '@angular/common';
@Component({
  selector: 'app-invoicing',
  templateUrl: './invoicing.component.html',
  styleUrls: ['./invoicing.component.scss']
})
export class InvoicingComponent implements OnInit {
  entity:any;
  person: any;
  company:any;
  parentControl: any;
  entityId: number;
  companyInvoice: boolean;
  itemModel: {
    ItemId: any;
    Description: any;
    Quantity: any;
    UnitRate: any;
  };
  employees:any[];
  invoiceDueDate: Date;
  submitted: boolean;
  showSearchControl:boolean;
  invoiceForm = this.formBuilder.group({
  InvoiceId: [0],
  BillableEntityId: [0],
  InvoiceDueDate: ['', [Validators.required]],
  TotalAmount:[0],
  Note:[''],
  Items: this.formBuilder.array([])});
  showInvoiceForm:boolean;
 
  entityForm = this.formBuilder.group({
    EntityId: [0],
    ContactEntity: [''],
    Phone: [''],
    Title: [''],
  });
  createNew: boolean;
  currentUser: any;
get Items() {
    return this.invoiceForm.get('Items') as FormArray;
}
constructor(private breadcrumbService: AppBreadcrumbService,
  private personService:  PersonService,
  private router: Router,
  private shoppingCartService: ShoppingCartService,
  private authService: AuthService,
  private membershipService: MembershipService,
  private invoiceService: InvoiceService, 
  private formBuilder: FormBuilder,
  private route: ActivatedRoute,
  private entityService: EntityService,
  private organizationService: OrganizationService,
  private companyService: CompanyService,
  @Inject(LOCALE_ID) private locale: string) { 
    this.breadcrumbService.setItems([
      {label: 'Home', routerLink: ['/']},
      {label: 'Invoice'},
      {label: 'Search Contact'},
      ]);
    this.parentControl="Invoice";
    this.showInvoiceForm=false;
    this.showSearchControl=true;
    this.companyInvoice=false;
    
  }

  ngOnInit(): void {
   this.createNew=false;
   this.currentUser = this.authService.currentUserValue;
  }

  createInvoice(event: any){
    
    console.log('Creating invoice for:'+ event.billableEntityId);
    this.entityId=event.billableEntityId;
    if(this.entityId){
      this.getEntityById();
    }
    this.createNew=false;
  }

  closeSearchControl(){
    this.showSearchControl = false;
    this.breadcrumbService.setItems([
      {label: 'Home', routerLink: ['/']},
      {label: 'Invoice'},
      {label: 'Create Invoice'},
      ]);
    this.invoiceForm.reset();
    this.entityForm.reset();
    const arr = <FormArray>this.invoiceForm.controls.Items;
    arr.controls = [];
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
        console.log('Loading person data')
        this.getPersonById(this.entity.personId);
        this.companyInvoice=false;
      } else {
        console.log('Loading company data')
        this.getCompanyById(this.entity.companyId);
        this.companyInvoice=true;
      }
    });
    
  }
  getPersonById(personId)
  {
    let searchParams = new HttpParams();
    searchParams = searchParams.append('personId',  personId);
    const opts = {params: searchParams};
    this.personService.getPersonById(opts).subscribe((data: any[]) =>
    {
      console.log(data);
      this.person = data;
      this.showInvoiceForm=true;
      this.invoiceForm.get('InvoiceDueDate').setValue(formatDate(new Date(),"MM/dd/yyyy",this.locale));
    });
  }
  getCompanyById(companyId: any)
  {
    console.log('Get data for companyId:' + companyId);
    let searchParams = new HttpParams();
    searchParams = searchParams.append('companyId',  companyId);
    const opts = {params: searchParams};
    this.companyService.getCompanyById(opts).subscribe((data: any[]) =>
    {
      console.log('Company data:' + JSON.stringify(data));
      this.company = data;
      this.showInvoiceForm=true;
      this.invoiceForm.get('InvoiceDueDate').setValue(formatDate(new Date(),"MM/dd/yyyy",this.locale));
    });
  }
  closeItemInvoice(){
    this.showInvoiceForm=false;
    this.showSearchControl=true;
    this.entityId=0;
    this.breadcrumbService.setItems([
      {label: 'Home', routerLink: ['/']},
      {label: 'Invoice'},
      {label: 'Search Contact'},
      ]);
  } 
}
