import { Component, OnInit } from '@angular/core';
import { MessageService, ConfirmationService, MenuItem } from 'primeng/api';
import { AppBreadcrumbService } from 'src/app/app.breadcrumb.service';
import { TrReportCatetoryService } from 'src/app/services/tr-report-catetory.service';
import { Category } from './category';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-report-category',
  templateUrl: './report-category.component.html',
  styleUrls: ['./report-category.component.scss'],
  providers: [MessageService, ConfirmationService]
})
export class ReportCategoryComponent implements OnInit {
  categoryForm: FormGroup;
  categories: Category[];
  category: Category;
  submitted: boolean;
  isAddNewRecord: boolean;
  items: MenuItem[];
  showTable: boolean;
  showLoader: boolean;
  categoryDialog: boolean;
  cols: any[];
  constructor(
    private reportCategoryService: TrReportCatetoryService,
    private breadcrumbService: AppBreadcrumbService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private fb: FormBuilder,
  ) {
    this.breadcrumbService.setItems([
      { label: 'Home', routerLink: ['/'] },
      { label: 'Set Up' },
      { label: 'Report Category' },
    ]);
    this.showTable = false;
    this.showLoader = true;
  }

  initForm() {
    this.categoryForm = this.fb.group({      
      name: this.fb.control('', [Validators.required]),
      description: this.fb.control('', [Validators.required])
    });
  }

  ngOnInit(): void {
    this.initForm();
    this.getAllReportCategories();
    this.cols = [
      { field: 'Id', header: 'Id' },
      { field: 'Name', header: 'Category Name' },
      { field: 'Description', header: 'Description' },
    ];
    this.items = [{
      label: 'Options',
      items: [{
        label: 'Edit Category',
        icon: 'pi pi-user-edit',
        command: () => {
          this.update();
        }
      },
      {
        label: 'Delete Category',
        icon: 'pi pi-trash',
        command: () => {
          this.deleteCategory();
        }
      }
      ]
    }
    ];
  }
  get f() {
    return this.categoryForm.controls;
  }
  update() {
    this.editCatetory();
    this.isAddNewRecord = false;
  }
  setActiveRow(category: any) {
    console.log('Selected Category:' + JSON.stringify(category));
    this.category = category;
  }
  getAllReportCategories() {
    this.reportCategoryService.getAllReportCategories().subscribe((data: any[]) => {
      this.categories = data;
      this.showTable = true;
      this.showLoader = false;
    });
  }
  hideDialog() {
    this.categoryDialog = false;
    this.submitted = false;
    this.categoryForm.reset();
  }

  openNew() {
    this.categoryDialog = true;
    this.category = {};
    this.submitted = false;
    this.isAddNewRecord = true;
    this.categoryForm.reset();
  }
  editCatetory() {
    this.category = { ...this.category };
    this.categoryDialog = true;
    this.categoryForm.setValue({
      name:this.category.name,
      description:this.category.description
    });
  }
  deleteCategory() {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete the selected Report Category?',
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.reportCategoryService.deleteReportCategory(this.category.id).subscribe(response => {
          this.messageService.add({
            severity: 'success',
            summary: 'Successful',
            detail: 'Report Category deleted succesfully.',
            life: 3000
          });
          this.getAllReportCategories();
        },
          error => {
            console.log(error);
            this.messageService.add({ severity: 'error', summary: 'Error', detail: error, life: 3000 });
          });

      }
    });
  }

  
  saveCategory() {
    if (this.categoryForm.invalid) {
      return;
    }
    this.submitted = true;
    this.category.name = this.categoryForm.value.name;
    this.category.description = this.categoryForm.value.description;
    if (this.isAddNewRecord)
    {
      this.reportCategoryService.createReportCategory(this.category).subscribe(response =>
      {
        this.messageService.add({
          severity: 'success',
          summary: 'Successful',
          detail: 'Report Category Added Succesfully.',
          life: 3000
        });
        this.getAllReportCategories();
        this.hideDialog();
      },
        error =>
        {
          console.log(error);
          this.messageService.add({ severity: 'error', summary: 'Error', detail: error, life: 3000 });
        });
    }
    else
    {
      this.reportCategoryService.updateReportCategory(this.category).subscribe(response =>
      {
        this.messageService.add({
          severity: 'success',
          summary: 'Successful',
          detail: 'Report Category Updated Succesfully.',
          life: 3000
        });
        this.getAllReportCategories();
        this.hideDialog();
      },
        error =>
        {
        console.log(error);
          this.messageService.add({ severity: 'error', summary: 'Error', detail: error, life: 3000 });
        });
    }
  } 
}
