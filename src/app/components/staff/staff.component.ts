import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, AfterViewChecked } from '@angular/core';
import { StaffService } from '../../services/staff.service';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { AppBreadcrumbService } from '../../app.breadcrumb.service';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { RoleService } from '../../services/role.service';
import { DepartmentService } from '../../services/department.service';
import { faCamera, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import { AuthService } from 'src/app/services/auth.service';
import { ImageCroppedEvent } from 'ngx-image-cropper';

@Component({
  selector: 'app-staff',
  templateUrl: './staff.component.html',
  styleUrls: ['./staff.component.scss'],
  styles: [`
       :host ::ng-deep .p-dialog {
            width: 150px;
            margin: 0 auto 2rem auto;
            display: block;
        }

        :host ::ng-deep .p-password input {
            width: 15rem
        }

        @media screen and (max-width: 960px) {
            :host ::ng-deep .p-datatable .p-datatable-tbody > tr > td:last-child {
                text-align: center;
            }

            :host ::ng-deep .p-datatable .p-datatable-tbody > tr > td:nth-child(6) {
                display: flex;
            }
        }
        :host ::ng-deep .ui-datatable-data> tr> td {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 150px;
        }
    `],
  providers: [MessageService, ConfirmationService],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class StaffComponent implements OnInit, AfterViewChecked 
{

  userDialog: boolean;
  resetPasswordDialog: boolean;
  staffList = [];
  confirmPassword: string;
  items: MenuItem[];
  staff: any;
  submitted: boolean;
  cols: any[];
  department: any[];

  addNew: boolean;
  staffDetailForm: FormGroup;
  resetPasswordForm: FormGroup;
  roles: any[];
  showPassword: boolean;
  showConfirmPassword: boolean;
  selectedRoles:any[]=[];
  showTable: boolean;
  showLoader: boolean;
  duplicatePassword: boolean;
  addErrorMessages : any = {};

  headerName: string;
  editPasswordText: string;
  editPasswordEnabled: boolean;

  faCamera = faCamera;
  faTrash = faTrashAlt;
  imageChangedEvent: any = '';
  croppedImage: any = '';
  showCropper:boolean =false;
  showTextCropper:boolean =false;

  profileImage: any;
  profileImageFile: File;

  formData = new FormData();

  currentUser: any;
  tempFile: any;
  cropper = {
    x1: 100,
    y1: 100,
    x2: 200,
    y2: 200
  };

  constructor(private staffService: StaffService,
    private roleService: RoleService,
    private breadcrumbService: AppBreadcrumbService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private departmentService: DepartmentService,
    private formBuilder: FormBuilder,
    private readonly changeDetectorRef: ChangeDetectorRef,
    private authService: AuthService,
    )
  {
    this.breadcrumbService.setItems([
      { label: 'Home', routerLink: ['/']},
      { label: 'Staff Management'},
      { label: 'Manage Users'}
    ]);
    this.showTable=false;
    this.showLoader=true;
    this.currentUser = this.authService.currentUserValue;
  }

  ngAfterViewChecked(): void {
    this.changeDetectorRef.detectChanges();
  }

  ngOnInit(): void
  {

    this.showPassword = false;
    this.showConfirmPassword = false;
    
    this.initializeForm();

    this.resetPasswordForm = this.formBuilder.group({     
      UserId: [0],
      Password: ['', [Validators.required, Validators.pattern(/^(?=.*?[A-Z])(?=.*?[0-9]).{8,20}$/)]],
      ConfirmPassword: ['', [Validators.required]]},
      {validator: this.MustMatch('Password', 'ConfirmPassword')}); 
  
    const body = {};
    this.roleService.getActiveRoles().subscribe((data: any[]) =>
    {
      console.log(data);
      this.roles = data;
    });

    this.departmentService.getAllDepartmentsSelectList().subscribe((data: any[]) =>
    {
      console.log(data);
      this.department = data;
    });

    

    this.getStaffUsers();

    this.cols = [
      { field: 'firsName', header: 'First Name' },
      { field: 'lastName', header: 'Last Name' },
      { field: 'email', header: 'Email' },
      { field: 'userName', header: 'User Name' },
      { field: 'status', header: 'Status' },
      { field: 'department[0].name', header: 'Status' }
    ];
    this.items = [{
      label: 'Options',
      items: [{
        label: 'Edit User',
        icon: 'pi pi-user-edit',
        command: () =>
        {
          this.update();
        }
      },
      {
        label: 'Delete User',
        icon: 'pi pi-trash',
        command: () =>
        {
          this.delete();
        }
      }
        ,
      {
        label: 'Reset Password',
        icon: 'pi pi-undo',
        command: () =>
        {
          this.resetUserPassword();
        }
      }
      ]
    }
    ];
  }


  get formFields() { return this.staffDetailForm.controls; }

  openNew()
  {
    this.imageChangedEvent = null;
    this.croppedImage = null;
    this.showCropper = false;
    this.showTextCropper = false;
    this.editPasswordEnabled = true;
    this.submitted = false;
    this.userDialog = true;
    this.addNew = true;
    this.headerName = "Add New user";
    this.showPassword = false;
    this.showConfirmPassword = false;
    this.applyPasswordValidation();  
  }
  update()
  {
    this.imageChangedEvent = null;
    this.croppedImage = null;
    this.showCropper = false;
    this.staffDetailForm.get('Password').setErrors({pattern:false}); 
    this.editUser();
    this.addNew = false;

    this.headerName = "Edit user '" + this.staff.userName + "'";

    this.editPasswordText = "Edit Password";
    this.editPasswordEnabled = false;

    this.removePasswordValidation();
  }

  delete()
  {
    this.deleteUser();
  }

  editUser()
  {
    this.userDialog = true;
    this.resetPasswordDialog = false;
    this.getSelectedRoles(this.staff.roles);
    this.getProfileImage();
    console.log('Selected  Roles:' + JSON.stringify(this.selectedRoles));

    this.staffDetailForm.get('UserId').setValue(this.staff.userId);
    this.staffDetailForm.get('FirstName').setValue(this.staff.firstName);
    this.staffDetailForm.get('LastName').setValue(this.staff.lastName);
    this.staffDetailForm.get('Username').setValue(this.staff.userName);
    this.staffDetailForm.get('Email').setValue(this.staff.email);
    this.staffDetailForm.get('Department').setValue(this.staff.departmentId.toString());
    this.staffDetailForm.get('Password').setValue('');
    this.staffDetailForm.get('ConfirmPassword').setValue('');
    this.staffDetailForm.get('Status').setValue(this.staff.isActive);
    this.staffDetailForm.get('SelectedRoles').setValue(this.selectedRoles);
    this.staffDetailForm.get('Password').setValidators([Validators.required]);
    this.staffDetailForm.get('Password').updateValueAndValidity();
    this.staffDetailForm.get('ConfirmPassword').clearValidators();
    this.staffDetailForm.get('ConfirmPassword').updateValueAndValidity();
    this.staffDetailForm.get('Locked').setValue(this.staff.isLocked);
    this.staffDetailForm.get('Cell').setValue(this.staff.cellPhoneNumber);
  }  

  deleteUser()
  {
    console.log('Deleteing:' + this.staff.userId);
    const body = {
      UserId: this.staff.userId
    };

    this.confirmationService.confirm({
      message: 'Are you sure you want to delete user: <B>' + this.staff.userName + '</B> ?',
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () =>
      {
        this.staffService.deleteStaff(body).subscribe(
          response =>
          {
            this.messageService.add({
              severity: 'success',
              summary: 'Successful',
              detail: 'Staff record deleted succesfully.',
              life: 3000
            });
            this.hideDialog();
            this.getStaffUsers();
          },
          error =>
          {
            console.log(error);
            this.messageService.add({ severity: 'error', summary: 'Error', detail: error, life: 3000 });
          });
      }
    });
  }

  hideDialog()
  {
    this.userDialog = false;
    this.submitted = false;
    this.initializeForm();
    // this.staffDetailForm.reset();
    this.profileImage = null;
    this.showCropper = false;
    this.showTextCropper = false;
  }

  clickShowPassword()
  {
    this.showPassword = !this.showPassword;
  }

  clickShowConfirmPassword()
  {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  clickEditPassword()
  {
    this.editPasswordEnabled = !this.editPasswordEnabled;
    if(this.editPasswordEnabled)
    {
      this.editPasswordText = "Cancel";
      this.showPassword = false;
      this.showConfirmPassword = false;
      this.applyPasswordValidation();
    }
    else
    {
      this.editPasswordText = "Edit Password";
      this.removePasswordValidation();
      this.staffDetailForm.get('Password').setValue('');
      this.staffDetailForm.get('ConfirmPassword').setValue('');
    }    
  }

  applyPasswordValidation()
  {
    this.staffDetailForm.get('Password').setValidators([Validators.required, Validators.pattern(/^(?=.*?[A-Z])(?=.*?[0-9]).{8,20}$/)]);
    this.staffDetailForm.get('Password').updateValueAndValidity();

    this.staffDetailForm.get('ConfirmPassword').setValidators([Validators.required]);
    this.staffDetailForm.get('ConfirmPassword').updateValueAndValidity();
  }

  removePasswordValidation()
  {
    this.staffDetailForm.get('Password').clearValidators();
    this.staffDetailForm.get('Password').updateValueAndValidity();
     
    this.staffDetailForm.get('ConfirmPassword').clearValidators();
    this.staffDetailForm.get('ConfirmPassword').updateValueAndValidity();
  }

  saveUser()
  {
    this.submitted = true;
    console.log(this.staffDetailForm.value);
    console.log(this.staffDetailForm.controls.ConfirmPassword);

    if (this.staffDetailForm.valid)
    {
      let statusValue = 0;
      if (this.staffDetailForm.get('Status').value === true)
      {
        statusValue = 1;
      }
      const body = {
        userId: this.staffDetailForm.get('UserId').value,
        firstName: this.staffDetailForm.get('FirstName').value,
        lastName: this.staffDetailForm.get('LastName').value,
        departmentId: this.staffDetailForm.get('Department').value,
        email: this.staffDetailForm.get('Email').value,
        userName: this.staffDetailForm.get('Username').value,
        selectedRoles: this.staffDetailForm.get('SelectedRoles').value,
        isActive: this.staffDetailForm.get('Status').value,
        isLocked: this.staffDetailForm.get('Locked').value,
        password: this.staffDetailForm.get('Password').value,
        cellPhoneNumber: this.staffDetailForm.get('Cell').value,
        organizationId: Number(this.currentUser.organizationId.toString())
      };
      console.log('Form Data:' + JSON.stringify(this.staffDetailForm.value));
      const username = '\'' + body.userName + '\'';

      if (this.addNew)
      {
        console.log(this.staffDetailForm.value);
        this.staffService.createStaff(body).subscribe(
        response =>
        {
          if(this.formData.get('File'))
          {
            this.formData.append('staffId', response.userId.toString());
            this.staffService.uploadImage(this.formData).subscribe((data: any) =>
            {
              this.messageService.add({
                severity: 'success',
                summary: 'Successful',
                detail: 'Staff record added succesfully.',
                life: 3000
              });
              this.formData = new FormData();
              this.hideDialog();
              this.getStaffUsers();
            });
          }
          else {
            this.messageService.add({
              severity: 'success',
              summary: 'Successful',
              detail: 'Staff record added succesfully.',
              life: 3000
            });
            this.formData = new FormData();
            this.hideDialog();
            this.getStaffUsers();
          }
        },
        error =>
        {
          console.log(error);
          this.messageService.add({ severity: 'error', summary: 'Error', detail: error, life: 3000 });
        });
      }
      else
      {
        this.staffService.updateStaff(body).subscribe(
          response =>
          {
            this.messageService.add({
              severity: 'success',
              summary: 'Successful',
              detail: 'Staff record updated succesfully.',
              life: 3000
            });
            this.hideDialog();
            this.getStaffUsers();
          },
          error =>
          {
            if (error=='Duplicate Password.')                
              this.duplicatePassword = true;
            console.log(error);
            this.messageService.add({ severity: 'error', summary: 'Error', detail: error, life: 3000 });
          });
      }
    }
    else
    {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Please fix the error(s) on the page.', life: 3000 });
    }
  }

  setActiveRow(staff: any)
  {
    console.log('Selected User:' + JSON.stringify(staff));
    this.staff = staff;
  }

  getSelectedRoles(staffRoles: any[])
  {
    this.selectedRoles = [];
     staffRoles.forEach(element => {
       //const role = {'name': element.role.name, 'code':element.role.roleId.toString()};
       this.selectedRoles.push(element.roleId);
    });
  }

  // RESET PASSWORD LOGIC

  resetUserPassword()
  {
    const username = '\'' + this.staff.userName + '\'';

    this.confirmationService.confirm({
      message: 'Are you sure you want to reset password for user: <B>' + username + '</B> ?',
      header: 'Confirm', 
      icon: 'pi pi-exclamation-triangle',
      accept: () =>
      {
        this.resetPasswordForm.reset();   
        this.resetPasswordForm.get('Password').setErrors(null);
        this.resetPasswordForm.get('ConfirmPassword').setErrors(null);
        this.resetPasswordDialog = true;
        this.userDialog = false;
        this.showPassword = false;
        this.showConfirmPassword = false;
      }
    });
  }

  resetPassword()
  {
    this.submitted = true;
    if (this.resetPasswordForm.valid)
    {
      const body = {
        UserId: this.staff.userId,
        Password: this.resetPasswordForm.get('Password').value
      };
      this.staffService.resetPassword(body).subscribe(
        response =>
        {
          this.messageService.add({
            severity: 'success',
            summary: 'Successful',
            detail: 'User Password has been changed succesfully.',
            life: 3000
          });
          this.hideResetPassowordDialog();
          this.getStaffUsers();
          this.resetPasswordForm.reset();
        },
        error =>
        {  
          if (error=='Duplicate Password.') {  
            this.resetPasswordForm.get('Password').setErrors({duplicatePassword:true});             
            this.duplicatePassword = true;  
          }    
          console.log(error);
          this.messageService.add({ severity: 'error', summary: 'Error', detail: error, life: 3000 });
        });
    }
    else
    {
      
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Please fix the error(s) on the page.', life: 3000 });
    }
  }

  hideResetPassowordDialog()
  {
    this.duplicatePassword=false;
    this.submitted = false;
    this.resetPasswordForm.reset();   
    this.resetPasswordForm.get('Password').setErrors(null);
    this.resetPasswordForm.get('ConfirmPassword').setErrors(null);
    this.resetPasswordDialog = false;
   
  }
  getStaffUsers()
  {
    this.staffService.getStaff().subscribe((data: any[]) =>
    {
      console.log(data);
      this.staffList = data;
      this.showTable=true;
      this.showLoader=false;
    });
  }

  MustMatch(controlName: string, matchingControlName: string)
  {
    return (formGroup: FormGroup) =>
    {
      const control = formGroup.controls[controlName];
      const matchingControl = formGroup.controls[matchingControlName];
      if (matchingControl.errors && !matchingControl.errors.mustMatch)
      {
        // return if another validator has already found an error on the matchingControl
        return;
      }
      // set error on matchingControl if validation fails
      if (control.value !== matchingControl.value)
      {
        matchingControl.setErrors({ mustMatch: true });
      } else
      {
        matchingControl.setErrors(null);
      }
    }
  }

  errorIconCss(field: string) {
    return {'has-feedback': this.isFieldValid(field)};
  }

  errorFieldCss(field: string) {
    return {'ng-dirty': this.isFieldValid(field)};
  }

  resetSubmitted(field){
    this.submitted = false;
    this.isFieldValid(field);
  }

  isFieldValid(field: string) {  
    if (this.userDialog) { 
    if ((!this.staffDetailForm.get(field).valid) && (this.submitted) && (this.staffDetailForm.get(field).hasError('required'))){
      if (field == 'Department'){this.addErrorMessages =  { errorType: 'dropdownrequired', controlName: field };}
      if (field == 'SelectedRoles'){this.addErrorMessages =  { errorType: 'selectedrolesrequired', controlName: field };}
      else this.addErrorMessages =  { errorType: 'required', controlName: field };
      return true;
    }
    if ((!this.staffDetailForm.get(field).valid)  && (this.staffDetailForm.get(field).hasError('email'))){
      this.addErrorMessages =  { errorType: 'email', controlName: field };
      return true;
    }
    if ((this.staffDetailForm.get(field).hasError('pattern')) && (field == 'Password')){
      this.addErrorMessages =  { errorType: 'pwPattern', controlName: field };
      return true;
    }
    if (!this.staffDetailForm.get(field).valid && (this.submitted) && this.staffDetailForm.get(field).hasError('mustMatch')){
      this.addErrorMessages =  { errorType: 'mustMatch', controlName: field };
      return true;
    }


  }
  if (this.resetPasswordDialog) { 
    if ((!this.resetPasswordForm.get(field).valid) && (this.submitted) && (this.resetPasswordForm.get(field).hasError('required'))){
      this.addErrorMessages =  { errorType: 'required', controlName: field };
      return true;
    }

    if (!this.resetPasswordForm.get(field).valid && (this.submitted) && this.resetPasswordForm.get(field).hasError('mustMatch')){
      this.addErrorMessages =  { errorType: 'mustMatch', controlName: field };
      return true;
    }
    if (!this.resetPasswordForm.get(field).valid  && this.resetPasswordForm.get(field).hasError('duplicatePassword')){
      this.addErrorMessages =  { errorType: 'duplicatePassword', controlName: field };
      return true;
    }
    if ((this.resetPasswordForm.get(field).hasError('pattern')) && (field == 'Password')){
      this.addErrorMessages =  { errorType: 'pwPattern', controlName: field };
      return true;
    }
  }

  }

  UserNameValidation(event) {
    if ((event.target.value.length < 5) || (event.target.value.length > 50)) {
      this.staffDetailForm.get('Username').reset();
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Username must be 5-50 characters long.', life: 3000 });
    }
  }

  matcher(event: ClipboardEvent, formControlName: string): boolean {
    if (this.userDialog) { 
      if (event.type == "paste") {
        let clipboardData = event.clipboardData;
        var pastedText = clipboardData.getData('text') + this.staffDetailForm.get(formControlName).value; 
        var allowedRegex = "";
        if ((formControlName == 'FirstName') || (formControlName == 'LastName')){
          allowedRegex = ("^[A-Za-z -.,']{0,30}$");
          if (!pastedText.match(allowedRegex))  {
            event.preventDefault();
            return false;
         }}
        if (formControlName == 'Username') {
          if (pastedText.indexOf(' ') >= 0){
            event.preventDefault();
            return false;
        }}
       return true;
      }
  }
  }

  noBlankValidator(control: FormControl)
  {
    const isWhitespace = (control.value || '').trim().length === 0;
    const isValid = !isWhitespace;
    return isValid ? null : { 'required': true };
  }

  onFileSelected(event) {
    const file: File = event.target.files[0];

    if (file) {
      let imageSize = file.size / 1000000;
      let imageType = file.type;
      if (imageSize > 5) {
        this.messageService.add({
            severity: "warn",
            summary: "Warning",
            detail: "Image size should not be greater than 5 Mb.",
            life: 3000,
        });
        event.target.value = null;
    }else if (
      imageType != "image/jpeg" &&
      imageType != "image/jpg" &&
      imageType != "image/png" &&
      imageType != "image/gif" 
  ) {
      this.messageService.add({
          severity: "warn",
          summary: "Warning",
          detail: "Please select image of type .jpeg, .jpg, .gif or .png.",
          life: 3000,
      });
      event.target.value = null;
  } else {
      // this.uploadProfileImage(file);
      // let reader = new FileReader();
      //   reader.addEventListener('load', () => {
      //     this.profileImage = [reader.result];
      //   }, false);
      //   reader.readAsDataURL(file);
      this.tempFile = file;
      event.target.value = null;
    }}
  } 

  uploadProfileImage(file){
    this.formData.append('File',file);
    if(!this.addNew){      
      this.formData.append('staffId', this.staff.userId.toString());
      this.staffService.uploadImage(this.formData).subscribe((data: any) =>
      {
        console.log(data);
        this.showLoader = false;
        this.getProfileImage();
      });
      this.formData = new FormData();
    }
    
  }

  getProfileImage() {
    this.staffService.getProfileImage(this.staff.userId).subscribe(data => {
        this.createImageFromBlob(data);
        console.log(data);
    }, error => {
      console.log(error);
    });
  }

  createImageFromBlob(image: Blob) {
    let reader = new FileReader();
    reader.addEventListener('load', () => {
      this.profileImage = [reader.result];
    }, false);
    if (image) {
      reader.readAsDataURL(image);
    }
  }

  

  deleteProfileImage()
  {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete profile image?',
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () =>
      {
        this.staffService.deleteProfileImage(this.staff.userId).subscribe(data => {
          console.log(data);
          this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Profile image deleted successfully.', life: 3000 });
          this.getProfileImage();
        }, error => {
          console.log(error);
          this.messageService.add({ severity: 'error', summary: 'Error', detail: error, life: 3000 });
        });
      }
    }); 
  }

  initializeForm(){
    this.staffDetailForm = this.formBuilder.group({
      UserId: [0],
      FirstName: ['', [Validators.required, this.noBlankValidator]],
      LastName: ['', [Validators.required, this.noBlankValidator]],
      Department: ['', [Validators.required]],
      SelectedRoles: ['', [Validators.required]],
      Username: ['', [Validators.required, this.noBlankValidator, Validators.minLength(5)]],
      Email: ['', [Validators.required, Validators.email]],
      Password: ['', [Validators.required, Validators.pattern(/^(?=.*?[A-Z])(?=.*?[0-9]).{8,20}$/)]],
      ConfirmPassword: ['', [Validators.required]],
      Cell: [''],
      Status: [true],
      Locked: [false]
    }, {
      validator: this.MustMatch('Password', 'ConfirmPassword')
    });
  }

  fileChangeEvent(event: any): void {
    this.imageChangedEvent = event;
    var files = this.imageChangedEvent.target.files.length;
    if(files > 0)
    {
      this.showCropper = true;
      this.showTextCropper = false;
    }
}
imageCropped(event: ImageCroppedEvent) {
    this.croppedImage = event.base64;
}
imageLoaded() {
  this.showTextCropper = true;
  setTimeout(() => {
    this.cropper = {
      x1: 100,
      y1: 100,
      x2: 300,
      y2: 200
    }
  });
}

cropperReady() {
  if (this.croppedImage) {
    const blob = this.dataURItoBlob(this.croppedImage);
    const file = new File([blob], 'cropped-image.png', { type: blob.type });

    const event = { target: { files: [file] } } as any; // create an Event object with the selected file
    this.onFileSelected(event); // call the onFileSelected method with the Event object
  }
}

 // utility method to convert data URI to Blob object
 dataURItoBlob(dataURI) {
  const byteString = atob(dataURI.split(',')[1]);
  const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  return new Blob([ab], { type: mimeString });
}
cropImageDone(){
  this.cropperReady();
  this.uploadProfileImage(this.tempFile);
  this.showCropper = false;
  this.imageChangedEvent = null;
  this.croppedImage = null;
  this.showTextCropper=false;
  $('input[type="file"]').val('');
  this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Profile image updated successfully.', life: 3000 });
}
loadImageFailed() {
    this.showTextCropper = false;
    this.messageService.add({
      severity: "warn",
      summary: "Warning",
      detail: "Image Loading Failed",
      life: 3000,
  });
    this.showCropper = false;
}
hideCropper()
{
  this.showCropper = false;
  this.showTextCropper = false;
  $('input[type="file"]').val('');
}
}
