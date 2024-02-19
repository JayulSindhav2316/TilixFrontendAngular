import { Component, OnInit } from '@angular/core';
import { Router,ActivatedRoute } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { HttpClient  } from '@angular/common/http';
import { first } from 'rxjs/operators';
import { EmailComponent } from '../email/email.component';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss'],
  providers: [MessageService, ConfirmationService]
})
export class ResetPasswordComponent implements OnInit {
  submitted: boolean;
  returnUrl: string;
  errorMessage: string;
  showLoader: boolean;
  ipAddress: string;
  organizationName: string;
  showErrorMessage:boolean;
  resetLinkSent: boolean;
  token: string;
  resetPasswordEnabled: boolean;
  showPassword: boolean;
  showConfirmPassword: boolean;
  addErrorMessages : any = {};
  validLink: boolean;
  constructor(private router: Router,private authService: AuthService, 
    private route: ActivatedRoute,
    private http:HttpClient,
    private messageService: MessageService) { 
if (this.authService.currentUserValue) {
this.ipAddress='';
this.router.navigate(['/']);
}
this.submitted= false;
this.showErrorMessage=false;
this.resetLinkSent=false;
this.resetPasswordEnabled=false;
this.validLink=false;
}

resetRequestForm = new FormGroup({
organizationName: new FormControl(''),
email: new FormControl('', [Validators.required]),
});

resetPasswordForm = new FormGroup({
  Password: new FormControl('', [Validators.required]),
  ConfirmPassword: new FormControl('', [Validators.required])
  });

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.organizationName = params['organizationName'];
      this.token = params['tokenId'];
    });
    if(this.token){
      console.log('Validating token');
      this.checkResetLink();
      this.resetPasswordEnabled=true;
    }
    console.log('Organization name:'+this.organizationName);
    console.log('Token:'+this.token);
    this.getIPAddress();
    
  }
  onSubmit() {
   
     this.submitted = true;
     const organization: string = this.organizationName;
     const email: string = this.resetRequestForm.value.email;
     const ipAddress: string = this.ipAddress;
     
     const body = {
       organizationName: organization,
       email: email,
       ipAddress: this.ipAddress,
     };

     this.authService.confirmResetPassword(body)
    .pipe(first())
    .subscribe(
      data => {
        console.log('Data:'+JSON.stringify(data));
        if(data.token.length)
        {
         this.resetLinkSent=true;
         this.showErrorMessage =  false;
        }
      },
      error => {
          this.errorMessage = error;
          this.showErrorMessage =  true;
          console.log('Error:' + JSON.stringify(error));
     });
 }
 onPasswordSubmit() {
   
  this.submitted = true;
  const organization: string = this.organizationName;
  const password: string = this.resetPasswordForm.value.Password;
  const confirmPassword: string = this.resetPasswordForm.value.ConfirmPassword;
  const token: string = this.token;
  const ipAddress: string = this.ipAddress;
  if(!this.resetPasswordForm.valid)
  {
    return false;
  }
  if (password != confirmPassword){
    return false;
  }
  
  const body = {
    organizationName: organization,
    password: password,
    token: token,
    ipAddress: this.ipAddress,
  };

  this.authService.resetPassword(body)
 .pipe(first())
 .subscribe(
   data => {
     console.log('Data:'+JSON.stringify(data));
     this.messageService.add({ severity: 'success',
     summary: 'Successful',
     detail: 'Password has been updated. Please wait we will tranfer you to login page.',
     life: 3000
    });
    this.delay(5000).then(any=>{
      this.router.navigate(['/login']);
    });
    
   },
   error => {
       this.errorMessage = error;
       this.showErrorMessage =  true;
       this.validLink=false;
       console.log('Error:' + JSON.stringify(error));
  });
}

checkResetLink(){
  console.log("Validating reset Link...")
  const body = {
    organizationName: this.organizationName,
    password: '',
    token: this.token,
    ipAddress: this.ipAddress,
  };
  console.log("body:"+JSON.stringify(body));
  this.authService.validateResetPasswordLink(body)
  .pipe(first())
  .subscribe(
    data => {
      console.log('Data:'+JSON.stringify(data));
      this.validLink=true;
    },
    error => {
        this.errorMessage = "The reset password link is invalid or has expired. Please try again";
        this.showErrorMessage =  true;
        console.log('Error:' + JSON.stringify(error));
        
   });
}
resetPassword(){
  this.showErrorMessage=false;
  this.errorMessage='';
  this.router.navigate(['/login']);
}

 closeForm(){
  window.close();
 }
  getIPAddress()
  {
    this.http.get("https://api.ipify.org/?format=json").subscribe((res:any)=>{
      this.ipAddress = res.ip;
      console.log('IP:'+this.ipAddress);
    });
  }

  clickShowPassword()
  {
    this.showPassword = !this.showPassword;
  }

  clickShowConfirmPassword()
  {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  
  applyPasswordValidation()
  {
    this.resetPasswordForm.get('Password').setValidators([Validators.required, Validators.pattern(/^(?=.*?[A-Z])(?=.*?[0-9]).{8,20}$/)]);
    this.resetPasswordForm.get('Password').updateValueAndValidity();

    this.resetPasswordForm.get('ConfirmPassword').setValidators([Validators.required]);
    this.resetPasswordForm.get('ConfirmPassword').updateValueAndValidity();
  }

  removePasswordValidation()
  {
    this.resetPasswordForm.get('Password').clearValidators();
    this.resetPasswordForm.get('Password').updateValueAndValidity();
     
    this.resetPasswordForm.get('ConfirmPassword').clearValidators();
    this.resetPasswordForm.get('ConfirmPassword').updateValueAndValidity();
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
    
    if ((!this.resetPasswordForm.get(field).valid) && (this.submitted) && (this.resetPasswordForm.get(field).hasError('required'))){
      this.addErrorMessages =  { errorType: 'required', controlName: field };
      return true;
    }

    if ((this.resetPasswordForm.get(field).hasError('pattern')) && (field == 'Password')){
      this.addErrorMessages =  { errorType: 'pwPattern', controlName: field };
      return true;
    }

    if(field === 'ConfirmPassword' && (this.submitted)){
      const password: string = this.resetPasswordForm.value.Password;
      const confirmPassword: string = this.resetPasswordForm.value.ConfirmPassword;
      if (password != confirmPassword){
        this.addErrorMessages =  { errorType: 'mustMatch', controlName: confirmPassword };
        return true;
      }
    }


  }
  async delay(ms: number) {
    await new Promise<void>(resolve => setTimeout(()=>resolve(), ms)).then(()=>console.log("fired"));
}
}
