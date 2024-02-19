import { Component, OnInit,  forwardRef, Input, EventEmitter, Output } from '@angular/core';
import { AbstractControl, ControlValueAccessor, FormBuilder, FormGroup, NG_VALIDATORS, NG_VALUE_ACCESSOR, ValidationErrors, Validator, Validators, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { ReportService } from '../../services/report.service';
import { MembershipService } from '../../services/membership.service';
import { HttpParams } from '@angular/common/http';

@Component({
  selector: 'app-standard-report',
  templateUrl: './standard-report.component.html',
  styleUrls: ['./standard-report.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => StandardReportComponent),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => StandardReportComponent),
      multi: true
    }
  ]
})
export class StandardReportComponent implements OnInit {
  @Input() userId: number;
  @Input() reportType: string;
  reports: any[];
  constructor() { }

  ngOnInit(): void {
  }

}
