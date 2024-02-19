import { Component, OnInit,  forwardRef, Input, EventEmitter, Output } from '@angular/core';
import { AbstractControl, ControlValueAccessor, FormBuilder, FormGroup, NG_VALIDATORS, NG_VALUE_ACCESSOR, ValidationErrors, Validator, Validators, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
type ChangeCallbackFn<T> = (value: T) => void;
type TouchCallbackFn = () => void;

@Component({
  selector: 'app-report-column',
  templateUrl: './report-column.component.html',
  styleUrls: ['./report-column.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ReportColumnComponent),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => ReportColumnComponent),
      multi: true
    }
  ]
})

export class ReportColumnComponent implements OnInit {
  @Input() controlId: string;
checked:boolean;
label:any;
columnFormGroup: FormGroup = this.fb.group({
  columnId:[0],
  columnName: ['']
});
onTouched: () => void = () => { };
  disallowChange: boolean;
  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {
   

  }
  registerOnChange(fn: ChangeCallbackFn<object>): void {
    this.columnFormGroup.valueChanges.subscribe(fn);

  }
  registerOnTouched(fn: TouchCallbackFn): void {
    this.onTouched = fn;
  }
  validate(control: AbstractControl): ValidationErrors | null {
    if (this.columnFormGroup.valid) {
      return null;
    }
    return { invalidForm: { valid: false, message: 'Column Name is invalid' } };
  }

  writeValue(val: any): void {
    if (val) {
      this.columnFormGroup.setValue(val, { emitEvent: false });
    }
  }
}
