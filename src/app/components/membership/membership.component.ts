import { Component, OnInit, ViewChild } from '@angular/core';
import { MembershipType } from '../../models/membership-type';
import { MembershipService } from '../../services/membership.service'
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { AppBreadcrumbService } from '../../app.breadcrumb.service';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { Router } from '@angular/router';

@Component({
  selector: 'app-membership',
  templateUrl: './membership.component.html',
  styleUrls: ['./membership.component.scss'],
  styles: [`
       :host ::ng-deep .p-dialog {
            width: 150px;
            margin: 0 auto 2rem auto;
            display: block;
        }

        @media screen and (max-width: 960px) {
            :host ::ng-deep .p-datatable .p-datatable-tbody > tr > td:last-child {
                text-align: center;
            }

            :host ::ng-deep .p-datatable .p-datatable-tbody > tr > td:nth-child(6) {
                display: flex;
            }
        }
    `],
      animations: [
      trigger('rowExpansionTrigger', [
          state('void', style({
              transform: 'translateX(-10%)',
              opacity: 0
          })),
          state('active', style({
              transform: 'translateX(0)',
              opacity: 1
          })),
          transition('* <=> *', animate('400ms cubic-bezier(0.86, 0, 0.07, 1)'))
      ])
      ],
    providers: [MessageService, ConfirmationService]
})
export class MembershipComponent implements OnInit {

  membershipDialog: boolean;
  feeDialog: boolean;
  membershipTypeList: MembershipType[];
  membershipType: MembershipType;
  selectedMemberships: any[];
  items: MenuItem[];
  activeRow: any;
  selectedPeriod: { name: string; code: string; };
  selectedType: { name: string; code: string; }
  responseArray: any[];
  submitted: boolean;
  showTable: boolean;
  showLoader: boolean;

  cols: any[];
  periodList: { name: string; code: number; }[];
  categoryList: { name: string; code: number; }[];
  frequencies: { name: string; code: number; }[];
  glAccountList: { name: string; code: number; }[];

  constructor(private membershipService: MembershipService, 
              private breadcrumbService: AppBreadcrumbService,
              private messageService: MessageService, 
              private confirmationService: ConfirmationService,
              private router: Router) {
      this.breadcrumbService.setItems([
        {label: 'Home', routerLink: ['/']},
        {label: 'Set Up'},
        {label: 'Membership Types'},
    ]);
    this.showTable=false;
    this.showLoader=true;  
  }

  ngOnInit(): void {

  this.getMemershipType();
  

  this.cols = [
      {field: 'name', header: 'Name'},
      {field: 'code', header: 'Code'},
      {field: 'description', header: 'Description'},
      {field: 'period', header: 'Period'},
      {field: 'category', header: 'Category'},
      {field: 'status', header: 'Active'}
  ];

  this.items = [{
    label: 'Options',
    items: [{
        label: 'Edit',
        icon: 'pi pi-pencil',
        command: () => {
            this.update();
        }
    },
    {
        label: 'Delete',
        icon: 'pi pi-trash',
        command: () => {
            this.delete();
        }
    }
  ]}
  ];
}

openNew() {

  this.router.navigate(['setup/membershipDetails'], {
    state: { membershipType: this.membershipType, isAddNewRecord: true }
  });
}
update() {
  console.log('Membership Type edit:'+ JSON.stringify(this.membershipType));
  this.router.navigate(['setup/membershipDetails/Update'], {
    
    state: { membershipType: this.membershipType, isAddNewRecord: false }
  });
}

    delete() {
    const body = {
      MembershipTypeId: this.membershipType.membershipTypeId
    };

    this.confirmationService.confirm({
    message: 'Are you sure you want to delete Membership Type ?',
    header: 'Confirm',
    icon: 'pi pi-exclamation-triangle',
    accept: () => {
      console.log('Deleting Membership Type:' +  JSON.stringify(body));
      this.membershipService.deleteMembershipType(body).subscribe(
        response => {
          this.messageService.add({ severity: 'success',
                                    summary: 'Successful',
                                    detail: 'Membbership deleted succesfully.',
                                    life: 3000
                                  });
          this.getMemershipType();
          },
        error => {
          console.log(error);
          this.messageService.add({ severity: 'error', summary: 'Error', detail: error, life: 3000 });
    });
  }
  });
}


setActiveRow(membershipType: MembershipType){
  this.membershipType = membershipType;
}

getMemershipType(){
  this.membershipService.getMembershipType().subscribe((data: any[]) => {
    console.log('Membership Types:' + JSON.stringify(data));
    this.membershipTypeList = data;
    this.showTable=true;
    this.showLoader=false;
  });
}

}
