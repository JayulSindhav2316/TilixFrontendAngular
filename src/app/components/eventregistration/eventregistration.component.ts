import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-eventregistration',
  templateUrl: './eventregistration.component.html',
  styleUrls: ['./eventregistration.component.scss']
})
export class EventregistrationComponent implements OnInit {

  searchList: any[];
  searchTypeList: any[];
  submitted: boolean;
  allowSearch: boolean;
  searchCompany: boolean;
  selectedSearchType: { name: string; code: string };

  constructor() { }

  ngOnInit(): void {
  }

}
