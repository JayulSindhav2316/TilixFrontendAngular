import { Component, OnInit } from "@angular/core";
import { MessageService, ConfirmationService, MenuItem } from "primeng/api";
import { AppBreadcrumbService } from "src/app/app.breadcrumb.service";
import { TrReportService } from "src/app/services/tr-report-editor.service";
import { Report, Template } from "./report";
import { TrReportCatetoryService } from "src/app/services/tr-report-catetory.service";
import { Category } from "../report-category/category";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ConfigurationService } from "src/app/services/configuration.service";
import { StorageService } from "src/app/services/storage.service";

@Component({
    selector: "app-report-editor",
    templateUrl: "./report-editor.component.html",
    styleUrls: ["./report-editor.component.scss"],
    providers: [MessageService, ConfirmationService],
})
export class ReportEditorComponent implements OnInit {
    reportForm: FormGroup;
    templates: Template[];
    categories: Category[];
    reports: Report[];
    report: Report;
    submitted: boolean;
    isAddNewRecord: boolean;
    items: MenuItem[];
    showTable: boolean;
    showLoader: boolean;
    reportDialog: boolean;
    selectedCategory: Category;
    selectedTemplate: Template;
    isClone: boolean;
    isUploadReport: boolean;
    cols: any[];
    dataViewLayout: string;
    addErrorMessages: any = {};
    currentUser: any;
    configuration: any;
    reportEmailSender:string;
    constructor(
        private reportEditorService: TrReportService,
        private reportCategoryService: TrReportCatetoryService,
        private breadcrumbService: AppBreadcrumbService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
        private configurationService: ConfigurationService,
        private fb: FormBuilder,
        private storageService: StorageService 
    ) {
        this.breadcrumbService.setItems([
            { label: "Home", routerLink: ["/"] },
            { label: "Set Up" },
            { label: "Reports" },
        ]);
        this.showTable = false;
        this.showLoader = true;
        this.isClone = false;
        this.isUploadReport = false;
        this.currentUser = JSON.parse(localStorage.getItem("currentUser"));
        this.reportEmailSender = this.currentUser.reportEmailSender;
        this.getConfiguration(this.currentUser.organizationId);
    }

    initForm() {
        this.reportForm = this.fb.group({
            name: this.fb.control("", [Validators.required]),
            description: this.fb.control("", [Validators.required]),
            category: this.fb.control("", Validators.required),
            template: this.fb.control("", Validators.required),
        });
    }

    ngOnInit(): void {
        this.initForm();
        this.getAllReportCategories();
        this.getAllReportTemplates();
        this.cols = [
            { field: "Id", header: "Id" },
            { field: "Name", header: "Report Name" },
        ];
        this.items = [
            {
                label: "Options",
                items: [
                    {
                        label: "Edit",
                        icon: "pi pi-pencil",
                        command: () => {
                            //this.update();
                        },
                    },
                    {
                        label: "Delete",
                        icon: "pi pi-trash",
                        command: () => {
                            //this.deleteReport();
                        },
                    },
                ],
            },
        ];
    }

    getConfiguration(organizationId) {
        this.configurationService
            .getConfigurationByOrganizationId(organizationId)
            .subscribe((data: any) => {
                this.configuration = data;
                const rv_dataviewlayout =this.storageService.getCache('re-dataviewlayout');
                if (rv_dataviewlayout == null) {
                    this.storageService.setCache('re-dataviewlayout',data.dataViewLayout,1);
                    this.dataViewLayout = data.dataViewLayout as string;
                } else {
                    this.dataViewLayout = rv_dataviewlayout;
                }                       
            });
    }

    get f() {
        return this.reportForm.controls;
    }

    changeLayout(dv: any) {        
        this.storageService.setCache('re-dataviewlayout',dv.layout,1);
    }

    getAllReports() {
        this.storageService.setCache('re-selectedcategory',this.selectedCategory,1);    
        this.reportEditorService
            .getReportsByCategory(this.selectedCategory.id)
            .subscribe((data: any[]) => {
                this.reports = data;
            });
    }
    getAllReportCategories() {
        this.reportCategoryService
            .getAllReportCategories()
            .subscribe((data: any[]) => {
                this.categories = data;
                if (this.categories.length > 0) {
                    const rv_selectedCategory = this.storageService.getCache('re-selectedcategory');
                    if (rv_selectedCategory == null) {
                        this.selectedCategory = this.categories[0];
                        this.storageService.setCache('re-selectedcategory',this.selectedCategory,1);
                    } else {
                        this.selectedCategory = rv_selectedCategory;
                    }
                }
                this.getAllReports();
            });
    }

    getAllReportTemplates() {
        this.reportEditorService
            .getReportTemplates()
            .subscribe((data: any[]) => {
                this.templates = data;
            });
    }
    // update() {
    //   this.editReport();
    //   this.isAddNewRecord = false;
    // }
    setActiveRow(report: any) {
        console.log("Selected Report:" + JSON.stringify(report));
        this.report = report;
    }

    hideDialog() {
        this.reportDialog = false;
        this.submitted = false;
        this.reportForm.reset();
    }

    openNew() {
        this.reportDialog = true;
        this.report = {};
        this.submitted = false;
        this.isAddNewRecord = true;
        this.isClone = false;
        this.isUploadReport = false;
        this.reportForm.reset();
    }
    editReport(report: Report) {
        this.reportForm.reset();
        this.isClone = false;
        this.isAddNewRecord = false;
        this.report = { ...report };
        this.selectedCategory = this.report.category;
        this.selectedTemplate = this.report.template;
        this.reportDialog = true;
        this.reportForm.setValue({
            name: this.report.name,
            description: this.report.description,
            category: this.report.category,
            template: this.report.template,
        });
    }

    cloneReport(report: Report) {
        this.reportForm.reset();
        this.isClone = true;
        report.name = report.name + "-Copy";
        this.report = { ...report };
        this.reportDialog = true;
        this.reportForm.setValue({
            name: this.report.name,
            description: this.report.description,
            category: this.report.category,
            template: this.report.template,
        });
    }
    deleteReport(report: Report) {
        this.confirmationService.confirm({
            message: "Are you sure you want to delete the selected Report?",
            header: "Confirm",
            icon: "pi pi-exclamation-triangle",
            accept: () => {
                this.reportEditorService.deleteReport(report.id).subscribe(
                    (response) => {
                        this.messageService.add({
                            severity: "success",
                            summary: "Successful",
                            detail: "Report Category deleted succesfully.",
                            life: 3000,
                        });
                        this.getAllReports();
                    },
                    (error) => {
                        console.log(error);
                        this.messageService.add({
                            severity: "error",
                            summary: "Error",
                            detail: error,
                            life: 3000,
                        });
                    }
                );
            },
        });
    }

    saveReport() {
        if (this.reportForm.invalid) {
            return;
        }
        this.submitted = true;
        this.report.name = this.reportForm.value.name;
        this.report.description = this.reportForm.value.description;
        this.report.categoryId = this.reportForm.value.category.id;
        this.report.templateId = this.reportForm.value.template.id;
        if (this.isAddNewRecord) {
            this.reportEditorService.createReport(this.report).subscribe(
                (response) => {
                    this.messageService.add({
                        severity: "success",
                        summary: "Successful",
                        detail: "Report Added Succesfully.",
                        life: 3000,
                    });
                    this.getAllReportCategories();
                    this.hideDialog();
                },
                (error) => {
                    console.log(error);
                    this.messageService.add({
                        severity: "error",
                        summary: "Error",
                        detail: error,
                        life: 3000,
                    });
                }
            );
        } else {
            if (this.isClone) {
                this.reportEditorService.cloneReport(this.report).subscribe(
                    (response) => {
                        this.messageService.add({
                            severity: "success",
                            summary: "Successful",
                            detail: "Report Cloned Succesfully.",
                            life: 3000,
                        });
                        this.getAllReportCategories();
                        this.hideDialog();
                    },
                    (error) => {
                        console.log(error);
                        this.messageService.add({
                            severity: "error",
                            summary: "Error",
                            detail: error,
                            life: 3000,
                        });
                    }
                );
            } else {
                this.reportEditorService.updateReport(this.report).subscribe(
                    (response) => {
                        this.messageService.add({
                            severity: "success",
                            summary: "Successful",
                            detail: "Report Updated Succesfully.",
                            life: 3000,
                        });
                        this.getAllReportCategories();
                        this.hideDialog();
                    },
                    (error) => {
                        console.log(error);
                        this.messageService.add({
                            severity: "error",
                            summary: "Error",
                            detail: error,
                            life: 3000,
                        });
                    }
                );
            }
        }
    }

    listboxChange() {
        this.getAllReports();
    }
}
