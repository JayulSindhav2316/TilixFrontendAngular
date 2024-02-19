import { Component, OnInit,  forwardRef, Input, EventEmitter, Output  } from '@angular/core';
import { AbstractControl, ControlValueAccessor, FormBuilder, FormGroup, NG_VALIDATORS, NG_VALUE_ACCESSOR, ValidationErrors, Validator, Validators, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { ContactEmail } from 'src/app/models/contact-email';
type ChangeCallbackFn<T> = (value: T) => void;
type TouchCallbackFn = () => void;

@Component({
  selector: 'app-email',
  templateUrl: './email.component.html',
  styleUrls: ['./email.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => EmailComponent),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => EmailComponent),
      multi: true
    }
  ]
})

export class EmailComponent implements ControlValueAccessor, Validator {
  emailFormGroup: FormGroup = this.fb.group({
    emailId:[0],
    emailAddressType: ['',Validators.required],
    emailAddress: ['',  [Validators.email,Validators.required]],
    isPrimary: [true]

  });
  labels: any[];

  @Input() controlId: string;
  @Output() removeControl = new EventEmitter<string>();
  @Input() profileFormSubmitted: boolean;
  @Input() isCompany: boolean;
  addErrorMessages : any = {};
  @Output() otherFormClicked = new EventEmitter<boolean>();
  @Output() setPrimaryEmail = new EventEmitter<string>();
  @Output() emailChanged = new EventEmitter<boolean>();
  controlValueChanged:{emailAddressTypeChanged :boolean, emailAddressChanged:boolean, isPrimaryChanged: boolean};
  onTouched: () => void = () => { };
  disallowChange: boolean;
  email: ContactEmail;
  constructor(private fb: FormBuilder, private router: Router) { 
   
  }

  ngOnInit(): void {    
    this. controlValueChanged = {emailAddressTypeChanged :false, emailAddressChanged:false, isPrimaryChanged:false}
    this.disallowChange = false;
    if(this.isCompany){
      this.labels = [
        {name: 'Work', code: 'Work'},
        {name: 'Other', code: 'Other'},
      ];
    }
    else {
      this.labels = [
        {name: 'Home', code: 'Home'},
        {name: 'Work', code: 'Work'},
        {name: 'Personal', code: 'Personal'},
        {name: 'School', code: 'School'},
        {name: 'Other', code: 'Other'},
      ];
    }
  }
  validate(control: AbstractControl): ValidationErrors | null {
    if (this.emailFormGroup.valid) {
      return null;
    }
    return { invalidForm: { valid: false, message: 'Email fields are invalid' } };
  }

  handleChange(event){
    this.setPrimaryEmail.emit(this.controlId);
    if (this.router.url.includes("/contactProfile?entityId")){
      if (event.checked == this.email.isPrimary) 
        this.controlValueChanged.isPrimaryChanged =false;
      if (event.checked != this.email.isPrimary)
        this.controlValueChanged.isPrimaryChanged = true; 
      this.allowEditSave();
    }
  }

  writeValue(val: any): void {
    if (this.router.url.includes("/contactProfile?entityId")){
      const email = new ContactEmail();
      email.emailAddressType = val.emailAddressType;
      email.emailAddress = val.emailAddress;
      email.isPrimary = val.isPrimary;
      this.email = email;
    }
    if (val) {
      this.emailFormGroup.setValue(val, { emitEvent: false });
    }
  }

  registerOnChange(fn: ChangeCallbackFn<object>): void {
    this.emailFormGroup.valueChanges.subscribe(fn);

  }
  registerOnTouched(fn: TouchCallbackFn): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    if (isDisabled) {
      this.emailFormGroup.disable();
    } else {
      this.emailFormGroup.enable();
    }
  }
  
  _removeControl() {
    this.removeControl.emit(this.controlId);
  }
  setValue(event){
    if (typeof event.value === 'string') {
      return;
     }
    this.emailFormGroup.get('emailAddressType').setValue(event.value.code);
    console.log('Email Seleted value:'+ event.value.code);
   }

  errorIconCss(field: string) {
    return { 'has-feedback': this.isFieldValid(field) };
  }

  errorFieldCss(field: string) {
    return { 'ng-dirty': this.isFieldValid(field) };
  }

  resetSubmitted(field){
    this.profileFormSubmitted = false;
    this.isFieldValid(field);
    this.otherFormClicked.emit(this.profileFormSubmitted);
  }

  isFieldValid(field: string) {    
    if ((!this.emailFormGroup.get(field).valid) && (this.profileFormSubmitted) && (this.emailFormGroup.get(field).hasError('required'))){
      if (field == 'emailAddressType'){
      field = 'Email Type ';
      this.addErrorMessages =  { errorType: 'dropdownrequired', controlName: field };
    }
    if (field == 'emailAddress'){
      field = 'Email';
      this.addErrorMessages =  { errorType: 'required', controlName: field };}
      return true;
    }
     if (!this.emailFormGroup.get(field).valid && this.emailFormGroup.get(field).hasError('email')){
      this.addErrorMessages =  { errorType: 'email', controlName: field };
      return true;
    }
  }
  matcher(event: ClipboardEvent, formControlName: string): boolean { 
    var allowedRegex = "^[a-zA-Z0-9+!$&'/=?^`{}|%#_.-]+@[a-zA-Z0-9.-]+(?:\.[a-zA-Z0-9-]+)*$";
    if (event.type == "paste") {
      let clipboardData = event.clipboardData;
      let pastedText = clipboardData.getData('text'); 
      if (!pastedText.match(allowedRegex))  {
        event.preventDefault();
        return false;
     }
     return true;
    }
  }

  enableSave(event, formControlName){
    if (this.router.url.includes("/contactProfile?entityId")){
    switch(formControlName){
      case 'emailAddressType' :
        if (event.value == this.email.emailAddressType) 
          this.controlValueChanged.emailAddressTypeChanged = false;
        if (event.value != this.email.emailAddressType)
          this.controlValueChanged.emailAddressTypeChanged = true;
      break;  
    case 'emailAddress' : 
      if (event.target.value == this.email.emailAddress) 
        this.controlValueChanged.emailAddressChanged = false;
      if (event.target.value != this.email.emailAddress) 
        this.controlValueChanged.emailAddressChanged = true;   
      break; 
    }
    this.allowEditSave();
  }
}

allowEditSave(){
  if ((this.controlValueChanged.emailAddressChanged) || (this.controlValueChanged.emailAddressTypeChanged) || (this.controlValueChanged.isPrimaryChanged))  
  this.disallowChange = true; 
  if ((!this.controlValueChanged.emailAddressChanged) && (!this.controlValueChanged.emailAddressTypeChanged) && (!this.controlValueChanged.isPrimaryChanged))  
  this.disallowChange = false; 
  this.emailChanged.emit(this.disallowChange);
}


}
