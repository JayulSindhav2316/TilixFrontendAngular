import { Component, OnInit } from '@angular/core';
import { Menu } from '../../models/menu';
import { RoleMenuService } from '../../services/role-menu.service';
import { ConfirmationService, MenuItem, MessageService, TreeNode } from 'primeng/api';
import { AppBreadcrumbService } from '../../app.breadcrumb.service';
import { Router } from '@angular/router';
import { RoleComponent } from 'src/app/components/role/role.component';
import { RoleService } from 'src/app/services/role.service';
@Component({
  selector: 'app-role-menu',
  templateUrl: './role-menu.component.html',
  styleUrls: ['./role-menu.component.scss'],
  styles: [`
       :host ::ng-deep .p-dialog {
            height: 450px;
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
  providers: [MessageService, ConfirmationService]
})
export class RoleMenuComponent implements OnInit
{

  menus: Menu[];
  menu: Menu;
  rowGroupMetadata: any;
  roles: any[];
  selectedMenus: Menu[];
  roleId: number;
  roleComponent: RoleComponent;

  constructor(private roleMenuService: RoleMenuService, private breadcrumbService: AppBreadcrumbService, private roleService: RoleService,
    private messageService: MessageService, private confirmationService: ConfirmationService, private router: Router)
  {
    this.breadcrumbService.setItems([
      { label: 'Home', routerLink: ['/']},
      { label: 'Staff Management'},
      { label: 'Link Role - Menus'}
    ]);
  }

  ngOnInit(): void
  {
    this.roleService.getRoles().subscribe((data: any[]) =>
    {
      console.log(data);
      this.roles = data;
    });
  }
  updateRowGroupMetaData()
  {
    this.rowGroupMetadata = {};

    if (this.menus)
    {
      for (let i = 0; i < this.menus.length; i++)
      {
        const rowData = this.menus[i];
        const group = rowData.group;

        if (i === 0)
        {
          this.rowGroupMetadata[group] = { index: 0, size: 1, status: false };
        }
        else
        {
          const previousRowData = this.menus[i - 1];
          const previousRowGroup = previousRowData.group;
          if (group === previousRowGroup)
          {
            this.rowGroupMetadata[group].size++;
          }
          else
          {
            this.rowGroupMetadata[group] = { index: i, size: 1, status: false };
          }
        }
      }
    }
    console.log('Metadat:'+JSON.stringify(this.rowGroupMetadata));
  }
  handleMenuGroupSelection(group)
  {
    const selectedGroup = group;

    for (const menuItem of this.menus)
    {
      if (menuItem.group === selectedGroup)
      {
        if (this.rowGroupMetadata[selectedGroup].status === true)
        {
          menuItem.isSelected = true;
        }
        else
        {
          menuItem.isSelected = false;
        }
      }
    }
  }
  handleMenuSelection(menu)
  {
    const group = menu.group;
    // Reset Group header
    if (menu.isSelected === false)
    {
      if (this.rowGroupMetadata[group].status === true)
      {
        this.rowGroupMetadata[group].status = false;
      }
    }
    //  Reset Header if all selected
    let allSelected = true;
    for (const menuItem of this.menus)
    {
      if (menuItem.group === group)
      {
        if (menuItem.isSelected === false)
        {
          allSelected = false;
        }
      }
    }

    this.rowGroupMetadata[group].status = allSelected;
  }

  Loadmenus(event)
  {
    this.roleId = event.value;
    const rolename = this.roles.filter(r => r.roleId == this.roleId)[0].name;
    this.roleMenuService.getMenuByRoleId(this.roleId).subscribe(response =>
    {
      console.log(response);
      this.menus = response;
      this.updateRowGroupMetaData();
      this.setGroupSelection();
    },
      error =>
      {
        console.log(error);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: error, life: 3000 });
      });
  }

  setGroupSelection(){
    let index = 0;
    let group = '';
    this.menus.forEach(menu => {
      if(index === 0 ){
        group = menu.group;
        this.rowGroupMetadata[group].status=true;
      }
      if( group === menu.group){
        if(menu.isSelected === false){
          this.rowGroupMetadata[group].status = false;
        }
      }
      else {
          group = menu.group;
          this.rowGroupMetadata[group].status=true;

          if(menu.isSelected === false){
            this.rowGroupMetadata[group].status = false;
          }
      }
      index++;
    });
      
  }

  updateRole()
  {
    this.selectedMenus = this.menus.filter(val => (val.isSelected === true ));
    let selectedMenuIDs = '';

    this.selectedMenus.forEach(selectedMenu =>
    {
      if (selectedMenuIDs.length === 0)
      {
        selectedMenuIDs = selectedMenu.menuId.toString();
      }
      else
      {
        selectedMenuIDs = selectedMenuIDs + ',' + selectedMenu.menuId.toString();
      }
    });

    const body = {
      roleId: this.roleId,
      selectedMenuIDs: selectedMenuIDs
    };
    console.log('Role-Menu:' + JSON.stringify(body));
    this.roleMenuService.updateRoleMenubyRoleId(body).subscribe(response =>
    {
      console.log(response);
      this.messageService.add({
        severity: 'success',
        summary: 'Successful',
        detail: 'Role Menus have been updated succesfully.',
        life: 3000
      });
    },
      error =>
      {
        console.log(error);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: error, life: 3000 });
      });

  }

  reset()
  {
    for (const menuItem of this.menus)
    {
      menuItem.isSelected = false;
    }
    this.setGroupSelection();
  }

  cancel()
  {
    this.router.navigate(['/']);
  }
}


