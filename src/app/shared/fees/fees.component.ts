import { Component, EventEmitter, forwardRef, Input, OnInit, Output } from '@angular/core';
import { AbstractControl, ControlValueAccessor, FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { NG_VALIDATORS, NG_VALUE_ACCESSOR, ValidationErrors, Validator, Validators } from '@angular/forms';
import { MembershipService } from '../../services/membership.service'

type ChangeCallbackFn<T> = (value: T) => void;
type TouchCallbackFn = () => void;

@Component({
  selector: 'app-fees',
  templateUrl: './fees.component.html',
  styleUrls: ['./fees.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FeesComponent),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => FeesComponent),
      multi: true
    }
  ]
})

export class FeesComponent implements ControlValueAccessor, Validator {
  feesFormGroup = this.formBuilder.group({
    Description: ['', [Validators.required, this.noBlankValidator]],
    FeeAmount: ['', [Validators.required]],
    BillingFrequency: ['', Validators.required],
    GlAccountId: ['', Validators.required],
    Name: [''],
    IsRequired: [true],
    FeeId: [0],
  },
  { validator: this.minFeeAmountValidator('FeeAmount') });
  addErrorMessages : any = {};

frequencies: { name: string; code: string; }[];

glAccountList: any[];

@Input() controlId: string;
@Output() removeControl = new EventEmitter<string>();
@Input() membershipDetailsFormSubmitted: boolean;
@Output() otherFormClicked = new EventEmitter<boolean>();


onTouched: () => void = () => { };

constructor(private formBuilder: FormBuilder, private membershipService: MembershipService ) {}

ngOnInit(): void {
  
  this.getMemershipGlAccountList();
  this.getMembershipBillingFrequencyList();
}

validate(control: AbstractControl): ValidationErrors | null {
    if (this.feesFormGroup.valid) {
      return null;
    }
    return { invalidForm: { valid: false, message: 'Fee fields are invalid' } };
  }

writeValue(val: any): void {
    if (val) {
      this.feesFormGroup.setValue(val, { emitEvent: false });
    }
  }

registerOnChange(fn: ChangeCallbackFn<object>): void {
    this.feesFormGroup.valueChanges.subscribe(fn);
  }
  
  registerOnTouched(fn: TouchCallbackFn): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    if (isDisabled) {
      this.feesFormGroup.disable();
    } else {
      this.feesFormGroup.enable();
    }
  }

  _removeControl() {
    this.removeControl.emit(this.controlId);
  }

  getMemershipGlAccountList(){
    this.membershipService.getMembershipGlAccountList().subscribe((data: any[]) => {
      console.log(data);
      this.glAccountList = data;
    });
  }

  getMembershipBillingFrequencyList(){
    this.membershipService.getMembershipBillingFrequencyList().subscribe((data: any[]) => {
      console.log(data);
      this.frequencies = data;
    });
  }

  errorIconCss(field: string) {
    return {'has-feedback': this.isFieldValid(field)};
  }

  errorFieldCss(field: string) {
    return {'ng-dirty': this.isFieldValid(field)};
  }

  resetSubmitted(field){
    this.membershipDetailsFormSubmitted = false;
    this.isFieldValid(field); 
    this.otherFormClicked.emit(this.membershipDetailsFormSubmitted);  
  }

  validateGLAccountId(event){
    if (event.value == 'All')
    this.feesFormGroup.get("GlAccountId").setErrors({required:true});
  }

  isFieldValid(field: string) {    
    if ((!this.feesFormGroup.get(field).valid) && (this.membershipDetailsFormSubmitted) && (this.feesFormGroup.get(field).hasError('required'))){
      if (field=='Description'){
          field = 'Name'
          this.addErrorMessages =  { errorType: 'required', controlName: field };}
      if (field=='FeeAmount'){
          field = 'Fee'
          this.addErrorMessages =  { errorType: 'required', controlName: field };}
      if (field=='BillingFrequency'){
          field = 'Billing Frequency'
          this.addErrorMessages =  { errorType: 'dropdownrequired', controlName: field };}
      if (field=='GlAccountId'){
          field = 'GL Account'
          this.addErrorMessages =  { errorType: 'dropdownrequired', controlName: field };}
      return true;
    }

    if (this.feesFormGroup.get(field).hasError('minFeeRequired')){
      this.addErrorMessages =  { errorType: 'minFeeRequired', controlName: 'Fee Amount' };
      return true;
    }

  }

  matcher(event: ClipboardEvent, formControlName: string): boolean {
    var allowedRegex = "";
    if (formControlName == 'Name') 
        allowedRegex = ("^[A-Za-z ']{0,30}$");
    if (event.type == "paste") {
      let clipboardData = event.clipboardData;
      let pastedText = clipboardData.getData('text') + this.feesFormGroup.get(formControlName).value; ; 
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

  FeeNameValidation(event)
  {
    if ((event.target.value.trim().length < 3) || (event.target.value.trim().length > 45))
    {
      this.feesFormGroup.get('Description').reset();
    }
    this.feesFormGroup.get('Description').setValue(event.target.value.trim());
  }

  minFeeAmountValidator(controlName: string)
  {
    return (formGroup: FormGroup) =>
    {
      const control = formGroup.controls[controlName];
      if (control.errors)
      {
        // return if another validator has already found an error on the matchingControl
        return;
      }
      else
      {
        control.setErrors(null);
      }
    }
  }
}
