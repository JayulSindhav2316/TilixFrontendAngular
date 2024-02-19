import { Component, OnInit } from '@angular/core';
import { AutoBillingService } from 'src/app/services/auto-billing.service';

@Component({
  selector: 'app-last-billing-outstanding',
  templateUrl: './last-billing-outstanding.component.html',
  styleUrls: ['./last-billing-outstanding.component.scss']
})
export class LastBillingOutstandingComponent implements OnInit
{
  chartDataByOutstanding: any;

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
      this.chartDataByOutstanding = {
      labels: ['Invoice Amount Approved', 'Invoice Amount Declined'],
      datasets: [
        {
          data: [response.amountApproved, response.amountDeclined],
          backgroundColor: [
            "#36A2EB",
            "#FFCE56"
          ],
          hoverBackgroundColor: [
            "#36A2EB",
            "#FFCE56"
          ]
        }]
      };
    },
    error => {
      console.log(error);
    });
  }

}
