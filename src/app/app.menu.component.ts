import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
import { Component, OnInit } from '@angular/core';
import { AppComponent } from './app.component';
import { AuthService } from './services/auth.service';
import { StaffService } from './services/staff.service';
import { HttpParams } from '@angular/common/http';
import { MenuItem } from 'primeng/api/menuitem';
@Component({
  selector: 'app-menu',
  template: `
        <ul class="layout-menu">
            <li app-menuitem *ngFor="let item of menuItems; let i = index;" [item]="item" [index]="i" [root]="true"></li>
        </ul>
    `
})
export class AppMenuComponent implements OnInit
{
  currentUser: any;
  staffMenu: any[];
  menuItems:  any[];
  disable: boolean;
  constructor(public app: AppComponent,
    private authService: AuthService, 
    private staffService: StaffService, ) {
    this.disable=true;
    this.currentUser = this.authService.currentUserValue;
   }

   getStaffMenu(){
    let searchParams = new HttpParams();
    searchParams = searchParams.append('staffId', this.currentUser.id.toString());
    const opts = {params: searchParams};
    this.staffService.getStaffMenu(opts).subscribe((data: any) =>
     {
      //  console.log('staff Id:'+this.currentUser.id)
      //  console.log('Menu Items:'+ JSON.stringify(data));
       this.menuItems =  data.staffMenu as MenuItem[];
       this.staffService.setMeuItems(data.accessUrl);
     });
   }
  ngOnInit()
  {
    this.getStaffMenu();
    
  }
}
