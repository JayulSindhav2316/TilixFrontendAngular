import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpHeaders } from '@angular/common/http';
import { StaffService } from '../services/staff.service';
import { HttpParams } from '@angular/common/http';
import { ConfirmationService } from 'primeng/api';
@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
    constructor(
      private router: Router,
      private authService: AuthService,
      private staffService: StaffService
    ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot)
  {
    const currentUser = this.authService.currentUserValue;
    var permission= this.checkUrlPermission(route, state, currentUser);
    if (currentUser) {
      console.log('Validate Token Data:');
      // logged in so return true
      console.log('Current User:'+JSON.stringify(currentUser));
      console.log('auth guard-loggedin');
      if (this.tokenExpired(currentUser.token)){
          console.log(state.url); 
          console.log('auth guard-Token expired');
          // not logged in so clear session aand redirect to login page with the return url
          localStorage.removeItem('currentUser');
          localStorage.removeItem('userVerification');
          localStorage.removeItem('cmsUser');
          this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
          return false;
      }
      if (!this.checkForEventManagerPendingChanges())
      {
        return false;
      }
      return true;
    }
      console.log(state.url); 
      console.log('auth guard-not -loggedin');
      // not logged in so redirect to login page with the return url
      this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
      return false;
  }
  
  private tokenExpired(token: string) {
    const expiry = (JSON.parse(atob(token.split('.')[1]))).exp;
    console.log('Token expiration:'+expiry);
    console.log('current time:'+Math.floor((new Date).getTime() / 1000));
    return (Math.floor((new Date).getTime() / 1000)) >= expiry;
  }
  
    private checkUrlPermission(route: ActivatedRouteSnapshot, state: RouterStateSnapshot, currentUser)
    {
      const menuitem=this.staffService.getMenuItems();
      var menu=menuitem; //as MenuItem;
      var arr=[];    
      
      var testi= [];
      testi=menu;

      var links=menuitem; //as MenuItem;

      if(menu!=undefined)
      {        
        var currentPath="/"+ route.routeConfig.path
        var splited=currentPath.split("/");
        let pComp ="/"+ splited[1]; 
    
        if(!links.includes(currentPath))
        {
        this.router.navigate(['/unauthorized']);
        }
          
      }
      else
      {
      if(currentUser!=null)
      {
      // var currentUser1=  this.authService.currentUserValue;
        let searchParams = new HttpParams();
        searchParams = searchParams.append('staffId',currentUser.id.toString());
        const opts = {params: searchParams};
        this.staffService.getStaffMenu(opts).subscribe((data: any) =>
        {
          
          const menuItems =  data.accessUrl //as MenuItem[];
          var test=menuItems as any ;
    
        var currentPath="/"+ route.routeConfig.path
    
        if(!menuItems.includes(currentPath))
        {
        this.router.navigate(['/unauthorized']);
        }
        
        });  
      }       
      }
  }
  
  private checkForEventManagerPendingChanges() : boolean
  {
    if (this.router.url != 'events/events')
    {      
      let setUpForm = JSON.parse(sessionStorage.getItem("SetUpForm"));
      let eventQuestions = JSON.parse(sessionStorage.getItem("EventQuestions"));
      let settingsForm = JSON.parse(sessionStorage.getItem("SettingsForm"));
      let sessionsForm = JSON.parse(sessionStorage.getItem("SessionsForm"));
      
      if (setUpForm || eventQuestions || settingsForm || sessionsForm)
      {
        if(confirm("You have unsaved changes. Are you sure you want to continue?"))
        { 
          sessionStorage.removeItem("SetUpForm");
          sessionStorage.removeItem("EventQuestions");
          sessionStorage.removeItem("SettingsForm");  
          sessionStorage.removeItem("SessionsForm");
          return true;
        }
        else
        {
          return false;
        }        
      }
      else
      {
        return true;
      }
    }
    else
    {
      return true;
    }
  }
      
}
