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
@Component({
  selector: 'app-relations',
  templateUrl: './relations.component.html',
  styleUrls: ['./relations.component.scss'],
  styles: [`
       :host ::ng-deep .p-dialog {
            width: 150px;
            margin: 0 auto 2rem auto;
            display: block;
        }

        @media screen and (max-width: 960px) {
            :host ::ng-deep .p-datatable .p-datatable-tbody > tr > td:last-child {
                text-align: center;
            }

            :host ::ng-deep .p-datatable .p-datatable-tbody > tr > td:nth-child(6) {
                display: flex;
            }
        }
       
    `],
  providers: [MessageService, ConfirmationService]
})

export class RelationsComponent implements OnInit {

  @Input() entityId: number;
  @Input() isPerson: boolean;
 
  searchList: any[];
  hasRelations: boolean;
  showTable: boolean;
  showLoader: boolean;
  showSearch: boolean;
  images : {[index: number]: [any]} = {};
  relations: any[];
  existedRelationIds:any[]=[];
  public cols: any[];
  imgUrl: string;
  isImageLoading: boolean;
  public personImage: any = [];
  parentControl: string;
  menuItems: MenuItem[];
  selectedRelation: any;
  showRelationDialog: boolean;
  relationshipTypes: any[];
  relationshipTypesData: any[];
  relationContact: any;
  isNewRelationRecord: boolean;
  
  relationForm = this.fb.group({
    relationType: ['', Validators.required]});
  relationSubmitted: boolean;
  currentUser: any;
  constructor(private breadcrumbService: AppBreadcrumbService, 
              private messageService: MessageService, 
              private imageService: ImageService,
              private confirmationService: ConfirmationService, 
              private router: Router,
              private sanitizer: DomSanitizer,
              private  personService: PersonService,
              private fb: FormBuilder,
              private entityService: EntityService,
              private httpClient: HttpClient) {
    this.parentControl =  'Relations';
    this.hasRelations= false;
    this.showRelationDialog = false;           
    this.menuItems = [{
      label: 'Options',
      items: [
       {
          label: 'Edit',
          icon: 'pi pi-pencil',
          command: () => {
              this.editRelation();
          }
      },
      {
          label: 'Delete',
          icon: 'pi pi-trash',
          command: () => {
              this.deleteRelation();
          }
      }

    ]}
    ];
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
  }

  ngOnInit(): void {
  this.router.routeReuseStrategy.shouldReuseRoute = () => false;
   this.getRelations();
   this.getRelationshipTypes();
  }

  editRelation(){
    this.showRelationDialog = true;
    this.isNewRelationRecord = false;
    this.filterRelationDropDownList();
  }

  deleteRelation(){
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete this relationship?',
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () =>
      {
          const body = {
            relationId: this.selectedRelation.relationId
          }
          if (body.relationId){
              console.log("Delete Relation Body:" + JSON.stringify(body));
              this.personService.deleteRelationship(body).subscribe((data: any[]) => {
                console.log(data);
                this.messageService.add({
                  severity: "success",
                  summary: "Successful",
                  detail: "Relationship delete Succesfully.",
                  life: 3000
            });
            this.showRelationDialog = false;
            this.getRelations();
          },
          (error) => {
            console.log(error);
            this.messageService.add({
              severity: "error",
              summary: "Error",
              detail: error,
              life: 3000,
            });
          });
      } 
    }
    }); 
  }
  showDetail(relation: any){
    console.log("Active Row:" + JSON.stringify(relation));
    this.router.navigate(["/contactProfile"], {
      queryParams: { entityId: relation.relatedEntityId },
    });
  }

  hideRelationDialog() {
    this.showRelationDialog = false;
    this.relationForm.reset();
    this.relationSubmitted = false;
  }

  getRelationshipTypes(){
    this.personService.getRelationshipTypes()
    .subscribe((data: any[]) => {
      console.log(data);
      this.relationshipTypesData = data;
    });
  }

  filterRelationDropDownList(){
    if(this.isNewRelationRecord){
      if(!this.isPerson){
        this.relationshipTypes = this.relationshipTypesData.filter(x => x.name == 'Employee');
      }  
      else{
        this.relationshipTypes = this.relationshipTypesData.filter(x => x.name != 'Company' && x.name != 'Employee');
      }
    }
    else{
      if(!this.isPerson){
        this.relationshipTypes = this.relationshipTypesData.filter(x => x.name == 'Employee');
      }
      else{
        if(this.selectedRelation.gender == '' && this.selectedRelation.dateOfBirth == '' && this.selectedRelation.lastName == ''){
          this.relationshipTypes = this.relationshipTypesData.filter(x => x.name == 'Company');
        }
        else{
          this.relationshipTypes = this.relationshipTypesData.filter(x => x.name != 'Company' && x.name != 'Employee');
        }
      }
    }
  }

  setActiveRow(relation: any){
    this.selectedRelation = relation;
    console.log('Selected Relation:' + JSON.stringify(relation));
    if(this.selectedRelation.gender == '' && this.selectedRelation.dateOfBirth == '' && this.selectedRelation.lastName == ''){
      this.menuItems[0].items[0].disabled = true;
    }
    else{
      this.menuItems[0].items[0].disabled = false;
    }
  }

  updateRelation() {
    this.relationSubmitted = true;
    const body = {
      relationId: this.selectedRelation.relationId,
      relationshipId: this.relationForm.get('relationType').value};
      if (body.relationshipId){
        console.log("Update Relation Body:" + JSON.stringify(body));
        this.personService.updateRelationship(body).subscribe((data: any[]) => {
          console.log(data);
          this.messageService.add({
            severity: "success",
            summary: "Successful",
            detail: "Relationship updated Succesfully.",
            life: 3000
      });
      this.showRelationDialog = false;
      this.getRelations();
    },
    (error) => {
      console.log(error);
      this.messageService.add({
        severity: "error",
        summary: "Error",
        detail: error,
        life: 3000,
      });
    });
  } 
}

  getRelations(){
    this.showLoader = true;
    this.showTable = false;
    this.showSearch = false;

    this.getRelationsByEntityId(this.entityId);
  }

  getImageFromService(personId: number, counter: number) {
    this.isImageLoading = true;
  
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

  getRelationsByEntityId(entityId)
  {
    let searchParams = new HttpParams();
    searchParams = searchParams.append('entityId',  entityId);
    const opts = {params: searchParams};
    this.entityService.getRelationsByEntityId(opts).subscribe((data: any[]) =>
    {
      console.log(data);
      this.existedRelationIds=[];
      this.relations = data;
      if (this.relations.length > 0) {
        this.hasRelations= true;
        let counter = 0;
        for (var relation of this.relations) {
          this.getImageFromService(relation.relatedEntityId, counter);
          this.existedRelationIds.push(relation.relatedEntityId);
          counter++;
        }
        this.showLoader = false;
        this.showTable = true;
      }
      
    });
  }
  addRelation() {
    this.showSearch = true;
    this.showTable = false;
  }

  closeSearchControl(){
    this.showSearch = false;
    this.getRelations();
  }

  openNew() {
    this.router.navigate(["/contactDetail"], {
      queryParams: { personID: 0 },
    });
  }

  addRelationToContact(contact: any){
    console.log(contact);
    if(contact){
      this.relationContact = contact;
      this.showRelationDialog = true;
      this.isNewRelationRecord = true;
      this.filterRelationDropDownList();
    }
  }

  saveRelation() {
    this.relationSubmitted = true;
    if(this.entityId === this.relationContact.entityId)
    {
      this.messageService.add({severity: "error", summary: "Error", detail: "You can not add relation to same contact.", life: 3000 });
      return;
    }
    const body = {
      entityId: this.entityId, 
      relatedEntityId: this.relationContact.entityId, 
      relationshipId: this.relationForm.get('relationType').value};
      if (body.relationshipId){
        console.log("Add Relation Body:" + JSON.stringify(body));
        this.entityService.addRelationship(body).subscribe((data: any[]) => {
          console.log(data);
          this.messageService.add({
            severity: "success",
            summary: "Successful",
            detail: "Relationship added Succesfully.",
            life: 3000
      });
      this.showRelationDialog = false;
      this.closeSearchControl();
    },
    (error) => {
      console.log(error);
      this.messageService.add({
        severity: "error",
        summary: "Error",
        detail: error,
        life: 3000,
      });
    });
  } else {
    this.messageService.add({severity: "error", summary: "Error", detail: "Please select a contact or click cancel not to add relation", life: 3000 });
  }
}
}

