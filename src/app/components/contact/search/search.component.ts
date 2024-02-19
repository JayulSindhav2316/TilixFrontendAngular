import { Component, OnInit, Input, ViewChild } from "@angular/core";
import { ConfirmationService, MenuItem, MessageService } from "primeng/api";
import { AppBreadcrumbService } from "../../../app.breadcrumb.service";
import { Router, ActivatedRoute } from "@angular/router";
import { Output, EventEmitter } from "@angular/core";
import { CreateMembership } from "src/app/models/create-membership";
import { HttpParams } from "@angular/common/http";
import { PersonService } from "../../../services/person.service";
import { MembershipSession } from "../../../models/membership-session";
import {
    FormBuilder,
    Validators,
    FormGroup,
    FormControl,
} from "@angular/forms";
import { LookupService } from "../../../services/lookup.service";
import { stringify } from "@angular/compiler/src/util";
import { CompanyService } from "../../../services/company.service";
import { ThisReceiver } from "@angular/compiler";
import { EntityService } from "../../../services/entity.service";
import { ConfigurationService } from "../../../services/configuration.service";
import { User } from "src/app/models/user";
import { AuthService } from "../../../services/auth.service";
@Component({
    selector: "app-search",
    templateUrl: "./search.component.html",
    styleUrls: ["./search.component.scss"],
    styles: [
        `
            @media screen and (max-width: 960px) {
                :host
                    ::ng-deep
                    .p-datatable
                    .p-datatable-tbody
                    > tr
                    > td:last-child {
                    text-align: center;
                }

                :host
                    ::ng-deep
                    .p-datatable
                    .p-datatable-tbody
                    > tr
                    > td:nth-child(6) {
                    display: flex;
                }
            }
        `,
    ],
    providers: [MessageService, ConfirmationService],
})
export class SearchComponent implements OnInit {
    @Input() parentControl: string;
    @Input() memberGroupId: number = 0;
    @Input() exceptMemberIds: any[] = null;
    @Input() parentEntityId: number;
    @Input() showCompany: boolean = true;
    @Output() closeEvent = new EventEmitter<string>();
    @Output() addMemberEvent = new EventEmitter<{
        additionalEntityId: number;
        isDuplicatePerson: boolean;
    }>();
    @Output() addBillableContactEvent = new EventEmitter<{
        billableContactId: number;
    }>();
    @Output() createInvoiceEvent = new EventEmitter<{
        billableEntityId: number;
    }>();
    @Output() addMemberToGroupEvent = new EventEmitter<{
        personId: number;
        entityId: number;
        name: string;
    }>();
    @Output() addRelationToContact = new EventEmitter<any>();

    searchList: any[];
    searchTypeList: any[];
    showPersonTable: boolean;
    showCompanyTable: boolean;
    showLoader: boolean;
    configuration: any;
    currentUser: User;
    selectedSearch: { name: string; code: string };
    selectedRelation: { name: string; code: string };
    selectedSearchType: { name: string; code: string };
    public cols: any[];
    public contacts: any[] = [];
    additionalContact: any;
    selectedContact: any;
    showControlButtons: boolean;
    items: MenuItem[];
    lastName: string;
    firstName: string;
    images : {[index: number]: [any]} = {};
    isImageLoading: boolean;
    public personImage: any = [];
    email: string;
    phone: string;
    contact: any;
    companyName: string;
    showAddButton: boolean;
    showCancelButton: boolean;
    relations: any[];
    searchMemberRoute: boolean;
    selectedEntityId: number;
    showViewButton: boolean;
    additionalEntityId: number;
    isDuplicatePerson: boolean;
    searchCompany: boolean;
    quickSearch: boolean;
    quickSerachParameter: string;
    quickSerachText: string;
    membershipSession: MembershipSession;
    toRemoveDuplicateAdditionalPerson: Array<number> = [];
    newMembershipData: CreateMembership;
    addGroupMember: boolean = false;

    allowSearch: boolean;
    isAdditionalMemberAdd: boolean;
    isBillableContactAdd: boolean;
    showMembershipType: boolean;
    showTitle: boolean;

    searchByNameForm: FormGroup;
    searchByEmailForm: FormGroup;
    searchByPhoneForm: FormGroup;
    searchCompanyForm: FormGroup;

    mainMemberId: number;
    companyList: any[] = [];
    company: any;
    showAddRelation: boolean;
    submitted: boolean;
    relationSubmitted: boolean;
    addErrorMessages: any = {};
    showCreateInvoiceButton: boolean;
    relationForm = this.fb.group({
        relationType: ["", Validators.required],
    });
    historyData: any;
    isEventRegistration : boolean = false;

    constructor(
        private breadcrumbService: AppBreadcrumbService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
        private router: Router,
        private personService: PersonService,
        private lookupService: LookupService,
        private fb: FormBuilder,
        private fbp: FormBuilder,
        private fbe: FormBuilder,
        private route: ActivatedRoute,
        private entityService: EntityService,
        private authService: AuthService,
        private companyService: CompanyService,
        private configurationService: ConfigurationService
    ) {
        if (this.router.url.includes("/contacts")) {
            this.breadcrumbService.setItems([
                { label: "Home" },
                { label: "Contacts-CRM" },
                { label: "Profile" },
                { label: "Search Contact" },
            ]);
            this.isEventRegistration = false;
        }
        if (this.router.url.includes("/membership/searchMember")) {
            this.breadcrumbService.setItems([
                { label: "Home" },
                { label: "Contacts-CRM" },
                { label: "Membership" },
                { label: "Search Contact" },
            ]);
            this.isEventRegistration = false;
        }
        if (this.router.url.includes("/eventregistration/searchMember")) {
            this.breadcrumbService.setItems([
                { label: "Home" },
                { label: "Event Registration" },
                { label: "Search Contact" },
            ]);
            this.isEventRegistration = true;
        }

        this.searchList = [
            { name: "Name", code: "Name" },
            { name: "Email", code: "Email" },
            { name: "Phone", code: "Phone" },
        ];

        this.searchCompany = false;
        this.showCreateInvoiceButton = false;
        this.quickSearch = false;
        this.showMembershipType = false;
        this.showTitle = true;
    }

    ngOnInit(): void {
        let user = JSON.parse(localStorage.getItem('currentUser'));
        localStorage.removeItem('ActiveRole');
        this.currentUser = user;
        this.membershipSession = JSON.parse(
            localStorage.getItem("NewMembershipSession")
        );
        if (this.membershipSession) {
            if (
                this.showCompany == false ||
                this.parentControl === "additionalMembersControl"
            ) {
                this.searchTypeList = [{ name: "People", code: "People" }];
            } else {
                this.searchTypeList = [
                    { name: "People", code: "People" },
                    { name: this.currentUser.accountName, code: this.currentUser.accountName },
                ];
            }
        } else {
            if (this.showCompany === false) {
                this.searchTypeList = [{ name: "People", code: "People" }];
            } else {
                this.searchTypeList = [
                    { name: "People", code: "People" },
                    { name: this.currentUser.accountName, code: this.currentUser.accountName },
                ];
            }
        }

        this.selectedSearch = { name: "Name", code: "Name" };
        this.selectedSearchType = { name: "People", code: "People" };

        let currentSearchType = JSON.parse(
            localStorage.getItem("CurrentSearchType")
        );
        if (currentSearchType) {
            this.selectedSearchType = currentSearchType;
        }
        this.route.queryParams.subscribe((params) => {
            this.quickSerachParameter = params["quickSearch"];
            if (this.quickSerachParameter) {
                if (this.quickSerachParameter.length > 0) {
                    this.quickSerachText = this.quickSerachParameter;
                    console.log(
                        "Quick Search:" + JSON.stringify(this.quickSerachText)
                    );
                    this.selectedSearchType.name = "People";
                    this.searchBytext();
                }
            }
        });

        console.log("Current Search Type:" + JSON.stringify(currentSearchType));
        if (this.selectedSearchType.name === "People") {
            this.searchCompany = false;
        } else {
            this.searchCompany = true;
        }
        if (!this.parentEntityId) {
            this.parentEntityId = 0;
        }

        this.showPersonTable = false;
        this.showCompanyTable = false;
        this.showLoader = false;
        this.showAddButton = true;
        this.showCancelButton = false;
        this.isAdditionalMemberAdd = false;
        this.searchMemberRoute = false;
        this.showViewButton = false;
        this.showAddRelation = false;
        this.searchByEmailForm = this.fbe.group({
            Email: ["", [Validators.required, Validators.email]],
        });
        this.searchByPhoneForm = this.fbp.group({
            Phone: ["", Validators.required],
        });
        this.searchCompanyForm = this.fbe.group({
            CompanyName: ["", Validators.required],
        });
        console.log("Parent Control:" + this.parentControl);

        if (this.parentControl === "Relations") {
            this.showAddButton = false;
            this.showCancelButton = true;
            this.showViewButton = true;
            this.showAddRelation = true;
        }
        if (this.parentControl === "Company") {
            this.showAddButton = false;
            this.showCancelButton = true;
            this.showViewButton = true;
            this.isBillableContactAdd = true;
            this.searchTypeList = [{ name: "People", code: "People" }];
        }
        if (this.parentControl === "Invoice") {
            this.showAddButton = false;
            this.showCancelButton = false;
            this.showViewButton = false;
            this.isBillableContactAdd = false;
            this.showCreateInvoiceButton = true;
        }
        if (this.parentControl === "Groups") {
            this.showAddButton = false;
            this.showCancelButton = true;
            this.showViewButton = false;
            this.isBillableContactAdd = false;
            this.addGroupMember = true;
            this.searchTypeList = [{ name: "People", code: "People" }];
        }
        if (
            (this.router.url.includes("/searchMember") ||
            this.router.url.includes("/createMembership")) && 
            (!this.router.url.includes("/eventregistration"))
        ) {
            this.searchMemberRoute = true;
            this.showAddButton = false;
        }
        if (this.parentControl === "additionalMembersControl") {
            this.searchMemberRoute = false;
            this.isAdditionalMemberAdd = true;
            this.showAddButton = false;
            this.showCancelButton = true;
        }
        if(this.parentControl === "eventRegistration")
        {
            this.searchMemberRoute = false;
            this.isAdditionalMemberAdd = false;
            this.showAddButton = false;
            this.showCancelButton = false;
            this.isEventRegistration = true;
        }
        this.searchByNameForm = this.fb.group({
            FirstName: ["", [Validators.required, Validators.minLength(3)]],
            LastName: ["", [Validators.required, Validators.minLength(3)]],
        });

        this.route.queryParams.subscribe((params) => {
            this.mainMemberId = params["entityId"];
        });
        this.getConfiguration(this.currentUser.organizationId);
    }

    getConfiguration(organizationId) {
        this.configurationService
            .getConfigurationByOrganizationId(organizationId)
            .subscribe((data: any) => {
                console.log("Configuration:" + JSON.stringify(data));
                this.configuration = data;

                //Show hide tabs
                console.log(
                    "Configuration Display Tabs:" +
                    JSON.stringify(
                        this.configuration.contactDisplayMembership
                    )
                );
                if (this.configuration.contactDisplayMembership === 0) {
                    this.showTitle = true;
                    this.showMembershipType = false;
                } else {
                    this.showTitle = false;
                    this.showMembershipType = true;
                }
            });
    }

    serachPersons() {
        this.showPersonTable = false;
        this.showCompanyTable = false;
        this.showLoader = false;
        this.submitted = true;

        this.selectedSearchType = { name: "People", code: "People" };

        localStorage.setItem(
            "CurrentSearchType",
            JSON.stringify(this.selectedSearchType)
        );
        localStorage.setItem(
            "CurrentSearch",
            JSON.stringify(this.selectedSearch)
        );
        if (this.selectedSearch.name === "Name") {
            this.firstName = this.searchByNameForm.get("FirstName").value;
            this.lastName = this.searchByNameForm.get("LastName").value;
            if (this.firstName.trim() != "" && this.lastName.trim() == "")
                this.searchByNameForm.get("LastName").setErrors(null);
            else if (this.firstName.trim() == "" && this.lastName.trim() != "")
                this.searchByNameForm.get("FirstName").setErrors(null);
            else if (
                this.firstName.trim() == "" &&
                this.lastName.trim() == ""
            ) {
                this.searchByNameForm
                    .get("FirstName")
                    .setErrors({ required: true });
                this.searchByNameForm
                    .get("LastName")
                    .setErrors({ required: true });
            } else if (
                (this.firstName.length >= 3 && this.lastName.length < 3) ||
                (this.firstName.length < 3 && this.lastName.length >= 3)
            ) {
                this.searchByNameForm.get("FirstName").setErrors(null);
                this.searchByNameForm.get("LastName").setErrors(null);
            } else if (this.firstName.length < 3 && this.lastName.length < 3) {
                this.searchByNameForm
                    .get("FirstName")
                    .setErrors({ minlength: true });
                this.searchByNameForm
                    .get("LastName")
                    .setErrors({ minlength: true });
            }

            if (this.searchByNameForm.valid) {
                let searchParams = new HttpParams();
                searchParams = searchParams.append("firstName", this.firstName);
                searchParams = searchParams.append("lastName", this.lastName);
                searchParams = searchParams.append("exceptedPersonsGroupId", this.memberGroupId);
                if (this.exceptMemberIds != null && this.exceptMemberIds.length > 0) {
                    let selectedMemberIds = this.exceptMemberIds.toString();
                    searchParams = searchParams.append("exceptMemberIds", JSON.stringify(this.exceptMemberIds));
                }
                const opts = { params: searchParams };
                this.getPersonsByFirstAndLastName(opts);
                console.log("form submitted");
                this.showLoader = true;
            } else {
                this.messageService.add({
                    severity: "info",
                    summary: "Enter required data",
                    detail: "Please entered minimum required information for search.",
                    life: 3000,
                });
            }
        } else if (this.selectedSearch.name === "Email") {
            if (this.searchByEmailForm.valid) {
                let searchParams = new HttpParams();
                this.email = this.searchByEmailForm.get("Email").value;
                searchParams = searchParams.append("emailAddreess", this.email);
                searchParams = searchParams.append("exceptedPersonsGroupId", this.memberGroupId);
                if (this.exceptMemberIds != null && this.exceptMemberIds.length > 0) {
                    let selectedMemberIds = this.exceptMemberIds.toString();
                    searchParams = searchParams.append("exceptMemberIds", JSON.stringify(this.exceptMemberIds));
                }
                const opts = { params: searchParams };
                this.getPersonsByEmail(opts);
                console.log("form submitted");
                this.showLoader = true;
            } else {
                this.messageService.add({
                    severity: "info",
                    summary: "Enter required data",
                    detail: "Please entered minimum required information for search.",
                    life: 3000,
                });
            }
        } else if (this.selectedSearch.name === "Phone") {
            if (this.searchByPhoneForm.valid) {
                let searchParams = new HttpParams();
                this.phone = this.searchByPhoneForm.get("Phone").value;
                searchParams = searchParams.append("phoneNumber", this.phone);
                searchParams = searchParams.append("exceptedPersonsGroupId", this.memberGroupId);
                if (this.exceptMemberIds != null && this.exceptMemberIds.length > 0) {
                    let selectedMemberIds = this.exceptMemberIds.toString();
                    searchParams = searchParams.append("exceptMemberIds", JSON.stringify(this.exceptMemberIds));
                }
                const opts = { params: searchParams };
                this.getPersonsByPhone(opts);
                console.log("form submitted");
            } else {
                this.messageService.add({
                    severity: "info",
                    summary: "Enter required data",
                    detail: "Please entered minimum required information for search.",
                    life: 3000,
                });
            }
        }
    }

    showDetails(selectedContact: any) {
        console.log("Active Row:" + selectedContact.entityId);
        this.contact = selectedContact;
        this.router.navigate(["/contactProfile"], {
            queryParams: { entityId: this.contact.entityId },
        });
    }
    
    openNew() {
        if (this.router.url.includes("/contactProfile?entityId") && this.parentControl != "Company") {
            const contactId = this.route.snapshot.queryParamMap.get("entityId");
            this.router.navigate(["/contactDetail"], {
                queryParams: { relatedContactforID: contactId },
            });
        } else {
            if (this.searchCompany) {
                if (this.searchMemberRoute) {
                    this.router.navigate(["/contactDetail"], {
                        queryParams: { action: "addCompanyMember" },
                    });
                } else {
                    this.router.navigate(["/contactDetail"], {
                        queryParams: { action: "addCompanyContact" },
                    });
                }
            } else if (this.parentControl == "Company") {
                const contactId = this.route.snapshot.queryParamMap.get("entityId");
                this.router
                    .navigateByUrl("/", { skipLocationChange: true })
                    .then(() => {
                        this.router.navigate(["/contactDetail"], {
                            queryParams: {
                                action: "addCompanyBillableContact",
                                billableContactforID: contactId
                            },
                        });
                    });
            } 
            else if (this.parentControl == "eventRegistration") {
                const contactId = this.route.snapshot.queryParamMap.get("entityId");
                this.router
                    .navigateByUrl("/", { skipLocationChange: true })
                    .then(() => {
                        this.router.navigate(["/contactDetail"], {
                            queryParams: {
                                action: "addEventRegisterContact"
                            },
                        });
                    });
            }
            else {
                this.router.navigate(["/contactDetail"], {
                    queryParams: { action: "addContact" },
                });
            }
        }
    }

    cancelContactSearch() {
        if (
            this.parentControl === "Relations" ||
            this.parentControl === "Company" ||
            this.parentControl === "Groups" ||
            this.parentControl === "additionalMembersControl"
        ) {
            this.closeSearchControl(this.parentControl);
        }
    }
    closeSearchControl(value: string) {
        this.closeEvent.emit(value);
        console.log("Closing Control from ->:" + value);
    }

    cancelInvoiceSerach() {
        if (this.parentControl === "Invoice") {
            this.closeSearchControl(this.parentControl);
        }
    }

    addMembership(contact: any) {
        this.contact = contact;
        this.newMembershipData = { entityId: contact.entityId };
        const jsonData = JSON.stringify(this.newMembershipData);
        localStorage.setItem("NewMembershipEntity", jsonData);

        this.router.navigate(["membership/createMembership"], {
            queryParams: { entityId: this.contact.entityId },
        });
        this.selectedEntityId = this.contact.entityId;

        this.searchMemberRoute = true;
        this.showAddButton = false;
    }

    addCompanyMembership(company: any) {
        this.company = company;
        this.newMembershipData = { entityId: company.entityId };
        const jsonData = JSON.stringify(this.newMembershipData);
        localStorage.setItem("NewMembershipEntity", jsonData);

        this.router.navigate(["membership/createMembership"], {
            queryParams: { entityId: this.company.entityId },
        });
        this.selectedEntityId = this.company.entityId;

        this.searchMemberRoute = true;
        this.showAddButton = false;
    }

    deleteSelectedContact() {
        console.log(
            "Deleting selected records:" + JSON.stringify(this.selectedContact)
        );
        this.confirmationService.confirm({
            message: "Are you sure that you want to perform this action?",
            accept: () => {
                // call Delete Service
                const body = {
                    PersonId: this.selectedContact.personId,
                };
                console.log("Deleting Contact:" + JSON.stringify(body));
                this.personService.deletePerson(body).subscribe(
                    (response) => {
                        this.messageService.add({
                            severity: "success",
                            summary: "Successful",
                            detail: "Contact(s) deleted succesfully.",
                            life: 3000,
                        });
                        // remove from current list
                        this.contacts = this.contacts.filter(
                            (obj) => obj !== this.selectedContact
                        );
                    },
                    (error) => {
                        console.log(error);
                        this.messageService.add({
                            severity: "error",
                            summary: "Error",
                            detail: error,
                            life: 3000,
                        });
                    }
                );
            },
        });
    }

    addAdditionalPerson(additionalContact: any) {
        this.additionalContact = additionalContact;
        this.additionalEntityId = this.additionalContact.entityId;
        this.isDuplicatePerson = false;

        console.log(
            "Additional Person:" + JSON.stringify(this.additionalContact)
        );
        // Add new Member
        this.membershipSession = JSON.parse(
            localStorage.getItem("NewMembershipSession")
        );

        // Initialize Members Ids
        if (
            typeof this.membershipSession.additionalMembers !== "undefined" &&
            this.membershipSession.additionalMembers.length === 0
        ) {
            this.membershipSession.additionalMembers = [];
        }

        if (
            this.membershipSession.additionalMembers.includes(
                this.additionalEntityId
            ) ||
            parseInt(this.additionalContact.entityId) == this.mainMemberId
        ) {
            this.isDuplicatePerson = true;
        } else
            this.membershipSession.additionalMembers.push(
                this.additionalContact.entityId
            );

        this.membershipSession.currentTab = 3; // Billable Member Selected
        console.log(
            "Current Session Info:" + JSON.stringify(this.membershipSession)
        );
        localStorage.setItem(
            "NewMembershipSession",
            JSON.stringify(this.membershipSession)
        );
        this.messageService.add({
            severity: "success",
            summary: "Successful",
            detail: "Conatct has been added to membership",
            life: 3000,
        });
        this.showPersonTable = false;
        this.showCompanyTable = false;
        this.addMemberEvent.emit({
            additionalEntityId: this.additionalEntityId,
            isDuplicatePerson: this.isDuplicatePerson,
        });
    }

    getPersonsByFirstAndLastName(params) {
        this.personService
            .getPersonsByFirstAndLastName(params)
            .subscribe((data: any[]) => {
                console.log(data);
                this.contacts = data;
                if (this.contacts.length > 0) {
                    
                    let counter = 0;
                    for (var contact of this.contacts) {
                      this.getImageFromService(contact.entityId, counter);
                      counter++;
                    }
                    this.showLoader = false;
                  }
                this.showData();
            });
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

    getPersonsByEmail(params) {
        this.personService
            .getPersonsByEmail(params)
            .subscribe((data: any[]) => {
                console.log(data);
                this.contacts = data;
                this.showData();
            });
    }
    getPersonsByPhone(params) {
        this.personService
            .getPersonsByPhone(params)
            .subscribe((data: any[]) => {
                console.log(data);
                this.contacts = data;
                this.showData();
            });
    }

    // Relation related Methods

    addRelation(contact: any) {
        console.log(
            "Adding  Relation for person:" +
            contact.personId +
            "To:" +
            this.parentEntityId
        );
        console.log("Contact:" + JSON.stringify(contact));
        this.addRelationToContact.emit(contact);
    }

    showData() {
        this.showLoader = false;
        if (this.contacts.length > 0) {
            this.showPersonTable = true;
        } else {
            this.messageService.add({
                severity: "info",
                summary: "No results",
                detail: "No results found for the search. Please revise your search and try again.",
                life: 3000,
            });
        }
    }

    searchSelectChanged(event) {
        this.submitted = false;
        this.allowSearch = false;
        if (event.code === "Name" && this.firstName && this.lastName) {
            this.allowSearch = true;
        } else if (event.code === "Phone" && this.phone) {
            this.allowSearch = true;
        } else if (event.code === "Email" && this.email) {
            this.allowSearch = true;
        }
    }
    searchTypeSelectChanged(event) {
        this.submitted = false;
        this.allowSearch = false;
        if (event.code === "People") {
            this.searchList = [
                { name: "Name", code: "Name" },
                { name: "Email", code: "Email" },
                { name: "Phone", code: "Phone" },
            ];
            this.searchCompany = false;
        } else {
            this.searchList = [{ name: "Name", code: "Name" }];
            this.searchCompany = true;
        }
    }

    isFieldValid(field: string) {
        if (!this.searchCompany) {
            if (this.selectedSearch.name === "Name") {
                if (!this.searchByNameForm.get(field).valid && this.submitted) {
                    this.addErrorMessages = {
                        errorType: "minContactSearchRequired",
                        controlName: field,
                    };
                    return true;
                }
            } else if (this.selectedSearch.name === "Email") {
                if (
                    !this.searchByEmailForm.get(field).valid &&
                    this.submitted &&
                    this.searchByEmailForm.get(field).hasError("required")
                ) {
                    this.addErrorMessages = {
                        errorType: "required",
                        controlName: field,
                    };
                    return true;
                }
                if (
                    !this.searchByEmailForm.get(field).valid &&
                    this.searchByEmailForm.get(field).hasError("email")
                ) {
                    this.addErrorMessages = {
                        errorType: "email",
                        controlName: field,
                    };
                    return true;
                }
            } else if (this.selectedSearch.name === "Phone") {
                if (
                    !this.searchByPhoneForm.get(field).valid &&
                    this.submitted &&
                    this.searchByPhoneForm.get(field).hasError("required")
                ) {
                    this.addErrorMessages = {
                        errorType: "required",
                        controlName: field,
                    };
                    return true;
                }
            }
        } else {
            if (!this.searchCompanyForm.get(field).valid && this.submitted) {
                this.addErrorMessages = {
                    errorType: "required",
                    controlName: field,
                };
                return true;
            }
        }
    }

    errorIconCss(field: string) {
        if (!this.searchCompany) {
            if (this.selectedSearch.name === "Name") {
                if (
                    this.isFieldValid("FirstName") &&
                    this.isFieldValid("LastName")
                ) {
                    if (field == "LastName")
                        return {
                            "has-feedback fullerrordisplayforlastsection": true,
                        };
                    if (field == "FirstName") return { "has-feedback": true };
                    if (field == "searchButton")
                        return { searchbuttondisplaywhenerror: true };
                }
                if (
                    this.isFieldValid("FirstName") &&
                    !this.isFieldValid("LastName")
                ) {
                    if (field == "LastName")
                        return { firsterrordisplayforlastsection: true };
                    if (field == "FirstName") return { "has-feedback": true };
                    if (field == "searchButton")
                        return { searchbuttondisplaywhenerror: true };
                }
                if (
                    !this.isFieldValid("FirstName") &&
                    this.isFieldValid("LastName")
                ) {
                    if (field == "LastName")
                        return {
                            "firsterrordisplayforlastsection has-feedback":
                                true,
                        };
                    if (field == "searchButton")
                        return { searchbuttondisplaywhenerror: true };
                }
                if (
                    !(
                        this.isFieldValid("FirstName") &&
                        !this.isFieldValid("LastName")
                    )
                ) {
                    if (field == "LastName")
                        return { displaylastsection: true };
                }
            } else return { "has-feedback": true };
        }
    }

    errorFieldCss(field: string) {
        return { "ng-dirty": this.isFieldValid(field) };
    }

    newButtonAlignAdjust() {
        if (!this.searchCompany) {
            if (this.selectedSearch.name === "Phone")
                return { "new-displayNonName": this.isFieldValid("Phone") };
            if (this.selectedSearch.name === "Email")
                return { "new-displayNonName": this.isFieldValid("Email") };
            if (this.selectedSearch.name === "Name")
                return {
                    "new-display":
                        this.isFieldValid("FirstName") ||
                        this.isFieldValid("LastName"),
                };
        }
    }

    resetSubmitted(field) {
        this.submitted = false;
        this.isFieldValid(field);
    }

    matcher(event: ClipboardEvent, formControlName: string): boolean {
        if (this.selectedSearch.name === "Name") {
            var allowedRegex = "^[A-Za-z -.,']{0,30}$";
        }
        if (this.selectedSearch.name === "Email") {
            var allowedRegex =
                "^[a-zA-Z0-9+!$&'/=?^`{}|%#_.-]+@[a-zA-Z0-9.-]+$";
        }
        if (event.type == "paste") {
            let clipboardData = event.clipboardData;
            let pastedText = clipboardData.getData("text");
            if (!pastedText.match(allowedRegex)) {
                event.preventDefault();
                return false;
            }
            return true;
        }
    }

    getAddress(street: string, city: string, state: string, zip: string) {
        let address = street;
        if (city.length > 0) {
            address += ", " + city;
        }
        if (state.length > 0) {
            address += ", " + state;
        }
        if (zip.length > 0) {
            address += ", " + zip;
        }
        return address;
    }

    //Company related functions
    searchCompanyByName() {
        this.selectedSearchType = { name: this.currentUser.accountName, code: this.currentUser.accountName };
        localStorage.setItem(
            "CurrentSearchType",
            JSON.stringify(this.selectedSearchType)
        );
        localStorage.setItem(
            "CurrentSearch",
            JSON.stringify(this.selectedSearch)
        );

        let companyName = this.searchCompanyForm.get("CompanyName").value;

        let searchParams = new HttpParams();
        searchParams = searchParams.append("companyName", companyName);

        const opts = { params: searchParams };
        if (companyName.length > 2) {
            this.companyService
                .getCompaniesByName(opts)
                .subscribe((data: any[]) => {
                    console.log("Company Name:" + JSON.stringify(data));
                    this.companyList = data;
                    this.showPersonTable = false;
                    this.showCompanyTable = true;
                });
        } else {
            this.messageService.add({
                severity: "info",
                summary: "Enter required data",
                detail: "Please enter company name with minimum 3 characters.",
                life: 3000,
            });
        }
    }
    showCompanyDetails(selectedCompany: any) {
        console.log("Active Row:" + JSON.stringify(selectedCompany));
        this.company = selectedCompany;
        this.router.navigate(["/contactProfile"], {
            queryParams: { entityId: this.company.entityId },
        });
    }

    createInvoice(contact: any) {
        console.log("Active Row:" + JSON.stringify(contact));
        this.selectedEntityId = contact.entityId;
        this.createInvoiceEvent.emit({ billableEntityId: contact.entityId });
        this.cancelInvoiceSerach();
    }

    addBillableContactPerson(contact: any) {
        if (this.parentEntityId == 0) {
            this.addBillableContactEvent.emit({
                billableContactId: contact.personId,
            });
        } else {
            let searchParams = new HttpParams();
            searchParams = searchParams.append(
                "entityId",
                this.parentEntityId.toString()
            );
            searchParams = searchParams.append(
                "billableContactId",
                contact.personId.toString()
            );
            const opts = { params: searchParams };
            if (contact.personId) {
                console.log("Add Billable Contact:" + JSON.stringify(opts));
                this.entityService.addBillableContact(opts).subscribe(
                    (data: any[]) => {
                        console.log(data);
                        this.messageService.add({
                            severity: "success",
                            summary: "Successful",
                            detail: "Billable contact added Succesfully.",
                            life: 3000,
                        });
                        this.addBillableContactEvent.emit({
                            billableContactId: contact.personId,
                        });
                    },
                    (error) => {
                        console.log(error);
                        this.messageService.add({
                            severity: "error",
                            summary: "Error",
                            detail: error,
                            life: 3000,
                        });
                    }
                );
            } else {
                this.messageService.add({
                    severity: "error",
                    summary: "Error",
                    detail: "Please select a contact or click cancel not to add billable contact",
                    life: 3000,
                });
            }
        }
    }
    searchBytext() {
        let searchParams = new HttpParams();
        searchParams = searchParams.append("quickSearch", this.quickSerachText);
        const opts = { params: searchParams };
        let invoiceId = 0;
        let isInvoice = /^\d+$/.test(this.quickSerachText);
        if (isInvoice) {
            invoiceId = parseInt(this.quickSerachText);
        }

        if (this.quickSerachText.length > 1) {
            this.personService
                .getPeopleByQucikSearch(opts)
                .subscribe((data: any) => {
                    console.log("Quick Search:" + JSON.stringify(data));
                    if (invoiceId > 0) {
                        this.contacts = data.data;
                        if (this.contacts.length > 0) {
                            this.router.navigate(["/contactProfile"], {
                                queryParams: {
                                    entityId: this.contacts[0].entityId,
                                    tab: 4,
                                },
                            });
                        } else {
                            if (data.isInvoiceModuleInUse == true) {
                                this.messageService.add({
                                    severity: "info",
                                    summary: "No data",
                                    detail: "No matching result found for the Invoice",
                                    life: 3000,
                                });
                            } else {
                                this.messageService.add({
                                    severity: "info",
                                    summary: "No data",
                                    detail: "No matching result found",
                                    life: 3000,
                                });
                            }
                        }
                    } else {
                        this.contacts = data.data;
                        this.showData();
                        // this.getSearchHistory();
                    }
                });
        }
    }
    getSearchHistory() {
        this.personService.getPersonsSearchHistory().subscribe(
            (data) => {
                this.historyData = data.result;

                this.bindDataList(this.historyData);
            },
            (error) => {
                console.log(error);
            }
        );
    }

    bindDataList(data) {
        var ele = document.getElementById("myUL");
        var html = "";
        data.forEach((st) => {
            html += "<option value='" + st + "'>" + st + "</option>";
        });

        ele.innerHTML = html;
    }
    addMemberToGroup(contact: any) {
        console.log("Active Row:" + JSON.stringify(contact));
        const contactModel = {
            personId: contact.personId,
            entityId: contact.entityId,
            name: contact.entity.name,
        };
        this.selectedEntityId = contact.entityId;
        // this.contacts = [];
        // this.showPersonTable = false;
        this.addMemberToGroupEvent.emit(contactModel);
    }

    addEventRegistration(model: any)
    {
        this.contact = model;
        this.router.navigate(["eventregistration/createeventregistration"], {
            queryParams: { entityId: this.contact.entityId },
        });
        this.selectedEntityId = this.contact.entityId;

        this.searchMemberRoute = true;
        this.isEventRegistration = false;
    }
}
