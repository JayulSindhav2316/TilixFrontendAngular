import { Component, OnInit } from '@angular/core';
import { PrimeNGConfig } from 'primeng/api';
import { AppBreadcrumbService } from './app.breadcrumb.service';
import { environment } from '../environments/environment';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  topbarTheme = 'dim';

  menuTheme = 'dim';

  layoutMode = 'light';

  menuMode = 'static';

  isRTL = false;

  inputStyle = 'outlined';

  ripple: boolean;

  constructor(
    private primengConfig: PrimeNGConfig    
  ) { }

  ngOnInit() {
    this.primengConfig.ripple = true; 
  }
}
