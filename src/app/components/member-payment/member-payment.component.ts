import { Component, OnInit } from '@angular/core';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { Router , ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { HttpParams } from '@angular/common/http';


@Component({
  selector: 'app-member-payment',
  templateUrl: './member-payment.component.html',
  styleUrls: ['./member-payment.component.scss']
})
export class MemberPaymentComponent implements OnInit {
  organizationName: string;
  paymentToken: string;
  ipAddress: string;
  constructor(  private router: Router,
    private activateRoute: ActivatedRoute ,
    private authService: AuthService) { }

  ngOnInit(): void {
    this.activateRoute.queryParams.subscribe(params => {
      //console.log(params);
      this.organizationName = params.organization;
      this.paymentToken = params.id;
    });
    this.authService.setPaymentOrganization(this.organizationName);
    //Get the MerhcnatInfo
    this.getMerchantInfo( this.organizationName);
  
  }

  getMerchantInfo(organizationName:string){
    console.log('Fetching Merchant info for:' +organizationName);
    this.authService.getMerchantProfile(organizationName).subscribe((data: any) =>
    {
      console.log(data);
      if(data){
        let merchantInfo = data;
        localStorage.setItem('currentMerchantInfo', JSON.stringify(merchantInfo));
        this.router.navigate(['/selfpayment'], {
            queryParams: { 'organization':  this.organizationName, 'id': this.paymentToken},
          });
        }
    });
  }
  
}
