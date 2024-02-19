import { Component, OnInit, Input } from '@angular/core';
import { ConfirmationService, MenuItem, MessageService } from "primeng/api";
import { AppBreadcrumbService } from '../../../app.breadcrumb.service';
import { Router } from '@angular/router';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { HttpParams } from '@angular/common/http';
import { CommunicationService } from '../../../services/communication.service';
@Component({
  selector: 'app-communication',
  templateUrl: './communication.component.html',
  styleUrls: ['./communication.component.scss'],
  styles: [
    `
            :host ::ng-deep .p-dialog {
                width: 150px;
                margin: 0 auto 2rem auto;
                display: block;
            }

            @media screen and (max-width: 960px) {
                :host
                    ::ng-deep
                    .p-datatable
                    .p-datatable-tbody
                    > tr
                    > td:last-child {
                    text-align: center;
                }

                :host
                    ::ng-deep
                    .p-datatable
                    .p-datatable-tbody
                    > tr
                    > td:nth-child(6) {
                    display: flex;
                }
            }
        `,
  ],
  providers: [MessageService, ConfirmationService],
})
export class CommunicationComponent implements OnInit {
  @Input() entityId: number;
  noRecords: boolean;
  showTable: boolean;
  showLoader: boolean;
  showSearch: boolean;
  public cols: any[];
  types: any[];
  public communications: any[];
  communicationDialog: boolean;
  addErrorMessages : any = {};
  submitted:boolean;
  currentDate: string;


  communicationForm = this.formBuilder.group({
    CommunicationDate: ['', Validators.required],
    Type: ['', Validators.required],
    Subject: ['', [Validators.required, this.noBlankValidator]],
    Description: ['', [Validators.required, this.noBlankValidator]],
    From: ['', [Validators.required, this.noBlankValidator]]
  });

  constructor(
    private breadcrumbService: AppBreadcrumbService,
    private messageService: MessageService,
    private router: Router,
    private communicationService:  CommunicationService,
    private formBuilder: FormBuilder
  ) {

    this.types = [
      { name: 'Email', code: 'Email' },
      { name: 'Phone', code: 'Phone' },
      { name: 'In Person', code: 'In Person' }
    ];
    this.currentDate = new Date().toISOString().substring(0, 10);
    this.noRecords=false;
  }

  ngOnInit(): void {
    this.showTable = false;
    this.showLoader = true;
    this.communicationDialog = false;
    this.getCommunications();
  }

  addCommunication() { 
    this.communicationForm.reset();
    this.communicationDialog = true;
    this.communicationForm.controls.CommunicationDate.setValue(new Date());
  }

  hideDialog(){
    this.submitted = false;
    this.communicationDialog = false;
    this.communicationForm.reset();
  }

  saveCommunication() {
   
    this.submitted = true;
    if (this.communicationForm.valid)
    { 

    const body = {
      communicationId: 0,
      entityId: this.entityId,
      date: this.communicationForm.get('CommunicationDate').value.toISOString(),
      type: this.communicationForm.get('Type').value,
      subject: this.communicationForm.get('Subject').value,
      notes: this.communicationForm.get('Description').value,
      from: this.communicationForm.get('From').value,
    };
    console.log('Adding Communication:' +  JSON.stringify(body));
    this.communicationService.createCommunication(body).subscribe(
      response => {
        this.messageService.add({ severity: 'success',
                                  summary: 'Successful',
                                  detail: 'Communication has been added succesfully.',
                                  life: 3000
                                });
        this.communicationDialog = false;
        this.getCommunications();
      },
      error => {
        console.log(error);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: error, life: 3000 });
      });
    } else
    {      
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Please fix the error(s) on the page.', life: 3000 });
    }
  }

  getCommunications(){
    this.showLoader = true;
    console.log('Reading communications:' + this.entityId);
    let searchParams = new HttpParams();
    searchParams = searchParams.append('entityId',  this.entityId.toString());
    const opts = {params: searchParams};
    this.communicationService.getCommunicationsByEntityId(opts).subscribe((data: any) =>
    {
      console.log(data);
      this.communications = data;
      if ( this.communications.length > 0){
        this.showLoader = false;
        this.showTable = true;
        this.noRecords=false;
      }
      else {
        this.noRecords=true;
        this.showLoader = false;
      }
    });
  }

  errorIconCss(field: string) {
    return { 'has-feedback': this.isFieldValid(field) };
  }

  errorFieldCss(field: string) {
    return { 'ng-dirty': this.isFieldValid(field) };
  }

  resetSubmitted(field){
    this.submitted = false;
    this.isFieldValid(field);
  }

  isFieldValid(field: string) {    
    if ((!this.communicationForm.get(field).valid) && (this.submitted) && (this.communicationForm.get(field).hasError('required'))){
      if (field=='Type')
        this.addErrorMessages =  { errorType: 'dropdownrequired', controlName: field };
      else
        this.addErrorMessages =  { errorType: 'required', controlName: field };

      return true;
    }
  }
  matcher(event: ClipboardEvent, formControlName: string): boolean {
    var allowedRegex='';
    if (formControlName == 'From'){
       allowedRegex = ("^[A-Za-z ']{0,30}$");}
    if (formControlName == 'Subject')
        allowedRegex = ("^[A-Za-z ]{0,64}$");
    if (event.type == "paste") {
      let clipboardData = event.clipboardData;
      let pastedText = '';
       pastedText = clipboardData.getData('text') + this.communicationForm.get(formControlName).value;
      if (!pastedText.match(allowedRegex))  {
        event.preventDefault();
        return false;
     }
     return true;
    }
  }
  noBlankValidator(control: FormControl)
    {
      const isWhitespace = (control.value || '').trim().length === 0;
      const isValid = !isWhitespace;
      return isValid ? null : { 'required': true };
    }
}
