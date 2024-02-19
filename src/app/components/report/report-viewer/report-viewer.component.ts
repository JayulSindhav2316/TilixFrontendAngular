import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { PrimeNGConfig } from "primeng/api";
import { AppBreadcrumbService } from "src/app/app.breadcrumb.service";
import { TrReportService } from "src/app/services/tr-report-editor.service";
import { Category, Report } from "../../setup/report/report-editor/report";
import { TrReportCatetoryService } from "src/app/services/tr-report-catetory.service";
import { ConfigurationService } from "src/app/services/configuration.service";
import { StorageService } from "src/app/services/storage.service";

@Component({
    selector: "app-report-viewer",
    templateUrl: "./report-viewer.component.html",
    styleUrls: ["./report-viewer.component.scss"],
})
export class ReportViewerComponent implements OnInit {
    categories: Category[];
    selectedCategory: Category;
    reports: Report[];
    report: Report;
    dataViewLayout: string;
    currentUser: any;
    reportEmailSender:string;
    configuration: any;
    constructor(
        private reportEditorService: TrReportService,
        private primengConfig: PrimeNGConfig,
        private breadcrumbService: AppBreadcrumbService,
        private reportCategoryService: TrReportCatetoryService,
        private configurationService: ConfigurationService,
        private storageService: StorageService        
    ) {
        this.breadcrumbService.setItems([
            { label: "Home", routerLink: ["/"] },
            { label: "Reports" },
            { label: "Report Viewer" },
        ]);
        this.currentUser = JSON.parse(localStorage.getItem("currentUser"));
        this.reportEmailSender = this.currentUser.reportEmailSender;
        this.getConfiguration(this.currentUser.organizationId);        
    }

    ngOnInit(): void {
        this.getAllReportCategories();
        this.primengConfig.ripple = true;
    }
    getConfiguration(organizationId) {
        this.configurationService
            .getConfigurationByOrganizationId(organizationId)
            .subscribe((data: any) => {
                const rv_dataviewlayout =this.storageService.getCache('rv-dataviewlayout');
                if (rv_dataviewlayout == null) {
                    this.storageService.setCache('rv-dataviewlayout',data.dataViewLayout,1);
                    this.dataViewLayout = data.dataViewLayout as string;
                } else {
                    this.dataViewLayout = rv_dataviewlayout;
                }
            });
    }
    getAllReports() {
        this.storageService.setCache('rv-selectedcategory',this.selectedCategory,1);            
        this.reportEditorService
            .getReportsByCategory(this.selectedCategory.id)
            .subscribe((data: any[]) => {
                this.reports = data;
            });
    }

    changeLayout(dv: any) {        
        this.storageService.setCache('rv-dataviewlayout',dv.layout,1);
    }
    getAllReportCategories() {
        this.reportCategoryService
            .getAllReportCategories()
            .subscribe((data: any[]) => {
                this.categories =  data as Category[];
                if (this.categories.length > 0) {
                    const rv_selectedCategory = this.storageService.getCache('rv-selectedcategory');
                    if (rv_selectedCategory == null) {
                        this.selectedCategory = this.categories[0];
                        this.storageService.setCache('rv-selectedcategory',this.selectedCategory,1);
                    } else {
                        this.selectedCategory = rv_selectedCategory;
                    }
                }
                this.getAllReports();
            });
    }

    listboxChange() {
        this.getAllReports();
    }
}
