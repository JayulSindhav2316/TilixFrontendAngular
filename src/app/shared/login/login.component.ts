import { Component, OnInit } from '@angular/core';
import { Router,ActivatedRoute } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { HttpClient  } from '@angular/common/http';
import { first } from 'rxjs/operators';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
 
  showErrorMessage = false;
  submitted: boolean;
  returnUrl: string;
  errorMessage: string;
  showLoader: boolean;
  ipAddress: string;
  showPassword: boolean;
  isValidOrganization: boolean;
  isForgotPassword: boolean;
  organizationName: string;

  constructor(private router: Router,private authService: AuthService, 
              private route: ActivatedRoute,
              private http:HttpClient) { 
    if (this.authService.currentUserValue) {
      this.ipAddress='';
     // this.router.navigate(['/']);
    }
    this.isValidOrganization= false;
    this.organizationName='';
    this.isForgotPassword=false;
  }

  loginForm = new FormGroup({
    organizationName: new FormControl('', [Validators.required]),
    userName: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required]),
    email: new FormControl('')
  });

  ngOnInit(): void {
    this.showErrorMessage = false;
    this.showPassword = false;
    this.submitted = false;
    this.getIPAddress();
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
  }

  checkOrganization(){
    if(!this.isValidOrganization){
      //this.logger.log("Validating organization...")
      const organization: string = this.loginForm.value.organizationName.toLowerCase();
      const userName: string = this.loginForm.value.userName;
      const password: string = this.loginForm.value.password;
      const ipAddress: string = this.ipAddress;
    
      const body = {
        organizationName: organization,
        userName: this.loginForm.value.userName,
        password: this.loginForm.value.password,
        ipAddress: this.ipAddress,
      };
      this.authService.ValidateOrganization(body)
      .pipe(first())
      .subscribe(
        data => {
          //this.logger.log('Data:'+JSON.stringify(data));
          if(data.organizationName === organization)
          {
            this.organizationName=data.organizationName.toLowerCase();
            this.isValidOrganization=true;
            this.errorMessage = "";
            this.showErrorMessage =  false;
            this.loginForm.get('organizationName').disable();
          }
        },
        error => {
            this.errorMessage = "Please enter a valid organization name.";
            this.showErrorMessage =  true;
            //this.logger.log('Error:' + JSON.stringify(error));
            
       });
    }
    
  }
  resetPassword(){
    //this.logger.log("Resetting password...");
    localStorage.clear();
    this.router.navigate(['/resetpassword'], {
      queryParams: { 'organizationName': this.organizationName },
    });
  }
 onLogin() {
   if(!this.isValidOrganization){
    this.checkOrganization();
    return false;
  }
  else {
    this.submitted = true;
    const organization: string = this.organizationName;
    const userName: string = this.loginForm.value.userName;
    const password: string = this.loginForm.value.password;
    const ipAddress: string = this.ipAddress;
    
    const body = {
      organizationName: organization,
      userName: this.loginForm.value.userName,
      password: this.loginForm.value.password,
      ipAddress: this.ipAddress,
      
    };

    
    this.authService.login(body)
    .pipe(first())
    .subscribe(
        data => {
          //this.logger.log('Data:'+JSON.stringify(data));
          if(data.responseStatus){
            let responseStatus = data.responseStatus;
            if(responseStatus.statusCode =='401')
            {
              this.errorMessage = responseStatus.message;
              this.showErrorMessage =  true;
              return;
            }
            this.router.navigate(['/validate'],{ queryParams: { returnUrl: this.returnUrl } });
            return;
          }
          if(data.id > 0)
          {
            if(JSON.parse(localStorage.getItem('currentUserId')) !== JSON.parse(localStorage.getItem('lastLogoutUserId')))
            {
              this.returnUrl="";
            }
            this.router.navigateByUrl(this.returnUrl);
          }
        },
        error => {
            this.errorMessage = error;
            this.showErrorMessage =  true;
            //this.logger.log('Error:' + JSON.stringify(error));
            //this.logger.log('Status:'+error.status);
      });
    }
  }

  getIPAddress()
  {
    this.http.get("https://api.ipify.org/?format=json").subscribe((res:any)=>{
      this.ipAddress = res.ip;
      //this.logger.log('IP:'+this.ipAddress);
    });
  }

  

  clickShowPassword()
  {
    this.showPassword = !this.showPassword;
  }
}
