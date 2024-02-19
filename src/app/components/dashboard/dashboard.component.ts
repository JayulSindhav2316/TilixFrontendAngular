import { Component, OnInit } from '@angular/core';
import { AppBreadcrumbService } from 'src/app/app.breadcrumb.service';
import { MembershipService } from '../../services/membership.service';
import { ReceiptService } from '../../services/receipt.service';
import { ConfigurationService } from '../../services/configuration.service';
import { User } from 'src/app/models/user';
import { AuthService } from '../../services/auth.service';
import { ContainerService } from '../../services/container.service';
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  membershipsData: any;

  salesData: any;

  expirationData: any;
  documentSearchData: any;

  terminationData: any;
  showLoader: boolean;
  showDocumentChart: boolean;
  showMembershipChart: boolean;
  membershipsByTypeOptions: any;
  expirationOptions: any;
  terminationsOptions:any;
  salesOptions:any;
  documentSearchOptions:any;
  configuration: any;
  currentUser: User;
  activeUserData: any;
  activeUserOptions: any;
  constructor( private membershipService: MembershipService,
              private receiptService: ReceiptService,
              private breadcrumbService: AppBreadcrumbService,
              private configurationService:ConfigurationService,
              private authService: AuthService,
              private containerService: ContainerService)
              { 
                this.breadcrumbService.setItems([]);

                this.salesOptions = {
                  plugins: {
                    legend: false,
                 },
                 maintainAspectRatio: false,
                 responsive: true
              };

              
              this.expirationOptions = {
                plugins: {
                  legend: false,
              },
              maintainAspectRatio: false,
              responsive: true
            };
            this.terminationsOptions = {
              plugins:{
                legend: false,
              },
              maintainAspectRatio: false,
              responsive: true
          };
          this.membershipsByTypeOptions = {
            plugins:{
              legend: false,
            },
            maintainAspectRatio: false,
            responsive: true
        };
        this.documentSearchOptions = {
          plugins:{
            legend: false,
          },
          maintainAspectRatio: false,
          responsive: true
      };
      this.activeUserOptions = {
        plugins: {
          legend: false,
      },
      maintainAspectRatio: false,
      responsive: true
    };
  }

  ngOnInit(): void {
    this.currentUser = this.authService.currentUserValue;
    this.showLoader = true;
    this.showMembershipChart = false;
    this.showDocumentChart = false;
    this.getConfiguration(this.currentUser.organizationId);
   
  }

  getConfiguration(organizationId){
    this.configurationService.getConfigurationByOrganizationId(organizationId).subscribe((data: any) =>
    {
      console.log('Configuration:'+ JSON.stringify(data));
      this.configuration = data;

      //Show hide tabs
      console.log('Configuration Dashboard Type:'+ JSON.stringify(this.configuration.dashboardType));
      if(this.configuration.dashboardType === 'Membership'){
        this.getMembershipTypeData();
        this.getSalesData();
        this.getMembershipExpirationData();
        this.getMembershipTerminationChart();
      }
      else if(this.configuration.dashboardType === 'Document'){
        this.getDocumentSearchData();
        this.getActiveUserData();
      }
     
    });
      
  }
 getMembershipTypeData(){
   this.membershipService.getMembershipTypeChart().subscribe((data: any) =>
    {
      console.log(data);
      this.membershipsData = data;
      this.showLoader = false;
      this.showMembershipChart =  true;
     
    });
  }
  getMembershipTerminationChart(){
    this.membershipService.getMembershipTerminationChart().subscribe((data: any) =>
     {
       console.log(data);
       this.terminationData = data;
     });
   }
 
  getSalesData(){
    this.receiptService.getSalesByMonth().subscribe((data: any) =>
     {
       console.log(data);
       this.salesData = data;
     
     });
   }

   getMembershipExpirationData(){
    this.membershipService.getMembershipExpirationChart().subscribe((data: any) =>
     {
       console.log(data);
       this.expirationData = data;
     
     });
   }
   getDocumentSearchData(){
    this.containerService.getDocumentSearchChart().subscribe((data: any) =>
     {
       console.log(data);
       this.documentSearchData = data;
       this.showDocumentChart =  true;
     });
   }
   getActiveUserData(){
    this.containerService.getActiveUserChart().subscribe((data: any) =>
     {
       console.log(data);
       this.activeUserData = data;
       this.showDocumentChart =  true;
     });
   }
}
