import {Component, AfterViewInit, Renderer2, OnDestroy, OnInit} from '@angular/core';
import { MenuService } from './app.menu.service';
import { PrimeNGConfig } from 'primeng/api';
import { AppComponent } from './app.component';
import { Router } from '@angular/router';
import { AuthService } from './services/auth.service';
import { ShoppingCartService } from './services/shopping-cart.service';
import { HttpErrorResponse, HttpParams, JsonpClientBackend } from '@angular/common/http';
import { AppBreadcrumbService } from './app.breadcrumb.service';
import { LoaderService } from './services/loader.service';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { ConfirmationService, MenuItem, MessageService } from "primeng/api";
@Component({
    selector: 'app-main',
    templateUrl: './app.main.component.html'
    ,
    providers: [MessageService, ConfirmationService],
})
export class AppMainComponent implements AfterViewInit, OnDestroy {

    rotateMenuButton: boolean;
    topbarMenuActive: boolean;
    overlayMenuActive: boolean;
    staticMenuDesktopInactive: boolean;
    staticMenuMobileActive: boolean;
    menuClick: boolean;
    topbarItemClick: boolean;
    activeTopbarItem: any;
    documentClickListener: () => void;
    configActive: boolean;
    configClick: boolean;
    menuHoverActive = false;
    searchClick = false;
    search = false;
    currentUser: any;
    searchText: any;
    searchEnabled: boolean;
    quickSearch: string[]=[];
    constructor(public renderer: Renderer2, 
                private menuService: MenuService, 
                private primengConfig: PrimeNGConfig,
                public app: AppComponent, 
                private router: Router,
                private authService: AuthService, 
                private shoppingCartService: ShoppingCartService,
                private appBreadCrumbService: AppBreadcrumbService,
                private loaderService: LoaderService,
                private messageService: MessageService,
                private confirmationService: ConfirmationService,) {
                    this.searchEnabled=false;
                 }

    ngOnInit(): void {

      this.currentUser = this.authService.currentUserValue;
      //User moght have switched browser so check cart status

      console.log('app.currentUser:'+ JSON.stringify(this.currentUser));
      if(this.currentUser.id){
        this.getShoppingCart(this.currentUser.id);
      }
      
    }
    
    getShoppingCart(id:number){
  
        console.log('Fetching Cart for Id:' +id.toString());
        let searchParams = new HttpParams();
        searchParams = searchParams.append('userId', id.toString());
        const opts = {params: searchParams};
        this.shoppingCartService.getGetShoppingCartByUserId(opts).subscribe((data: any) =>
        {
          console.log(data);
          //Set Cart Status
          let cartId = parseInt(data.shoppingCartId);
          if(cartId > 0){
              this.authService.addCart(cartId);
          }
          else{
            this.authService.clearCart();
          }
          this.appBreadCrumbService.setCart(cartId);
        },catchError(this.handleError)
        );
      }

    ngAfterViewInit() {
        // hides the horizontal submenus or top menu if outside is clicked
        this.documentClickListener = this.renderer.listen('body', 'click', (event) => {
            if (!this.topbarItemClick) {
                this.activeTopbarItem = null;
                this.topbarMenuActive = false;
            }

            if (!this.menuClick && this.isHorizontal()) {
                this.menuService.reset();
            }

            if (this.configActive && !this.configClick) {
                this.configActive = false;
            }

            if (!this.menuClick) {
                if (this.overlayMenuActive) {
                    this.overlayMenuActive = false;
                }
                if (this.staticMenuMobileActive) {
                    this.staticMenuMobileActive = false;
                }

                this.menuHoverActive = false;
                this.unblockBodyScroll();
            }

            if (!this.searchClick) {
                this.search = false;
            }

            this.searchClick = false;
            this.configClick = false;
            this.topbarItemClick = false;
            this.menuClick = false;
        });
    }

    onMenuButtonClick(event) {
        this.rotateMenuButton = !this.rotateMenuButton;
        this.topbarMenuActive = false;
        this.menuClick = true;

        if (this.app.menuMode === 'overlay' && !this.isMobile()) {
            this.overlayMenuActive = !this.overlayMenuActive;
        }

        if (this.isDesktop()) {
            this.staticMenuDesktopInactive = !this.staticMenuDesktopInactive;
        } else {
            this.staticMenuDesktopInactive = !this.staticMenuDesktopInactive;
            this.staticMenuMobileActive = !this.staticMenuMobileActive;
            if (this.staticMenuMobileActive) {
                this.blockBodyScroll();
            } else {
                this.unblockBodyScroll();
            }
        }

        event.preventDefault();
    }

    onMenuClick($event) {
        this.menuClick = true;
    }

    onTopbarItemClick(event, item) {
        this.topbarItemClick = true;
        console.log("serach on...");
        if (this.activeTopbarItem === item) {
            this.activeTopbarItem = null;
        } else {
            this.activeTopbarItem = item; }

        if (item.className === 'search-item topbar-item') {
            this.search = !this.search;
            this.searchClick = !this.searchClick;
        }

        event.preventDefault();
    }
    checkSearch(event){
        console.log("serach text."+this.searchText);
        if(this.searchText.length >2)
        {
            this.searchEnabled=true;
        }
    }
    onSerachContacts(event){
        if(this.searchText==undefined)
        {
            this.messageService.add({
                severity: "info",
                summary: "Enter required data",
                detail: "Please enter minimum 2 characters for quick serach.",
                life: 3000,
              });
            return;
        }
        if(this.searchText.length >1)
        {
            console.log("seraching on...");
            console.log(JSON.stringify(this.searchText));
            var searchArray = JSON.parse(localStorage.getItem("quickSearch")); 
            if (!searchArray){
                searchArray = new Array();
            }
            searchArray.push(this.searchText);
            localStorage.setItem("quickSearch", JSON.stringify(searchArray)); 
            
            this.router.navigate(['/contacts'], {
                queryParams: { quickSearch: this.searchText}
              });
        }
        else
        {
            this.messageService.add({
                severity: "info",
                summary: "Enter required data",
                detail: "Please enter minimum 2 characters for quick serach.",
                life: 3000,
              });
        }
    }
    onTopbarSubItemClick(action: string) {
      switch (action){
        case 'logout': {
           this.authService.logout(null);
                location.reload();
        }
      }
    }

    onRTLChange(event) {
        this.app.isRTL = event.checked;
    }

    onRippleChange(event) {
        this.app.ripple = event.checked;
        this.primengConfig.ripple = event.checked;
    }

    onConfigClick(event) {
        this.configClick = true;
    }

    isTablet() {
        const width = window.innerWidth;
        return width <= 1024 && width > 640;
    }

    isDesktop() {
        return window.innerWidth > 1024;
    }

    isMobile() {
        return window.innerWidth <= 640;
    }

    isOverlay() {
        return this.app.menuMode === 'overlay';
    }

    isStatic() {
        return this.app.menuMode === 'static';
    }

    isHorizontal() {
        return this.app.menuMode === 'horizontal';
    }

    blockBodyScroll(): void {
        if (document.body.classList) {
            document.body.classList.add('blocked-scroll');
        } else {
            document.body.className += ' blocked-scroll';
        }
    }

    unblockBodyScroll(): void {
        if (document.body.classList) {
            document.body.classList.remove('blocked-scroll');
        } else {
            document.body.className = document.body.className.replace(new RegExp('(^|\\b)' +
                'blocked-scroll'.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
        }
    }

    ngOnDestroy() {
        if (this.documentClickListener) {
            this.documentClickListener();
        }
    }
   
  
    handleError(error: HttpErrorResponse) {
        if(error.message){
          return throwError(error.message);
        }
        console.log('invoiceService:'+ error);
        return throwError(error);
      }
}
