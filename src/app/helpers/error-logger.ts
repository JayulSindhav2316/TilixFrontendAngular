import { ErrorHandler, Injectable } from '@angular/core';
import { LoggerService } from '../services/logger-service';
import { AuthService } from '../services/auth.service';
@Injectable()
export class ErrorLogger implements ErrorHandler {

constructor(private logger: LoggerService, private authService: AuthService) { }
  handleError(error) {
    const currentUser = this.authService.currentUserValue;
    console.log("Current User in Errorlog:"+ JSON.stringify(currentUser));
   
    const body = {
        message: 'Name:'+ error.name + ' Status:'+  error.status + ' Message:'+error.message,
        httpErrorCode: error.httpErrorCode,
        stack: error.stack,
        clientUrl: location.href,
        userName:currentUser.username,
        organizationName:currentUser.organizationName
    };
    console.log("Log Body:"+JSON.stringify(body));
    this.logger.CreateLog(body).subscribe((data: any) =>
    {
      console.log("Error Logged:"+ JSON.stringify(data));
    });
    
  }
}