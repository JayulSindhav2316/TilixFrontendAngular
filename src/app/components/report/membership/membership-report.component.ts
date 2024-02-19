import { Component, OnInit,Inject,LOCALE_ID  } from '@angular/core';
import { ConfirmationService, MenuItem, MessageService, TreeNode } from 'primeng/api';
import { FormBuilder,  Validators,  FormGroup,  FormControl} from "@angular/forms";
import { Output, EventEmitter } from '@angular/core';
import { FormArray } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AppBreadcrumbService } from '../../../app.breadcrumb.service';
import { ReportColumn} from '../../../models/report-column';
import { ReportColumnComponent } from 'src/app/shared/report-column/report-column.component';
import { ReportService } from '../../../services/report.service';
import { MembershipService } from '../../../services/membership.service';
import { HttpParams } from '@angular/common/http';
import * as FileSaver from 'file-saver';
import { AuthService } from '../../../services/auth.service';
import {TreeDragDropService} from 'primeng/api';
import autoTable from 'jspdf-autotable';
declare var jsPDF: any; // Important
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import {OrderListModule} from 'primeng/orderlist';
import { BehaviorSubject } from 'rxjs';
import { OrganizationService } from 'src/app/services/organization.service';
require('jspdf-autotable');
import { DomSanitizer } from '@angular/platform-browser';
import {formatDate} from '@angular/common';
import { StaffService } from '../../../services/staff.service';
import { SelectorListContext, ThisReceiver } from '@angular/compiler';
import {SelectList} from '../../../models/select-list';
import {ReportFilter} from '../../../models/report-filter';
import { ReportSortOrder } from 'src/app/models/report-sort-order';

@Component({
  selector: 'app-membership-report',
  templateUrl: './membership-report.component.html',
  styleUrls: ['./membership-report.component.scss'],
  providers: [MessageService, ConfirmationService]
})
export class MembershipReportComponent implements OnInit {
  categoryList: any[];
  membershipTypeList: any[];
  currentUser: any;
  statusList: any[];
  reportLogo: any;
  shareReport: any;
  showReportFormTab: boolean;
  reportFormTabindex: number = 0;
  reportTabIndex=0;
  showPreview: boolean;
  filterList: any[];
  previewMode: boolean;
  reportColumns: any[];
  selectedColumns: any[]=[];
  selectedColumnNames: any[]=[];
  fieldList : ReportColumn[]=[];
  sortFieldList: ReportColumn[]=[];
  selectedFieldList: ReportColumn[]=[];
  report: any;
  selectedCategory: SelectList[]=[];
  selectedItems: any[];
  selectedMembershipType:any[]=[];
  selectedStatus:any[];
  reportForm = this.fb.group({
    ReportId: [0],
    Filters: this.fb.array([
      this.fb.control('')
    ]),
  });
  reportSortForm = this.fb.group({
    ReportId: [0],
    SortOrders: this.fb.array([
      this.fb.control('')
    ]),
  });
  showReportTab: boolean;
  createReport: boolean;
  showReport: boolean;
  userId: number;
  reportType:string;
  logo:any;
  cols: any;
  showColumnSelection: boolean;
  rows:any[]=[];
  users: any[]=[];
  sharedUsers: any[]=[];
  showTable: boolean;
  exportColumns: any[];
  selectedFields:TreeNode[] = [];
  reportConfiguration: any;
  editMode: boolean;
  columnForm = this.fb.group({
    ReportId:[0],
    Columns: this.fb.array([
      this.fb.control('')
    ]),
  });
  addErrorMessages : any = {};
  sortableFields: any[]=[];
  reportDescription: string;
  reportTitle:string;
  originalReportTitle: string;
  originalReportDescription: string;
  submitted: boolean;
  constructor(private fb: FormBuilder,
    private authService: AuthService, 
    private breadcrumbService: AppBreadcrumbService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private reportService: ReportService,
    private organizationService: OrganizationService,
    private domSanitizer: DomSanitizer,
    private membershipService: MembershipService,
    private staffService: StaffService) {
      this.breadcrumbService.setItems([
        { label: 'Home' },
        { label: 'Reports' },
        { label: 'Membership' }
      ])
      this.statusList = [
        { name: "Active", code: "1" },
        { name: "InActive", code: "0" },
        { name: "On Hold", code: "4" },
        { name: "Terminated", code: "3" },
      ];
      this.showTable=false;
      this.showReportTab=true;
      this.createReport=false;
      this.showReport=false;
      this.shareReport=false;
      this.showPreview=false;
      this.previewMode=false;
      this.editMode=false;
      this.showReportFormTab=false;
     }

  ngOnInit(): void {
    this.currentUser = this.authService.currentUserValue;
    this.getFieldList();
    this.getMembershipCategoryList();
    this.getMembershipTypeList();
    this.getHeaderImage();
    this.getStaffList();
    this.getSortableFieldList();
    this.showColumnSelection=true;
  }
  get Filters() {
    return this.reportForm.get('Filters') as FormArray;
  }
  get SortOrders() {
    return this.reportSortForm.get('SortOrders') as FormArray;
  }
  get Columns() {
    return this.columnForm.get('Columns') as FormArray;
  }
  HideColumns(){
    this.showColumnSelection=false;
  }
  showColumns(){
    this.showColumnSelection=true;
  }
  getFieldList(){
    let searchParams = new HttpParams();
    searchParams = searchParams.append("categoryId", "1");
    const opts = { params: searchParams };
    this.reportService.getReportFieldsByCategoryId(opts).subscribe((data: any[]) => {
      console.log('Field Data:'+JSON.stringify(data));
      this.reportColumns = data;
    });
  }
  getSortableFieldList(){
    let searchParams = new HttpParams();
    searchParams = searchParams.append("categoryId", "1");
    const opts = { params: searchParams };
    this.reportService.getSortableReportFieldsByCategoryId(opts).subscribe((data: any[]) => {
      console.log('Sortable Field Data:'+JSON.stringify(data));
      this.sortableFields = data;
    });
  }
  getStaffList(){
    
    this.staffService.getStaff().subscribe((data: any[]) => {
      console.log('Field Data:'+JSON.stringify(data));
      this.users = data;

      //Remove current user
      this.users.forEach((value,index)=>{
        if(value.userId==this.currentUser.id) {
          this.users.splice(index,1);
          console.log('Removed '+ this.currentUser.id);
        }
      });
    });
  }

  getHeaderImage()
  {
    this.organizationService.getOrganizationImageInBase64(this.currentUser.organizationId,'header').subscribe(data => {
        console.log(data);
        this.logo=data;
    }, error => {
      console.log(error);
    });
  }

  createImageFromBlob(image: Blob) {
    let reader = new FileReader();
    reader.addEventListener('load', () => {
      this.logo = [reader.result];
      console.log('Image:'+this.logo);
    }, false);
    if (image) {
      reader.readAsDataURL(image);
    }
  }

  getParameterList(){
    let searchParams = new HttpParams();
    searchParams = searchParams.append("categoryId", "1");
    const opts = { params: searchParams };
    this.reportService.getReportParametersByCategoryId(opts).subscribe((data: any[]) => {
      console.log(data);
      this.filterList = data;
    });
  }
  getMembershipCategoryList(){
    this.membershipService.getMembershipCategoryList().subscribe((data: any[]) => {
      console.log(data);
      this.categoryList = data;
    });
  }
  categoryChanged(){
    this.getMembershipTypeList();
  }

  getMembershipTypeList(){
    let categories : string[]=[];
    if(this.selectedCategory){
      this.selectedCategory.forEach(function (item) {
        console.log('Item:'+item.code);
        categories.push(item.code);
      });
      let searchParams = new HttpParams();
      searchParams = searchParams.append("selectedCategories", categories.toString());
      const opts = { params: searchParams };
      this.membershipService.getMembershipTypeSelectListByCategories(opts).subscribe((data: any[]) => {
        console.log('MembershipType:'+JSON.stringify(data));
        this.membershipTypeList = data;
        if(this.editMode){
          this.loadMembershipTypeList();
        }
      });
    }
    
  }
  getMembershipReport(reportId: number){
    let searchParams = new HttpParams();
    searchParams = searchParams.append("membershipReportId", reportId.toString());
    const opts = { params: searchParams };
    this.reportService.getMembershipReport(opts).subscribe((data: any) => {
      console.log(data);
      data.rows.forEach(d=>{
        if (d.hasOwnProperty('membership_TerminationDate')) 
        {
          d.membership_TerminationDate=d.membership_TerminationDate=='01-01-0001' || d.membership_TerminationDate=='1/1/0001'? '00/00/0000':d.membership_TerminationDate;
        } 
        if (d.hasOwnProperty('membership_RenewDate'))
        {
          d.membership_RenewDate=d.membership_RenewDate=='01-01-0001' || d.membership_RenewDate=='1/1/0001'? '00/00/0000':d.membership_RenewDate;
        } 
     })
      if(this.previewMode){
          this.reportTitle=this.originalReportTitle;
          
          this.report = data;
          this.showNewReport();
      }
      else{
        this.report = data;
        this.reportTitle=this.report.title;
        this.showNewReport();
      }
      this.exportColumns = this.report.columns.map(col => ({title: col.header, dataKey: col.field}));
    });
  }

  getMembershipReportConfiguration(reportId: number){
    let searchParams = new HttpParams();
    searchParams = searchParams.append("membershipReportId", reportId.toString());
    const opts = { params: searchParams };
    this.reportService.getMembershipReportConfiguration(opts).subscribe((data: any[]) => {
      console.log(data);
      this.reportConfiguration = data;
      this.populateEditForm();
    });
  }

  previewMembershipReport(){
    this.previewMode=true;
    if(this.editMode){
      this.originalReportTitle=this.reportTitle;
    }
    this.createUpdateMembershipReport(true);
  }

  saveMembershipReport(){
    this.previewMode=false;
    this.createUpdateMembershipReport(false);
    this.showPreview=false;
  }

  runMembershipReport(){
    this.previewMode=false;
    this.createUpdateMembershipReport(true);
    this.showPreview=false;
  }

  createUpdateMembershipReport(run: boolean){
    this.submitted=true;
    console.log('Selected Category:'+JSON.stringify(this.selectedCategory));
    console.log('Selected Type:'+JSON.stringify(this.selectedMembershipType));
    console.log('Selected Status:'+JSON.stringify(this.selectedStatus));
    console.log('Selected Columns:'+JSON.stringify(this.selectedFieldList));
    console.log('Selected Users:'+JSON.stringify(this.sharedUsers));

    if(this.reportTitle.length===0 || this.reportDescription.length===0){
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Please enter the required information.', life: 3000 });
      return;
    }
   
    if(this.fieldList.length===0){
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Please select columns for the report', life: 3000 });
      return;
    }

    let categories : string[]=[];
    this.selectedCategory.forEach(function (item) {
      console.log('Item:'+item.code);
      categories.push(item.code);
    });
    console.log('Categories:'+ JSON.stringify(categories));

    let membershipTypes : string[]=[];
    this.selectedMembershipType.forEach(function (item) {
      console.log('Item:'+item.code);
      membershipTypes.push(item.code);
    });
    console.log('Membership Types:'+ JSON.stringify(membershipTypes));

    let membershipStatuses : string[]=[];
    this.selectedStatus.forEach(function (item) {
      console.log('Item:'+item.code);
      membershipStatuses.push(item.code);
    });
    let fields : string[]=[];
    this.fieldList.forEach(function (item) {
      console.log('Item:'+item.columnId);
      fields.push(item.columnId.toString());
    });

    let users: string[]=[];
    this.sharedUsers.forEach(function (item) {
      console.log('User:'+item.userId);
      users.push(item.userId.toString());
    });
    console.log('Membership Statuses:'+ JSON.stringify(membershipStatuses));
    console.log('Filters:' + JSON.stringify(this.reportForm.get('Filters').value));
    let previewMode = 0;
    if(this.previewMode){
      previewMode=1;
    }
    let reportId = 0;
    if(this.editMode){
      reportId=this.reportConfiguration.membershipReportId;
    }
    const body = {
      MembershipReportId: reportId.toString(),
      ReportCategoryId: "1",
      Categories: categories.toString(),
      MembershipTypes: membershipTypes.toString(),
      Status: membershipStatuses.toString(),
      Fields: fields.toString(),
      Title:this.reportTitle,
      Description:this.reportDescription,
      UserId:this.currentUser.id,
      ReportFilters: this.reportForm.get('Filters').value,
      ReportSortOrders: this.reportSortForm.get('SortOrders').value,
      Users:users.toString(),
      PreviewMode:previewMode.toString()
    };
    this.originalReportTitle=this.reportTitle;
    console.log('Form body:'+JSON.stringify(body));
    if(!this.editMode || this.previewMode){
      this.reportService.createMembershipReport(body).subscribe(
        response =>
        {
          console.log(response);
          if(!this.previewMode){
            this.messageService.add({
              severity: 'success',
              summary: 'Successful',
              detail: 'Report created succesfully.',
              life: 3000
            });
          }
          if(run){
            this.getMembershipReport(response.membershipReportId);
          }
          else {
            this.cancelReport();
          }
          
        },
        error =>
        {
          console.log(error);
          this.messageService.add({ severity: 'error', summary: 'Error', detail: error, life: 3000 });
        });
      }
      else {
        this.reportService.updateMembershipReport(body).subscribe(
          response =>
          {
            console.log(response);
            if(!this.previewMode){
              this.messageService.add({
                severity: 'success',
                summary: 'Successful',
                detail: 'Report updated succesfully.',
                life: 3000
              });
            }
            if(run){
              this.getMembershipReport(response.membershipReportId);
            }
            else {
              this.cancelReport();
            }
            
          },
          error =>
          {
            console.log(error);
            this.messageService.add({ severity: 'error', summary: 'Error', detail: error, life: 3000 });
          });
      }
  }
  removeFilter(controlId){
      console.log('Remove Filter: '+controlId);
      this.Filters.removeAt(controlId);
  }

  filterChanged(event){

  }

  addFilter() {
    
      this.Filters.push(this.fb.control({'reportFilterId':0,
      'parameterId':0,
      'operator':'',
      'value':''
      }));
  }
  addSortColumn() {
    
    this.SortOrders.push(this.fb.control({'reportSortOrderId':0,
    'fieldName':'',
    'order':''
    }));
}
  statusChanged(event){

  }
  removeSortOrder(controlId){
    console.log('Remove SortOrder: '+controlId);
    this.SortOrders.removeAt(controlId);
  }

  sortOrderChanged(event){

  }
  createNewReport(event){
    this.reportTitle='';
    this.reportDescription='';
    this.selectedCategory=[];
    this.selectedMembershipType=[];
    this.selectedStatus=[];
    this.selectedFields=[];
    this.selectedFieldList=[];
    this.fieldList=[];
    this.sortFieldList=[];
    this.SortOrders.clear();
    this.Filters.clear();
    this.shareReport=false;
    this.showTable=false;
    this.showReportTab=false;
    this.createReport=true;
    this.showReportFormTab=true;
    this.showReport=false;
    this.reportFormTabindex=0;
    this.addFilter();
    this.addSortColumn();
    console.log("Creating new report");
  }
  closeNewReport(){
    this.showTable=false;
    this.showReportTab=true;
    this.createReport=false;
    this.showReportFormTab=false;
    this.showReport=false;
    this.reportTabIndex=this.reportTabIndex;
    console.log("Creating new report");
  }
  cancelReport(){
    this.showTable=false;
    this.showReportTab=true;
    this.createReport=false;
    this.showReportFormTab=false;
    this.editMode=false;
    this.showReport=false;
    this.reportTabIndex=0;
    console.log("Closing report");
  }
  showNewReport(){
    this.showTable=false;
    this.showReportTab=false;
    this.createReport=false;
    this.showReportFormTab = false;
    if(this.previewMode){
      this.showPreview=true;
    }
    else {
      this.showReport=true;
    }
    
  }
  closePreviewReport(){
    this.showTable=false;
    this.showReportTab=false;
    this.showReportFormTab=true;
    this.createReport=true;
    this.showReport=false;
    this.showPreview=false;
    this.previewMode=false;
    console.log("Close preview report");
  }
  exportPdf() {
    import("jspdf").then(jsPDF => {
        import("jspdf-autotable").then(x => {
            const doc = new jsPDF.default('p','px','a4');
            const logo=this.logo;
            const title = this.reportTitle;
            autoTable(doc, {
              columns: this.exportColumns,
              body: this.report.rows,
              theme: "grid",
              showHead: "everyPage",
              margin: {top: 75, right: 10, bottom: 20, left: 15},
              didDrawCell: (data) => { },
              didDrawPage: function (data) {

                // Header
                doc.setFontSize(20);
                doc.setTextColor(40);
                if (logo) {
                  doc.addImage(logo, "PNG", data.settings.margin.left, 15, 150, 46);
                }
                doc.text("Membership Report", data.settings.margin.left+ 410, 20,{
                  align: 'right',
                });
                doc.setFontSize(15);
                doc.text(title, data.settings.margin.left+ 410, 50,{
                  align: 'right',
                });
                doc.setFontSize(12);
                doc.text("Generated on:"+formatDate(new Date(), 'MM/dd/yyyy', 'en'), data.settings.margin.left+ 410, 70,{
                  align: 'right',
              });
                // Footer
                var str = "Page " + doc.getNumberOfPages();
            
                doc.setFontSize(10);
            
                // jsPDF 1.4+ uses getWidth, <1.4 uses .width
                var pageSize = doc.internal.pageSize;
                var pageHeight = pageSize.height
                  ? pageSize.height
                  : pageSize.getHeight();
                doc.text(str, data.settings.margin.left, pageHeight - 10);
              }
          });
            doc.save('membership.pdf');
        })
    })
   
}
runReport(reportId){
      console.log("Running report:"+reportId);
      this.getMembershipReport(reportId);
}
editReport(reportId){
  console.log("Editing report:"+reportId);
  this.getMembershipReportConfiguration(reportId);
  this.editMode=true;
  this.showReportFormTab=true;
  this.showReportTab=false;
  this.reportFormTabindex=0;
}

populateEditForm(){
//populate form
this.selectedFields=[];
this.reportTitle = this.reportConfiguration.title;
this.reportDescription= this.reportConfiguration.description;

let categories = this.reportConfiguration.categories.split(',');
let selectedCategories: SelectList[]=[];
this.categoryList.forEach(function (item) {
  const found = categories.find(element => element == item.code);
  if(found){
    console.log('Find:' + JSON.stringify(item));
    selectedCategories.push({code: item.code, name: item.name});
  }
});
this.selectedCategory=[...selectedCategories];
console.log('Find:' + JSON.stringify(this.selectedCategory));
//populated Types
this.getMembershipTypeList();

//Populate status
let statuses = this.reportConfiguration.status.split(',');
let selectedStatus:any[] =[];
this.statusList.forEach(function (item) {
  const found = statuses.find(element => element == item.code);
  if(found){
    console.log('Find:' + JSON.stringify(item));
    selectedStatus.push({code: item.code, name: item.name});
  }
});
this.selectedStatus=[...selectedStatus];
console.log('Find:' + JSON.stringify(this.selectedStatus));

//Populate fields
this.fieldList= [];
let fields = this.reportConfiguration.fields.split(',');
fields.forEach(element => {
  this.selectNode(this.reportColumns, element);
});

this.sortFieldList= [];
let sortFields = this.reportConfiguration.fields.split(',');
sortFields.forEach(element => {
  console.log('Element:'+element);
  this.sortableFields.forEach(item => {
    console.log('item:'+item.reportFieldId);
    if(parseInt(item.reportFieldId) === parseInt(element)){ 
      console.log('Adding item:'+item.reportFieldId);
      let column:ReportColumn = {columnId:item.reportFieldId,columnName:item.fieldTitle};
      this.sortFieldList = [...this.sortFieldList, column];
    }
   });
});
//Populate filters
this.Filters.clear();
this.SortOrders.clear();


if(this.reportConfiguration.reportFilters.length > 0 ){
  this.reportConfiguration.reportFilters.forEach(element => {
    let filter = new ReportFilter();
    filter.reportFilterId = element.reportFilterId;
    filter.parameterId = element.parameterId;
    filter.operator = element.operator;
    filter.value = element.value;
    this.Filters.push(this.fb.control(filter));
  });
}

if(this.reportConfiguration.reportSortOrders.length > 0 ){
  this.reportConfiguration.reportSortOrders.forEach(element => {
    let sortOrder = new ReportSortOrder();
    sortOrder.reportSortOrderId = element.reportSortOrderId;
    sortOrder.fieldName = element.fieldName;
    sortOrder.order = element.order;
    this.SortOrders.push(this.fb.control(sortOrder));
  });
}

//Populate shared users

let selectedUsers:any[] =[];
let userArray:string[]=[];
this.reportConfiguration.reportShares.forEach(function (item) {
  userArray.push(item.sharedToUserId);
});

this.users.forEach(function (item) {
  const found = userArray.find(element => element == item.userId);
  if(found){
    console.log('Find:' + JSON.stringify(item));
    selectedUsers.push(item);
  }
});
this.sharedUsers=[...selectedUsers];
console.log('Find:' + JSON.stringify(this.sharedUsers));
if(this.sharedUsers.length >0){
  this.shareReport=true;
}

}


loadMembershipTypeList(){
  let types = this.reportConfiguration.membershipTypes.split(',');
  let selectedTypes: SelectList[]=[];
  this.membershipTypeList.forEach(function (item) {
    const found = types.find(element => element == item.code);
    if(found){
      console.log('Find:' + JSON.stringify(item));
      selectedTypes.push(item);
    }
  });
  this.selectedMembershipType=[...selectedTypes];
  console.log('Find:' + JSON.stringify(this.selectedMembershipType));
}

exportExcel() {
    import("xlsx").then(xlsx => {
        const worksheet = xlsx.utils.json_to_sheet(this.report.rows);
        const workbook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
        const excelBuffer: any = xlsx.write(workbook, { bookType: 'xlsx', type: 'array' });
        this.saveAsExcelFile(excelBuffer, "report.rows");
    });
}

saveAsExcelFile(buffer: any, fileName: string): void {
    let EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
    let EXCEL_EXTENSION = '.xlsx';
    const data: Blob = new Blob([buffer], {
        type: EXCEL_TYPE
    });
    FileSaver.saveAs(data, fileName + '_export_' + new Date().getTime() + EXCEL_EXTENSION);
}
public removeItem(item: any, list: any[]): void {
  list.splice(list.indexOf(item), 1);
}
nodeSelect(event){
  console.log('Selected:'+ event.node.label)
  let column:ReportColumn = {columnId:event.node.data,columnName:event.node.label};
  this.fieldList= [...this.fieldList, column];
  this.sortableFields.forEach(item => {
    if(item.fieldTitle===event.node.label){
      let column:ReportColumn = {columnId:item.reportFieldId,columnName:item.fieldTitle};
      this.sortFieldList = [...this.sortFieldList, column];
    }
   });
}
nodeUnselect(event){
  console.log('Un Selected:'+ event.node.label)
  this.fieldList.forEach((value,index)=>{
    if(value.columnId==event.node.data) {
      this.fieldList.splice(index,1);
      console.log('Removed '+ event.node.label);
    }
   
});
this.fieldList=[...this.fieldList];

this.sortFieldList.forEach((value,index)=>{
  if(value.columnId==event.node.data) {
    this.sortFieldList.splice(index,1);
    console.log('Removed '+ event.node.label);
  }
});

this.sortFieldList=[...this.sortFieldList];
this.selectedFields.forEach((value,index)=>{
  if(value.data==event.node.data) {
    this.selectedFields.splice(index,1);
    console.log('Removed '+ event.node.label);
  }
  this.fieldList=[...this.fieldList];
});
}

selectNode(nodes: TreeNode[], data: string) {
  for (let i = 0; i < nodes.length; i++) {
    if (nodes[i].data == data) {
      this.selectedFields.push(nodes[i]);
    } else {
      for (let j = 0; j < nodes[i].children.length; j++) {
        if (nodes[i].children[j].data == data) {
          nodes[i].expanded=true;
          this.selectedFields.push(nodes[i].children[j])
          let column:ReportColumn = {columnId:nodes[i].children[j].data,columnName:nodes[i].children[j].label};
          this.fieldList = [...this.fieldList, column];
          return;
          }
        }
      }
    }
    console.log(this.selectedFields);
  }
  isFieldValid(field: string){
        if (field === "Title" ){ 
          if(this.submitted){
            if (this.reportTitle.length===0) {
              this.addErrorMessages =  { errorType: 'required', controlName: field };
            return true;
          }
        }
      }
      if (field === "Description" ){ 
        if(this.submitted){
          if (this.reportDescription.length===0) {
            this.addErrorMessages =  { errorType: 'required', controlName: field };
          return true;
        }
      }
      }
  }
}
