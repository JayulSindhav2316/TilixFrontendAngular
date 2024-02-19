import { Component, OnInit,  forwardRef, Input, EventEmitter, Output } from '@angular/core';
import { AbstractControl, ControlValueAccessor, FormBuilder, FormGroup, NG_VALIDATORS, NG_VALUE_ACCESSOR, ValidationErrors, Validator, Validators, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { ReportService } from '../../services/report.service';
import { MembershipService } from '../../services/membership.service';
import { HttpParams } from '@angular/common/http';
type ChangeCallbackFn<T> = (value: T) => void;
type TouchCallbackFn = () => void;
@Component({
  selector: 'app-report-sort',
  templateUrl: './report-sort.component.html',
  styleUrls: ['./report-sort.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ReportSortComponent),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => ReportSortComponent),
      multi: true
    }
  ]
})
export class ReportSortComponent implements OnInit {
  sortFormGroup: FormGroup = this.fb.group({
    reportSortOrderId:[0],
    fieldName: [0],
    order: ['']
  });
  @Input() reportSortId: string;
  @Input() columns: any[];
  @Output() removeControl = new EventEmitter<string>();
  sortOrders: any[];
  controlId:any;
  onTouched: () => void = () => { };
  constructor(private fb: FormBuilder,
    private reportService: ReportService,
    private membershipService: MembershipService) {
      this.sortOrders = [
        {name: 'Ascending', code: 'ASC'},
        {name: 'Descending', code: 'DESC'}
    ];
     }

  ngOnInit(): void {
    console.log('Columns:' + this.columns);
  }
  
  registerOnChange(fn: ChangeCallbackFn<object>): void {
    this.sortFormGroup.valueChanges.subscribe(fn);

  }
  registerOnTouched(fn: TouchCallbackFn): void {
    this.onTouched = fn;
  }
  validate(control: AbstractControl): ValidationErrors | null {
    if (this.sortFormGroup.valid) {
      return null;
    }
    return { invalidForm: { valid: false, message: 'Column Name is invalid' } };
  }

  writeValue(val: any): void {
    if (val) {
      this.sortFormGroup.setValue(val, { emitEvent: false });
    }
  }

  setSortOrder(event){
    console.log('Event:' + event);

  }

  _removeControl(){
    console.log('Remove control:');
    this.removeControl.emit(this.controlId);
  }
}
