import { Component, OnInit } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { AppBreadcrumbService } from '../../../app.breadcrumb.service';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-search-member',
  templateUrl: './search-member.component.html',
  styleUrls: ['./search-member.component.scss'],
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
export class SearchMemberComponent implements OnInit {
  constructor(private breadcrumbService: AppBreadcrumbService, private messageService: MessageService,
    private confirmationService: ConfirmationService, private router: Router, private route: ActivatedRoute) {    this.breadcrumbService.setItems([
    
    ]);
 }

  ngOnInit(): void {   
  

  }
  
  



}
