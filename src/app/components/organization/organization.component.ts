import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { AppBreadcrumbService } from 'src/app/app.breadcrumb.service';
import { OrganizationService } from 'src/app/services/organization.service';

@Component({
  selector: 'app-organization',
  templateUrl: './organization.component.html',
  styleUrls: ['./organization.component.scss']
})
export class OrganizationComponent implements OnInit {
  organizationList: any[]
  showTable: boolean;
  showLoader: boolean;  
  items: MenuItem[];
  selectedOrganization: any;

  constructor(private router: Router,
              private organizationService: OrganizationService,
              private breadcrumbService: AppBreadcrumbService) { this.breadcrumbService.setItems([
        {label: 'Home', routerLink: ['/']},
        {label: 'Organization List'}
    ]);
    this.showTable=false;
    this.showLoader=true; }

  ngOnInit(): void {
    this.getAllOrganizations();

    this.items = [{
      label: 'Options',
      items: [
      {
        label: 'View',
        icon: 'pi pi-eye',
        command: () => {
            this.update(true);
        }
      },
      {
        label: 'Edit',
        icon: 'pi pi-pencil',
        command: () => {
            this.update(false);
        }
      }
    ]}
    ];
  }

  openNew(){
    this.router.navigate(['setup/organizationDetails'], {
      queryParams: { organization: 0, isAddNewRecord: true, isViewOnly: false }
    });
  }

  update(viewOnly: boolean){
    this.router.navigate(['setup/organizationDetails'], {
    queryParams: { organization: this.selectedOrganization.organizationId, isAddNewRecord: false, isViewOnly: viewOnly },
    });
  }

  delete(){

  }

  setActiveRow(organization: any){
    this.selectedOrganization = organization;
    console.log(JSON.stringify(organization));
  }


  getAllOrganizations(){
    this.organizationService.getAllOrganizations().subscribe((data: any[]) => {
      console.log(data);
      if ((data.length > 0)) {
        this.organizationList = data;
        this.showTable=true;
        this.showLoader=false;      
      }
      
    });
  }


}
