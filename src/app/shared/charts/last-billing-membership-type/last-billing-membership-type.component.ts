import { Component, OnInit } from '@angular/core';
import { AutoBillingService } from '../../../services/auto-billing.service';

@Component({
  selector: 'app-last-billing-membership-type',
  templateUrl: './last-billing-membership-type.component.html',
  styleUrls: ['./last-billing-membership-type.component.scss']
})
export class LastBillingMembershipTypeComponent implements OnInit {
  chartDataByMembershipType: any;
  membershiptTypeLabel: string[]=[];
  membershipTypeRevenue: any[]=[];  

  constructor(private autoBillingService : AutoBillingService) { }

  ngOnInit(): void
  { 
    this.autoBillingService.getCategorySummaryByBillingDocumentId(0).subscribe(
    response => {
      console.log(response);
      this.bindchart(response);      
    },
    error => {
      console.log(error);
    });
  }

  bindchart(data: any[])
  {
    data.forEach(element => {
      this.membershiptTypeLabel.push(element.categoryName);
      this.membershipTypeRevenue.push(element.amount)
    });

    this.chartDataByMembershipType = {
      labels: this.membershiptTypeLabel,
      datasets: [
        {
          label: 'Last Billing By Membership type',
          backgroundColor: '#42A5F5',
          data: this.membershipTypeRevenue
        }
      ]
    };
  }

}
