import { Component, OnInit,  forwardRef, Input, EventEmitter, Output } from '@angular/core';
import { AbstractControl, ControlValueAccessor, FormBuilder, FormGroup, NG_VALIDATORS, NG_VALUE_ACCESSOR, ValidationErrors, Validator, Validators, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { ReportService } from '../../services/report.service';
import { MembershipService } from '../../services/membership.service';
import * as moment from 'moment';
import { HttpParams } from '@angular/common/http';
type ChangeCallbackFn<T> = (value: T) => void;
type TouchCallbackFn = () => void;
@Component({
  selector: 'app-report-filter',
  templateUrl: './report-filter.component.html',
  styleUrls: ['./report-filter.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ReportFilterComponent),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => ReportFilterComponent),
      multi: true
    }
  ]
})
export class ReportFilterComponent implements OnInit {
  filterFormGroup: FormGroup = this.fb.group({
    reportFilterId:[0],
    parameterId: [0, Validators.required],
    operator: ['', Validators.required],
    value: ['', Validators.required]
  });
  controlId:any;
  conditions: any[];
  @Input() filterId: string;
  @Output() removeControl = new EventEmitter<string>();
  parameters: any[];
  onTouched: () => void = () => { };
  disallowChange: boolean;
  showText: boolean;
  showDate: boolean;
  constructor(private fb: FormBuilder,
    private reportService: ReportService,
    private membershipService: MembershipService
   ) {
        this.conditions = [
          {name: 'Equals', code: 'EQ'},
          {name: 'Not Equal', code: 'NEQ'},
          {name: 'Greater Than', code: 'GT'},
          {name: 'Less Than', code: 'LT'},
      ];
      this.showText=false;
      this.showDate=true;
    }

  ngOnInit(): void {
    this.getParameterList();
   
  }

  setParameter(event){    
    console.log('Parameter:'+JSON.stringify(event));
    var item = this.parameters.find(item => item.reportParameterId === event.value);
    console.log('Selected Parameter:'+JSON.stringify(item));
    if(item.type==='Date'){
      this.showText=false;
      this.showDate=true;
      this.filterFormGroup.get('value').setValue(new Date());      
    }
    else {
      this.showText=true;
      this.showDate=false;
      this.filterFormGroup.get('value').setValue('0.00');
    }
  }

  getParameterList(){
    let searchParams = new HttpParams();
    searchParams = searchParams.append("categoryId", "1");
    const opts = { params: searchParams };
    this.reportService.getReportParametersByCategoryId(opts).subscribe((data: any[]) => {
      console.log(data);
      this.parameters = data;
      let parameterId =this.filterFormGroup.get('parameterId').value;
      let value = this.filterFormGroup.get('value').value;
      var item = this.parameters.find(item => item.reportParameterId === parameterId);
      if(item){
        if(item.type==='Date'){
          this.showText=false;
          this.showDate=true;          
          // this.filterFormGroup.get('value').setValue(moment(new Date(value)).utc(true).format());
        }
        else {
          this.showText=true;
          this.showDate=false;
          this.filterFormGroup.get('value').setValue(value);
        }
      }
    });
  }

  registerOnChange(fn: ChangeCallbackFn<object>): void {
    this.filterFormGroup.valueChanges.subscribe(fn);

  }
  registerOnTouched(fn: TouchCallbackFn): void {
    this.onTouched = fn;
  }
  _removeControl() {
    this.removeControl.emit(this.controlId);
  }
  validate(control: AbstractControl): ValidationErrors | null {
    if (this.filterFormGroup.valid) {
      return null;
    }
    return { invalidForm: { valid: false, message: 'Column Name is invalid' } };
  }

  writeValue(val: any): void {
    if (val) {
      this.filterFormGroup.setValue(val, { emitEvent: false });
    }
  }
}
