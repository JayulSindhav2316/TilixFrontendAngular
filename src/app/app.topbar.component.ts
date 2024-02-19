import { Component,HostListener,Renderer2,ViewChild,ElementRef } from '@angular/core';
import { AppComponent } from './app.component';
import { AppMainComponent } from './app.main.component';
import { AuthService } from './services/auth.service';
import { OrganizationService } from './services/organization.service';
import { HttpParams } from '@angular/common/http';
import { StaffService } from './services/staff.service';
import { PersonService } from './services/person.service';

@Component({
    selector: 'app-topbar',
    template: `<style>
    .close {
        cursor: pointer;
        position: absolute;
       
        right: 0%;
        padding: 12px 16px;
        transform: translate(0%, -72%);
      }
      
    #myUL {
        list-style-type: none;
        padding: 0;
        margin: 0;
      }
      #myUL li {
        border: 1px solid #ddd;
        margin-top: -1px; /* Prevent double borders */
        background-color: #f6f6f6;
        padding: 12px;
        text-decoration: none;
        font-size: 15px;
        color: black;
        display: block;
        cursor: pointer;
      }
      
      #myUL li a:hover:not(.header) {
        background-color: #eee;
      }  
      .close:hover {background: #bbb;}
      listDiv{
        position: absolute;
        width: 100%;
      }    
    </style>
        <p-toast></p-toast>
        <div class="layout-topbar">
            <div class="layout-topbar-wrapper">
                <div class="layout-topbar-left">
                    <div class="layout-topbar-logo" id="logolink" style="cursor: pointer; outline: none;" routerLink="/">
                        <img id="app-logo" [src]="'assets/layout/images/trilix-app-header-dark.png'"  alt="Company logo" style="width: 149px; max-width: 149px; height:55px; margin-left:0; margin-top:5px !important;" alt="memberax-layout"/>
                    </div>
                </div>

                <div class="layout-topbar-right">
                    <a class="menu-button" href="#" (click)="appMain.onMenuButtonClick($event)">
                        <i class="pi pi-bars"></i>
                    </a>

                    <ul class="layout-topbar-actions">
                         <li #searchItem class="search-item topbar-item" [ngClass]="{'active-topmenuitem': appMain.search}">
                            <a href="#" (click)="appMain.onTopbarItemClick($event,searchItem)">
                                <span class="topbar-icon">
                                    <i class="pi pi-search"></i>
                                </span>
                            </a>

                            <div class="search-input-wrapper" style="position: absolute;
                            right: 40px;" styleClass="mr-2">
                            
  <input type="text" #toggleButton name="browser" id="browser" [(ngModel)]="appMain.searchText" (click) ="ShowSearchList()" pInputText placeholder="Quick Search..." (keyup.enter)="appMain.onSerachContacts($event)"  (keyup)="filterSearchList()"/>
  <span role="button" class="input-group-addon dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"><span class="caret"></span></span>
  <ul [hidden]="!showList" #menu id="myUL" style="    margin-top: 5px;width: 200px;position: fixed;">
  <li *ngFor="let text of searchData">
  <div>
  <div style="width: 150px; word-break: break-all;" (click)="onSelect(text)">{{text}}</div>
  <div  (click)="clearHistory(text)" class="close">&times;</div>
  </div>
</ul>                        
  </div>
                           
                            <div class="search-input-wrapper">
                           
                            <button pButton pRipple type="button" icon="pi pi-search" class="p-button-rounded p-button-success" (click) ="appMain.onSerachContacts($event)"></button>
                            </div>
                        </li>
                       
                        <li #profile class="topbar-item user-profile"
                            [ngClass]="{'active-topmenuitem':appMain.activeTopbarItem === profile}">
                            <a href="#" (click)="appMain.onTopbarItemClick($event,profile)">
                                <p-avatar [image]="staffProfileImage" styleClass="mr-2" size="xlarge" shape="circle"></p-avatar>
                                <div class="profile-info">
                                    <h6>{{appMain.currentUser.username}}@{{appMain.currentUser.organizationName}}</h6>
                                </div>
                            </a>

                            <ul class="fadeInDown">
                                <li class="layout-submenu-header">
                                    <p-avatar [image]="staffProfileImage" styleClass="mr-2" size="xlarge" shape="circle"></p-avatar>
                                    <!-- <img class="profile-image" [src]="staffProfileImage" alt="demo"> -->
                                    <div class="profile-info">
                                        <h6>{{appMain.currentUser.firstName}} {{appMain.currentUser.lastName}}</h6>

                                    </div>
                                </li>
                                <!-- <li role="menuitem">
                                    <a href="#" (click)="appMain.onTopbarSubItemClick($event)">
                                        <i class="pi pi-cog"></i>
                                        <h6>Settings</h6>
                                    </a>
                                </li>
                                <li role="menuitem">
                                    <a href="#" (click)="appMain.onTopbarSubItemClick($event)">
                                        <i class="pi pi-file-o"></i>
                                        <h6>Terms of Usage</h6>
                                    </a>
                                </li>
                                <li role="menuitem">
                                    <a href="#" (click)="appMain.onTopbarSubItemClick($event)">
                                        <i class="pi pi-compass"></i>
                                        <h6>Support</h6>
                                    </a>
                                </li> -->
                                <li role="menuitem">
                                    <a (click)="appMain.onTopbarSubItemClick('logout')">
                                        <i class="pi pi-power-off"></i>
                                        <h6>Logout</h6>
                                    </a>
                                </li>
                            </ul>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    `
})
export class AppTopBarComponent{
    @ViewChild('toggleButton') toggleButton: ElementRef;
    @ViewChild('menu') menu: ElementRef;
    currentUser: any;
    organizationLogo: any;
    staffProfileImage: any;
    historyData: any;
    showList:boolean=false;
    searchData:any=[];
    
    constructor(public appMain: AppMainComponent,
        public app: AppComponent,
        private authService: AuthService,
        private organizationService: OrganizationService,
        private staffService: StaffService,
        private personService: PersonService,
        private renderer:Renderer2
    ) {
        this.currentUser = this.authService.currentUserValue;
        this.renderer.listen('window','click',(e:Event)=>{
            // if(e.target !== this.toggleButton.nativeElement && e.target!==this.menu.nativeElement){
            //     this.showList=false;
            // }
            if(e.target !== this.toggleButton.nativeElement){
                this.showList=false;
               // appMain.onSerachContacts(e);
            }
        });
    }

    getHeaderImage() {
        this.organizationService.getOrganizationImage(this.currentUser.organizationId.toString(), 'logo').subscribe((data: any) => {
            console.log('Image Data:');
            console.log(data);
            this.createImageFromBlob(data);

        }, error => {
            console.log(error);
        });

    }
    createImageFromBlob(image: Blob) {
        let reader = new FileReader();
        reader.addEventListener('load', () => {
            this.organizationLogo = [reader.result];
        }, false);
        if (image) {
            reader.readAsDataURL(image);

        }
    }

    getStaffProfileImage() {
        this.staffService.getProfileImage(this.currentUser.id).subscribe(data => {
            this.createStaffProfileImageFromBlob(data);
            console.log(data);
        }, error => {
            console.log(error);
        });
    }
    getSearchHistory() {
        // this.heroes.clear();
        this.personService.getPersonsSearchHistory().subscribe(data => {
            this.historyData = data.result;

            this.bindDataList(this.historyData);
        }, error => {
            console.log(error);
        });
    }

    bindDataList(data) {
        let arr=[]=data;
        this.searchData=arr;
    }

    createStaffProfileImageFromBlob(image: Blob) {
        let reader = new FileReader();
        reader.addEventListener('load', () => {
            this.staffProfileImage = [reader.result];
        }, false);
        if (image) {
            reader.readAsDataURL(image);

        }
    }
    ShowSearchList()
    {
        this.getSearchHistory();
        this.showList=true;
    }
    onSelect(text)
    {
        this.appMain.searchText=text;
        this.showList=false;
    }
    ngOnInit() {
       
        this.getHeaderImage();
        this.getStaffProfileImage();
        this.getSearchHistory();
    }
     filterSearchList() {
        var input, filter, ul, li, a, i, txtValue,div;
        input = document.getElementById("browser");
        filter = input.value.toUpperCase();
        ul = document.getElementById("myUL");
        li = ul.getElementsByTagName("li");
        for (i = 0; i < li.length; i++) {
            a = li[i].getElementsByTagName("div")[0];
        div=a.getElementsByTagName("div")

            txtValue = div[0].textContent || div[0].innerText;
            if (txtValue.toUpperCase().indexOf(filter) > -1) {
                li[i].style.display = "";
            } else {
                li[i].style.display = "none";
            }
        }
    }
    clearHistory(text)
    {

    const body = {
        SearchText: text,
      };
          this.personService.deleteSearchHistory(body).subscribe(
            (response) => {
              // remove from current list
               this.searchData = this.searchData.filter(
                  (obj) => obj !== text
                );
            this.showList=true;
            },
            (error) => {
            
            }
          );
    }
    

}
