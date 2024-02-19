import { NgModule  } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { HashLocationStrategy, LocationStrategy } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TK_CONFIG, AcceptJSService } from '@openutility/acceptjs-angular-wrapper';
import { AppRoutingModule } from './app-routing.module';
import { AccordionModule } from 'primeng/accordion';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { CardModule } from 'primeng/card';
import { CarouselModule } from 'primeng/carousel';
import { ChartModule } from 'primeng/chart';
import { CheckboxModule } from 'primeng/checkbox';
import { ChipsModule } from 'primeng/chips';
import { CodeHighlighterModule } from 'primeng/codehighlighter';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import {ConfirmPopupModule} from 'primeng/confirmpopup';
import { ColorPickerModule } from 'primeng/colorpicker';
import { ContextMenuModule } from 'primeng/contextmenu';
import { DataViewModule } from 'primeng/dataview';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { FieldsetModule } from 'primeng/fieldset';
import { FileUploadModule } from 'primeng/fileupload';
import { FullCalendarModule } from 'primeng/fullcalendar';
import { GalleriaModule } from 'primeng/galleria';
import { InplaceModule } from 'primeng/inplace';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputMaskModule } from 'primeng/inputmask';
import { InputSwitchModule } from 'primeng/inputswitch';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { LightboxModule } from 'primeng/lightbox';
import { ListboxModule } from 'primeng/listbox';
import { MegaMenuModule } from 'primeng/megamenu';
import { MenuModule } from 'primeng/menu';
import { MenubarModule } from 'primeng/menubar';
import { MessagesModule } from 'primeng/messages';
import { MessageModule } from 'primeng/message';
import { MultiSelectModule } from 'primeng/multiselect';
import { OrderListModule } from 'primeng/orderlist';
import { OrganizationChartModule } from 'primeng/organizationchart';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { PaginatorModule } from 'primeng/paginator';
import { PanelModule } from 'primeng/panel';
import { PanelMenuModule } from 'primeng/panelmenu';
import { PasswordModule } from 'primeng/password';
import { PickListModule } from 'primeng/picklist';
import { ProgressBarModule } from 'primeng/progressbar';
import { RadioButtonModule } from 'primeng/radiobutton';
import { RatingModule } from 'primeng/rating';
import { RippleModule } from 'primeng/ripple';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { SelectButtonModule } from 'primeng/selectbutton';
import { SidebarModule } from 'primeng/sidebar';
import { SlideMenuModule } from 'primeng/slidemenu';
import { SliderModule } from 'primeng/slider';
import { SplitButtonModule } from 'primeng/splitbutton';
import { StepsModule } from 'primeng/steps';
import { TabMenuModule } from 'primeng/tabmenu';
import { TagModule } from 'primeng/tag';
import { TableModule } from 'primeng/table';
import { TabViewModule } from 'primeng/tabview';
import { TerminalModule } from 'primeng/terminal';
import { TieredMenuModule } from 'primeng/tieredmenu';
import { ToastModule } from 'primeng/toast';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { ToolbarModule } from 'primeng/toolbar';
import { TooltipModule } from 'primeng/tooltip';
import { TreeModule } from 'primeng/tree';
import { TreeSelectModule } from 'primeng/treeselect';
import { TreeTableModule } from 'primeng/treetable';
import { VirtualScrollerModule } from 'primeng/virtualscroller';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { DividerModule } from 'primeng/divider';
import { EditorModule } from 'primeng/editor';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { SkeletonModule } from 'primeng/skeleton';
import { AppCodeModule } from './app.code.component';
import { AppComponent } from './app.component';
import { AppMainComponent } from './app.main.component';
import { AppConfigComponent } from './app.config.component';
import { AppMenuComponent } from './app.menu.component';
import { AppMenuitemComponent } from './app.menuitem.component';
import { AppBreadcrumbComponent } from './app.breadcrumb.component';
import { AppTopBarComponent } from './app.topbar.component';
import { AppFooterComponent } from './app.footer.component';
import { MenuService } from './app.menu.service';
import { AppBreadcrumbService } from './app.breadcrumb.service';
import { ErrorComponent } from './shared/error/error.component';
import { AccessdeniedComponent } from './shared/accessdenied/accessdenied.component';
import { NotfoundComponent } from './shared/notfound/notfound.component';
import { StaffComponent } from './components/staff/staff.component';
import { StaffService } from './services/staff.service';
import { RoleComponent } from './components/role/role.component';
import { RoleService } from './services/role.service';
import { RoleMenuComponent } from './components/role-menu/role-menu.component';
import { RoleMenuService } from './services/role-menu.service';
import { LoginComponent } from './shared/login/login.component';
import { MembershipComponent } from './components/membership/membership.component';
import { MembershipService } from './services/membership.service';
import { SearchComponent } from './components/contact/search/search.component';
import { ContactComponent } from './components/contact/contact.component';
import { ProfileComponent } from './components/contact/profile/profile.component';
import { DetailComponent } from './components/contact/detail/detail.component';
import { AddressComponent } from './shared/address/address.component';
import { EmailComponent } from './shared/email/email.component';
import { PhoneComponent } from './shared/phone/phone.component';
import { FeesComponent } from './shared/fees/fees.component';
import { InvoicesComponent } from './components/contact/invoices/invoices.component';
import { WebComponent } from './components/contact/web/web.component';
import { CommunicationComponent } from './components/contact/communication/communication.component';
import { RelationsComponent } from './components/contact/relations/relations.component';
import { ImageService } from './services/image.service';
import { MembershipDetailsComponent } from './components/membership/membership-details/membership-details.component';
import { SearchMemberComponent } from './components/createmembership/searchMember/search-member.component';
import { CreatemembershipComponent } from './components/createmembership/createmembership/createmembership.component';
import { SearchMembershipComponent } from './components/createmembership/search-membership/search-membership.component';
import { SelectFeesComponent } from './components/createmembership/select-fees/select-fees.component';
import { AuthService } from './services/auth.service';
import { JwtInterceptor } from './helpers/jwt.interceptor';
import { ErrorInterceptor } from './helpers/error.interceptor';
import { LookupService } from './services/lookup.service';
import { PersonService } from './services/person.service';
import { GlchartofaccountsComponent } from './components/glchartofaccounts/glchartofaccounts.component';
import { BillingComponent } from './components/billing/billing.component';
import { MembershipInfoComponent } from './components/contact/membership-info/membership-info.component';
import { ImageLoaderComponent } from './shared/image-loader/image-loader.component';
import { AddMemberComponent } from './components/createmembership/add-member/add-member.component';
import { ReviewComponent } from './components/createmembership/review/review.component';
import { InvoiceComponent } from './components/createmembership/invoice/invoice.component';
import { BillingOverviewComponent } from './components/billing/billing-overview/billing-overview.component';
import { BillingUpcomingComponent } from './components/billing/billing-upcoming/billing-upcoming.component';
import { BillingLastComponent } from './components/billing/billing-last/billing-last.component';
import { BillingReceivablesComponent } from './components/billing/billing-receivables/billing-receivables.component';
import { LastBillingMembershipTypeComponent } from './shared/charts/last-billing-membership-type/last-billing-membership-type.component';
import { LastBillingOutstandingComponent } from './shared/charts/last-billing-outstanding/last-billing-outstanding.component';
import { LastBillingSuccessComponent } from './shared/charts/last-billing-success/last-billing-success.component';
import { ShowInvoiceComponent } from './components/createmembership/show-invoice/show-invoice.component';
import { FieldErrorDisplayComponent } from './shared/field-error-display-component/field-error-display-component.component';
import { CheckoutComponent } from './components/checkout/checkout/checkout.component';
import { PaymentComponent } from './components/checkout/payment/payment.component';
import { ShowReceiptComponent } from './components/checkout/show-receipt/show-receipt.component';
import { DatePipe } from '@angular/common';
import { ManualBillingComponent } from './components/billing/manual-billing/manual-billing.component';
import { AutoBillingComponent } from './components/billing/auto-billing/auto-billing.component';
import { VersionComponent } from './shared/version/version.component';
import { RecurringBillingSetupComponent } from './components/setup/recurring-billing-setup/recurring-billing-setup.component';
import { GeneralLedgerComponent } from './components/report/general-ledger/general-ledger.component';
import { CreditCardComponent } from './components/report/credit-card/credit-card.component';
import { PrintInvoiceComponent } from './shared/print-invoice/print-invoice.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { DepartmentComponent } from './components/department/department.component';
import { ProgressComponentComponent } from './shared/progress-component/progress-component.component';
import { ComingSoonComponent } from './components/coming-soon/coming-soon.component';
import { LoadingComponent } from './shared/loading/loading.component';
import { ValidateUserComponent } from './shared/validate-user/validate-user.component';
import { AcceptJSEcheckService } from './services/acceptjs.service';
import { OrganizationComponent } from './components/organization/organization.component';
import { OrganizationDetailsComponent } from './components/organization/organization-details/organization-details.component';
import { NoteComponent } from './components/contact/note/note.component';
import { PrimeNGCorrectionService } from './services/prime-ngcorrection.service';
import { PromoCodeComponent } from './components/promo-code/promo-code.component';
import { SelfPaymentComponent } from './components/self-payment/self-payment.component';
import { SelfReceiptComponent } from './components/self-receipt/self-receipt.component';
import { AvatarModule } from 'primeng/avatar';
import { InvoiceItemComponent } from './components/invoice-item/invoice-item.component';
import { SafePipe } from './helpers/safepipe';
import { LineItemComponent } from './shared/line-item/line-item.component';
import { InvoicingComponent } from './components/invoicing/invoicing.component';
import { MembershipReportComponent } from './components/report/membership/membership-report.component';
import { ReportFilterComponent } from './shared/report-filter/report-filter.component';
import { ReportColumnComponent } from './shared/report-column/report-column.component';
import { StandardReportComponent } from './shared/standard-report/standard-report.component';
import { MyReportComponent } from './shared/my-report/my-report.component';
import { SharedReportComponent } from './shared/shared-report/shared-report.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { ReportSortComponent } from './shared/report-sort/report-sort.component';
import { EditInvoiceComponent } from './shared/edit-invoice/edit-invoice.component';
import { GeneralEditInvoiceComponent } from './shared/general-edit-invoice/general-edit-invoice.component';
import { ResetPasswordComponent } from './shared/reset-password/reset-password.component';
import { DepositComponent } from './components/report/deposit/deposit.component';
import { GroupComponent } from './components/board-and-group/set-up/group/group.component';
import { GroupDetailsComponent } from './components/board-and-group/set-up/group-details/group-details.component';
import { ManageGroupComponent } from './components/board-and-group/management/manage-group/manage-group.component';
import { ManageGroupMembersComponent } from './components/board-and-group/management/manage-group-members/manage-group-members.component';
import { BadgeModule } from 'primeng/badge';
import { GroupsCRMComponent } from './components/contact/groups-crm/groups-crm.component';
import { EwalletComponent } from './components/contact/ewallet/ewallet.component';
import { MerchantConfig } from './app.merchant-config';
import { LoggerService } from './services/logger-service';
import { GroupRoleComponent } from './shared/group-role/group-role.component';
import { ContainerComponent } from './components/document/container/container.component';
import { FolderComponent } from './components/document/folder/folder.component';
import { SplitterModule } from "primeng/splitter";
import {NgxFilesizeModule} from 'ngx-filesize';
import { FileIconsModule } from "ngx-file-icons";
import { TagComponent } from './shared/tag/tag.component';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { UnauthorizedComponent } from './components/unauthorized/unauthorized.component';
import { EventSetUpComponent } from './components/events/event-set-up/event-set-up.component';
import { EventListComponent } from './components/events/event-list/event-list.component';
import { EventMainComponent } from './components/events/event-main/event-main.component';
import { EventSummaryComponent } from './components/events/event-summary/event-summary.component';
import { EventSettingsComponent } from './components/events/event-settings/event-settings.component';
import { EventSessionsComponent } from './components/events/event-sessions/event-sessions.component';
import { EventQuestionsComponent } from './components/events/event-questions/event-questions.component';
import { QuestionBankComponent } from './components/question-bank/question-bank.component';
import { ImageModule } from 'primeng/image';
import { ChipModule } from 'primeng/chip';
import { GroupRegistrationComponent } from './components/events/group-registration/group-registration.component';
import { ClipboardModule } from 'ngx-clipboard';
import { PdfJsViewerModule } from 'ng2-pdfjs-viewer';
import { AutoFocusDirective } from './diectives/auto-focus.directive'; 
import { TelerikReportingModule } from '@progress/telerik-angular-report-viewer';
import { ReportDesingerComponent } from './shared/report-desinger/report-desinger.component';
import { ShowEditInvoiceRecepitComponent } from './shared/show-edit-invoice-recepit/show-edit-invoice-recepit.component';
import { ContactRoleComponent } from './components/contact-role/contact-role.component';
import { EditContactRoleComponent } from './shared/edit-contact-role/edit-contact-role.component';
import { ImageCropperModule } from 'ngx-image-cropper';
import { AccountContactComponent } from './components/contact/account-contact/account-contact.component';
import { SearchContactRoleComponent } from './shared/search-contact-role/search-contact-role.component';
import { ReportCategoryComponent } from './components/setup/report/report-category/report-category.component';
import { ReportEditorComponent } from './components/setup/report/report-editor/report-editor.component';
import { ReportViewerComponent } from './components/report/report-viewer/report-viewer.component';
import { RolesComponent } from './components/contact/roles/roles.component';
import { CustomFieldsComponent } from './components/custom-fields/custom-fields.component';
import { RoleHistoryComponent } from './components/contact/role-history/role-history.component';
import { EventregistrationComponent } from './components/eventregistration/eventregistration.component';
import { CreateeventregistrationComponent } from './components/eventregistration/createeventregistration/createeventregistration.component';
import { EventselectionComponent } from './components/eventregistration/eventselection/eventselection.component';
import { EventsessionComponent } from './components/eventregistration/eventsession/eventsession.component';
import { EventquestionComponent } from './components/eventregistration/eventquestion/eventquestion.component';
import { EventreviewComponent } from './components/eventregistration/eventreview/eventreview.component';
import { EventinvoiceComponent } from './components/eventregistration/eventinvoice/eventinvoice.component';
import { ContactActivityComponent } from './components/contact/contact-activity/contact-activity.component';

@NgModule({
    imports: [
        BrowserModule,
        FormsModule,
        ReactiveFormsModule,
        AppRoutingModule,
        HttpClientModule,
        BrowserAnimationsModule,
        AccordionModule,
        AutoCompleteModule,
        BreadcrumbModule,
        ButtonModule,
        CalendarModule,
        CardModule,
        CarouselModule,
        ChartModule,
        CheckboxModule,
        ChipsModule,
        CodeHighlighterModule,
        ConfirmDialogModule,
        ConfirmPopupModule,
        ColorPickerModule,
        ContextMenuModule,
        DataViewModule,
        DialogModule,
        DropdownModule,
        EditorModule,
        FieldsetModule,
        FileUploadModule,
        FullCalendarModule,
        GalleriaModule,
        InplaceModule,
        InputNumberModule,
        InputMaskModule,
        InputSwitchModule,
        InputTextModule,
        InputTextareaModule,
        LightboxModule,
        ListboxModule,
        MegaMenuModule,
        MenuModule,
        MenubarModule,
        MessageModule,
        MessagesModule,
        MultiSelectModule,
        OrderListModule,
        OrganizationChartModule,
        OverlayPanelModule,
        PaginatorModule,
        PanelModule,
        PanelMenuModule,
        PasswordModule,
        PickListModule,
        ProgressBarModule,
        ProgressSpinnerModule,
        DividerModule,
        RadioButtonModule,
        RatingModule,
        RippleModule,
        ScrollPanelModule,
        SelectButtonModule,
        SidebarModule,
        SlideMenuModule,
        SliderModule,
        SplitButtonModule,
        StepsModule,
        TableModule,
        TabMenuModule,
        TabViewModule,
        TerminalModule,
        TieredMenuModule,
        ToastModule,
        ToggleButtonModule,
        ToolbarModule,
        TooltipModule,
        TreeModule,
        TreeTableModule,
        VirtualScrollerModule,
        AppCodeModule,
        TagModule,
        FontAwesomeModule,
        SkeletonModule,
        AvatarModule,
        DragDropModule,
        TreeSelectModule,
        BadgeModule,
        SplitterModule,
        NgxFilesizeModule,
        FileIconsModule,
        PdfViewerModule,
        ImageModule,
        ChipModule,
        ClipboardModule,
        PdfJsViewerModule,
        ImageCropperModule,
        TelerikReportingModule        
    ],
    declarations: [
        AppComponent,
        AppMainComponent,
        AppConfigComponent,
        AppMenuComponent,
        AppMenuitemComponent,
        AppBreadcrumbComponent,
        AppTopBarComponent,
        AppFooterComponent,
        ErrorComponent,
        AccessdeniedComponent,
        NotfoundComponent,
        StaffComponent,
        RoleComponent,
        RoleMenuComponent,
        LoginComponent,
        MembershipComponent,
        SearchComponent,
        ContactComponent,
        ProfileComponent,
        DetailComponent,
        AddressComponent,
        EmailComponent,
        PhoneComponent,
        FeesComponent,
        InvoicesComponent,
        WebComponent,
        CommunicationComponent,
        RelationsComponent,
        MembershipDetailsComponent,
        SearchMemberComponent,
        CreatemembershipComponent,
        SearchMembershipComponent,
        SelectFeesComponent,
        GlchartofaccountsComponent,
        BillingComponent,
        MembershipInfoComponent,
        ImageLoaderComponent,
        AddMemberComponent,
        ReviewComponent,
        InvoiceComponent,
        BillingOverviewComponent,
        BillingUpcomingComponent,
        BillingLastComponent,
        BillingReceivablesComponent,
        LastBillingMembershipTypeComponent,
        LastBillingOutstandingComponent,
        LastBillingSuccessComponent,
        ShowInvoiceComponent,
        FieldErrorDisplayComponent,
        ShowInvoiceComponent,
        CheckoutComponent,
        PaymentComponent,
        ShowReceiptComponent,
        ManualBillingComponent,
        AutoBillingComponent,
        VersionComponent,
        RecurringBillingSetupComponent,
        GeneralLedgerComponent,
        CreditCardComponent,
        PrintInvoiceComponent,
        DashboardComponent,
        DepartmentComponent,
        ProgressComponentComponent,
        ComingSoonComponent,
        LoadingComponent,
        ValidateUserComponent,
        OrganizationComponent,
        OrganizationDetailsComponent,
        NoteComponent,
        PromoCodeComponent,
        SelfPaymentComponent,
        SelfReceiptComponent,
        InvoiceItemComponent,
        SafePipe,
        LineItemComponent,
        InvoicingComponent,
        MembershipReportComponent,
        ReportFilterComponent,
        ReportColumnComponent,
        StandardReportComponent,
        MyReportComponent,
        SharedReportComponent,
        ReportSortComponent,
        EditInvoiceComponent,
        GeneralEditInvoiceComponent,
        ResetPasswordComponent,
        GroupComponent,
        DepositComponent,
        GroupDetailsComponent,
        ManageGroupComponent,
        ManageGroupMembersComponent,
        GroupsCRMComponent,
        EwalletComponent,
        ContainerComponent,
        FolderComponent,
        GroupRoleComponent,
        TagComponent,
        UnauthorizedComponent,
        EventSetUpComponent,
        EventListComponent,
        EventMainComponent,
        EventSummaryComponent,
        EventSettingsComponent,
        EventSessionsComponent,
        EventQuestionsComponent,
        QuestionBankComponent,
        GroupRegistrationComponent,
        AutoFocusDirective,
        ReportDesingerComponent,
        ShowEditInvoiceRecepitComponent,
        ContactRoleComponent,
        SearchContactRoleComponent,
        AccountContactComponent,
        EditContactRoleComponent,
        ReportCategoryComponent,
        ReportEditorComponent,
        ReportViewerComponent,
        AccountContactComponent,
        SearchContactRoleComponent,
        RolesComponent,
        CustomFieldsComponent,
        RoleHistoryComponent,
        EventregistrationComponent,
        CreateeventregistrationComponent,
        EventselectionComponent,
        EventsessionComponent,
        EventquestionComponent,
        EventreviewComponent,
        EventinvoiceComponent,
        ContactActivityComponent
    ],
    providers: [
        { provide: LocationStrategy, useClass: HashLocationStrategy },
        MenuService, AppBreadcrumbService, StaffService, RoleService, RoleMenuService,
        MembershipService, ImageService, AuthService, LookupService, PersonService, DatePipe, PrimeNGCorrectionService,LoggerService,
        { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
        { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
        //{ provide: ErrorHandler, useClass: ErrorLogger},
        { provide: TK_CONFIG, useFactory:MerchantConfig}, AcceptJSService,AcceptJSEcheckService
    ],
    bootstrap: [AppComponent]
})
export class AppModule {
}
