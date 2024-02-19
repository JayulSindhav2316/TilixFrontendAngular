import { Component, HostListener, Input, OnInit, ViewChild } from '@angular/core';
import { type } from 'os';
import { MenuItem } from 'primeng/api/menuitem';
import { SelectItem } from 'primeng/api/selectitem';
import { Table } from 'primeng/table';
import { Alert } from 'selenium-webdriver';
import { MessageService, ConfirmationService } from "primeng/api";
import { GroupRegistrationService } from 'src/app/services/group-registration.service';
import { MembershipService } from '../../../services/membership.service';
import { HttpParams } from '@angular/common/http';
import { LookupService } from '../../../services/lookup.service';
import { every } from 'rxjs/operators';
import { element } from 'protractor';
import { AppBreadcrumbService } from 'src/app/app.breadcrumb.service';

@Component({
  selector: 'app-group-registration',
  templateUrl: './group-registration.component.html',
  styleUrls: ['./group-registration.component.scss']
})
export class GroupRegistrationComponent implements OnInit {
  @ViewChild('dt', { static: false }) private docDataTable: Table;

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.key == "Escape") {
      this.getAllGroups(null);
    }
  }
  cars: Array<any>;
  // brands: SelectItem[];
  clonedCars: { [s: string]: Car } = {};
  statuses: SelectItem[];
  menuItems: MenuItem[];
  selectedGroup: any;
  groupRegistration: boolean = true;
  currentRow: any;
  membershipCategory: { name: string; code: string; }[];
  selectedMembershipCategory: string[] = [];
  showTable: boolean;
  showLoader: boolean;
  membershipTypes: any[];
  selectedMembershipTypeIds: any[] = [];
  selectedMembership: any;
  selectedMembershipType: any[] = [];
  inside: boolean = false;
  expandedRows: any[] = [];
  cities: City[];

  selectedCityCodes: string[] = [];
  designationList: any[];
  searchText: string;
  includeInactive: boolean = false;
  disableSave: boolean = false;

  constructor(
    private breadcrumbService: AppBreadcrumbService,
    private confirmationService: ConfirmationService,
    private lookupService: LookupService,
    private groupService: GroupRegistrationService,
    private messageService: MessageService,
    private membershipService: MembershipService) {
    this.breadcrumbService.setItems([
      { label: 'Home', routerLink: ['/'] },
      { label: 'Set Up' },
      { label: 'Registration Groups' },
    ]);
  }
  getAllGroups(searchText) {
    if (searchText == null) {
      searchText = "";
    }
    if (this.includeInactive == true) {
      searchText = "Inactive";
    }
    else {
      searchText = "Active";
    }
    this.groupService.getAllGroups(searchText).subscribe((data: any[]) => {
      console.log(data);
      // var test=data.filter(c => c.status==1);
      this.cars = data.filter(x => x.name != 'Non-Member' && x.name != 'Member'); //Member & Non-Member group are reserved groups which cannot be modified - Amit
    });
  }
  
  ngOnInit(): void {
    
    // document.addEventListener('click',(event)=>{
    //   const target = document.querySelector('#tab1')
    //   const withinBoundaries = event.composedPath().includes(target)
    //   if (withinBoundaries) {
    //     // alert("inside");
    //   } else {
    //   //  alert("outside");
    // }
    // });
    this.getdesignationLookup()
    this.cities = [
      { name: 'New York', code: 'NY' },
      { name: 'Rome', code: 'RM' },
      { name: 'London', code: 'LDN' },
      { name: 'Istanbul', code: 'IST' },
      { name: 'Paris', code: 'PRS' }
    ];
    this.selectedCityCodes.push('NY');
    this.getAllGroups(null);
    this.getMembershipCategories();

    this.menuItems = [{
      label: 'Options',
      items: [
        {
          label: 'Link Membership types',
          icon: 'pi pi-pencil',
          command: () => {
            this.linkMembershipType();
            // this.editInvoice();
          }
        },
        {
          label: 'Delete',
          icon: 'pi pi-trash',
          command: () => {
            this.deleteGroup();
          }
        },
      ]
    }
    ];

    this.statuses = [{ label: 'Type1', value: 'Type1' }, { label: 'Type2', value: 'Type2' }]
  }

  onEditCancel(event): void {

  }
  showCancel(data) {
    var cancelElements = Array.from(document.getElementsByClassName("cancelB"));
    cancelElements.forEach(ele => {
      var trt = ele as HTMLElement
      trt.style.display = 'none';
    })
    var saveElements = Array.from(document.getElementsByClassName("saveB"));
    saveElements.forEach(ele => {
      var trt = ele as HTMLElement
      trt.style.display = 'none';
    })
    var menuElements = Array.from(document.getElementsByClassName("menuOpB"));
    menuElements.forEach(ele => {
      var trt = ele as HTMLElement
      trt.style.display = 'flex';
    })
    document.getElementById("menuOp" + data.registrationGroupId).style.display = 'none';


    document.getElementById("cancel" + data.registrationGroupId).style.display = 'flex';
    document.getElementById("save" + data.registrationGroupId).style.display = 'flex  ';

  }
  applyClass(controlType: string, value: any) {
    if (controlType == "text") {
      if (value.trim().length == 0) {
        return "invalid";
      }
    }
    else if (controlType == "list") {
      if (value == 0) {
        return "invalid";
      }
    }
    return "valid";
  }
  onEditComplete(data, field) {
    this.disableSave=true;
    if (data.name.trim() == "") {
      this.messageService.add({ severity: "error", summary: "Error", detail: "Please fill all row to save data", life: 3000 });
      setTimeout(() => {
        var ele = document.getElementById("grpname0");
        ele.focus();
      }, 100);
      this.disableSave=false;
   return;
    }
    if (data.registrationGroupId == 0 && data.type != '' && field == "save") {
      this.addNewGroup(data);
    }
    if(data.type=="" && field == "save")
    {
      this.messageService.add({ severity: "error", summary: "Error", detail: "Please select type.", life: 3000 });
    }
    if (data.registrationGroupId != 0) {
      if (data.name == "") {
        this.messageService.add({ severity: "error", summary: "Error", detail: "Please fill all row to save data", life: 3000 });
        setTimeout(() => {
          var ele = document.getElementById("grpname" + data.registrationGroupId);
          ele.focus();
        }, 100);
      }
      else {
        if (field == "type") {
          if (data.registrationgroupmembershiplinks.length > 0 && data.type != "Membership") {
            // alert();
            this.confirmationService.confirm({
              message: 'Membership type linked will be deleted if type is changed. ',
              header: 'Confirm',
              icon: 'pi pi-exclamation-triangle',
              accept: () => {
                this.docDataTable.toggleRow(data);
                this.updateGroup(data);
              },
              reject: () => {
                this.getAllGroups(null);
              }
            });
          }
          else {
            // this.updateGroup(data);
            let group = {
              registrationGroupId: data.registrationGroupId,
              name: data.name,
              type: data.type,//=="Type1"?1:2,
              status: data.status == true ? 1 : 0,
            };

            this.groupService.updateGroup(group).subscribe(response => {
                this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Group updated successfully.', life: 3000 });
              var ele = document.getElementById("cancel" + data.registrationGroupId);
              ele.style.display = "none";
             
              var isExpand= this.docDataTable.isRowExpanded(data);
              if(isExpand)
              this.docDataTable.toggleRow(data);
            },
              error => {
                this.messageService.add({ severity: 'error', summary: 'Error', detail: error, life: 3000 });
              });
          }
        }
        else {
          let group = {
            registrationGroupId: data.registrationGroupId,
            name: data.name,
            type: data.type,//=="Type1"?1:2,
            status: data.status == true ? 1 : 0,
          };
          this.groupService.updateGroup(group).subscribe(response => {
            this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Group updated successfully.', life: 3000 });
            
            if(field=="save")
            {
              var cancelEle = document.getElementById("cancel" + data.registrationGroupId);
              var saveEle=document.getElementById("save" + data.registrationGroupId);
              var ele = document.getElementById("menuOp" + data.registrationGroupId);
              ele.style.display = "flex";
              cancelEle.style.display="none";
              saveEle.style.display="none";
            }
          },
            error => {
              this.messageService.add({ severity: 'error', summary: 'Error', detail: error, life: 3000 });
            });
          // this.updateGroup(data);
        }
      }
    }
    this.disableSave=false;

  }
  onRowEditCancel(data: Car, index: number) {
    this.getAllGroups(null);
  }

  addRow() {
    this.searchText = "";
    this.docDataTable.filterGlobal("", 'contains');
    var exist = this.cars.find(x => x.registrationGroupId == 0);
    if (exist == undefined) {
      var row = { registrationGroupId: 0, name: '', type: '', status: 1 };
      this.cars.unshift(row);
    }

    setTimeout(() => {
      var ele = document.getElementById("grpname0");
      ele.focus();
      document.getElementById("cancel0").style.display = 'flex';
      document.getElementById("save0").style.display = 'flex';
    }, 300);

  }
  disableNav(eve: any) {
    if (eve.keydown) {
      eve.stopPropagation();
    }
  }
  doNothing(e: any) {
    e.stopPropagation();
    return;
  }

  setActiveRow(data) {
    this.selectedGroup = data;
    if (data.type == "Membership") {
      this.menuItems = [{
        label: 'Options',
        items: [
          {
            label: 'Link Membership types',
            icon: 'pi pi-pencil',
            command: () => {
              this.linkMembershipType();
              // this.editInvoice();
            }
          },
          {
            label: 'Delete',
            icon: 'pi pi-trash',
            command: () => {
              this.deleteGroup();
            }
          },
        ]
      }
      ];
    }
    else {
      this.menuItems = [{
        label: 'Options',
        items: [
          {
            label: 'Delete',
            icon: 'pi pi-trash',
            command: () => {
              this.deleteGroup();
            }
          },
        ]
      }
      ];
    }
  }
  linkMembershipType() {
    var test = this.selectedGroup;
    var selectedNames: String[] = [];

    // this.selectedMembershipCategory=[];
    var test2 = test.registrationgroupmembershiplinks.forEach(x => {

      let a = {
        name: '1',
        code: x.membership.categoryNavigation.name
      }
      var asd = x.membership.categoryNavigation.name
      selectedNames.push(asd);
    })
    let arrayOfValues = ['NY', 'IST'];
    var type = this.membershipCategory.filter(a => selectedNames.includes(a.name)).map(a => a.code);
    this.selectedMembershipCategory = type;
    this.serachMemberships();
    // var selectedCategory=test.filter(x=>x.categoryNavigation);

    //  this.selectedMembershipType=this.selectedGroup.registrationgroupmembershiplinks;

    //select types
    const thisRef = this;
    thisRef.expandedRows = [];
    thisRef.expandedRows[this.selectedGroup.registrationGroupId] = true;
    this.groupRegistration = false;
  }
  hideExpand() {
    this.groupRegistration = true;
  }

  toggleStatus(rowData: any) {
    if (rowData.registrationGroupId != 0 && rowData.name.trim()!="") {

      this.updateGroup(rowData);
    }
    else
    {
      if(rowData.name.trim()=="")
      this.messageService.add({ severity: "error", summary: "Error", detail: "Name can not be blank. ", life: 3000 });
    }
  }
  addNewGroup(data) {
    this.disableSave = true;
    // this.addNewQuestionRecord = true; 
    if (data.status == false) {
      data.status = 0;
    }
    let group = {
      registrationGroupId: 0,
      name: data.name,
      type: data.type,//=="Type1"?1:2,
      status: data.status,
    };
    if (group.name.trim() != '') {
      this.groupService.addGroup(group).subscribe(response => {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Group added successfully.', life: 3000 });
        this.getAllGroups(null);
        this.disableSave = false;
      },
        error => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: error, life: 3000 });
          this.disableSave = false;
        });
    }
    this.disableSave = false;
  }
  updateGroup(data) {
    // this.addNewQuestionRecord = true; 
    let group = {
      registrationGroupId: data.registrationGroupId,
      name: data.name,
      type: data.type,//=="Type1"?1:2,
      status: data.status == true ? 1 : 0,
    };

    this.groupService.updateGroup(group).subscribe(response => {
      this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Group updated successfully.', life: 3000 });
      var ele = document.getElementById("cancel" + data.registrationGroupId);
      ele.style.display = "none";
      this.getAllGroups('');
    },
      error => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: error, life: 3000 });
      });
  }
  deleteGroup() {

    this.confirmationService.confirm({
      message: 'Are you sure you want to delete this group?',
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.groupService.deleteGroup(this.selectedGroup.registrationGroupId).subscribe(response => {
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Group deleted successfully.', life: 3000 });
          this.getAllGroups(null);
          this.groupRegistration = true;
        },
          error => {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: error, life: 3000 });
          });
      },
      reject: () => {
        // this.questionList[index].answerTypeLookUpId = this.clonedQuestionList[index].answerTypeLookUpId;
      }
    });
  }
  includeInactiveQuestions(event: any) {
    this.includeInactive = event.checked;
    this.getAllGroups(null);
  }

  // linkmembershipstart

  getMembershipCategories() {

    console.log('Fetcing data for membership category:');

    this.membershipService.getMembershipCategoryList().subscribe((data: any) => {
      console.log(data);
      this.membershipCategory = data;
      //  this.selectedMembershipCategory=[];
      //  this.selectedMembershipCategory.push('1');

    });

  }
  serachMemberships() {
    this.selectedMembershipType = [];
    console.log('selected memberships catgeories;' + this.selectedMembershipCategory);
    this.showTable = false;
    this.showLoader = true;

    let searchParams = new HttpParams();
    searchParams = searchParams.append('selectedCategories', this.selectedMembershipCategory.toString());
    const opts = { params: searchParams };
    this.membershipService.getMembershipTypeByCategories(opts).subscribe((data: any) => {
      console.log(data);
      this.membershipTypes = data;
      this.showTable = true;
      this.showLoader = false;
      var test = this.selectedGroup;

      var seTypes = this.selectedGroup.registrationgroupmembershiplinks.map(x => x.membership);
      seTypes.forEach(x => {
        var itm = this.membershipTypes.find(x => x.membershipTypeId == x.membershipTypeId);
        this.selectedMembershipType.push(x);
      })

    });
  }
  goBack() {
    this.getAllGroups(null);
    this.groupRegistration = true;

  }
  // selectMembership()
  // {
  //   this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Linked successfully.', life: 3000 });
  //   this.goBack();
  // }

  saveMembershipLink() {
    if (!this.selectedMembershipTypeIds) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Please select a membership type.', life: 3000 });
    }
    console.log('Selected Memberships:' + JSON.stringify(this.selectedMembership));

    var Ids = this.selectedMembershipType.map(x => x.membershipTypeId);

    let group = {
      registrationGroupId: this.selectedGroup.registrationGroupId,
      MembershipTypeIds: Ids//this.selectedMembershipTypeIds
    };
    this.groupService.linkMembership(group).subscribe(response => {
      this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Group linked successfully.', life: 3000 });
      //var ele=document.getElementById("cancel"+data.registrationGroupId);
      //ele.style.display="none";
      // this.getAllGroups();
      this.goBack();
    },
      error => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: error, life: 3000 });
      });
  }
  SelectMembership(membershipType) {
    // this.selectedMembershipType=[];
    console.log('Selected Membership:' + JSON.stringify(membershipType));
    this.selectedMembershipTypeIds.push(membershipType.membershipTypeId);
    //this.selectedMembership=membershipType;
  }
  // expandGroupClick(group: any){
  //   console.log(group);
  //   this.inside=true;

  // }
  deleteLink(data: any) {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete this linked membership type?',
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.groupService.deleteLinkedMembership(data.registrationGroupMembershipLinkId).subscribe(response => {
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Deleted successfully.', life: 3000 });
          this.getAllGroups(null);
        },
          error => {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: error, life: 3000 });
          });
      },
      reject: () => {
        // this.questionList[index].answerTypeLookUpId = this.clonedQuestionList[index].answerTypeLookUpId;
      }
    });
  }
  getdesignationLookup() {
    let params = new HttpParams();
    params = params.append('name', 'Designation');
    this.lookupService.getLookupValues(params).subscribe((data: any[]) => {
      console.log(data);
      this.designationList = data;
    });
  }
  searchGroupByName() {
    var searchText = this.searchText;
    this.getAllGroups(searchText)
  }


}
export interface Car {
  groupId: number;
  name: string;
  type: string;
  status: number;
  // color: string;
}
interface City {
  name: string,
  code: string
}


