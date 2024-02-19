import { Component, OnInit, Input } from '@angular/core';
import { Table } from 'primeng/table';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { AppBreadcrumbService } from '../../../app.breadcrumb.service';
import { Router } from '@angular/router';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ImageService } from '../../../services/image.service';
import { PersonService } from '../../../services/person.service';
import { DomSanitizer } from '@angular/platform-browser';
import { FormBuilder,  Validators,  FormGroup,  FormControl} from "@angular/forms";
import { EntityService } from '../../../services/entity.service';
import { EntityRoleService } from '../../../services/entity-role.service';

@Component({
  selector: 'app-account-contact',
  templateUrl: './account-contact.component.html',
  styleUrls: ['./account-contact.component.scss']
})
export class AccountContactComponent implements OnInit {

  @Input() entityId: number;
  @Input() isPerson: boolean;
  accountContacts: any[];
  images : {[index: number]: [any]} = {};
  imgUrl: string;
  isImageLoading: boolean;
  showTable: boolean;
  public personImage: any = [];
  showSearch: boolean;
  searchEnabled: boolean;
  showCompany: boolean;
  showContact: boolean;
  companyId: number;
  contact: any;
  constructor(private breadcrumbService: AppBreadcrumbService, 
    private messageService: MessageService, 
    private imageService: ImageService,
    private confirmationService: ConfirmationService, 
    private router: Router,
    private sanitizer: DomSanitizer,
    private  personService: PersonService,
    private fb: FormBuilder,
    private entityService: EntityService,
    private entityRoleService: EntityRoleService,
    private httpClient: HttpClient) { }

  ngOnInit(): void {
    this.getAccountContactsById(this.entityId);
    this.getEntityById(this.entityId);
    this.showSearch=false;
    this.searchEnabled=true;
    this.showCompany=false;
    this.showContact=false;
  }

  getAccountContactsById(entityId)
  {
    console.log('Fetching contact Account data for Entity:' + entityId);
    let searchParams = new HttpParams();
    searchParams = searchParams.append('entityId',  entityId);
    const opts = {params: searchParams};
    this.entityRoleService.GetAccountContactsByEntityId(opts).subscribe((data: any) =>
    {
      console.log('Account Contacts:' + JSON.stringify(data));
      this.accountContacts = data;
      let counter = 0;
      for (var contact of this.accountContacts) {
        this.getImageFromService(contact.entityId, counter);
        counter++;
        this.showTable=true;
      }
    });
  }
  getImageFromService(personId: number, counter: number) {
    this.isImageLoading = true;
    console.log("Loading image for:"+personId + ":"+counter);
    this.entityService.getProfileImage(personId).subscribe(data => {
      this.createImageFromBlob(data, counter);
      this.isImageLoading = false;
      console.log(data);
    }, error => {
      this.isImageLoading = false;
      console.log(error);
    });
  }

  createImageFromBlob(image: Blob, counter: number) {
    let reader = new FileReader();
    reader.addEventListener('load', () => {
      this.personImage.push(reader.result);
      this.images[ counter] = [reader.result];
    }, false);
    if (image) {
      reader.readAsDataURL(image);
    }
  }
  getEntityById(entityId) {
    console.log("Fetcing data for Entity:" + entityId);
    let searchParams = new HttpParams();
    searchParams = searchParams.append("entityId", entityId);
    const opts = { params: searchParams };
    this.entityService.getEntitySummaryById(opts)
        .subscribe((data: any) => {
            console.log(data);
            this.contact = data;
           
            if (this.contact.companyId) {
                this.showCompany = true;
                console.log("Showing company record");
                this.companyId=this.contact.companyId
            } else {
                this.showContact = true;
            }
        });
}
  addContacts(){
    this.showSearch=true;
  }
  reloadContactRoles(e: any){
    this.showSearch=false;
    this.getAccountContactsById(this.entityId);
  }
  showContactDetail(contactRole: any){
    console.log('Redirecting user to Contact overview:' + JSON.stringify(contactRole));
    this.router.navigate(["/contactProfile"], {
      queryParams: {
          entityId: contactRole.entityId,
          tab: 0,
      },
  });
  }
  showAccountRoleDetail(role: any) {
    console.log('Redirecting user to Account Role:' + JSON.stringify(role));
    localStorage.setItem('ActiveRole', role.contactRoleId)
    this.router.navigate(["/contactProfile"], {
      queryParams: {
        entityId: role.accountId,
        tab: 4,
      },
    });
  }
}
