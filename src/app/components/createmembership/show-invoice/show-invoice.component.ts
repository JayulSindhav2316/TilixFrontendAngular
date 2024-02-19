import { Component, OnInit ,OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { InvoiceService } from '../../../services/invoice.service';
import { EventCommunicationService } from '../../../services/event-communication.service'
import { HttpParams } from '@angular/common/http';
import { PersonService } from '../../../services/person.service';
import { DecimalPipe } from '@angular/common';
import { EntityService } from '../../../services/entity.service';

@Component({
  selector: 'app-show-invoice',
  templateUrl: './show-invoice.component.html',
  styleUrls: ['./show-invoice.component.scss']
})
export class ShowInvoiceComponent implements OnInit, OnDestroy {
  messages: any[] = [];
  subscription: Subscription;
  showInvoice: boolean;
  invoice: any;
  billingAddress: any;
  invoiceTotal: number;
  logo: any;
  // invoiceNotesExist: boolean;
  
   constructor(private eventCommunicationService: EventCommunicationService,
                private invoiceService: InvoiceService,
                private entityService: EntityService,
                private personService: PersonService) {
        // subscribe to Invoice component to get newly created invoiceid 
        
        this.subscription = this.eventCommunicationService.getMessage().subscribe(message => {
          if (message) {
            console.log(message);
            const data  = message.text;
            this.getInvoiceDetails(data);
          } else {           
            this.messages = [];
          }
        });
    }

    ngOnDestroy() {
        // unsubscribe to ensure no memory leaks
        this.subscription.unsubscribe();
    }

  ngOnInit(): void {
    this.showInvoice=false;
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

      this.getBillingAddress(this.invoice.billableEntityId);
      // this.checkForInvoiceNotes(this.invoice.notes);
    });
  }

  getBillingAddress(entityId: number){
    console.log('Fetching Address for Id:' + entityId.toString());
    let searchParams = new HttpParams();
    searchParams = searchParams.append('entityId', entityId.toString());
    const opts = {params: searchParams};
    this.entityService.getBillingAddressByEntityId(opts).subscribe((data: any) =>
    {
      console.log(data);
      this.billingAddress = data;
      this.getHeaderImage();
      this.showInvoice=true;
    });
  }

  getHeaderImage()
  {
    this.invoiceService.getHeaderImage(this.invoice.organization.organizationId).subscribe(data => {
        this.createImageFromBlob(data);
        console.log(data);
    }, error => {
      console.log(error);
    });
  }

  createImageFromBlob(image: Blob) {
    let reader = new FileReader();
    reader.addEventListener('load', () => {
      this.logo = [reader.result];
    }, false);
    if (image) {
      reader.readAsDataURL(image);
      this.showInvoice=true;
    }
  }

  // checkForInvoiceNotes(invoiceNotes: string)
  // {
  //   if(invoiceNotes){
  //     if(invoiceNotes.length>0){
  //       this.invoiceNotesExist = true;
  //     }
  //   }
  //   else{
  //     this.invoiceNotesExist = false;
  //   }
  // }

}
