import { Component, Input, OnInit } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { GroupService } from 'src/app/services/group.service';

@Component({
  selector: 'app-groups-crm',
  templateUrl: './groups-crm.component.html',
  styleUrls: ['./groups-crm.component.scss'],
  providers: [MessageService, ConfirmationService]
})
export class GroupsCRMComponent implements OnInit {
  @Input() entityId: number;
  groupList: any[]=[];
  activeGroupList:  any[]=[];
  checked: boolean = true;
  includeInactive: boolean = false;

  constructor(
    private groupService : GroupService,
    private messageService : MessageService,
    private confirmationService : ConfirmationService) { }

  ngOnInit(): void {
    this.getAllGroupsByEntityId();
  }
  
  getAllGroupsByEntityId(){
    this.groupService.getGroupsByEntityId(this.entityId).subscribe((data: any[]) =>{
      console.log(data);
      this.groupList = data;
      this.activeGroupList = this.groupList.filter(x => x.isActive == true);      
    });
  }

  removeGroupMemberRole(groupMemberRole: any){
    console.log(groupMemberRole);
    this.confirmationService.confirm({
    message: 'Are you sure you want to delete this role?',
    header: 'Confirm',
    icon: 'pi pi-exclamation-triangle',
    accept: () =>
    {
      this.groupService.deleteGroupMemberRole(groupMemberRole.groupMemberRoleId).subscribe((data: any[]) => {
        console.log(data);
        this.messageService.add({
          severity: "success",
          summary: "Successful",
          detail: "Role deleted successfully.",
          life: 3000
        });
        this.getAllGroupsByEntityId();
      },
      error => {
        this.messageService.add({
          severity: "error",
          summary: "Error",
          detail: error,
          life: 3000,
        });
      });
    }
    });
  }

  includeInactiveGroups(event){
    this.includeInactive = event.checked;
  }

  updateGroupMemberRole(groupMemberRole: any){
  this.groupService.updateGroupMemberRole(groupMemberRole).subscribe(
    response => {
      this.messageService.add({ severity: 'success',
                                summary: 'Successful',
                                detail: 'Status updated successfully.',
                                life: 3000
                              });
    },
    error => {
      console.log(error);
      this.messageService.add({ severity: 'error', summary: 'Error', detail: error, life: 3000 });
    });
  }

   updateGroupMember(groupMember: any){
    this.groupService.updateGroupMember(groupMember).subscribe(
      response => {
        this.messageService.add({ severity: 'success',
                                  summary: 'Successful',
                                  detail: 'Member updated successfully.',
                                  life: 3000
                                });
      },
      error => {
        console.log(error);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: error, life: 3000 });
      });
    }
  
}
