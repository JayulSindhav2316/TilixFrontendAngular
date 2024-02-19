import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-billing',
  templateUrl: './billing.component.html',
  styleUrls: ['./billing.component.scss']
})
export class BillingComponent implements OnInit
{

  index = 0;

  constructor() { }

  ngOnInit(): void
  {
  }

  setActiveTab(tabIndex: number)
  {
    this.index = tabIndex;
    console.log('-< Active Tab Set to:' + tabIndex);
  }

}
