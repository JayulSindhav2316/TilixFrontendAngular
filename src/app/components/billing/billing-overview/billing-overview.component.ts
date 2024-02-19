import { Component, OnInit } from '@angular/core';
import { AppBreadcrumbService } from '../../../app.breadcrumb.service';

@Component({
  selector: 'app-billing-overview',
  templateUrl: './billing-overview.component.html',
  styleUrls: ['./billing-overview.component.scss']
})
export class BillingOverviewComponent implements OnInit
{
  constructor(private breadcrumbService: AppBreadcrumbService,)
  {
    this.breadcrumbService.setItems([
      { label: 'Home' },
      { label: 'Billing' },
      { label: 'Dashboard' }
    ]);
  }

  ngOnInit(): void
  {

  }
}
