import { Component, OnInit } from '@angular/core';
import { AutoBillingService } from 'src/app/services/auto-billing.service';

@Component({
  selector: 'app-last-billing-success',
  templateUrl: './last-billing-success.component.html',
  styleUrls: ['./last-billing-success.component.scss']
})
export class LastBillingSuccessComponent implements OnInit
{
  chartDataByInvoice: any;

  constructor(private autoBillingService : AutoBillingService) { }

  ngOnInit(): void
  {
    this.bindChart();    
  }

  bindChart()
  {
    this.autoBillingService.getLastBillingChartInvoiceChartData().subscribe(
      response => {
      console.log(response);
      this.chartDataByInvoice = {
        labels: ['Last Billing Invoice(s)'],
        datasets: [
          {
            label: 'Invoice Amount Created',
            backgroundColor: '#42A5F5',
            data: [response.amountCreated]
          },
          {
            label: 'Invoice Amount Collected',
            backgroundColor: '#FFA726',
            data: [response.amountApproved]
          }
        ]
      };
    },
    error => {
      console.log(error);
    });
  }

}
