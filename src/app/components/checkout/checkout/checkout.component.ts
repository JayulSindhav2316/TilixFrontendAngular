import { Component, OnInit, Input } from '@angular/core';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { AppBreadcrumbService } from '../../../app.breadcrumb.service';
import { Router } from '@angular/router';
import { ShoppingCartService } from '../../../services/shopping-cart.service';
import { AuthService } from '../../../services/auth.service';
import { PersonService } from '../../../services/person.service';
import { PromoCodeService } from '../../../services/promo-code.service';
import { HttpParams } from '@angular/common/http';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss'],
  providers: [MessageService, ConfirmationService]
})
export class CheckoutComponent implements OnInit {

  currentUser: any;
  cartItems: any[];
  rowGroupMetadata: any;
  cartTotal: number;
  cartId: number;
  creditBalance: any;
  personId: number;
  useCreditBalance: boolean;
  payAmount: number;
  displayPromoCode: boolean;
  promoCode: string;
  promoCodeApplied: boolean;
  promoDiscount: number;
  cartTotalDue: number;
  percentage: number;
  displayPremium: boolean;
  discountPercentage: number;
  processing: boolean;

  constructor(private breadcrumbService: AppBreadcrumbService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private shoppingCartService: ShoppingCartService,
    private authService: AuthService,
    private router: Router,
    private personService: PersonService,
    private promoCodeService: PromoCodeService
    ) { 
      if (this.router.url.includes('/checkout')){
        this.breadcrumbService.setItems([
          { label: 'Home' },
          { label: 'Membership' },
          { label: 'Cart' }
        ]); 
    }
    this.displayPromoCode=false;
    this.displayPremium = false;
    this.discountPercentage= 0;
    this.processing=false;
  }
  ngOnInit(): void {
    this.currentUser = this.authService.currentUserValue;
    this.cartId =  this.currentUser.cartId;
    this.getShoppingCart(this.currentUser.id);
     //Get the MerhcnatInfo
     this.getMerchantInfo(this.currentUser.organizationName);
  }

  showPromoCode(){
    this.displayPromoCode=true;
  }
  hidePromoCode(){
    this.displayPromoCode=false;
    this.displayPremium = false;
  }

  applyPromoCode(){
    if((Number(this.discountPercentage) > 100) && this.displayPremium){
      this.discountPercentage = 0;
      this.messageService.add({ severity: 'warn', summary: 'Warning', detail: 'Discount cannot be more than 100%.', life: 3000 });
    }
    else{
      let applyPromoCode = false;

      const formData = new FormData();
      formData.append('cartId',this.cartId.toString());
      formData.append('promoCode',this.promoCode);
      formData.append('discount',this.discountPercentage.toString());

      console.log('Apply PromoCode Request:' + formData);
      //Check Promo code type
      let searchParams = new HttpParams();
      searchParams = searchParams.append('promoCode', this.promoCode);
      const opts = {params: searchParams};
      if(!this.displayPremium){
        this.promoCodeService.getPromoCodeByCode(opts).subscribe((data: any) =>
        {
          console.log('Promo Code:' + JSON.stringify(data));
          if(data.discountType === 2)
          {
            this.displayPremium = true;
            this.promoCodeApplied = false;
          }
          else {
            console.log('Submitting Form');
            this.submitPromoCode()
          }
        });
      }
      else {
        console.log('Submitting Form With Premium promo code');
        this.submitPromoCode()
      }
    }        
  }

  submitPromoCode(){
    const formData = new FormData();
    formData.append('cartId',this.cartId.toString());
    formData.append('promoCode',this.promoCode);
    formData.append('discount',this.discountPercentage.toString());

    console.log('Apply PromoCode Request:' + formData);

    this.shoppingCartService.applyPromoCode(formData).subscribe((data: any) =>
    {
      console.log('Response from apply promo code:'+ JSON.stringify(data));
      this.cartItems = data.shoppingCartDetails;
      this.personId = data.personId;
      this.updateRowGroupMetaData();
      this.creditBalance = data.creditBalance;
      if(this.creditBalance > 0){
        this.useCreditBalance = true;
        this.payAmount = this.cartTotalDue - this.creditBalance;
        if(this.payAmount < 0){
          this.payAmount = 0;
        }
      }
      this.promoCodeApplied=true;
    },
    error => {
      console.log(error);
      this.messageService.add({ severity: 'error', 
                                summary: 'Error', 
                                detail: error, 
                                life: 3000 });
    });
  }

  getShoppingCart(id:number){
  
    console.log('Fetching Cart for Id:' +id.toString());
    let searchParams = new HttpParams();
    searchParams = searchParams.append('userId', id.toString());
    const opts = {params: searchParams};
    this.shoppingCartService.getGetShoppingCartByUserId(opts).subscribe((data: any) =>
    {
      console.log(data);
      if(data.shoppingCartId===0){  
        this.authService.clearCart();
        this.breadcrumbService.setCart(0);
        this.router.navigate(['/membership/searchMember'], {
          queryParams: {  }
      });
      }
      else {
        this.promoCode = data.promoCode;
        this.cartItems = data.shoppingCartDetails;
        this.personId = data.personId;
        this.updateRowGroupMetaData();
        this.creditBalance = data.creditBalance;
        if(this.creditBalance > 0){
          this.useCreditBalance = true;
          this.payAmount = this.cartTotalDue - this.creditBalance;
          if(this.payAmount < 0){
            this.payAmount = 0;
          }
        }
      }
    });
  }

  updateRowGroupMetaData() {
    this.rowGroupMetadata = {};
    this.cartTotal=0;
    this.promoDiscount=0;
    this.cartTotalDue=0;

    if (this.cartItems) {
        for (let i = 0; i < this.cartItems.length; i++) {
           
            if (this.promoCode) {
              this.promoDiscount = this.promoDiscount + parseFloat(this.cartItems[i].discount);
            }
            this.cartItems[i].itemAmount=this.cartItems[i].amount + this.cartItems[i].discount;
            if(this.cartItems[i].amount ==this.cartItems[i].price)
            {
              this.cartItems[i].itemAmount=this.cartItems[i].amount;
            }
            this.cartTotal = this.cartTotal + parseFloat(this.cartItems[i].itemAmount);
            this.cartTotalDue = this.cartTotalDue + parseFloat(this.cartItems[i].amount);

            let rowData = this.cartItems[i];
            let itemGroupDescription = rowData.itemGroupDescription;
            
            if (i == 0) {
                this.rowGroupMetadata[itemGroupDescription] = { index: 0, size: 1 };
            }
            else {
                let previousRowData = this.cartItems[i - 1];
                let previousRowGroup = previousRowData.itemGroupDescription;
                if (itemGroupDescription === previousRowGroup)
                    this.rowGroupMetadata[itemGroupDescription].size++;
                else
                    this.rowGroupMetadata[itemGroupDescription] = { index: i, size: 1 };
            }
        }
    }
    if( this.promoDiscount > 0){
      this.promoCodeApplied=true;
      this.displayPromoCode=true;
    }
    console.log('Row Data:'+ JSON.stringify(this.rowGroupMetadata));
  }

  addReceipt(){
    console.log('Adding Receipt Cart for Id:' + this.cartId.toString());
    let useCredit = 1;
    const formData = new FormData();
    if(this.useCreditBalance){
      useCredit = 1;
    }
    else {
      useCredit = 0;
    }
   

    formData.append('cartId',this.cartId.toString());
    formData.append('useCreditBalance', useCredit.toString() )
   
    this.shoppingCartService.addReceiptToShoppingCart(formData).subscribe((data: any) =>
    {
      console.log(data);
      this.cartItems = data.shoppingCartDetails;
      //if payment is adjusted through credit then send to show receipt
      if(data.paymentStatus === 2 && data.useCreditBalance === 1){
        this.updateInvoiceDetails();
        this.router.navigate(['/receipt'], {
          queryParams: {  }
        });
      }
      //Navigate to Payment
      this.router.navigate(['/payment'], {
        queryParams: { cartId: data.shoppingCartId, paymentStatus: data.paymentStatus,promoCode:this.promoCode,discountPercentage:this.discountPercentage }
      });
    });
  }

  clearCart(){
    //Confirm
    this.confirmationService.confirm({
      message: 'Are you sure that you want to delete items from cart?',
      accept: () => {
            // call Delete Service
            let searchParams = new HttpParams();
            searchParams = searchParams.append('cartId', this.cartId.toString());
            const opts = {params: searchParams};
            console.log('Deleting Cart:' +  JSON.stringify(opts));
            this.shoppingCartService.deleteCart(opts).subscribe(
              response => {
                this.messageService.add({ severity: 'success',
                                          summary: 'Successful',
                                          detail: 'Shopping Cart items deleted succesfully.',
                                          life: 3000
                                        });
                // remove from current list
                this.authService.clearCart();
                this.breadcrumbService.setCart(0);
                this.router.navigate(['/membership/searchMember'], {
                  queryParams: {  }
              });
              },
              error => {
                console.log(error);
                this.messageService.add({ severity: 'error', 
                                          summary: 'Error', 
                                          detail: error, 
                                          life: 3000 });
              });
      }
  });
  
}

checkPayamount(event) { 
    console.log(JSON.stringify(event));
    if(event.checked){
      this.useCreditBalance = true;
      this.payAmount = this.cartTotalDue - this.creditBalance;
      if(this.payAmount < 0){
        this.payAmount =0;
      }
    }
    else {
     this.useCreditBalance = false;
     this.payAmount = this.cartTotalDue;
    }
}
removePromoCode(){
  this.confirmationService.confirm({
    message: 'Are you sure that you want to remove the applied promo code?',
    accept: () => {
      // call Delete Service
      const formData = new FormData();
      formData.append('cartId',this.cartId.toString());
      formData.append('promoCode',this.promoCode);
      
      this.shoppingCartService.deletePromoCode(formData).subscribe(
        response => {
          this.messageService.add({ severity: 'success',
                                    summary: 'Successful',
                                    detail: 'Promo Code has been deleted succesfully.',
                                    life: 3000
                                  });
          // remove from current list
          // console.log('Response from apply promo code:'+ response);
          // this.cartItems = response.shoppingCartDetails;
          // this.personId = response.personId;
          // this.updateRowGroupMetaData();
          // this.creditBalance = response.creditBalance;
          // if(this.creditBalance > 0){
          //   this.useCreditBalance = true;
          //   this.payAmount = this.cartTotal - this.creditBalance;
          //   if(this.payAmount < 0){
          //     this.payAmount = 0;
          //   }
          // }
          this.promoCodeApplied=false;
          this.promoCode=null;
          this.hidePromoCode();
          this.getShoppingCart(this.currentUser.id);
        },
        error => {
          console.log(error);
          this.messageService.add({ severity: 'error', summary: 'Error',detail: error, life: 3000 });
        });
    }
});
}
  makePayment(){
    // Add Receipt
    this.addReceipt();
    
  }

  updateInvoiceDetails()
  {
    if(this.cartId==null || this.promoCode==null)
    {
      return ;
    }
    const formData = new FormData();
    formData.append('cartId',this.cartId.toString());
    formData.append('promoCode',this.promoCode);
    formData.append('discount',this.discountPercentage.toString());
    this.shoppingCartService.updateShoppingCartInvoiceDetails(formData).subscribe(()=>{
     console.log('invoice details updated for cart id '+this.cartId);
  });
  }
  
  updateAmount(item){
    if(this.promoCodeApplied)
      {
        this.messageService.add({ severity: 'warn',
        summary: 'Warning',
        detail: 'Please remove applied promo code before editing the amount.',
        life: 3000
      });
         return;
      }
    this.processing=true;
    console.log("Edited:"+ JSON.stringify(item));
    const formData = new FormData();

      formData.append('ShoppingCartId',item.data.shoppingCartId);
      formData.append('ShoppingCartDetailId',item.data.shoppingCartDetailId);
      formData.append('Amount',item.data.itemAmount);
      console.log("Edited Amount:"+ item.amount); 
      console.log("Form Data:"+ JSON.stringify(formData));
      this.shoppingCartService.updateShoppingCartItem(formData).subscribe(
        response => {
          this.messageService.add({ severity: 'success',
                                    summary: 'Successful',
                                    detail: 'payment amount updated succesfully.',
                                    life: 3000
                                  });
          this.getShoppingCart(this.currentUser.id);
          this.processing=false;
          if(this.promoCode)
          {
          // call Delete Service
            const formData = new FormData();
             formData.append('cartId',this.cartId.toString());
             formData.append('promoCode',this.promoCode);
             this.shoppingCartService.deletePromoCode(formData).subscribe(
             response => {       
              this.promoCodeApplied=false;
              this.promoCode='';
              this.hidePromoCode();
              this.getShoppingCart(this.currentUser.id);
         });
      }
        },
        error => {
          console.log(error);
          this.messageService.add({ severity: 'error', summary: 'Error',detail: error, life: 3000 });
          this.processing=false;
        });
    
  }
  removeShoppingCartItem(item){
    this.processing=true;
    console.log("Removing:"+ JSON.stringify(item));
    const formData = new FormData();
    formData.append('ShoppingCartId',item.shoppingCartId);
    formData.append('ShoppingCartDetailId',item.shoppingCartDetailId);
    console.log("Form Data:"+ JSON.stringify(formData));
    this.shoppingCartService.deleteShoppingCartItem(formData).subscribe(
      response => {
        this.messageService.add({ severity: 'success',
                                  summary: 'Successful',
                                  detail: 'Item deleted succesfully.',
                                  life: 3000
                                });
        this.getShoppingCart(this.currentUser.id);

        this.processing=false;
      },
      error => {
        console.log(error);
        this.messageService.add({ severity: 'error', summary: 'Error',detail: error, life: 3000 });
        this.processing=false;
      });
  }

  getMerchantInfo(organizationName:string){
    console.log('Fetching Merchant info for:' +organizationName);
    this.authService.getMerchantProfile(organizationName).subscribe((data: any) =>
    {
      console.log(data);
      if(data){
        let merchantInfo = data;
        localStorage.setItem('currentMerchantInfo', JSON.stringify(merchantInfo));
    }
    });
  }
}
