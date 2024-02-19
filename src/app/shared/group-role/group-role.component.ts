import { Component, EventEmitter, forwardRef, Input, OnInit, Output } from '@angular/core';
import { AbstractControl, ControlValueAccessor, FormBuilder, NG_VALIDATORS, NG_VALUE_ACCESSOR, ValidationErrors, Validator, Validators } from '@angular/forms';
import { GroupService } from 'src/app/services/group.service';

type ChangeCallbackFn<T> = (value: T) => void;
type TouchCallbackFn = () => void;

@Component({
  selector: 'app-group-role',
  templateUrl: './group-role.component.html',
  styleUrls: ['./group-role.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => GroupRoleComponent),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => GroupRoleComponent),
      multi: true
    }
  ]
})
export class GroupRoleComponent implements ControlValueAccessor, Validator {
  @Input() controlId: string;
  @Input() groupId: number;
  @Output() removeControl = new EventEmitter<string>();
  @Input() roleFormSubmitted: boolean;
  @Output() otherFormClicked = new EventEmitter<number>();
  @Input() roleList: any[]=[];

  roleFormGroup = this.formBuilder.group({
    GroupMemberRoleId: [0],
    GroupRoleId: [0,[Validators.min(1)]],
    Term: [false],
    StartDate: [''],
    EndDate: [''],
    IsActive: [true]
  });

  addErrorMessages : any = {};
  groupRoleItem: any = {};
  selectedGroup: any;
  selectedGroupMember: any;
  enableTerm: boolean = false;
  newItem: boolean;
  addNewMemberRecord: boolean;
  minDate = new Date();
  minEndDate = new Date();
  startDate = new Date();
  endDate= new Date();

  onTouched: () => void = () => { };

  constructor(private formBuilder: FormBuilder,
    private groupService: GroupService) { }

    validate(control: AbstractControl): ValidationErrors | null {
      if (this.roleFormGroup.valid) {
        return null;
      }
      return { invalidForm: { valid: false, message: 'Position fields are invalid' } };
    }

   writeValue(val: any): void {
    this.groupRoleItem.GroupMemberRoleId = val.GroupMemberRoleId;
    this.newItem = val.GroupMemberRoleId == 0 ? true : false;
    if(val.GroupRoleId > 0){
      let isValidRole = this.validateInactiveRole(val.GroupRoleId);
      if(!isValidRole){
        val.GroupRoleId = 0;
        this.groupRoleItem.GroupRoleId = 0;
      }
      else{
        this.groupRoleItem.GroupRoleId = val.GroupRoleId;
      }
    }
    else{
      this.groupRoleItem.GroupRoleId = val.GroupRoleId;
    }
    this.groupRoleItem.Term = val.Term;
    this.groupRoleItem.StartDate = val.StartDate;
    this.groupRoleItem.EndDate = val.EndDate;
    this.groupRoleItem.IsActive = val.IsActive;

    this.enableTerm = val.Term; 
    this.roleFormGroup.setValue(this.groupRoleItem, { emitEvent: false });     
  }

  registerOnChange(fn: ChangeCallbackFn<object>): void {
    this.roleFormGroup.valueChanges.subscribe(fn);
  }
  
  registerOnTouched(fn: TouchCallbackFn): void {
    this.onTouched = fn;
  }

  ngOnInit(): void {
  }

  toggleTerm(event){
    this.enableTerm = event.checked;
  }

  _removeControl() {
    this.removeControl.emit(this.controlId);
  }

  getMemberRoleCode(){     
    // let memberCode = this.roleList.filter(x => x.groupRoleName == 'Member')[0].groupRoleId;
    // this.groupMemberForm.get('Role').setValue(memberCode);
  }

  errorIconCss(field: string) {
    return {'has-feedback': this.isFieldValid(field)};
  }
  errorFieldCss(field: string) {
    return {'ng-dirty': this.isFieldValid(field)};
  }

  isFieldValid(field: string) {    
    if ((!this.roleFormGroup.get(field).valid) && (this.roleFormSubmitted) && (this.roleFormGroup.get(field).hasError('min'))){
      
      if (field=='GroupRoleId'){
          field = 'Position'
          this.addErrorMessages =  { errorType: 'dropdownrequired', controlName: field };
      }
      return true;
    }

  }

  roleChanged(){
    let roleId = this.roleFormGroup.get("GroupRoleId").value;
    this.otherFormClicked.emit(roleId);  
  }

  validateInactiveRole(roleId: any){
    let role = this.roleList.find(x => x.groupRoleId === roleId);
    if(role){
      return true;
    }
    else{
      return false;
    }
    console.log(role);
  }

  setMinEndDate(event:any){
    this.minEndDate = event;
    let date = new Date(event);
    let year = date.getFullYear();
    let days = 365;
    if((year % 4 == 0 && year % 100 != 0) || (year % 400 == 0)){
      days = 365;
    }
    else{
      days = 364;
    }
    date.setDate(date.getDate() + days);
    this.roleFormGroup.get('EndDate').setValue(date);
  }

}
