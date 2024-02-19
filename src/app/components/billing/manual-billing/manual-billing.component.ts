
import { HttpParams } from '@angular/common/http';
import { Component, OnInit, Input, Inject,LOCALE_ID, OnDestroy, Injectable } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { AppBreadcrumbService } from '../../../app.breadcrumb.service';
import { BillingService } from '../../../services/billing.service';
import { formatDate } from '@angular/common';
import { faEdit } from '@fortawesome/free-solid-svg-icons';
import * as moment from 'moment';
import { MembershipService } from '../../../services/membership.service';
import { InvoiceService } from '../../../services/invoice.service';
import { ExportExcelService } from '../../../services/export-excel.service';
import { AuthService } from '../../../services/auth.service';
import * as fs from 'file-saver';
import { interval, Observable, Subject, Subscription, timer } from 'rxjs';
import { switchMap } from 'rxjs/operators';
@Component({
  selector: 'app-manual-billing',
  templateUrl: './manual-billing.component.html',
  styleUrls: ['./manual-billing.component.scss'],
  providers: [MessageService, ConfirmationService]
})

export class ManualBillingComponent implements OnInit, OnDestroy {
  subscription: Subscription
  everyFiveSeconds: Observable<number> = timer(0, 5000);
  items: MenuItem[];
  invoiceItems: MenuItem[];
  billingCycles: any;
  row: any;
  showDetail: boolean;
  selectedCycle: any;
  selectedDate: any;
  showMain: boolean;
  manualBillingList: any;
  manualBillingMemberCount: any;
  manualBillingRevenue: number = 0;
  showForm: boolean;
  faEdit = faEdit;
  invalidDates: Array<Date>
  membershipCategory: { name: string; code: string; }[];
  membershipTypes: any[];
  selectedMembershipCategory: any
  selectedMembershipType: any;
  editInvoice: boolean = false;
  selectedInvoice: any;

  currentUser: any;
  billingForm = this.formBuilder.group({
    cycleId: [0],
    cycleName: ['', Validators.required],
    category: ['', Validators.required],
    membershipType: ['', Validators.required],
    throughDate: ['', Validators.required],
  });


  constructor(  private billingService: BillingService,
    private breadcrumbService: AppBreadcrumbService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private formBuilder: FormBuilder,
    private membershipService:  MembershipService,
    private excelService: ExportExcelService,
    private invoiceService: InvoiceService,
    private authService: AuthService,
    @Inject(LOCALE_ID) private locale: string) { 
      this.breadcrumbService.setItems([
      { label: 'Home' },
      { label: 'Billing' },
      { label: 'Manual Billing' }
    ])}

  ngOnInit(): void {
    this.showDetail = false;
    this.showMain =true;
    this.GetBillingCycles();
    this.getMembershipCategories();
    let today = new Date();
    let invalidDate = new Date();
    invalidDate.setDate(today.getDate() - 1);
    this.invalidDates = [today,invalidDate];
    this.showForm=false;
    this.currentUser = this.authService.currentUserValue;
    this.items = [{
      label: 'Options',
      items: [{
        label: 'Finalize',
        icon: 'pi pi-check',
        command: () =>
        {
          this.finalizePaperInvoice();
        }
      },
      {
        label: 'View Details',
        icon: 'pi pi-list',
        command: () =>
        {
          this.showDetails();
        }
      }

      ]
    }
    ];

    this.invoiceItems = [{
      label: 'Options',
      items: [{
        label: 'Edit Invoice',
        icon: 'pi pi-pencil',
        command: () =>
        {
          this.editInvoice = true;
          this.showDetail = false;
          this.showForm = false;
          this.showMain = false;
        }
      },
      {
        label: 'Delete Invoice',
        icon: 'pi pi-trash',
        command: () =>
        {
          this.deletePaperInvoice();
        }
      }

      ]
    }
    ];
  }
  
  getMembershipCategories(){
  
   this.membershipService.getMembershipCategoryList().subscribe((data: any) =>
   {
     console.log(data);
     this.membershipCategory = data;
   });
 
  }

  getMembershipTypes(event){
    this.billingForm.get('membershipType')?.reset();
    let membershipCategory = event.value;
    console.log('selected memberships catgeories;' +membershipCategory.code);

		  let searchParams = new HttpParams();
		  searchParams = searchParams.append('selectedCategories', membershipCategory.code);
		  const opts = { params: searchParams };
	  	this.membershipService.getMembershipTypeByCategories(opts).subscribe((data: any) => {
			console.log(data);
			this.membershipTypes = data;
		});
  
   }

  finalizePaperInvoice(){
    let item =  this.row;
    console.log('Finalize cycle:' + JSON.stringify(item));
    this.confirmationService.confirm({
          message: 'Are you sure that you want to finalize this cycle?',
          accept: () => {
                // call Finalization Service
                const body = {
                  billingCycleId: item.billingCycleId.toString()
                };
                console.log('Finalize Cycle:' +  JSON.stringify(body));
                this.billingService.finalizeBillingCycle(body).subscribe(
                  response => {
                    this.messageService.add({ severity: 'success',
                                              summary: 'Successful',
                                              detail: 'Billing Cycle has been scheduled to finalize.',
                                              life: 3000
                                            });
                     this.GetBillingCycles();
                    
                  },
                  error => {
                    console.log(error);
                    this.messageService.add({ severity: 'error', 
                                              summary: 'Error', 
                                              detail: error, 
                                              life: 3000 });
                  });
          }
      });

  }

  showDetails(){
    this.showDetail = true;
    this.showMain =false;
    this.selectedCycle = this.row.cycleName;
    this.selectedDate = formatDate(new Date(this.row.runDate),"MM/dd/yyyy",this.locale);
    this.getPaperInvoiceByCycleId(this.row.billingCycleId)
  }
  goBack(){
    this.GetBillingCycles();
    this.showDetail = false;
    this.showMain =true;
  }

  setActiveRow(item: any){
    this.row = item;
    console.log('Selected Row:' + JSON.stringify(this.row));    
    this.items[0].items[0].disabled = this.row.status == 3 || this.row.invoiceCount == 0 ? true : false;    
  }

  GetBillingCycles(){
    this.billingService.getBillingCycles().subscribe((data: any) =>
    {
      console.log(data);
      this.billingCycles = data;
    } );
  }
  deleteCycle(item: any){
    console.log('Deleting cycle:' + JSON.stringify(item));
    this.confirmationService.confirm({
          message: 'Are you sure that you want to delete this cycle?',
          accept: () => {
                // call Delete Service
                const body = {
                  billingCycleId: item.billingCycleId.toString()
                };
                console.log('Deleting Cycle:' +  JSON.stringify(body));
                this.billingService.deleteCycle(body).subscribe(
                  response => {
                    this.messageService.add({ severity: 'success',
                                              summary: 'Successful',
                                              detail: 'Billing Cycle deleted succesfully.',
                                              life: 3000
                                            });
                    // remove from current list
                    this.billingCycles = this.billingCycles.filter(obj => obj !== item);
                  },
                  error => {
                    console.log(error);
                    this.messageService.add({ severity: 'error', 
                                              summary: 'Error', 
                                              detail: error, 
                                              life: 3000 });
                  });
          }
      });

  }

  regenrateCycle(item: any){
    console.log('Regenrate billing cycle:' + JSON.stringify(item));
    this.confirmationService.confirm({
          message: 'Are you sure that you want to regenerate this cycle?',
          accept: () => {
                // call Delete Service
                const body = {
                  billingCycleId: item.billingCycleId.toString()
                };
                console.log('Deleting Cycle:' +  JSON.stringify(body));
                this.billingService.regenrateCycle(body).subscribe(
                  response => {
                    this.messageService.add({ severity: 'success',
                                              summary: 'Successful',
                                              detail: 'Regenerating the Billing Cycle.',
                                              life: 3000
                                            });
                    this.GetBillingCycles();
                  },
                  error => {
                    console.log(error);
                    this.messageService.add({ severity: 'error', 
                                              summary: 'Error', 
                                              detail: error, 
                                              life: 3000 });
                  });
          }
      });

  }

  getPaperInvoiceByCycleId(cycleId){
    let searchParams = new HttpParams();
    searchParams = searchParams.append('BillingCycleId', cycleId.toString());
    const opts = {params: searchParams};
    console.log('Geting data for cycle:' +  JSON.stringify(opts));
    this.billingService.getPaperInvoicesByCycleId(opts).subscribe((data: any) =>
    {
      console.log(data);
      this.manualBillingList = data
      this.manualBillingMemberCount = this.manualBillingList.length;
      if(this.manualBillingMemberCount > 0){
        this.manualBillingRevenue =  this.manualBillingList.map(o => o.amount).reduce((a, c) => { return a + c });
      }
      else{
        this.manualBillingRevenue = 0;
      }
    });
    
  }
  addNewCycle(){
    this.showForm=true;
    this.showMain=false;
    this.billingForm.reset();
  }

  createBillingCycle(){
    if (this.billingForm.valid)
    {
      let selectedMemberships = this.billingForm.get('membershipType').value;
      let membershipIds = selectedMemberships.map(o => o.membershipTypeId);
      const body = {
        CycleName: this.billingForm.get('cycleName').value,
        ThroughDate: moment( this.billingForm.get('throughDate').value).utc(true).format(),
        MembershipType: membershipIds
      };
  
      console.log('Creating Billing Cycle:' +  JSON.stringify(body));
      this.billingService.createBillingCycle(body).subscribe(
        response => {
          this.messageService.add({ severity: 'success',
                                    summary: 'Successful',
                                    detail: 'Billing cycle created succesfully.Billing service will notify when the invoices are ready.',
                                    life: 5000
                                  });
          this.showForm=false;
          this.showMain=true;
          this.GetBillingCycles();
        },
        error => {
          console.log(error);
          this.messageService.add({ severity: 'error', 
                                    summary: 'Error', 
                                    detail: error, 
                                    life: 3000 });
        });
    }
    else
    {
      this.messageService.add({ severity: 'warning', 
                                summary: 'Warning', 
                                detail: 'Please enter the required information.', 
                                life: 3000 });
    }
  }
  hideDialog(){
    this.showForm=false;
    this.showMain=true;
  }
  exportToExcel(){
    console.log(this.manualBillingList);

    let dataForExcel = [];
    let headers = ['Invoice Id', 'Billable Member','Member Name','Membership Type','Count of Membership','Due Date', 'Description','Notification', 'Amount'];
      this.manualBillingList.forEach((row: any) => {
      dataForExcel.push(Object.values(row))
    })

    let data = {
      title:  this.selectedCycle,
      data: this.manualBillingList,
      headers: headers
    }
    this.excelService.exportBillinCycleReport(data);
  }

  exportToPDF(){
    this.invoiceService.getPaperInvoicePdfByCycleId(this.row.billingCycleId,this.currentUser.organizationId ).subscribe((data: any) =>
    {
      console.log(data);
      let parsedResponse =(data)
      var blob = new Blob([data], {type: 'application/pdf'});
      var filename = 'BillingReport-'+this.selectedCycle+'.pdf';
      fs.saveAs(blob, filename);
    } );
  }

  ngOnDestroy() {
    if(this.subscription) {this.subscription.unsubscribe();}
  }

  setActiveInvoice(invoice: any){
    console.log(invoice);
    this.selectedInvoice = invoice;
    this.invoiceItems[0].items[0].disabled = this.row.status == 3 ? true : false;
    this.invoiceItems[0].items[1].disabled = this.row.status == 3 ? true : false;
  }

  closeEditInvoice(){
    this.showDetails();
    this.editInvoice = false;
    this.showDetail = true;
    this.showForm = false;
    this.showMain = false;
  }

  deletePaperInvoice(){
    this.confirmationService.confirm({
      message: 'Are you sure that you want to delete this paper invoice?',
      accept: () => {
      this.invoiceService.deletePaperInvoice(this.selectedInvoice.paperInvoiceId).subscribe((data: any) =>
        {
          this.messageService.add({ severity: 'success',
                                        summary: 'Successful',
                                        detail: 'Paper invoice deleted successfully.',
                                        life: 5000
                                      });
          this.closeEditInvoice();
        });
      }
    });
  }

}
