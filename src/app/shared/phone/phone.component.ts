import { Component, OnInit,  forwardRef, Input, EventEmitter, Output } from '@angular/core';
import { AbstractControl, ControlValueAccessor, FormBuilder, FormGroup, NG_VALIDATORS, NG_VALUE_ACCESSOR, ValidationErrors, Validator, Validators, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { ContactPhone } from 'src/app/models/contact-phone';
type ChangeCallbackFn<T> = (value: T) => void;
type TouchCallbackFn = () => void;

@Component({
  selector: 'app-phone',
  templateUrl: './phone.component.html',
  styleUrls: ['./phone.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => PhoneComponent),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => PhoneComponent),
      multi: true
    }
  ]
})
export class PhoneComponent implements ControlValueAccessor, Validator {
  phoneFormGroup: FormGroup = this.fb.group({
    phoneId:[0],
    phoneType: ['', Validators.required],
    phoneNumber: ['', Validators.required],
    isPrimary: [true]
  });
  labels: any[];
  addErrorMessages : any = {};
  @Input() controlId: string;
  @Input() isCompany: boolean;
  @Output() removeControl = new EventEmitter<string>();
  @Input() profileFormSubmitted: boolean;
  @Output() otherFormClicked = new EventEmitter<boolean>();
  @Output() setPrimaryPhone = new EventEmitter<string>();
  @Output() phoneChanged = new EventEmitter<boolean>();
  controlValueChanged:{phoneTypeChanged :boolean, phoneNumberChanged:boolean, isPrimaryChanged: boolean};
  onTouched: () => void = () => { };
  disallowChange: boolean;
  phone: ContactPhone;
  constructor(private fb: FormBuilder, private router: Router) { 
    this.labels = [
      {name: 'Cell', code: 'Cell'},
      {name: 'Home', code: 'Home'},
      {name: 'Work', code: 'Work'},
      {name: 'Other', code: 'Other'}
    ];

  }
  ngOnInit(): void {
    this. controlValueChanged = {phoneTypeChanged :false, phoneNumberChanged:false, isPrimaryChanged:false}
    this.disallowChange = false;

    if(this.isCompany){
      this.labels = [
        {name: 'Work', code: 'Work'},
        {name: 'Other', code: 'Other'},
      ];
    }
    else {
      this.labels = [
        {name: 'Cell', code: 'Cell'},
        {name: 'Home', code: 'Home'},
        {name: 'Work', code: 'Work'},
        {name: 'Other', code: 'Other'}
      ];
    }
  }

  handleChange(event){
       this.setPrimaryPhone.emit(this.controlId);
       if (this.router.url.includes("/contactProfile?entityId")){
       if (event.checked == this.phone.isPrimary) 
          this.controlValueChanged.isPrimaryChanged =false;
       if (event.checked != this.phone.isPrimary)
          this.controlValueChanged.isPrimaryChanged = true; 
          this.allowEditSave();}
  }
  
  validate(control: AbstractControl): ValidationErrors | null {
    if (this.phoneFormGroup.valid) {
      return null;
    }
    return { invalidForm: { valid: false, message: 'Phone nuber is invalid' } };
  }

  writeValue(val: any): void {
    if (this.router.url.includes("/contactProfile?entityId")){
      const Phone = new ContactPhone();
      Phone.phoneType = val.phoneType;
      Phone.phoneNumber = val.phoneNumber;
      Phone.isPrimary = val.isPrimary;
      this.phone = Phone;
      }
    if (val) {
      this.phoneFormGroup.setValue(val, { emitEvent: false });
    }
  }

  registerOnChange(fn: ChangeCallbackFn<object>): void {
    this.phoneFormGroup.valueChanges.subscribe(fn);

  }
  registerOnTouched(fn: TouchCallbackFn): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    if (isDisabled) {
      this.phoneFormGroup.disable();
    } else {
      this.phoneFormGroup.enable();
    }
  }

  _removeControl() {
    this.removeControl.emit(this.controlId);
  }

  errorIconCss(field: string) {
    return {      
      'has-feedback': this.isFieldValid(field)
    };
  }

  errorFieldCss(field: string) {
    return {           
      'ng-dirty': this.isFieldValid(field)
    };
  }

  resetSubmitted(field){
    this.profileFormSubmitted = false;
    this.isFieldValid(field);
    this.otherFormClicked.emit(this.profileFormSubmitted);
  }

  isFieldValid(field: string) {    
    if ((!this.phoneFormGroup.get(field).valid) && (this.profileFormSubmitted) && (this.phoneFormGroup.get(field).hasError('required'))){
      if (field == 'phoneType'){
        field = 'Phone Type';
        this.addErrorMessages =  { errorType: 'dropdownrequired', controlName: field };
      }
      if (field == 'phoneNumber'){
        field = 'Phone Number';
      this.addErrorMessages =  { errorType: 'required', controlName: field };}
      return true;
    }
  }

  enableSave(event, formControlName){
    console.log("Phone:"+JSON.stringify(this.phone));
    if (this.router.url.includes("/contactProfile?entityId")){
    switch(formControlName){
      case 'phoneType' :
        if (event.value == this.phone.phoneType) 
          this.controlValueChanged.phoneTypeChanged = false;
        if (event.value != this.phone.phoneType)
          this.controlValueChanged.phoneTypeChanged = true;              
      break;  
    case 'phoneNumber' :   
      let tempphoneNumber = event.target.value.replace(/[_()x-]/g, '');
      tempphoneNumber = tempphoneNumber.split(/\s/).join('');
      let previousphoneNumber = this.phone.phoneNumber.replace(/[_()x-]/g, '');
      previousphoneNumber = previousphoneNumber.split(/\s/).join('');
      if (((tempphoneNumber.length == 15) && (tempphoneNumber == previousphoneNumber)) || (tempphoneNumber.length < 15))
        this.controlValueChanged.phoneNumberChanged = false;
      if ((tempphoneNumber.length == 15) && (tempphoneNumber != previousphoneNumber))
        this.controlValueChanged.phoneNumberChanged = true;    
      break; 
    }
    this.allowEditSave();
  }
}

allowEditSave(){
  if ((this.controlValueChanged.phoneNumberChanged) || (this.controlValueChanged.phoneTypeChanged) || (this.controlValueChanged.isPrimaryChanged))  
  this.disallowChange = true; 
  if ((!this.controlValueChanged.phoneNumberChanged) && (!this.controlValueChanged.phoneTypeChanged) && (!this.controlValueChanged.isPrimaryChanged))  
  this.disallowChange = false; 
  this.phoneChanged.emit(this.disallowChange);
}

}
