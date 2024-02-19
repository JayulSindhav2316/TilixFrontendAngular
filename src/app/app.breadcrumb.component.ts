import { Component, OnDestroy } from '@angular/core';
import { AppBreadcrumbService } from './app.breadcrumb.service';
import { Subscription } from 'rxjs';
import { MenuItem } from 'primeng/api';
import { Router } from '@angular/router';

@Component({
    selector: 'app-breadcrumb',
    templateUrl: './app.breadcrumb.component.html'
})
export class AppBreadcrumbComponent implements OnDestroy {

    subscription: Subscription;
    cartListner: Subscription;

    items: MenuItem[];
    showCheckout: boolean;
    cart: any;


    constructor(public breadcrumbService: AppBreadcrumbService, private router: Router,) {
        this.showCheckout=false;
        this.subscription = breadcrumbService.itemsHandler.subscribe(response => {
            this.items = response;
        });
        this.cartListner = breadcrumbService.cartHandler.subscribe(response => {
            console.log('Cart-response:' +JSON.stringify(response));
            this.cart = response;
            console.log('Cart status:'+response);
            let cartStatus = parseInt(this.cart);
            if(cartStatus===0){
                this.showCheckout=false;
            }
            else {
                this.showCheckout=true;
            }
            
        });

        //Also check from current user
        let user = JSON.parse(localStorage.getItem('currentUser'));
        if(parseInt(user.cartId) > 0){
            this.showCheckout=true;
        }
    }

    ngOnDestroy() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }

    openCheckout(){
        console.log("Navigate to checkout")
        this.router.navigate(['/checkout'], {
            queryParams: { cartId: this.cart }
          });
    }
}
