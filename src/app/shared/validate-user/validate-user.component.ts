import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router,ActivatedRoute } from '@angular/router';
import { UserVerification} from '../../models/user-verification'
import { AuthService } from '../../services/auth.service';
import { Subscription, interval } from 'rxjs';

@Component({
  selector: 'app-validate-user',
  templateUrl: './validate-user.component.html',
  styleUrls: ['./validate-user.component.scss']
})
export class ValidateUserComponent implements OnInit {
  options: any[];
  timer: any;
  timeLeft: number;
  validationCode: any;
  showErrorMessage: boolean;
  errorMessage: any;
  showValidation: boolean;
  sendEmail: any;
  sendPhone: any;
  userId: any;
  submitted: boolean;
  failedAttempt: number;
  timeLimit: number;
  authdata: UserVerification;
  private subscription: Subscription;
  validateUserForm = new FormGroup({
    validationCode: new FormControl('', [Validators.required,Validators.minLength(6)]),
    remember:new FormControl(''),
    timer: new FormControl('')
  });
  returnUrl: string;

  constructor(private route: ActivatedRoute, private router: Router, private authService: AuthService) {
    this.options = [
      {name: 'Email', code: 'Email'},
      {name: 'SMS', code: 'SMS'}
  ];
  
   }

  ngOnInit(): void {
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/'; 
      this.authdata = JSON.parse(localStorage.getItem('userVerification'));
      this.timeLimit = this.authdata.verificationTimeLimit
      console.log('Auth Data:' + JSON.stringify(this.authdata));
      this.userId = this.authdata.userId
      this.sendEmail = this.authdata.emailDisplay;
      this.sendPhone = this.authdata.phoneDisplay;
      console.log(this.userId);
      console.log(this.sendEmail);
      console.log(this.sendPhone);
      console.log(this.authdata.verificationToken);
      this.showValidation = false;
      this.failedAttempt=0;
  }
  sendNotificationRequest(mode: string){
    console.log(' Send sendNotificationRequest with Auth Data:' + JSON.stringify(this.authdata));
    let rememberMe = 0;
    if(this.validateUserForm.value.remember==='true'){
      rememberMe=1;
    }
    const body = {
      mode: mode,
      userId: this.userId.toString(),
      rememberDevice: rememberMe,
      verificationToken: this.authdata.verificationToken,
      tenantName: this.authdata.tenantName
    };
    console.log('Validate User:' + JSON.stringify(body));
    this.authService.ValidateUser(body).subscribe((data: any) =>
    {
      console.log(data);
      this.showValidation = true;
      this.timeLeft = this.timeLimit * 60;
      this.startTimer();
      var date = new Date(null);
      date.setSeconds(this.timeLeft ); 
      var result = date.toISOString().substr(11, 8);
      this.validateUserForm.get("timer").setValue(result);
    });
  }

  startTimer(){
    this.subscription = interval(5000)
    .subscribe(x => { this.getTimeLeft(); });
  }

  private getTimeLeft () {
    this.timeLeft =  this.timeLeft-5;
    if(this.timeLeft <= 0) {
      this.router.navigate(['/login']);
    }
    var date = new Date(null);
    date.setSeconds(this.timeLeft ); 
    var result = date.toISOString().substr(11, 8);
    this.validateUserForm.get("timer").setValue(result);
}

  goHome(){
    this.router.navigate(['/login']);
  }

  onSend(){
    this.submitted=true;
    let rememberMe = 0;
    if(this.validateUserForm.value.remember){
      rememberMe=1;
    }
    const body = {
      userId: this.userId.toString(),
      verificationToken: this.authdata.verificationToken,
      verificationCode: this.validateUserForm.value.validationCode,
      rememberDevice:rememberMe,
      tenantName: this.authdata.tenantName
    };
    console.log('Validate Code:' + JSON.stringify(body));
    this.authService.ValidateCode(body).subscribe((data: any) =>
    {
      console.log(data);
      console.log('Failed attempt:'+this.failedAttempt);
      if(data.statusCode){
        if(data.statusCode  === 401){
          this.errorMessage = data.message;
          this.showErrorMessage =  true;
          this.failedAttempt += 1;
          return;
        }
        if(data.statusCode === 403){
          console.log('In Failed attempt:'+this.failedAttempt);
          this.router.navigate(['/login']);
          return;
        }
      }
      if(data.id>0){
        console.log('redirecting to dashboard');
        this.router.navigateByUrl(this.returnUrl);
       // this.router.navigate([this.returnUrl]);
      }
    },
    error => {
      console.log(error);
      console.log('redirecting to login');
      this.subscription.unsubscribe();
      this.router.navigate(['/login']);
    });
  }
  ngOnDestroy() {
    if(this.subscription){
      this.subscription.unsubscribe();
    }
    
  }
}
