import { Component, OnInit, ChangeDetectorRef, AfterViewInit } from '@angular/core';
import { FormBuilder, Validators, FormControl,FormArray,FormGroup } from '@angular/forms';
import { faLeaf, faSlash } from '@fortawesome/free-solid-svg-icons';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { AppBreadcrumbService } from 'src/app/app.breadcrumb.service';
import { CustomFieldService } from 'src/app/services/custom-field.service';

@Component({
  selector: 'app-custom-fields',
  templateUrl: './custom-fields.component.html',
  styleUrls: ['./custom-fields.component.scss']
})
export class CustomFieldsComponent implements OnInit {
  hobbiesArray = new FormArray([new FormControl("", Validators.required)]);

  fieldStatus:boolean=true;
  fieldEditable:boolean=true;
  isLabelValid:boolean=false;
  header:string="Add New Field";

  isEdit:boolean=false;

  currentField:any;
  fields:any[];
  items: MenuItem[];

  addForm: any;
  rows: FormArray;
  itemForm: FormGroup;


  customFieldForm = this.formBuilder.group({
    FieldType: ['', [Validators.required]],
    Label: ['', [Validators.required]],
    Validation: [''],
    CharLimit: ['', [Validators.required]],
    CostCenter: ['', Validators.required],
    Status: [true]
  });

  textForm = this.formBuilder.group({
    Validation: ['', Validators.required],
    CharLimit: ['', [Validators.required]],
    Placeholder: ['', Validators.required],
    // RequiredField: [true]
  });

  fieldLabel:string;
  fieldPlaceholder:string;
  addErrorMessages : any = {};
isSubmitted:boolean=false;

  selectedFieldType: any;
  selectedValidation:string;

  customFieldDialog: boolean = false;
  showTxtForm: boolean = false;
  showLabel: boolean = false;
  showPlaceholder: boolean = false;
  showRequired: boolean = false;
  showCountryCode: boolean = false;
  showMultipleSelection: boolean = false;

  showDateForm: boolean = false;
  showTimeForm: boolean = false;
  showDropdownForm: boolean = false;




  selectedDateFormat: any;
  selectedDefaultDate: any;
  selectedTimeFormat: any;
  selectedDefaultTime: any;



  fieldRequired: boolean = false;
  countryCode: boolean = false;
  multipleSelection:boolean=false;

  cities: any[];
  validations: any[];
  dateFormat: any[] = [
    { name: 'MM/DD/YY', value: 'MM/DD/YY' },
    { name: 'DD/MM/YY', value: 'DD/MM/YY' },
    { name: 'YY/MM/DD', value: 'YY/MM/DD' }
  ];
  defaultDate: any[] = [
    { name: 'None', value: 'None' },
    { name: 'Current', value: 'Current' },
    { name: 'Custom', value: 'Custom' }
  ];
  timeFormat: any[] = [
    { name: '24 Hour', value: '24 Hour' },
    { name: 'AM/PM', value: 'AM/PM' },
  ];
  defaultTime: any[] = [
    { name: 'None', value: 'None' },
    { name: 'Current', value: 'Current' },
    { name: 'Custom', value: 'Custom' }
  ];
  fieldTypes:any[];
  constructor(private formBuilder: FormBuilder,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private breadcrumbService: AppBreadcrumbService, private customFieldService:CustomFieldService) { 
      this.addForm = this.formBuilder.group({
        items: [null, Validators.required],
        items_value: ['no', Validators.required]
      });
  
      this.rows = this.formBuilder.array([]);


      this.breadcrumbService.setItems([
        {label: 'Home', routerLink: ['/']},
        {label: 'Set Up'},
        {label: 'Custom Fields'},
    ]);
    }

  ngOnInit(): void {
    this.items = [{
      label: 'Options',
      items: [{
          label: 'Edit',
          icon: 'pi pi-pencil',
          command: () => {
              this.update();
          }
      },
      {
          label: 'Delete',
          icon: 'pi pi-trash',
          command: () => {
             this.deleteCustomField();
          }
      }
    ]}
    ];

      this.customFieldService.getFieldTypes().subscribe((data: any[]) => {
        this.fieldTypes = data;
        this.getAllCustomFields();
      });
    
    this.addForm.addControl('rows', this.rows);
  
    this.cities = [
      { name: 'Text', code: 'Text' },
      { name: 'Email Address', code: 'Email' },
      { name: 'Phone Number', code: 'Phone' },
      { name: 'Date', code: 'Date' },
      { name: 'Time', code: 'Time' },
      { name: 'Number', code: 'Number' },
      { name: 'Short Text', code: 'ShortTxt' },
      { name: 'Long Text', code: 'LongTxt' },
      { name: 'Dropdown', code: 'Dropdown' },
      { name: 'Single Choice Field', code: 'SingleCh' },
      { name: 'Multiple Choice Field', code: 'MultipleCh' }
    ];
    this.validations = [
      { name: 'Alphabetic', code: 'Alphabetic' },
      { name: 'Alphanumeric', code: 'Alphanumeric' },
      { name: 'Currency', code: 'Currency' },
      { name: 'Email', code: 'Email' },
      { name: 'Numeric', code: 'Numeric' },
      { name: 'URL', code: 'URL' },
    ];

  }
  openNew() {
    if(this.isEdit==false)
    {
      this.header="Add New Field";
      this.fieldStatus=true;
      this.fieldEditable=true;
      this.multipleSelection=false;
    this.isLabelValid=true;
    this.selectedFieldType="";
    this.selectedValidation="";

    this.showLabel = false;
    this.showTxtForm = false;
    this.showCountryCode=false;
    this.showDateForm=false;
    this.showTimeForm=false;
    this.showPlaceholder=false;
    this.showRequired=false;
    this.showDropdownForm=false;
    this.customFieldDialog = true;
  }
  else
  {
    this.customFieldDialog = true;
  }
    // this.addNewRecord = true;
    //this.headerName = "Add New GL Account";
  }
  update() {
    this.isEdit=true
    this.header="Edit Field";
    this.editField();
   // this.isAddNewRecord = false;
  }
  editField()
  {
    var data=this.currentField;
    var setField=this.fieldTypes.find(x=>x.code==data.fieldType.fieldTypeId);
    // var setVal=this.validations.find(x=>x.code==data.validations)
    // this.selectedValidation=setVal;
    this.fieldStatus=data.status==1?true:false;
    this.fieldEditable=data.editable==1?true:false;
    this.multipleSelection=data.multipleSelection==1?true:false;
    this.selectedFieldType=setField;//data.fieldType.fieldTypeId;
    this.fieldLabel=data.label;
    this.fieldPlaceholder=data.placeholder;
    this.fieldRequired=data.required==1?true:false;
    this.textForm.get('CharLimit').setValue(data.characterLimit);
    this.countryCode=data.countryCode==1?true:false;

    this.selectedDateFormat=data.dateFormat;
    this.selectedDefaultDate=data.defaultDate;

    this.selectedTimeFormat=data.timeFormat;
    this.selectedDefaultTime=data.defaultTime;

    this.openNew();
    this.fieldTypeChanged(setField.name,"");
  }
  hideDialog() {
    this.customFieldDialog = false;
    this.fieldLabel="";
    this.fieldPlaceholder="";
    
    this.customFieldForm.reset();
    this.isEdit=false;
  }
  fieldTypeChanged(event: any, data:any) {
    
    if(data=="changed")
    {
      if(this.isEdit==true)
    {
      if(this.currentField.customfielddata.length>0)
      {
       var oldVal= this.currentField;
       var setField=this.fieldTypes.find(x=>x.code==oldVal.fieldType.fieldTypeId);
        setTimeout(() => {
          this.selectedFieldType=setField;
        }, 500);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Field is in use.', life: 3000 });
        return;
      }
    }


    this.isEdit=false;
    this.rows.clear();
  }
    this.isLabelValid=false;
    if(this.isEdit==false)
    {
    this.clearForms();
  }
    this.showLabel = true;
    this.showRequired = true;
    if(this.isEdit==true)
    {
      var val = event;
    }
    else
    {
      var val = event.value.name;
    }
    // var val = event.value.name;x 
    switch (val) {
      case "Text":
        this.showTxtForm = true;
        this.showPlaceholder = true;
        this.showDateForm = false;
        this.showTimeForm = false;
        this.showDropdownForm = false;
        this.showCountryCode=false;
        break;
      case "Email Address":
        this.showPlaceholder = true;
        this.showTxtForm = false;
        this.showDateForm = false; 
        this.showTimeForm = false;
        this.showDropdownForm = false;
        this.showCountryCode=false;
        break;
      case "Phone Number":
        this.showPlaceholder = true;
        this.showCountryCode = true;
        this.showTxtForm = false;
        this.showDateForm = false;
        this.showTimeForm = false;
        this.showDropdownForm = false;
        break;
      case "Date":
        this.showDateForm = true;
        this.showTxtForm = false;
        this.showPlaceholder = false;
        this.showCountryCode = false;
        this.showTimeForm = false;
        this.showDropdownForm = false;
        if(!this.isEdit)
        {
        this.selectedDateFormat="MM/DD/YYYY";
        this.selectedDefaultDate="None"
      }
        break;
      case "Time":
        this.showTimeForm = true;
        this.showDateForm = false;
        this.showTxtForm = false;
        this.showPlaceholder = false;
        this.showCountryCode = false;
        this.showDropdownForm = false;
        if(!this.isEdit)
        {
        this.selectedTimeFormat="24 Hour";
        this.selectedDefaultTime="None"
      }
        break;
      case "Number":
        this.showPlaceholder = true;
        this.showTxtForm = false;
        this.showDateForm = false;
        this.showTimeForm = false;
        this.showDropdownForm = false;
        this.showCountryCode=false;
        break;
      case "Short Text":
        this.showTxtForm = true;
        this.showPlaceholder = true;
        this.showDateForm = false;
        this.showTimeForm = false;
        this.showDropdownForm = false;
        this.showCountryCode=false;
        break;

      case "Long Text":
        this.showTxtForm = true;
        this.showPlaceholder = true;
        this.showDateForm = false;
        this.showTimeForm = false;
        this.showDropdownForm = false;
        this.showCountryCode=false;
        break;
      case "Dropdown":
        this.showDropdownForm = true;
        this.showMultipleSelection = true;
        this.showTxtForm = false;
        this.showPlaceholder = false;
        this.showDateForm = false;
        this.showTimeForm = false;
        this.showCountryCode=false;
        this.rows.push(this.createItemFormGroup());
        if(this.isEdit)
        this.setOptionValues()

        break;
      case "Single Choice Field":
        this.showDropdownForm = true;
        this.showMultipleSelection = false;
        this.showTxtForm = false;
        this.showPlaceholder = false;
        this.showDateForm = false;
        this.showTimeForm = false;
        this.showCountryCode=false;
        this.rows.push(this.createItemFormGroup());
        if(this.isEdit)
        this.setOptionValues()
        break;
      case "Multiple Choice Field":
        this.showDropdownForm = true;
        this.showMultipleSelection = false;
        this.showTxtForm = false;
        this.showPlaceholder = false;
        this.showDateForm = false;
        this.showTimeForm = false;
        this.showCountryCode=false;
        this.rows.push(this.createItemFormGroup());
        if(this.isEdit)
        this.setOptionValues()
        break;
    }

  }
  setOptionValues()
  {
    this.rows.clear();
    var data:[]=this.currentField.customfieldoptions;
    data.forEach(op => {
      this.rows.push(this.createItemFormGroup2(op));
    });
    
  }
  clearForms()
  {
    this.selectedDateFormat="";
    this.selectedDefaultDate="";

    this.selectedTimeFormat="";
    this.selectedDefaultTime="";

    this.fieldRequired=false;

    this.countryCode=false;

    this.textForm.reset();
    this.rows.clear();
    this.fieldLabel="";
    this.fieldPlaceholder="";


  }
  saveCustomField()
  {
    if(this.selectedFieldType=="" || this.selectedFieldType==undefined)
    {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Please select field type.', life: 3000 });
      return;
    }
     this.isSubmitted=true;
     this.isFieldValid("label");
     if(this.selectedFieldType.name=="Dropdown" || this.selectedFieldType.name=="Single Choice Field" || this.selectedFieldType.name=="Multiple Choice Field")
     {
     var options:any[]=this.addForm.value.rows.map(x=>x.name.trim());
     if(options.length<=0 || options[0]=="" || options.includes(""))
     {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Please add options for the field.', life: 3000 });
      return;
     }
     var res=this.toFindDuplicates(options);
     if(res==true)
     {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Options can not be same.', life: 3000 });
      return;
     }

    }
    var textBody= {
      Status:this.fieldStatus==true?1:0,
      Editable:this.fieldEditable==true?1:0,
      Options:options,
      CustomFieldId:0,
      FieldTypeId:this.selectedFieldType.code,
      OrganizationId:1,
      moduleId:1,
      Label:this.fieldLabel,
      Validations:this.selectedValidation==""?null:this.selectedValidation,
      CharacterLimit:this.textForm.get("CharLimit").value,
      Placeholder:this.fieldPlaceholder,
      Required:this.fieldRequired==true?1:0,

      CountryCode:this.countryCode==true?1:0,
      DateFormat:this.selectedDateFormat,
      defaultDate:this.selectedDefaultDate,
      
      TimeFormat:this.selectedTimeFormat,
      DefaultTime:this.selectedDefaultTime,

      MultipleSelection:this.multipleSelection==true?1:0,
    }

    var field=textBody;
if(this.fieldLabel.trim()!="" && this.fieldLabel!=undefined)
{
  this.saveCustomFieldData(field);
}

  }

  getAllCustomFields()
  {
    this.customFieldService.getAllCustomFields().subscribe((data: any[]) => {
      this.fields = data;
     
    });
  }

  saveCustomFieldData(data)
  {
    if(this.isEdit==false){
      this.customFieldService.createCustomField(data).subscribe(response =>
        {
          debugger;
          if(response==null)
          {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Field already exists.', life: 3000 });
            return;
          }
          this.messageService.add({
            severity: 'success',
            summary: 'Successful',
            detail: 'Field Added succesfully.',
            life: 3000
          });
          this.getAllCustomFields();
          this.hideDialog();
        },
          error =>
          {
            console.log(error);
            this.messageService.add({ severity: 'error', summary: 'Error', detail: error, life: 3000 });
          });
    }
    else
    {
      data.CustomFieldId=this.currentField.customFieldId;
      this.customFieldService.updateCustomField(data).subscribe(response =>
        {
          this.messageService.add({
            severity: 'success',
            summary: 'Successful',
            detail: 'Field Updated succesfully.',
            life: 3000
          });
          this.getAllCustomFields();
          this.hideDialog();
        },
          error =>
          {
            console.log(error);
            this.messageService.add({ severity: 'error', summary: 'Error', detail: error, life: 3000 });
          });
    }
    }
  


//
onAddRow() {
  var options:any[]=this.addForm.value.rows.map(x=>x.name.trim());

//check for duplicates
// const toFindDuplicates = options => options.filter((item, index) => options.indexOf(item) !== index)
var res = this.toFindDuplicates(options); //this.tofindDuplicates(options);
//
     if(options.includes(""))
     {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Please add options for the field.', life: 3000 });
      return;
     }
     if(res==true)
     {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Options can not be same.', life: 3000 });
      return;
     }
  this.rows.push(this.createItemFormGroup());
}
 toFindDuplicates(arry) {

  let resultToReturn = false;
  // call some function with callback function as argument
  resultToReturn = arry.some((element, index) => {
      return arry.indexOf(element) !== index
  });
  if (resultToReturn) {
     //alert("same");
     return true;
      }
      else {
        return false;
        //alert("not same");
          }
      }

onRemoveRow(rowIndex:number, data){
 // this.hobbiesArray.removeAt(rowIndex);
 var value=data;
 var options=this.currentField.customfielddata.length>0?this.currentField.customfielddata[0].value:"";
 if(this.currentField.customfielddata.length>0)
 {

 
 if(this.currentField.multipleSelection==1)
 {
  var opArray=JSON.parse(options);
  if(opArray.includes(data.value.name))
  {
    this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Option is in use.', life: 3000 });
    return;
  }
 }
 else
 {
  var opArray=JSON.parse(options);
  if(opArray==data.value.name)
  {
    this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Option is in use.', life: 3000 });
    return;
  }
 }
}
   this.rows.removeAt(rowIndex);
}

createItemFormGroup(): FormGroup {
  return this.formBuilder.group({
    name: ['', [Validators.required]],
    description: null,
    qty: null
  });
}
createItemFormGroup2(op): FormGroup {
  return this.formBuilder.group({
    name: op.option,
    description: null,
    qty: null
  });
}
//

// validateFields(type)
// {
//   if(this.fieldLabel=="")
//   {

//   }
//   if(type=="Text")
//   {
    
//   }
// }
isFieldValid(field: string) {   
if(this.isSubmitted==true)
{

  if(field=="label")
  {
    if(this.fieldLabel.trim()=="" || this.fieldLabel==undefined)
    {
      this.errorFieldCss("label");
      this.addErrorMessages =  { errorType: 'required', controlName: field };
      this.isLabelValid=true;
      return true; 
    }
  }
}
 }


 errorFieldCss(field: string) {
  if(this.isSubmitted==true)
  return {'ng-dirty': true};
}
setActiveRow(department: any)
  {
    console.log('Selected Department:' + JSON.stringify(department));
    this.currentField = department;
  }
  deleteCustomField()
  {
    const departmentname = this.currentField;
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete this custom field ?',
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () =>
      {
        const body = {
          CustomFieldId: this.currentField.customFieldId
        };
        this.customFieldService.deleteCustomField(body).subscribe(response =>
        {
          this.messageService.add({
            severity: 'success',
            summary: 'Successful',
            detail: 'Field deleted succesfully.',
            life: 3000
          });
          this.getAllCustomFields();
        },
          error =>
          {
            console.log(error);
            this.messageService.add({ severity: 'error', summary: 'Error', detail: error, life: 3000 });
          });

      }
    });
  }
  addInputControl() {
    
    this.hobbiesArray.push(new FormControl('', Validators.required));
}
CheckVal(evt:any)
{
  var ASCIICode = (evt.which) ? evt.which : evt.keyCode
  if (ASCIICode > 31 && (ASCIICode < 48 || ASCIICode > 57))
      return false;
  return true;
}
}
