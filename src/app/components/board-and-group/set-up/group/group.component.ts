import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { AppBreadcrumbService } from 'src/app/app.breadcrumb.service';
import { AuthService } from 'src/app/services/auth.service';
import { GroupService } from 'src/app/services/group.service';

@Component({
  selector: 'app-group',
  templateUrl: './group.component.html',
  styleUrls: ['./group.component.scss'],
  providers: [MessageService, ConfirmationService]
})
export class GroupComponent implements OnInit {
  items: MenuItem[];
  boardsGroupsList : any[]=[];
  activeGroupsList : any[]=[];
  group: any;
  currentUser: any;
  organizationId: number;
  includeInactive: boolean = false;

  constructor(private router: Router,
    private groupService: GroupService,    
    private authService: AuthService,
    private breadcrumbService: AppBreadcrumbService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService ) {
    this.breadcrumbService.setItems([
      {label: 'Home', routerLink: ['/']},
      {label: 'Set Up'},
      {label: 'Groups'},
    ]); 
    }

  ngOnInit(): void {
    this.currentUser = this.authService.currentUserValue;
    this.organizationId = this.currentUser.organizationId;
    this.getBoardGroupList();
    this.setMenuItems();
  }

  getBoardGroupList(){
    this.groupService.getAllGroupsByOrganizationId(this.organizationId).subscribe((data: any[]) =>{
      console.log(data);
      this.boardsGroupsList = data;
      this.activeGroupsList = this.boardsGroupsList.filter(x => x.isActive == true);
    });
  }

  openNew() {
    this.router.navigate(['setup/groupsDetails'], {
      state: { group: this.group, isNewRecord: true } 
    });
  }

  update() {
    this.router.navigate(['setup/groupsDetails/Edit'], {    
      state: { group: this.group, isNewRecord: false }
    });
  }

  setActiveRow(group: any){
    this.group = group;
  }

  setMenuItems(){
    this.items = [{
      label: 'Options',
      items: [{
        label: 'Edit Group',
        icon: 'pi pi-sitemap',
        command: () =>
        {
          this.update();
        }
      },
      {
        label: 'Delete Group',
        icon: 'pi pi-trash',
        command: () =>
        {
          this.deleteGroup();
        }
      }

      ]
    }];
  }

  includeInactiveGroups(event){
    this.includeInactive = event.checked;
    if(this.includeInactive)
    {
      this.activeGroupsList = this.boardsGroupsList;
    }
    else
    {
      this.activeGroupsList = this.boardsGroupsList.filter(x => x.isActive == true);
    }
  }

  deleteGroup(){
    this.confirmationService.confirm({
      message: 'This is an irreversible process. Are you sure you want proceed ?',
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () =>
      {        
        this.groupService.deleteGroup(this.group.groupId).subscribe((data: any[]) => {
          console.log(data);
          this.messageService.add({
            severity: "success",
            summary: "Successful",
            detail: "Group deleted Succesfully.",
            life: 3000
          });
          this.getBoardGroupList();
        },
        error => {
          this.messageService.add({
            severity: "error",
            summary: "Error",
            detail: error,
            life: 3000,
          });
        });
      },
      reject: () =>{}
    });
  }

  confirmDeleteGroup(){
    this.confirmationService.confirm({
      message: 'This is an irreversible process. Are you sure you want proceed ?',
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () =>
      {        
        this.groupService.deleteGroup(this.group.groupId).subscribe((data: any[]) => {
          console.log(data);
          this.messageService.add({
            severity: "success",
            summary: "Successful",
            detail: "Group deleted Succesfully.",
            life: 3000
          });
          this.getBoardGroupList();
        },
        error => {
          this.messageService.add({
            severity: "error",
            summary: "Error",
            detail: error,
            life: 3000,
          });
        });
      },
      reject: () =>{}
    });
  }
}
