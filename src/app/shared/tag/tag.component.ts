import { Component, OnInit, forwardRef, Input, EventEmitter, Output } from '@angular/core';
import { AbstractControl, ControlValueAccessor, FormBuilder, FormGroup, NG_VALIDATORS, NG_VALUE_ACCESSOR, ValidationErrors, Validator, Validators, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { DocumentTag } from 'src/app/models/document-tag';
import { TagService } from '../../services/tag.service';
type ChangeCallbackFn<T> = (value: T) => void;
type TouchCallbackFn = () => void;

@Component({
  selector: 'app-tag',
  templateUrl: './tag.component.html',
  styleUrls: ['./tag.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TagComponent),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => TagComponent),
      multi: true
    }
  ]
})
export class TagComponent implements ControlValueAccessor, Validator {
  tagFormGroup: FormGroup = this.fb.group({
    tagId: [0],
    tagName: ['', Validators.required],
    tagValue: ['', Validators.required]
  });
  labels: any[];
  addErrorMessages: any = {};
  Tags: any[];
  @Input() controlId: string;
  @Output() removeControl = new EventEmitter<string>();
  @Input() documentTagFormSubmitted: boolean;
  @Output() tagChanged = new EventEmitter<boolean>();
  controlValueChanged: { tagChanged: boolean, tagValueChanged: boolean};
  onTouched: () => void = () => { };
  disallowChange: boolean;
  tag: DocumentTag;
  constructor(private fb: FormBuilder, private router: Router,private tagService: TagService) {

  }
  ngOnInit(): void {
    this.controlValueChanged = { tagChanged: false, tagValueChanged: false}
    this.disallowChange = false;
    this.getTagSelectList();
  }

  handleChange(event) {
  
  }

  validate(control: AbstractControl): ValidationErrors | null {
    if (this.tagFormGroup.valid) {
      return null;
    }
    return { invalidForm: { valid: false, message: 'Tag is invalid' } };
  }

  writeValue(val: any): void {
    if (val) {
      this.tagFormGroup.setValue(val, { emitEvent: false });
    }
  }

  registerOnChange(fn: ChangeCallbackFn<object>): void {
    this.tagFormGroup.valueChanges.subscribe(fn);

  }
  registerOnTouched(fn: TouchCallbackFn): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    if (isDisabled) {
      this.tagFormGroup.disable();
    } else {
      this.tagFormGroup.enable();
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

  resetSubmitted(field) {
    this.isFieldValid(field);
  }

  isFieldValid(field: string) {
    if ((!this.tagFormGroup.get(field).valid)  && (this.documentTagFormSubmitted) && (this.tagFormGroup.get(field).hasError('required'))) {
      if (field == 'tagName') {
        field = 'Tag Name';
        this.addErrorMessages = { errorType: 'dropdownrequired', controlName: field };
      }
      if (field == 'tagValue') {
        field = 'Tag Value';
        this.addErrorMessages = { errorType: 'required', controlName: field };
      }
      return true;
    }
  }

  enableSave(event, formControlName) {
    console.log("Tag:" + JSON.stringify(this.tag));
   
      switch (formControlName) {
        case 'tagName':
          if (event.value == this.tag.tagName)
            this.controlValueChanged.tagChanged = false;
          if (event.value != this.tag.tagName)
            this.controlValueChanged.tagChanged = true;
          break;
        case 'tagValue':
          if (event.value == this.tag.tagValue)
          this.controlValueChanged.tagValueChanged = false;
        if (event.value != this.tag.tagValue)
          this.controlValueChanged.tagValueChanged = true;
          break;
    }
  }

  allowEditSave() {
    if ((this.controlValueChanged.tagChanged) || (this.controlValueChanged.tagValueChanged))
      this.disallowChange = true;
    if ((!this.controlValueChanged.tagChanged) && (!this.controlValueChanged.tagValueChanged))
      this.disallowChange = false;
    this.tagChanged.emit(this.disallowChange);
  }
  getTagSelectList(){
    this.tagService.getTagSelectList().subscribe((data: any) => {
      console.log(data);
      this.Tags=data;
    });
  }
}
