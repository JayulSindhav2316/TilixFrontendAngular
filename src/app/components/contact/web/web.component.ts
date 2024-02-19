import { Component, OnInit,  Input } from '@angular/core';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { Validators } from '@angular/forms';
import { EntityService } from '../../../services/entity.service';
import { HttpParams } from '@angular/common/http';
import { MessageService } from 'primeng/api';
import { AppBreadcrumbService } from '../../../app.breadcrumb.service';
@Component({
  selector: 'app-web',
  templateUrl: './web.component.html',
  styleUrls: ['./web.component.scss']
})
export class WebComponent implements OnInit {
  @Input() entityId: number;
  @Input() loginId: string;
  webForm = this.fb.group({
    login: ['', Validators.required],   
    password: ['', [Validators.required, Validators.pattern(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?).{8,}$/)]],
    locked: false
  });
  contact: any;
  addErrorMessages : any = {};
  submitted: boolean;
  disallowSave: boolean;
  constructor(private fb: FormBuilder,
              private breadcrumbService: AppBreadcrumbService,
              private messageService: MessageService,
              private entityService: EntityService) { }

  ngOnInit(): void {
    console.log('EntityId:' + this.entityId);
    console.log('LoginId:' + this.loginId);    
    this.getEntityById();
    this.disallowSave = true;
  }

  onSubmit() {
    // TODO: Use EventEmitter with form value
    console.log('Form data:' + JSON.stringify(this.webForm.value));
  }

  updateForm(){      
    if(this.contact.webLoginName){
      this.webForm.get('login').setValue(this.contact.webLoginName.trim());
    }
    this.webForm.get('password').setValue('*************'); 
    this.webForm.get('locked').setValue(this.contact.accountLocked == 1 ? true : false); 
    this.webForm.get('password').setErrors(null);
  }

  getEntityById()
  {
    console.log('Fetcing data for Entity:' + this.entityId);
    let searchParams = new HttpParams();
    searchParams = searchParams.append('entityId',  this.entityId.toString());
    const opts = {params: searchParams};
    this.entityService.getEntityById(opts).subscribe((data: any) =>
    {
      console.log(data);
      this.contact = data;
      this.updateForm();
    });
  }
  reloadLoginPassword(){
    this. getEntityById();
    this.disallowSave = true;
  }
  saveLoginPassword(){
    this.submitted = true;
      const body = {
        EntityId: this.entityId,
        LoginName: this.webForm.get('login').value.trim(),
        Password: this.webForm.get('password').value,
        AccountLocked: this.webForm.get('locked').value == true ? 1 : 0,
      }
      if (this.webForm.valid){
        console.log('Updating WebLogin:' +  JSON.stringify(body));
      this.entityService.updateWebLogin(body).subscribe(
        response => {
          this.messageService.add({ severity: 'success',
                                    summary: 'Successful',
                                    detail: 'Web info updated succesfully.',
                                    life: 3000
                                  });
          this.disallowSave = true;
        },
        error => {
          console.log(error);
          this.messageService.add({ severity: 'error', summary: 'Error', detail: error, life: 3000 });
        });
      }  else {
        this.messageService.add({ severity: 'info', 
                                  summary: 'Required Info', 
                                  detail: 'Please enter required information.', 
                                  life: 3000 });
      }
  }

  errorIconCss(field: string) {
    return {'has-feedback': this.isFieldValid(field)};
  }

  errorFieldCss(field: string) {
    return {'ng-dirty': this.isFieldValid(field)};
  }

  resetSubmitted(field){
    this.submitted = false;
    this.isFieldValid(field);
  }

  isFieldValid(field: string) {  
    if ((!this.webForm.get(field).valid) && (this.submitted) && (this.webForm.get(field).hasError('required'))){
      if (field=='login')
          field = 'Login Id'
      if (field=='password')
          field = 'Password'
      this.addErrorMessages =  { errorType: 'required', controlName: field };
      return true;
    }
     if (this.webForm.get(field).hasError('pattern')){
       if (field=='password'){
        this.addErrorMessages =  { errorType: 'pwPattern', controlName: field };
       }
      return true;
    }

  }

  matcher(event: ClipboardEvent, formControlName: string): boolean {
    var allowedRegex = "";
    if (formControlName == 'login')
        allowedRegex = "^[A-Za-z0-9]*$";
    if (event.type == "paste") {
      let clipboardData = event.clipboardData ;
      let pastedText = clipboardData.getData('text')  + this.webForm.get(formControlName).value; 
      if (!pastedText.match(allowedRegex))  {
        if (formControlName == 'login'){
        event.preventDefault();
        return false;} 

     }
     return true;
    }
  }
  enableSave(event, formControlName){
    switch(formControlName){
      case 'login' :
        if (event.target.value == this.contact.webLoginName)
          this.disallowSave = true;
        if (event.target.value != this.contact.webLoginName)
          this.disallowSave = false;
      break
      case 'password' :
          this.disallowSave = false;
      break
      case 'locked' :
          this.disallowSave = false;
      break
      }
    }


}
