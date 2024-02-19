import { Component, OnInit } from "@angular/core";
import { ConfirmationService, MenuItem, MessageService } from "primeng/api";
import { AppBreadcrumbService } from "../../app.breadcrumb.service";
import { ActivatedRoute, Router } from "@angular/router";
import { PersonService } from "../../services/person.service";
import { HttpParams } from "@angular/common/http";
import { HttpClient } from "@angular/common/http";
import {
    faCamera,
    faTrashAlt,
    faStickyNote,
} from "@fortawesome/free-solid-svg-icons";
import { PrimeNGCorrectionService } from "../../services/prime-ngcorrection.service";
import { User } from "src/app/models/user";
import { AuthService } from "../../services/auth.service";
import { CompanyService } from "../../services/company.service";
import { ConfigurationService } from "../../services/configuration.service";
import { EntityService } from "../../services/entity.service";
import { faEdit, faPlus } from "@fortawesome/free-solid-svg-icons";
import { timeout } from "rxjs/operators";   
import { ImageCroppedEvent } from 'ngx-image-cropper';

@Component({
    selector: "app-contact",
    templateUrl: "./contact.component.html",
    styleUrls: ["./contact.component.scss"],
    styles: [
        `
            :host ::ng-deep .p-dialog {
                width: 150px;
                margin: 0 auto 2rem auto;
                display: block;
            }

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
export class ContactComponent implements OnInit {
    entityId: number;
    personId: number;
    companyId: number;
    contact: any;
    company: any;
    age: number;
    profileLoaded: boolean = false;
    showLoader: boolean;
    index = 0;
    membershipStatus: string;
    membershipExpirationDate: Date;
    membershipJoinDate: Date;
    fileName: string;
    faCamera = faCamera;
    faTrash = faTrashAlt;
    faStickyNote = faStickyNote;
    profileImage: any;
    contactToRelation: string;
    notes: any[] = [];
    creditBalance: number;
    currentUser: User;
    showCompany: boolean;
    faEdit = faEdit;
    faPlus = faPlus;
    showBillingNotificationDialog: boolean;
    notificationList: any[];
    hasBillingEmail: boolean;
    activeNotes: number;
    activeTab: number;
    showPerson: boolean;
    selectedNotification: { name: string; code: string };
    configuration: any;
    showNotes: boolean;
    showEncounters: boolean;
    showBoardGroups: boolean;
    showWebInfo: boolean;
    showWallet: boolean;
    showInvoicePayments: boolean;
    showMembership: boolean;
    showRelatedContacts: boolean;
    showDetails: boolean;
    showOverview: boolean;
    disableDelete: boolean;
    showAccountContacts: boolean;
    showRoles:boolean;
    showCropper:boolean =false;
    showTextCropper:boolean =false;
    imageChangedEvent: any = '';
    croppedImage: any = '';

    cropperDialog : boolean = false;
    tempFile: any;
    cropperHeaderName : string = "Crop Image"
    selectedRole: string;
    cropper = {
        x1: 100,
        y1: 100,
        x2: 200,
        y2: 200
      };
    showActivity: boolean;
    constructor(
        private breadcrumbService: AppBreadcrumbService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
        private personService: PersonService,
        private http: HttpClient,
        private route: ActivatedRoute,
        private authService: AuthService,
        private companyService: CompanyService,
        private entityService: EntityService,
        private configurationService: ConfigurationService,
        private primeNgCorrection: PrimeNGCorrectionService,
        private router: Router
    ) {
        this.contactToRelation = "";
        this.notes = [];
        this.showNotes = true;
        this.showBoardGroups = true;
        this.showEncounters = true;
        this.showWebInfo = true;
        this.showWallet = true;
        this.showInvoicePayments = true;
        this.showMembership = true;
        this.showRelatedContacts = true;
        this.showDetails = true;
        this.showOverview = true;
        this.showCompany = false;
        this.showPerson = false;
        this.showAccountContacts = true;
        this.showActivity =true;
        this.showBillingNotificationDialog = false;
        this.showRoles=true;
        this.selectedRole='';
        this.notificationList = [
            { name: "Paper Invoice", code: "Paper" },
            { name: "Email", code: "Email" },
            { name: "Paper Invoice & Email", code: "Boath" },
        ];
        this.hasBillingEmail = false;
    }

    ngOnInit(): void {
        this.currentUser = this.authService.currentUserValue;
        this.showLoader = true;
        this.route.queryParams.subscribe((params) => {
            this.entityId = params["entityId"];
            this.activeTab = params["tab"];
            this.contactToRelation = params["relatedContactforID"];
            if (this.contactToRelation) {
                if (this.contactToRelation.length > 0) {
                    this.entityId = parseInt(this.contactToRelation);
                }
            }
        });
        console.log("EntityId:" + this.entityId);
        console.log("PersonId:" + this.personId);
        console.log("CompanyId:" + this.companyId);
        //Get the MerhcnatInfo
        this.getMerchantInfo(this.currentUser.organizationName);
        this.getProfileImage();
        this.getEntityById(this.entityId);
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
                    JSON.stringify(this.configuration.contactDisplayTabs)
                );
                var contactTabs =
                    this.configuration.contactDisplayTabs.split(",");
                if (contactTabs.indexOf("Encounters") < 0) {
                    this.showEncounters = false;
                }
                if (contactTabs.indexOf("Notes") < 0) {
                    this.showNotes = false;
                }
                if (contactTabs.indexOf("BoardsGroups") < 0) {
                    this.showBoardGroups = false;
                }
                if (contactTabs.indexOf("WebInfo") < 0) {
                    this.showWebInfo = false;
                }
                if (contactTabs.indexOf("Wallet") < 0) {
                    this.showWallet = false;
                }
                if (contactTabs.indexOf("InvoicePayments") < 0) {
                    this.showInvoicePayments = false;
                }
                if (contactTabs.indexOf("Membership") < 0) {
                    this.showMembership = false;
                }
                if (contactTabs.indexOf("RelatedContacts") < 0) {
                    this.showRelatedContacts = false;
                }
                if (contactTabs.indexOf("Details") < 0) {
                    this.showDetails = false;
                }
                if (contactTabs.indexOf("Overview") < 0) {
                    this.showOverview = false;
                }
                if (contactTabs.indexOf("AccountContacts") < 0) {
                    this.showAccountContacts = false;
                }
                if (contactTabs.indexOf("Activities") < 0) {
                    this.showActivity = false;
                }
                if (contactTabs.indexOf("Roles") < 0) {
                    this.showRoles = false;
                }
                if (contactTabs.indexOf("RoleHistory") < 0) {
                    this.showRoles = false;
                }
            });
    }
    public CalculateAge(): void {
        console.log("DOB:" + this.contact.dateOfBirth);
        if (this.contact.person.dateOfBirth) {
            var timeDiff = Math.abs(
                Date.now() - new Date(this.contact.person.dateOfBirth).getTime()
            );
            this.age = Math.floor(timeDiff / (1000 * 3600 * 24) / 365.25);
            console.log("Age:" + this.age);
        }
        else
        {
            this.age = 0;
        }
    }
    setActiveTab(tabIndex: number) {
        this.index = tabIndex;
        console.log("contact - Active Tab Set to:" + tabIndex);
        if (tabIndex != 4) {
            localStorage.setItem("LastContactTab", "");
        }
    }

    setPreferredCommunication() {
        this.showBillingNotificationDialog = true;
    }
    cancelNotification() {
        this.showBillingNotificationDialog = false;
    }
    updateBillingNotification() {
        console.log("Selected Notification:" + this.selectedNotification);
        const body = {
            entityId: this.entityId,
            BillingNotification: this.selectedNotification,
        };
        this.entityService
            .updateBillingNotification(body)
            .subscribe((data: any) => {
                console.log(data);
                this.showBillingNotificationDialog = false;
                this.getEntityById(this.entityId);
            });
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
                this.showLoader = false;

                if (this.contactToRelation) {
                    if (this.contactToRelation.length > 0) {
                        this.setActiveTab(2);
                    }
                }
                if (this.activeTab) {
                    this.setActiveTab(this.activeTab);
                }
                if (this.contact.notes) {
                    if (this.contact.notes.length > 0) {
                        this.notes = this.contact.notes.filter(
                            (x) => x.status === 1
                        );
                    }
                }
                if (this.contact.companyId) {
                    this.showCompany = true;
                    console.log("Showing company record");
                } else {
                    this.showPerson = true;
                    this.CalculateAge();
                }
                if (this.contact.preferredBillingCommunication != 0) {
                    this.hasBillingEmail = true;
                } else {
                    this.hasBillingEmail = false;
                }
                this.activeNotes = 0;
                let activeNotes = 0;
                this.contact.notes.forEach(function (note) {
                    if (note.status === 1) {
                        activeNotes = activeNotes + 1;
                    }
                });
                this.activeNotes = activeNotes;
                console.log("Active Notes:" + this.activeNotes);
                this.profileLoaded = true;
            });
    }

    getCompanyById(companyId) {
        console.log("Fetcing data for Company:" + companyId);
        let searchParams = new HttpParams();
        searchParams = searchParams.append("companyId", companyId);
        const opts = { params: searchParams };
        this.companyService
            .getCompanyProfileById(opts)
            .subscribe((data: any) => {
                console.log(data);
                this.company = data;
                this.showLoader = false;
                this.profileLoaded = true;
                if (this.company.notes) {
                    if (this.company.notes.length > 0) {
                        this.notes = this.company.notes.filter(
                            (x) => x.status === 1
                        );
                    }
                }
            });
    }

    getProfileImage() {
        this.entityService.getProfileImage(this.entityId)
            .subscribe(
                (data) => {
                    this.createImageFromBlob(data);
                    console.log(data);
                },
                (error) => {
                    console.log(error);
                }
            );
    }

    createImageFromBlob(image: Blob) {
        let reader = new FileReader();
        reader.addEventListener(
            "load",
            () => {
                this.profileImage = [reader.result];
            },
            false
        );
        if (image) {
            reader.readAsDataURL(image);
        }
    }

    onFileSelected(event) {
        const file: File = event.target.files[0];
        this.showLoader = true;
        if (file) {
            let imageSize = file.size / 1000000;
            let imageType = file.type;
            if (imageSize > 5) {
                this.messageService.add({
                    severity: "warn",
                    summary: "Warning",
                    detail: "Image size should not be greater than 5 Mb.",
                    life: 3000,
                });
                event.target.value = null;
            } else if (
                imageType != "image/jpeg" &&
                imageType != "image/jpg" &&
                imageType != "image/png" &&
                imageType != "image/gif"
            ) {
                this.messageService.add({
                    severity: "warn",
                    summary: "Warning",
                    detail: "Please select image of type .jpeg, .jpg, .gif or .png.",
                    life: 3000,
                });
                event.target.value = null;
            } else {
                // this.uploadProfileImage(file);
                this.tempFile = file;
                this.profileImage = "assets/layout/images/oval.svg";
                event.target.value = null;
            }
        }
    }

    uploadProfileImage(file) {
        const formData = new FormData();
        //this.profileImage = "assets/layout/images/oval.svg";

        formData.append("File", file);
        formData.append("entityId", this.entityId.toString());

        this.entityService.uploadImage(formData)
            .subscribe((data: any) => {
                console.log(data);
                this.showLoader = false;
                this.getProfileImage();
            });
    }

    deleteProfileImage() {
        console.log(this.personId);
        this.confirmationService.confirm({
            message: "Are you sure you want to delete profile image?",
            header: "Confirm",
            icon: "pi pi-exclamation-triangle",
            accept: () => {
                this.entityService.deleteProfileImage(this.entityId)
                    .subscribe(
                        (data) => {
                            console.log(data);
                            this.messageService.add({
                                severity: "success",
                                summary: "Successful",
                                detail: "Profile image deleted successfully.",
                                life: 3000,
                            });
                            this.getProfileImage();
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
    getMerchantInfo(organizationName: string) {
        console.log("Fetching Merchant info for:" + organizationName);
        this.authService.getMerchantProfile(organizationName)
            .subscribe((data: any) => {
                console.log(data);
                if (data) {
                    let merchantInfo = data;
                    localStorage.setItem(
                        "currentMerchantInfo",
                        JSON.stringify(merchantInfo)
                    );
                }
            });
    }

    deleteMemberProfile() {
        this.confirmationService.confirm({
            message: "This action can not be undo. Are you sure to delete member profile ?",
            header: "Confirm",
            icon: "pi pi-exclamation-triangle",
            accept: () => {
                console.log("deleting the member profile");
                this.personService.deletePerson(this.contact).subscribe((data) => {
                    console.log(data);
                    this.messageService.add({
                        severity: "success",
                        summary: "Successful",
                        detail: "Member profile deleted successfully.",
                        life: 3000
                    });
                    console.log("Member profile deleted successfully.");
                    setTimeout(() => {
                        this.router.navigate(['/contacts']);
                    }, 3000);
                },
                    (error) => {
                        console.log(error);
                        this.messageService.add({
                            severity: "error",
                            summary: "Error",
                            detail: error,
                            life: 3000
                        });
                    });
                this.disableDelete = true;
                this.confirmationService.close();
            },
            reject: () => {
                this.confirmationService.close();
            }
        });

    }
    deleteCompanyProfile() {
        this.confirmationService.confirm({
            message: "This action can not be undo. Are you sure to delete company profile ?",
            header: "Confirm",
            icon: "pi pi-exclamation-triangle",
            accept: () => {
                console.log("deleting the company profile");
                this.companyService.deleteCompany(this.contact).subscribe((data) => {
                    console.log(data);
                    this.messageService.add({
                        severity: "success",
                        summary: "Successful",
                        detail: "Company profile deleted successfully.",
                        life: 3000,
                    });
                    console.log("Company profile deleted successfully");
                    setTimeout(() => {
                        this.router.navigate(['/contacts']);
                    }, 3000);
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
                this.disableDelete = true;
                this.confirmationService.close();
            },
            reject: () => {
                this.confirmationService.close();
            }
        });
    }

    imageCropped(event: ImageCroppedEvent) {
        this.croppedImage = event.base64;
    }

    imageLoaded() {
        this.showTextCropper = true;
        this.cropperDialog = true;
        this.showCropper = true;
        setTimeout(() => {
            this.cropper = {
              x1: 100,
              y1: 100,
              x2: 300,
              y2: 200
            }
          });
      }

      cropperReady() {
        if (this.croppedImage) {
          const blob = this.dataURItoBlob(this.croppedImage);
          const file = new File([blob], 'cropped-image.png', { type: blob.type });
      
          const event = { target: { files: [file] } } as any; // create an Event object with the selected file
          this.onFileSelected(event); // call the onFileSelected method with the Event object
        }
      }

       // utility method to convert data URI to Blob object
 dataURItoBlob(dataURI) {
    const byteString = atob(dataURI.split(',')[1]);
    const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: mimeString });
  }

  loadImageFailed() {
    this.showTextCropper = false;
    this.messageService.add({
      severity: "warn",
      summary: "Warning",
      detail: "Image Loading Failed",
      life: 3000,
  });
    this.showCropper = false;
}

cropImageDone(){
    this.cropperReady();
    this.uploadProfileImage(this.tempFile);
    this.hideCropperDialog();
    this.messageService.add({
        severity: "success",
        summary: "Successful",
        detail: "Profile image updated successfully.",
        life: 3000,
    });
  }

fileChangeEvent(event: any): void {
    this.showTextCropper = false;
    this.imageChangedEvent = event;
}

hideCropperDialog()
{
    this.getProfileImage();
    this.showCropper = false;
    this.imageChangedEvent = null;
    this.croppedImage = null;
    this.showTextCropper=false;
    this.cropperDialog = false;
    $('input[type="file"]').val('');
}

}
