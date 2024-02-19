import { HttpParams } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { MenuItem, MessageService } from 'primeng/api';
import { AppBreadcrumbService } from 'src/app/app.breadcrumb.service';
import { AuthService } from 'src/app/services/auth.service';
import { NotesService } from 'src/app/services/notes.service';

@Component({
  selector: 'app-note',
  templateUrl: './note.component.html',
  styleUrls: ['./note.component.scss']
})
export class NoteComponent implements OnInit {
  @Input() entityId: number;
  noRecords: boolean;
  showTable: boolean;
  showLoader: boolean;
  showSearch: boolean;
  public cols: any[];
  severityList: any[];
  public notes: any[];
  notesDialog: boolean;
  addErrorMessages : any = {};
  submitted:boolean;
  currentDate: string;
  currentUser: any;  
  items: MenuItem[];
  isAddNewRecord: boolean;
  isViewOnly: boolean;
  selectedNote: any;
  createdBy: string;
  createdOn: string;
  modifyBy: string;
  modifyOn: string;
  isPageValid: boolean;

  notesForm = this.formBuilder.group({
    Note: ['', [Validators.required, this.noBlankValidator]],
    Severity: ['', [Validators.required]],
    // DisplayOnProfile: [0],
    Status: [1]
  });

  constructor(
    private noteService: NotesService,
    private breadcrumbService: AppBreadcrumbService,
    private messageService: MessageService,
    private router: Router,
    private formBuilder: FormBuilder,
    private authService: AuthService,) { 

    this.severityList = [
      { name: 'General', code: 'General' },
      { name: 'Warning', code: 'Warning' },
      { name: 'Emergency', code: 'Emergency' }
    ];
    
  }
  
  ngOnInit(): void {
  
    this.isPageValid = false;
    this.getNotes(); 
    this.currentUser = this.authService.currentUserValue;

    this.items = [{
      label: 'Options',
      items: [
      {
        label: 'View',
        icon: 'pi pi-eye',
        command: () => {
            this.editNote(true);
        }
      },
      {
        label: 'Edit',
        icon: 'pi pi-pencil',
        command: () => {
            this.editNote(false);
        }
      }
    ]}
    ];
  }

  setActiveRow(note: any){
    this.selectedNote = note;
    this.isViewOnly = false;
    this.isAddNewRecord = false;
    this.isPageValid = false;
  }

  saveNotes(){
    this.submitted = true;
    if(this.notesForm.valid){
      this.isPageValid = true;
      const body = {
        NoteId: this.selectedNote ? this.selectedNote.noteId : 0,
        EntityId: this.entityId,
        Severity: this.notesForm.get('Severity').value,
        // DisplayOnProfile: this.notesForm.get('DisplayOnProfile').value === true ? 1 : 0,
        DisplayOnProfile: 1,
        Notes: this.notesForm.get('Note').value,
        Status: this.notesForm.get('Status').value === true ? 1 : 0,
        CreatedBy: this.currentUser.username,
        ModifiedBy: this.currentUser.username,
        CreatedOn: moment(new Date()).utc(true).format(),
        ModifiedOn: moment(new Date()).utc(true).format()
      };
      console.log('Adding Notes:' +  JSON.stringify(body));

      if(this.isAddNewRecord)
      {
        this.noteService.createNotes(body).subscribe(
        response => {
          this.messageService.add({ severity: 'success',
                                    summary: 'Successful',
                                    detail: 'Notes has been added succesfully.',
                                    life: 3000
                                  });
          this.notesDialog = false;
          this.getNotes();
        },
        error => {
          console.log(error);
          this.messageService.add({ severity: 'error', summary: 'Error', detail: error, life: 3000 });
        });
      }
      else
      {
        this.noteService.updateNotes(body).subscribe(
        response => {
          this.messageService.add({ severity: 'success',
                                    summary: 'Successful',
                                    detail: 'Notes updated succesfully.',
                                    life: 3000
                                  });
          this.notesDialog = false;
          this.getNotes();
        },
        error => {
          console.log(error);
          this.messageService.add({ severity: 'error', summary: 'Error', detail: error, life: 3000 });
        });
      }
    }
  }

  getNotes(){
    this.showLoader = true;
    let searchParams = new HttpParams();
    searchParams = searchParams.append('entityId',  this.entityId.toString());
    const opts = {params: searchParams};
    this.noteService.getNotesByEntityId(opts).subscribe((data: any) =>
    {
      console.log(data);
      this.notes = data;
      if ( this.notes.length > 0){
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

  noBlankValidator(control: FormControl)
  {
    const isWhitespace = (control.value || '').trim().length === 0;
    const isValid = !isWhitespace;
    return isValid ? null : { 'required': true };
  }

  addNote(){
    this.notesDialog = true;
    this.isAddNewRecord= true;
    this.isViewOnly = false;
    this.isPageValid = false;
    this.notesForm.reset();
    this.notesForm.get('Status').setValue(true);
  }

  editNote(viewOnly: boolean){
    this.notesDialog = true;
    this.isViewOnly = viewOnly;
    this.notesForm.get('Note').setValue(this.selectedNote.notes);
    this.notesForm.get('Severity').setValue(this.selectedNote.severity);
    // this.notesForm.get('DisplayOnProfile').setValue(this.selectedNote.displayOnProfile);
    this.notesForm.get('Status').setValue(this.selectedNote.status === 1 ? true : false);
    this.createdBy = this.selectedNote.createdBy;
    this.createdOn = moment(this.selectedNote.createdOn).format("MM-DD-YYYY HH:mm:ss");
    this.modifyBy = this.selectedNote.modifiedBy;
    this.modifyOn = this.selectedNote.modifiedOn ? moment(this.selectedNote.modifiedOn).format("MM-DD-YYYY HH:mm:ss") : this.selectedNote.modifiedOn;
  }

  hideDialog(){
    this.notesDialog = false;
    this.notesForm.reset();
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
    if ((!this.notesForm.get(field).valid) && (this.submitted) && (this.notesForm.get(field).hasError('required'))){
      if (field=='Severity')
        this.addErrorMessages =  { errorType: 'dropdownrequired', controlName: field };
      else
        this.addErrorMessages =  { errorType: 'required', controlName: field };

      return true;
    }
  }

  matcher(event: ClipboardEvent, formControlName: string): boolean {
    var allowedRegex='';
    if (event.type == "paste") {
      let clipboardData = event.clipboardData;
      let pastedText = '';
       pastedText = clipboardData.getData('text') + this.notesForm.get(formControlName).value;
      if (!pastedText.match(allowedRegex))  {
        event.preventDefault();
        return false;
     }
     return true;
    }
  }
}
