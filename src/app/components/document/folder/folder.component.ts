import { Component, OnInit, ViewChild } from '@angular/core';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { AppBreadcrumbService } from '../../../app.breadcrumb.service';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { Router } from '@angular/router';
import { FormBuilder, Validators, FormControl, FormGroup, FormArray } from '@angular/forms';
import { MembershipService } from '../../../services/membership.service';
import { HttpParams } from '@angular/common/http';
import { ContainerService } from '../../../services/container.service';
import { AuthService } from '../../../services/auth.service';
import { PrimeNGConfig } from 'primeng/api';
import { Splitter } from 'primeng/splitter';
import { TreeNode } from 'primeng/api';
import { ConfigurationService } from '../../../services/configuration.service';
import { GroupService } from '../../../services/group.service';
import * as fs from 'file-saver';
import { ThisReceiver } from '@angular/compiler';
import { DocumentTag } from '../../../models/document-tag';
import { TagService } from '../../../services/tag.service';
import { environment } from 'src/environments/environment';
import { Tree } from 'primeng/tree';
import { DatePipe } from '@angular/common';
import { ClipboardService } from 'ngx-clipboard';
import * as moment from 'moment';
import { ppid } from 'process';
import { data } from 'jquery';
@Component({
  selector: 'app-folder',
  templateUrl: './folder.component.html',
  styleUrls: ['./folder.component.scss'],
  providers: [MessageService, ConfirmationService],
})
export class FolderComponent implements OnInit {
  @ViewChild('externalPdfViewer') public externalPdfViewer;
  stringToSearch = '';
  directories: TreeNode[];
  currentFolder: string;
  conatiner: any;
  nodeData: any = {};
  folderArr: any = [];
  selectedFolder: TreeNode;
  addingNode: boolean;
  containerSelected: boolean;
  nodeName: string;
  containerId: any;
  editMode: boolean;
  uploadFiles: boolean;
  membershipAccessList: any[];
  groupAccessList: any[];
  staffAccessList: any[];
  containerAccessList: any[];
  documentAccessList: any[];
  showFileUploadDialog: boolean;
  showAccessList: boolean;
  currentUser: any;
  selectedAccessList: any[];
  selectedStaffList: any[];
  documents: any[];
  accessControl: string;
  configuration: any;
  menuItems: MenuItem[];
  selectedDocument: any;
  folderKey: string;
  showSearchResults: boolean;
  searchedDocuments: any[];
  selectedObject: TreeNode;
  selectedNode: TreeNode;
  serachText: string;
  showTagDialog: boolean
  filters: any[];
  selectedFilter: any;
  showFilter: boolean;
  filterValue: string;
  searchText: string;
  documentObjectId: string;
  folderSelected: boolean;
  uploadedFiles: any[] = [];
  tagList = [];
  selectedTags = [];
  addingTag: boolean;
  files: any[];
  tagName: string;
  fileUrl: string;
  showPdfPreview: boolean;
  currentFolderKey: string;
  showAuditTrail: boolean;
  autditTrail: any[];
  filteredAuditTrail: any[];
  fromDate: any;
  toDate: any;
  auditTrailFormDate: any;
  auditTrailToDate: any;
  showFolders: boolean;
  minDate: Date;
  maxDate: Date;
  monthStart: Date;
  monthEnd: Date;
  showAccessControlDialog: boolean;
  showSearchBox: boolean;
  uploadFile: File;
  uploadingDocument: boolean;
  uploadFileName: string;
  uploadFileSize: any;
  editingTag: boolean;
  filterList: any[];
  selectedFilterTags: any;
  totalRecords: number;
  pageIndex: number;
  pipe = new DatePipe('en-US');
  startPage: number;
  paginating: boolean;
  downloadFileName: string;
  sortBy: any;
  sortList: any[];
  totalMatchCount: number;
  showRefineQueryMessage: boolean;
  displaySearchMessage: string;
  get Tags() {
    return this.documentTagForm.get('Tags') as FormArray;
  }

  documentTagForm = this.fb.group({
    documentObjectIdId: [0],
    Tags: this.fb.array([
      this.fb.control('')
    ]),
  });
  constructor(private fb: FormBuilder,
    private breadcrumbService: AppBreadcrumbService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private formBuilder: FormBuilder,
    private membershipService: MembershipService,
    private containerService: ContainerService,
    private authService: AuthService,
    private configurationService: ConfigurationService,
    private groupService: GroupService,
    private tagService: TagService,
    private clipboardService: ClipboardService) {

    this.breadcrumbService.setItems([
      { label: "Home" },
      { label: "Documents" },
      { label: "Explorer" }
    ]);

    this.menuItems = [{
      label: 'Options',
      items: [
        {
          label: 'Access Control',
          icon: 'pi pi-tags',
          command: () => {
            this.manageAccessControl();
          }
        },
        {
          label: 'Copy Link',
          icon: 'pi pi-tags',
          command: () => {
            this.copyDocumentLink();
          }
        },
        {
          label: 'Tags',
          icon: 'pi pi-tags',
          command: () => {
            this.manageTags();
          }
        },
        {
          label: 'Audit Trail',
          icon: 'pi pi-tags',
          command: () => {
            this.getAuditTrail();
          }
        },
        {
          label: 'Download',
          icon: 'pi pi-cloud-download',
          command: () => {
            this.downLoadDocument();
          }
        },
        {
          label: 'Delete',
          icon: 'pi pi-trash',
          command: () => {
            this.deleteDocument();
          }
        },
      ]
    }
    ];
    this.showSearchBox = true;
    this.showAccessControlDialog = false;
    this.showAuditTrail = false;
    this.addingNode = false;
    this.containerSelected = false;
    this.editMode = false;
    this.uploadFiles = false;
    this.showFileUploadDialog = false;
    this.showAccessList = false;
    this.showSearchResults = false;
    this.showFilter = false;
    this.folderSelected = false;
    this.addingTag = false;
    this.showPdfPreview = false;
    this.currentFolderKey = '';
    this.currentFolder = '';
    this.nodeName = '';
    this.showFolders = true;
    this.uploadingDocument = false;
    this.editingTag = false;
    this.pageIndex = 0;
    this.filterList = [
      { name: "Text", code: "Text" },
      { name: "File Name", code: "FileName" },
      { name: "Tag", code: "Tag" },
      { name: "Date Range", code: "DateRange" },
    ];
    this.sortList = [{ name: "Relevance", code: "Relevance" }, { name: "Newest", code: "Newest" }, { name: "Oldest", code: "Oldest" }]
    this.selectedFilter = "Text";
    this.startPage = 0;
    this.paginating = false;
    this.sortBy = "Relevance";
    this.showRefineQueryMessage = false;
  }

  ngOnInit(): void {
    this.currentUser = this.authService.currentUserValue;
    this.getDocumentContainers();
    this.getConfiguration();
    this.getTagSelectList();

    let today = new Date();
    let month = today.getMonth();
    let year = today.getFullYear();
    let prevMonth = (month === 0) ? 11 : month - 1;
    let prevYear = (prevMonth === 11) ? year - 1 : year;
    let nextMonth = (month === 11) ? 0 : month + 1;
    let nextYear = (nextMonth === 0) ? year + 1 : year;
    let dateString = '2000-01-01T00:00:00'
    this.minDate = new Date(dateString);
    this.minDate.setMonth(1);
    this.minDate.setFullYear(2000);
    this.maxDate = new Date();
    this.maxDate.setMonth(month);
    this.maxDate.setFullYear(year);

    this.monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    this.monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    this.fromDate = this.monthStart;
    this.toDate = this.monthEnd;

    this.auditTrailFormDate = this.monthStart;
    this.auditTrailToDate = this.monthEnd;
  }

  filterSelectionChanged(event: any) {
    console.log("Selected Filter:" + JSON.stringify(event));
    this.selectedFilterTags = [];
  }

  setActiveRow(document: any) {
    console.log('Selected Document:' + JSON.stringify(document));
    this.selectedDocument = document;
    if (document.accessControlEnabled === 0) {
      this.menuItems[0].items[0].disabled = true;
    }
    else {
      this.menuItems[0].items[0].disabled = false;
    }
  }

  AddNode() {
    if (this.containerSelected) {
      this.addingNode = true;
      this.editMode = false;
      this.nodeName = '';
      this.showSearchBox = false;
    }
  }

  onFileSelected(event) {
    console.log("FIle Selected:" + JSON.stringify(event.target.files[0].name));
    console.log("FIle Size:" + JSON.stringify(event.target.files[0].size));
    this.uploadFile = event.target.files[0];
    this.uploadFileName = event.target.files[0].name;
    this.uploadFileSize = event.target.files[0].size;
    this.editingTag = false;

    const fileSizeInKB = Math.round(this.uploadFileSize / 1024);
    if (fileSizeInKB > 100000) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: "File size should be < 100 MB.", life: 3000 });
      this.uploadingDocument = false;
    }
    else {
      if (this.uploadFile) {
        this.showFileUploadDialog = false;
        this.showTagDialog = true;
        this.uploadingDocument = true;
        //this.uploadDocument(file);
        event.target.value = null;
      }
    }
  }

  DeleteNode() {
    if (this.folderSelected) {
      this.confirmationService.confirm({
        header: "Confirm",
        icon: "pi pi-exclamation-triangle",
        message: 'Are you sure that you want to delete this folder ?',
        accept: () => {
          console.log('Deleting folder:' + this.containerId + ":" + this.currentFolder);
          this.currentUser = this.authService.currentUserValue;
          const body = {
            containerId: this.containerId,
            documentObjectId: this.documentObjectId,
            pathName: this.currentFolder,
            staffId: this.currentUser.id.toString()
          }
          this.containerService.deleteFolder(body).subscribe(
            response => {
              this.messageService.add({
                severity: 'success',
                summary: 'Successful',
                detail: 'Folder has been deleted succesfully.',
                life: 3000
              });
              this.deleteChild();
              this.currentFolder = '';
              this.folderSelected = false;
              this.containerSelected = false;
            },
            error => {
              console.log(error);
              this.messageService.add({ severity: 'error', summary: 'Error', detail: error, life: 3000 });
            });
        }
      });
    }
  }

  copyDocumentLink() {
    console.log("Selected Document:" + this.selectedDocument.documentObjectId)
    //TODO AKS url should come from configuration
    var result = this.clipboardService.copyFromContent(this.configuration.sociableBaseUrl + 'document/download/' + this.selectedDocument.documentObjectId);
    if (result) {
      this.messageService.add({
        severity: 'success',
        summary: 'Successful',
        detail: 'Document link copied successfully.',
        life: 3000
      });
    }
    else
    {
      this.messageService.add({
        severity: 'success',
        summary: 'Successful',
        detail: 'Failed to copy document link.',
        life: 3000
      });
    }
  }

  showAccessControl() {
    if (this.showAccessList) {
      this.showAccessList = false;
    }
    else {
      this.showAccessList = true;
    }
  }
  searchSelectChanged(event) {
    this.showFilter = true;
  }
  getDocumentContainers() {

    console.log('Fetcing document Containers:');
    if (this.containerId) {
      this.currentFolderKey = this.containerId + '-' + this.documentObjectId + ':' + this.currentFolder + '/' + this.nodeName;
    }
    else {
      this.currentFolderKey = '';
    }
    console.log("Current Folder Key:" + this.currentFolderKey);
    //set folder 
    //this.currentFolder = this.currentFolder + '/' + this.nodeName;
    let folders = this.currentFolder.split('/')
    console.log(folders, "<--- folders")
    this.containerService.getRootContainerTree(this.currentFolderKey).subscribe((data: any) => {
      console.log('Tree:' + JSON.stringify(data));
      this.directories = data;
      this.selectNode(this.currentFolderKey);
    });

  }

  manageAccessControl() {
    this.showAccessControlDialog = true;
    console.log('Fetcing AccessControl:');

    //Fetch access data for contianer
    this.containerService.getDocumentContainerAccessListByContainerId(this.selectedDocument.containerId).subscribe((data: any) => {
      console.log('Container Access Control:' + JSON.stringify(data));
      this.staffAccessList = [];
      this.groupAccessList = data;

      this.groupAccessList.forEach(data => {
        if (data.staffRoles != 0) {
          this.staffAccessList.push(data);
        }
      })
      this.selectedAccessList = this.groupAccessList.filter(x => x.staffRoles == 0);
      this.selectedStaffList = this.staffAccessList;
      this.getDocumentAccessList();
      this.groupAccessList = this.groupAccessList.filter(x => x.staffRoles == 0);
    });

  }

  getDocumentAccessList() {
    this.containerService.getAccessControlListByDocumentId(this.selectedDocument.documentObjectId).subscribe((data: any) => {
      console.log('Document Access Control:' + data);
      this.documentAccessList = data;
      if (this.documentAccessList.length > 0) {
        this.selectedAccessList = [];
        this.selectedStaffList = [];
        this.groupAccessList.forEach(element => {
          this.documentAccessList.forEach(accessItem => {
            if (accessItem.groupId == element.groupId) {
              this.selectedAccessList.push(element);
            }
          });
        });
        this.documentAccessList.forEach(ele => {
          if (ele.staffRoleId != null) {
            var data = this.staffAccessList.find(x => x.staffRoles == ele.staffRoleId);
            this.selectedStaffList.push(data)
          }
        })
      }
    });
  }
  cancelAccessControl() {
    this.showAccessControlDialog = false;
    this.groupAccessList = [];
    this.documentAccessList = [];
  }

  downLoadDocument() {
    this.getDocumentById(this.selectedDocument.documentId);
  }

  deleteDocument() {
    this.currentUser = this.authService.currentUserValue;
    const body = {
      documentObjectId: this.selectedDocument.documentObjectId,
      organizationId: this.currentUser.organizationId,
      staffId: this.currentUser.id.toString()
    }
    console.log('Form Body:' + JSON.stringify(body));
    if (!this.editMode) {
      this.containerService.deleteDocument(body).subscribe(
        response => {
          this.messageService.add({
            severity: 'success',
            summary: 'Successful',
            detail: 'Document has been deleted succesfully.',
            life: 3000
          });
          this.getDocuments(this.containerId, this.currentFolder);
        },
        error => {
          console.log(error);
          this.messageService.add({ severity: 'error', summary: 'Error', detail: error, life: 3000 });
        });
    }
  }
  closeSearch() {
    this.showSearchResults = false;
    this.showFolders = true;
    this.searchedDocuments = [];
    this.pageIndex = 0;
    this.sortBy = "Relevance";
  }
  getConfiguration() {
    console.log('Fetcing Configuration:');

    this.configurationService.getConfigurationByOrganizationId(this.currentUser.organizationId).subscribe((data: any) => {
      console.log(data);
      this.configuration = data;
      this.accessControl = this.configuration.documentAccessControl;


    });

  }


  showFileUploader() {
    if (this.containerSelected) {
      this.getDocumentContainerAccessList(this.containerId);
      this.documentTagForm.reset();
    }
  }
  EditNodeLabel() {
    if (this.folderSelected) {
      this.addingNode = true;
      this.nodeName = this.selectedNode.label;
      this.editMode = true;
      this.showSearchBox = false;
    }
  }


  getDocumentContainerAccessList(containerId: any) {
    console.log('Fetcing Container Access List by Id:' + containerId);
    this.containerAccessList = [];
    this.membershipAccessList = [];
    this.selectedAccessList = [];
    this.containerService.getDocumentContainerAccessListByContainerId(containerId)
      .subscribe((data: any) => {

        this.containerAccessList = data;
        console.log('Container Accessdata:' + JSON.stringify(this.containerAccessList));
        console.log('Container Access data length:' + JSON.stringify(this.containerAccessList.length));

        if (this.accessControl === 'Membership') {
          if (this.containerAccessList.length > 0) {
            this.membershipAccessList = [];
            this.selectedAccessList = [];
            this.containerAccessList.forEach(element => {
              this.membershipAccessList.push(element);
              this.selectedAccessList.push(element);
            });
            console.log('Selected Access List:' + JSON.stringify(this.membershipAccessList));
            this.showAccessList = true;
          }
        }
        else {
          console.log('Adding group access:' + JSON.stringify(this.containerAccessList));
          if (this.containerAccessList.length > 0) {
            this.groupAccessList = [];
            this.selectedAccessList = [];
            this.staffAccessList = [];
            this.containerAccessList.forEach(element => {
              this.groupAccessList.push(element);
              this.selectedAccessList.push(element);
            });
            console.log('Selected Access List:' + JSON.stringify(this.groupAccessList));
            this.showAccessList = true;
          }
        }
      });
    this.showFileUploadDialog = true;
  }

  hideDialog() {
    this.showFileUploadDialog = false;
  }

  saveAccessControl() {
    let selectedGroupAccessList = [];
    let selectedStaffAccessListArray = [];
    if (this.selectedAccessList) {
      this.selectedAccessList.forEach(element => {
        selectedGroupAccessList.push(element.groupId);
      });
    }
    if (this.showAccessList && selectedGroupAccessList.length === 0) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: "Please select at least one Access Control.", life: 3000 });
      return false;
    }
    this.selectedStaffList.forEach(element => {
      selectedStaffAccessListArray.push(element.staffRoles);
    });
    const body = {
      documentObjectId: this.selectedDocument.documentObjectId,
      containerId: this.selectedDocument.containerId,
      accessList: selectedGroupAccessList.toString(),
      StaffRoles: selectedStaffAccessListArray
    }
    console.log('Update access control:' + JSON.stringify(body));
    this.containerService.updateAccessControl(body).subscribe((data: any) => {
      console.log(data);
      this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Access Control updated successfully.', life: 3000 });
      this.getDocuments(this.containerId, this.currentFolder);
      this.cancelAccessControl();
    },
      error => {
        console.log(error);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: error, life: 3000 });
      });
  }

  saveTags() {
    if (this.uploadingDocument) {
      this.uploadDocument();
      this.showTagDialog = false;
      this.editingTag = false;
    }
    else {
      let selectedTags = [];
      if (this.selectedTags) {
        this.selectedTags.forEach(element => {
          selectedTags.push(element.code);
        });
      }
      const body = {
        documentObjectId: this.selectedDocument.documentObjectId,
        tagList: selectedTags.toString()
      }
      console.log('Update Tags:' + JSON.stringify(body));
      this.containerService.updateTags(body).subscribe((data: any) => {
        console.log(data);
        this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Tags updated successfully.', life: 3000 });
        this.getDocuments(this.containerId, this.currentFolder);
        this.cancelTags();
        this.selectedTags = [];
        this.editingTag = false;
      },
        error => {
          console.log(error);
          this.messageService.add({ severity: 'error', summary: 'Error', detail: error, life: 3000 });
        });

    }

  }
  uploadDocument() {
    const formData = new FormData();

    if (!this.currentFolder) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: "Please select a folder.", life: 3000 });
    }
    else {
      formData.append('File', this.uploadFile);
      formData.append('containerId', this.containerId);
      formData.append('filePath', this.currentFolder);
      formData.append('staffId', this.currentUser.id);
      formData.append('organizationId', this.currentUser.organizationId);
      formData.append('tenantId', this.currentUser.tenantId);
      formData.append('Tags', JSON.stringify(this.selectedTags));
      this.containerService.uploadDocument(formData).subscribe((data: any) => {
        console.log(data);
        this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Document uploaded successfully.', life: 3000 });
        this.getDocuments(this.containerId, this.currentFolder);
        this.showTagDialog = false;
        this.uploadingDocument = false;
        this.selectedTags = [];
      },
        error => {
          console.log(error);
          this.messageService.add({ severity: 'error', summary: 'Error', detail: error, life: 3000 });
        });
    }
  }

  selectedPath(link = '') {
    let keyArr = this.nodeData.key.split(':');
    let keyId: any;
    let selectedRootNode: any;
    if (keyArr.length === 1) {
      keyId = keyArr[0]
    } else {
      keyId = keyArr[0].split('-')[0]
    }
    let selectedFolder: any
    this.directories.map((folder) => {
      if (folder.key == keyId) {
        selectedFolder = folder
      }
    });

    const findChildNode = (routes) => {
      if (routes.label === link) {
        selectedRootNode = routes;
      } else if (routes.children) {
        routes.children.forEach(findChildNode)
      }
    }

    findChildNode(selectedFolder)
    this.selectedNode = selectedRootNode;
    this.nodeSelect({ node: selectedRootNode })
  }

  nodeSelect(event) {
    this.nodeData = event.node;
    console.log(this.nodeData, "<-- nodedata", this.directories)
    this.folderKey = event.node.key;
    let key = this.folderKey.split(":");
    let KeyIds = key[0].split("-");
    this.containerId = KeyIds[0];
    this.documentObjectId = KeyIds[1];
    if (event.node.parent) {
      this.currentFolder = key[1];
      this.folderSelected = true;
    }
    else {
      this.currentFolder = event.node.label;
      this.folderSelected = false;
    }

    this.containerSelected = true;
    this.documents = [];
    this.getDocumentContainerByKey(this.folderKey);
    this.folderArr = this.currentFolder.split("/");
    this.getDocuments(this.containerId, this.currentFolder);
    this.editMode = false;
    this.addingNode = false;
  }

  convertFolderToNode(key, name, data): TreeNode {
    return {
      key: key,
      label: name,
      data: data
    };
  }

  CancelNode() {
    this.addingNode = false;
    this.editMode = false;
    this.nodeName = '';
    this.showSearchBox = true;
  }

  SaveNode() {
    var nodeName = this.nodeName.trim();
    if (this.selectedNode.label.trim() == nodeName && this.editMode == true) {
      this.editMode = false;
      this.addingNode = false;
      this.showSearchBox = true;
      this.messageService.add({
        severity: 'success',
        summary: 'Successful',
        detail: 'Folder has been updated succesfully.',
        life: 3000
      });
      return;
    }
    if (!nodeName) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: "Name can not be empty.", life: 3000 });
      return false;
    }
    const currentUser = this.authService.currentUserValue;
    const body = {
      containerId: this.containerId,
      documentObjectId: this.documentObjectId,
      fileName: nodeName,
      fileType: 0,
      pathName: this.currentFolder,
      createdBy: currentUser.id.toString()
    }
    console.log('Form Body:' + JSON.stringify(body));
    if (!this.editMode) {
      this.containerService.createFolder(body).
        subscribe((data: any) => {
          console.log("New Folder added:" + JSON.stringify(data));
          //this.documentObjectId=data.documentObjectId;
          this.messageService.add({
            severity: 'success',
            summary: 'Successful',
            detail: 'Folder has been created succesfully.',
            life: 3000
          });
          this.getDocumentContainers();
          this.editMode = false;
          this.addingNode = false;
          this.showSearchBox = true;
        },
          error => {
            console.log(error);
            this.messageService.add({ severity: 'error', summary: 'Error', detail: error, life: 3000 });
          });
    }
    else {
      this.containerService.updateFolder(body)
        .subscribe((data: any) => {
          console.log("Updated Folder:" + JSON.stringify(data));
          this.editMode = false;
          this.addingNode = false;
          this.showSearchBox = true;
          this.currentFolder = data.pathName;
          this.nodeName = data.fileName;
          this.getDocumentContainers();
          this.messageService.add({
            severity: 'success',
            summary: 'Successful',
            detail: 'Folder has been updated succesfully.',
            life: 3000
          });

        },
          error => {
            console.log(error);
            this.messageService.add({ severity: 'error', summary: 'Error', detail: error, life: 3000 });
          });
    }
  }
  getDocumentContainerById(containerId: any) {

    console.log('Fetcing document Container by Id:' + containerId);
    this.containerService.getDocumentContainerById(containerId)
      .subscribe((data: any) => {
        console.log('Container data:' + JSON.stringify(data));
        this.conatiner = data;
        if (parseInt(this.conatiner.accessControlEnabled) === 1) {
          this.showAccessList = true;
        }
        else {
          this.showAccessList = false;
        }
      });
  }
  getDocumentContainerByKey(key: any) {

    console.log('Fetcing document Container by Key:' + key);
    this.containerService.getDocumentContainerByKey(key).subscribe((data: any) => {
      console.log('Container data:' + JSON.stringify(data));
      this.conatiner = data;
      if (parseInt(this.conatiner.accessControlEnabled) === 1) {
        this.showAccessList = true;
      }
      else {
        this.showAccessList = false;
      }
    });
  }
  getDocuments(containerId: any, path: string) {

    console.log('Fetcing documents by Id:' + containerId + ' Path:' + path);
    this.containerService.getDocumentsByContainerAndPath(containerId, path).subscribe((data: any) => {
      console.log('Container documents:' + JSON.stringify(data));
      this.documents = data;
    });
  }

  getDocumentById(documentId: any) {
    const body = {
      documentObjectId: this.selectedDocument.documentObjectId,
      staffId: this.currentUser.id,
      organizationId: this.currentUser.organizationId,
      tenantId: this.currentUser.tenantId
    }
    console.log('GetDocument body:' + JSON.stringify(body));
    if (this.selectedDocument.fileName.indexOf("pdf") > 0) {
      this.containerService.downloadDocument(this.selectedDocument.documentObjectId, this.currentUser.id, this.currentUser.organizationId, this.currentUser.tenantId).subscribe((data: any) => {
        console.log(data);
        var blob = new Blob([data], { type: data.type });
        var filename = this.selectedDocument.fileName;
        this.downloadFileName = this.selectedDocument.fileName;
        console.log('File Name:' + this.downloadFileName);
        this.fileUrl = window.URL.createObjectURL(blob);
        console.log("PDFUrl:" + this.fileUrl);
        this.externalPdfViewer.pdfSrc = this.fileUrl;
        this.externalPdfViewer.downloadFileName = this.downloadFileName;
        this.externalPdfViewer.refresh();

      });
    }
    else {
      this.containerService.downloadDocument(this.selectedDocument.documentObjectId, this.currentUser.id, this.currentUser.organizationId, this.currentUser.tenantId).subscribe((data: any) => {
        console.log(data);
        var blob = new Blob([data], { type: data.type });
        var filename = this.selectedDocument.fileName;
        fs.saveAs(blob, filename);
      },
      error => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: "Document not found", life: 3000 });
      });
    }
  }

  searchDocuments(newSearch: number) {
    this.showAuditTrail = false;
    if (!this.selectedFilter) {
      this.selectedFilter = '';
    }
    if (this.searchText != undefined && this.searchText != '') {
      this.searchText = this.searchText.trim();
    }
    console.log('Search Text:' + this.searchText);
    if (!this.searchText) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: "Please enter search text with a minimum length of 3 characters", life: 3000 });
      return false;
    }
    if (this.searchText.length < 3) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: "Please enter search text with a minimum length of 3 characters", life: 3000 });
      return false;
    }
    if (newSearch === 1) {
      this.pageIndex = 0;
      this.startPage = 0;
    }
    console.log("Selected Filter:" + this.selectedFilter);
    console.log("Search Text:" + this.searchText)

    const startDate = this.pipe.transform(this.fromDate, 'MM/dd/yyyy');
    const endDate = this.pipe.transform(this.toDate, 'MM/dd/yyyy');

    console.log('Start Date:' + startDate);
    console.log('End Date:' + endDate);

    if (this.selectedFilter.code == 'DateRange') {
      if (!moment(startDate, 'MM/DD/YYYY', true).isValid()) {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: "Please enter a valid date range.", life: 3000 });
        return false;
      }
      if (!moment(endDate, 'MM/DD/YYYY', true).isValid()) {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: "Please enter a valid date range.", life: 3000 });
        return false;
      }
      if (moment(startDate).isAfter(endDate)) {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: "Please enter a valid date range.", life: 3000 });
        return false;
      }

    }


    console.log('Date Comapre:' + moment(startDate).isAfter(endDate));
    let searchParams = new HttpParams();
    searchParams = searchParams.append('text', this.searchText);
    searchParams = searchParams.append('searchFilter', this.selectedFilter.name);
    searchParams = searchParams.append('tags', this.selectedFilterTags);
    searchParams = searchParams.append('fromDate', startDate);
    searchParams = searchParams.append('toDate', endDate);
    searchParams = searchParams.append('startPage', this.pageIndex);
    searchParams = searchParams.append('staffUserId', this.currentUser.id.toString());
    searchParams = searchParams.append('sortBy', this.sortBy.code);
    searchParams = searchParams.append('tenantId', this.currentUser.tenantId);
    const opts = { params: searchParams };
    console.log('Search Params:' + JSON.stringify(opts));

    this.containerService.getDocumentsByText(opts).subscribe((data: any) => {
      console.log(data);
      this.showRefineQueryMessage = false;
      //this.currentFolder = '';
      this.searchedDocuments = data.documents;
      this.showSearchResults = true;
      this.totalRecords = data.totalCount;
      this.totalMatchCount = data.totalMatchCount;
      this.showFolders = false;
      this.paginating = false;
      this.displaySearchMessage = data.displayMessage;
      if (this.totalMatchCount > this.totalRecords) {
        this.showRefineQueryMessage = true;
      }
    });
  }


  downlaod(document: any) {
    console.log("Donwloading :" + JSON.stringify(document));
    this.selectedDocument = document;
    this.getDocumentById(document.documentObjectId);
  }
  copyDocumentUrl(document: any) {
   var result= this.clipboardService.copyFromContent(this.configuration.sociableBaseUrl + 'document/download/' + document.documentObjectId);
    if (result) {
      this.messageService.add({
        severity: 'success',
        summary: 'Successful',
        detail: 'Document link copied successfully.',
        life: 3000
      });
    }
    else
    {
      this.messageService.add({
        severity: 'success',
        summary: 'Successful',
        detail: 'Failed to copy document link.',
        life: 3000
      });
    }
  }
  getFileType(filename) {
    let split = filename.split('.');
    return split[1];
  }

  manageTags() {
    this.showTagDialog = true;
    this.selectedTags = [];
    this.editingTag = true;
    this.uploadingDocument = false;
    //Get Selected Tags
    let tags = [];
    this.containerService.getTagListtByDocumentId(this.selectedDocument.documentObjectId).subscribe((data: any) => {
      console.log('Current Tags:' + JSON.stringify(data));
      tags = data;
      tags.forEach(element => {
        this.selectedTags.push({ name: element.tag.tagName, code: element.tagId.toString() });
      });
      console.log('Selected Tags:' + JSON.stringify(this.selectedTags));
      this.selectedTags = [...this.selectedTags];
    });
  }
  cancelTags() {
    this.showTagDialog = false;
    this.Tags.clear();
    this.selectedTags = [];
    this.addTag()
  }
  addTag() {
    this.Tags.push(this.fb.control({
      'tagId': 0,
      'tagName': '',
      'tagValue': ''
    }));
  }
  getTagSelectList() {
    this.tagService.getTagSelectList().subscribe((data: any) => {
      console.log('Tag List:' + JSON.stringify(data));
      this.tagList = data;
    });
  }
  keyPressAlphanumeric(event) {
    var inp = String.fromCharCode(event.keyCode);
    if (/[a-zA-Z0-9-. ]/.test(inp)) {
      return true;
    } else {
      event.preventDefault();
      return false;
    }
  }
  deleteChild() {
    if (this.selectedNode && this.selectedNode.parent) {
      let index = this.selectedNode.parent.children.indexOf(this.selectedNode);
      this.selectedNode.parent.children.splice(index, 1);
      console.log("Selected child deleted in", this.directories);
    }
  }
  EnableNewTag() {
    this.addingTag = true;
  }
  SaveTag() {
    if (this.tagName.length < 2) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: "Please enter a tag with minimum length of 2 charcters.", life: 3000 });
    }
    else {
      const body = {
        tagId: '0',
        tagName: this.tagName
      }
      this.tagService.createTag(body).subscribe((data: any) => {
        console.log('Tag Added:' + JSON.stringify(data));

        this.messageService.add({
          severity: 'success',
          summary: 'Successful',
          detail: 'Tag has been added succesfully.',
          life: 3000
        });
        this.selectedTags.push({ name: this.tagName, code: data.tagId.toString() });
        this.addingTag = false;
        this.tagName = '';
        this.getTagSelectList();
      },
        error => {
          console.log(error);
          this.messageService.add({ severity: 'error', summary: 'Error', detail: error, life: 3000 });
        });
    }

  }
  CancelTag() {
    this.addingTag = false;
    this.tagName = '';
  }
  public openExternalLinksInNewTab(event: any): void {
    const textLayer = event.source.textLayerDiv;
    const annotationLayer = textLayer.nextElementSibling;
    const anchorElements = annotationLayer.getElementsByTagName('a');

    for (let i = 0; i < anchorElements.length; i++) {
      anchorElements[i].setAttribute('target', '_blank');
    }
  }
  getTreeNodeWithKey(key: string, nodes: TreeNode[]): TreeNode | undefined {
    console.log('Searching Node with Key:' + key)
    for (let node of nodes) {
      if (node.key === key) {
        console.log('Found Node with Key:' + key)
        return node;
      }

      if (node.children) {
        let matchedNode = this.getTreeNodeWithKey(key, node.children);
        if (matchedNode) {
          console.log('Found Child Node with Key:' + key)
          return matchedNode;
        }
      }
    }
    return undefined;
  }
  selectNode(key: string): void {
    let node = this.getTreeNodeWithKey(key, this.directories);
    if (node) {
      this.selectedNode = node;
      if (this.selectedNode.expanded) {
        this.selectedNode.expanded = true;
      }
    }
    this.directories = [...this.directories];
  }
  getAuditTrail() {
    console.log('Fetching AuditTrail for document:' + this.selectedDocument.documentObjectId);
    this.showAuditTrail = true;
    this.showSearchResults = false;
    this.showFolders = false;
    this.containerService.getAuditTrailByDocumentId(this.selectedDocument.documentObjectId).subscribe((data: any) => {
      console.log(data);
      this.autditTrail = data;
      this.filterAuditTrails();
    });
  }

  filterAuditTrails() {
    if (this.auditTrailFormDate > this.auditTrailToDate) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: "To date can not be less than from date.", life: 3000 });
      return false;
    }
    else {
      this.filteredAuditTrail = this.autditTrail;
      if (this.auditTrailFormDate != null) {
        this.filteredAuditTrail = this.filteredAuditTrail.filter(f => new Date(new Date(f.accessDate).toDateString()) >= this.auditTrailFormDate);
      }
      if (this.auditTrailToDate != null) {
        this.filteredAuditTrail = this.filteredAuditTrail.filter(f => new Date(new Date(f.accessDate).toDateString()) <= this.auditTrailToDate);
      }
    }
  }

  closeAudit() {
    this.showAuditTrail = false;
    this.showSearchResults = false;
    this.showFolders = true;
    this.autditTrail = [];
  }
  paginate(event) {
    //event.first = Index of the first record
    //event.rows = Number of rows to display in new page
    //event.page = Index of the new page
    //event.pageCount = Total number of pages
    this.pageIndex = event.page;
    this.startPage = event.first;
    console.log("Current Page:" + this.pageIndex);
    this.paginating = true;
    this.searchDocuments(0);
  }

  exportDocument() {
    this.containerService.exportDocuments("userName").subscribe((data: any) => {
      console.log(data);
    });
  }
  getAllTagNames(tags: any): string {
    var res = "";
    if (tags.length > 0) {
      for (var tag of tags) {
        res = res + ", " + tag.tag.tagName;
      }
     res= res?.trim().slice(1);
    }
    return res;

  }
}
