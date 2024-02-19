import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { AppMainComponent } from './app.main.component';
import { NotfoundComponent } from './shared/notfound/notfound.component';
import { ErrorComponent } from './shared/error/error.component';
import { AccessdeniedComponent } from './shared/accessdenied/accessdenied.component';
import { StaffComponent } from './components/staff/staff.component';
import { RoleComponent } from './components/role/role.component';
import { RoleMenuComponent } from './components/role-menu/role-menu.component';
import { LoginComponent } from './shared/login/login.component';
import { AuthGuard } from './helpers/auth.guard';
import { MembershipComponent } from './components/membership/membership.component';
import { SearchComponent } from './components/contact/search/search.component';
import { ContactComponent } from './components/contact/contact.component';
import { DetailComponent } from './components/contact/detail/detail.component';
import { MembershipDetailsComponent } from './components/membership/membership-details/membership-details.component';
import { SearchMemberComponent } from './components/createmembership/searchMember/search-member.component';
import { CreatemembershipComponent } from './components/createmembership/createmembership/createmembership.component';
import { GlchartofaccountsComponent } from './components/glchartofaccounts/glchartofaccounts.component';
import { BillingComponent } from './components/billing/billing.component';
import { CheckoutComponent } from './components/checkout/checkout/checkout.component';
import { PaymentComponent } from './components/checkout/payment/payment.component';
import { ShowReceiptComponent } from './components/checkout/show-receipt/show-receipt.component';
import { ManualBillingComponent } from './components/billing/manual-billing/manual-billing.component';
import { AutoBillingComponent } from './components/billing/auto-billing/auto-billing.component';
import { RecurringBillingSetupComponent } from './components/setup/recurring-billing-setup/recurring-billing-setup.component';
import { GeneralLedgerComponent } from './components/report/general-ledger/general-ledger.component';
import { CreditCardComponent } from './components/report/credit-card/credit-card.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { DepartmentComponent } from './components/department/department.component';
import { ComingSoonComponent } from './components/coming-soon/coming-soon.component';
import { ValidateUserComponent } from './shared/validate-user/validate-user.component';
import { OrganizationComponent } from './components/organization/organization.component';
import { OrganizationDetailsComponent } from './components/organization/organization-details/organization-details.component';
import { PromoCodeComponent } from './components/promo-code/promo-code.component';
import { SelfPaymentComponent } from './components/self-payment/self-payment.component';
import { SelfReceiptComponent } from './components/self-receipt/self-receipt.component';
import { InvoiceItemComponent } from './components/invoice-item/invoice-item.component';
import { InvoicingComponent } from './components/invoicing/invoicing.component';
import { MembershipReportComponent } from './components/report/membership/membership-report.component';
import { ResetPasswordComponent } from './shared/reset-password/reset-password.component';
import { DepositComponent } from './components/report/deposit/deposit.component';
import { GroupComponent } from './components/board-and-group/set-up/group/group.component';
import { GroupDetailsComponent } from './components/board-and-group/set-up/group-details/group-details.component';
import { ManageGroupComponent } from './components/board-and-group/management/manage-group/manage-group.component';
import { ManageGroupMembersComponent } from './components/board-and-group/management/manage-group-members/manage-group-members.component';
import { MemberPaymentComponent } from './components/member-payment/member-payment.component';
import { ContainerComponent } from './components/document/container/container.component';
import { FolderComponent } from './components/document/folder/folder.component';
import { UnauthorizedComponent } from './components/unauthorized/unauthorized.component';
import { EventSettingsComponent } from './components/events/event-settings/event-settings.component';
import { EventListComponent } from './components/events/event-list/event-list.component';
import { EventMainComponent } from './components/events/event-main/event-main.component';
import { QuestionBankComponent } from './components/question-bank/question-bank.component';
import { GroupRegistrationComponent } from './components/events/group-registration/group-registration.component';
import { ReportDesingerComponent } from './shared/report-desinger/report-desinger.component';
import { ContactRoleComponent } from './components/contact-role/contact-role.component';
import { CustomFieldsComponent } from './components/custom-fields/custom-fields.component';
import { ReportCategoryComponent } from './components/setup/report/report-category/report-category.component';
import { ReportEditorComponent } from './components/setup/report/report-editor/report-editor.component';
import { ReportViewerComponent } from './components/report/report-viewer/report-viewer.component';
import { EventregistrationComponent } from './components/eventregistration/eventregistration.component';
import { CreateeventregistrationComponent } from './components/eventregistration/createeventregistration/createeventregistration.component';
@NgModule({
  imports: [
    RouterModule.forRoot([
      {
        path: '', component: AppMainComponent, canActivate: [AuthGuard],
        children: [
          { path: '', component: DashboardComponent, canActivate: [AuthGuard] },
          { path: 'setup/customfields', component: CustomFieldsComponent,  },
          { path: 'contacts', component: SearchComponent, canActivate: [AuthGuard] },
          { path: 'contactProfile', component: ContactComponent, canActivate: [AuthGuard] },
          { path: 'contactDetail', component: DetailComponent, canActivate: [AuthGuard] },
          { path: 'membership/searchMember', component: SearchMemberComponent, canActivate: [AuthGuard] },
          { path: 'membership/createMembership', component: CreatemembershipComponent, canActivate: [AuthGuard] },
          { path: 'staff/staff', component: StaffComponent, canActivate: [AuthGuard] },
          { path: 'staff/role', component: RoleComponent, canActivate: [AuthGuard] },
          { path: 'staff/role-menu', component: RoleMenuComponent, canActivate: [AuthGuard] },
          { path: 'setup/membership', component: MembershipComponent, canActivate: [AuthGuard] },
          { path: 'setup/department', component: DepartmentComponent, canActivate: [AuthGuard] },
          { path: 'setup/membershipDetails', component: MembershipDetailsComponent, canActivate: [AuthGuard] },
          { path: 'setup/membershipDetails/Update', component: MembershipDetailsComponent, canActivate: [AuthGuard] },
          { path: 'setup/recurringBuilling', component: RecurringBillingSetupComponent, canActivate: [AuthGuard] },         
          { path: 'setup/glAccounts', component: GlchartofaccountsComponent, canActivate: [AuthGuard] },
          { path: 'setup/invoiceItem', component: InvoiceItemComponent, canActivate: [AuthGuard] },
          { path: 'billing/dashboard', component: BillingComponent, canActivate: [AuthGuard] },
          { path: 'billing/manual', component: ManualBillingComponent, canActivate: [AuthGuard] },
          { path: 'billing/recurring', component: AutoBillingComponent, canActivate: [AuthGuard] },
          { path: 'report/generalledger', component: GeneralLedgerComponent, canActivate: [AuthGuard] },          
          { path: 'report/creditcard', component: CreditCardComponent, canActivate: [AuthGuard] },
          { path: 'report/membership', component: MembershipReportComponent, canActivate: [AuthGuard] },
          { path: 'report/deposit', component: DepositComponent, canActivate: [AuthGuard] },          
          { path: 'report/reportList', component: ReportViewerComponent, canActivate: [AuthGuard] },          
          { path: 'checkout', component: CheckoutComponent, canActivate: [AuthGuard] },
          { path: 'payment', component: PaymentComponent, canActivate: [AuthGuard] },
          { path: 'receipt', component: ShowReceiptComponent, canActivate: [AuthGuard] },
          { path: 'events', component: ComingSoonComponent, canActivate: [AuthGuard] },
          { path: 'invoice', component: InvoicingComponent, canActivate: [AuthGuard] },
          { path: 'marketplace', component: EventSettingsComponent, canActivate: [AuthGuard] },
          { path: 'publications', component: ComingSoonComponent, canActivate: [AuthGuard] },
          { path: 'accounting', component: ComingSoonComponent, canActivate: [AuthGuard] },
          { path: 'setup/organization', component: OrganizationComponent, canActivate: [AuthGuard] },
          { path: 'setup/organizationDetails', component: OrganizationDetailsComponent, canActivate: [AuthGuard] },
          { path: 'setup/promoCode', component: PromoCodeComponent, canActivate: [AuthGuard] },
          { path: 'setup/groups', component: GroupComponent, canActivate: [AuthGuard] },
          { path: 'setup/groupsDetails', component: GroupDetailsComponent, canActivate: [AuthGuard] },
          { path: 'setup/groupsDetails/Edit', component: GroupDetailsComponent, canActivate: [AuthGuard] },
          { path: 'manage/groups', component: ManageGroupComponent, canActivate: [AuthGuard] },
          { path: 'manage/groupMembers', component: ManageGroupMembersComponent, canActivate: [AuthGuard] },
          { path: 'document/container', component: ContainerComponent, canActivate: [AuthGuard] },
          { path: 'document/folder', component: FolderComponent, canActivate: [AuthGuard] },
          { path: 'events/events', component: EventListComponent, canActivate: [AuthGuard] },
          { path: 'events/EventMain', component: EventMainComponent, canActivate: [AuthGuard] },
          { path: 'events/EventMain/Edit', component: EventMainComponent, canActivate: [AuthGuard] },
          { path: 'events/questions', component: QuestionBankComponent, canActivate: [AuthGuard] },
          { path: 'events/group-resgistration', component: GroupRegistrationComponent},
          { path: 'setup/report-desinger', component: ReportEditorComponent, canActivate: [AuthGuard] },
          { path: 'setup/report-category', component: ReportCategoryComponent, canActivate: [AuthGuard] },
          { path: 'report/report-control/:reportname/:page/:email',component:ReportDesingerComponent},
          { path: 'setup/contactRoles', component: ContactRoleComponent, canActivate: [AuthGuard] },
          { path: 'eventregistration/searchMember', component: EventregistrationComponent, canActivate: [AuthGuard] },
          { path: 'eventregistration/createeventregistration', component: CreateeventregistrationComponent, canActivate: [AuthGuard] },
        ]
      },
      { path: 'unauthorized', component: UnauthorizedComponent },
      { path: 'login', component: LoginComponent },
      { path: 'memberpayment', component: MemberPaymentComponent },
      { path: 'selfpayment', component: SelfPaymentComponent },
      { path: 'selfreceipt', component: SelfReceiptComponent },
      { path: 'error', component: ErrorComponent },
      { path: 'validate', component: ValidateUserComponent },
      { path: 'home', component: ComingSoonComponent },
      { path: 'resetpassword', component: ResetPasswordComponent },
      { path: '**', redirectTo: '/' },
    ], { scrollPositionRestoration: 'enabled', relativeLinkResolution: 'legacy' })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule
{
}
