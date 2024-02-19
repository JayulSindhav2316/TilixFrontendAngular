import { Component, OnInit, Input } from "@angular/core";
import { ConfirmationService, MessageService } from "primeng/api";
import { AppBreadcrumbService } from "../../app.breadcrumb.service";
import { Router } from "@angular/router";
import { ActivatedRoute } from "@angular/router";
import { PersonService } from "../../services/person.service";
import { MembershipService } from "../../services/membership.service";
import { HttpParams } from "@angular/common/http";
import { MembershipSession } from "../../models/membership-session";
import { Output, EventEmitter } from "@angular/core";
import { InvoiceService } from "../../services/invoice.service";
import { MenuService } from "src/app/app.menu.service";
import { PdfService } from "../../services/pdf.service";
import { formatDate } from "@angular/common";
import { Inject } from "@angular/core";
import { LOCALE_ID } from "@angular/core";
import {
    FormArray,
    FormBuilder,
    FormControl,
    FormGroup,
    Validators,
} from "@angular/forms";
import * as printJS from "print-js";
import { Browser } from "protractor";
@Component({
    selector: "app-print-invoice",
    templateUrl: "./print-invoice.component.html",
    styleUrls: ["./print-invoice.component.scss"],
})
export class PrintInvoiceComponent implements OnInit {
    @Input() invoiceId: number;
    @Output() closeEvent = new EventEmitter<string>();
    membershipFees: any[];
    additionalMembers: any[];
    membershipType: { name: string; code: string; periodName: string };
    billableMember: {
        firstName: string;
        lastName: string;
        gender: string;
        age: number;
    };
    membershipSession: MembershipSession;
    showAdditionalMemberTable: boolean;
    showLoader: boolean;
    showInvoice: boolean;
    showEmail: boolean;
    emailForm: FormGroup;
    invoice: any;
    editorData: any;
    billablePersonEmail: string;
    shoppingCart: any;
    pdfMake: any;
    currentDate: string;
    public localID: string;
    billingAddress: any;
    addErrorMessages: any = {};
    submitted: boolean;
    logo: any;
    invoicePdf: any;
    primaryAddress: any[];
    membershipInvoice: boolean;
    isInvoiceWriteOff: boolean = false;
    // invoiceNotesExist: boolean;

    constructor(
        private breadcrumbService: AppBreadcrumbService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
        private router: Router,
        private route: ActivatedRoute,
        private personService: PersonService,
        private invoiceService: InvoiceService,
        private membershipService: MembershipService,
        private pdfService: PdfService,
        private formBuilder: FormBuilder,
        private menuService: MenuService,
        @Inject(LOCALE_ID) localID: string
    ) {
        this.membershipType = { name: "", code: "", periodName: "" };
        this.billableMember = {
            firstName: "",
            lastName: "",
            gender: "",
            age: 0,
        };
        this.showEmail = false;
        this.localID = localID;
        this.membershipInvoice = true;
    }

    ngOnInit(): void {
        this.showLoader = true;
        this.showInvoice = false;
        this.showEmail = false;
        this.invoiceId = 0;

        this.emailForm = this.formBuilder.group({
            PersonId: [0],
            ToEmail: ["", [Validators.required, Validators.email]],
            Subject: ["", [Validators.required, Validators.maxLength(64)]],
        });
    }
    ngOnChanges(val) {
        console.log("change detected");
        console.log(val);
        console.log("id:" + this.invoiceId);
        this.getInvoiceDetails();
    }

    hidePrint() {
        this.closeEvent.emit("close");
        console.log("close event");
    }
    getInvoiceDetails() {
        if (this.invoiceId === 0) {
            return;
        }
        console.log(
            "Fetching Invoice data for Id:" + this.invoiceId.toString()
        );
        let searchParams = new HttpParams();
        searchParams = searchParams.append(
            "invoiceId",
            this.invoiceId.toString()
        );
        const opts = { params: searchParams };
        this.invoiceService.getInvoiceDetail(opts).subscribe((data: any) => {
            console.log(data);
            this.invoice = data;
            if (this.invoice.membership) {
                this.membershipInvoice = true;
            } else {
                this.membershipInvoice = false;
            }
            if (this.invoice.isAllInvoiceDetailsWriteOff) {
                this.isInvoiceWriteOff = true;
            } else {
                this.isInvoiceWriteOff = false;
            }

            this.setEditorText();
            this.getHeaderImage();
            //this.primaryAddress = this.invoice.billablePerson.addresses.filter(x => x.isPrimary === true);
            this.showLoader = false;
            this.showInvoice = true;
            // this.checkForInvoiceNotes(this.invoice.notes);
        });
    }

    showEmailDialog() {
        this.emailForm
            .get("ToEmail")
            .setValue(this.invoice.billingAddress.billToEmail);
        this.emailForm.get("Subject").setValue("Your Membership Invoice");
        this.showEmail = true;
    }

    hideEmailDialog() {
        this.showEmail = false;
        this.emailForm.reset();
    }
    sendEmail() {
        this.submitted = true;
        this.emailInvoice();
        if (this.emailForm.valid) this.showEmail = false;
    }

    emailInvoice() {
        if (this.emailForm.valid) {
            const body = {
                receipientAddress: this.emailForm.get("ToEmail").value,
                subject: this.emailForm.get("Subject").value,
                invoiceId: this.invoice.invoiceId.toString(),
            };
            this.showLoader = true;
            this.invoiceService.emailInvoice(body).subscribe((data: any) => {
                console.log(data);
                if (data === true) {
                    this.messageService.add({
                        severity: "success",
                        summary: "Successful",
                        detail: "Email has been sent succesfully.",
                        life: 3000,
                    });
                } else {
                    this.messageService.add({
                        severity: "warn",
                        summary: "Warning",
                        detail: "An error has occured. Please try later.",
                        life: 3000,
                    });
                }
            });
            this.showLoader = false;
        } else {
            this.messageService.add({
                severity: "warn",
                summary: "Warning",
                detail: "Please enter the required information.",
                life: 3000,
            });
        }
    }

    setEditorText() {
        this.editorData =
            "Dear " +
            this.invoice.billingAddress.billToName +
            "</B>. Please login to member portal to make the payments.";
    }

    showPdf() {
        this.invoiceService
            .getPaperInvoicePdfByInvoiceId(
                this.invoice.invoiceId,
                this.invoice.organization.organizationId
            )
            .subscribe((data: any) => {
                // debugger;
                //console.log(data);
                let parsedResponse = data;
                var blob = new Blob([data], { type: "application/pdf" });
                var filename = "Invoice-" + this.invoice.invoiceId + ".pdf";
                let blobUrl: string = window.URL.createObjectURL(blob);
                window.open(blobUrl,'_blank',"width=800,height=600");
                // printJS(blobUrl);
            });
    }

    async downloadPdf() {
        await this.loadPdfMaker();
        var def = this.generatePdf(this.invoice);
        console.log(def);
        const pdfDocGenerator = this.pdfMake.createPdf(def);
        pdfDocGenerator.getBase64((data) => {
            this.invoicePdf = data;
        });
    }

    async loadPdfMaker() {
        if (!this.pdfMake) {
            const pdfMakeModule = await import("pdfmake/build/pdfmake");
            const pdfFontsModule = await import("pdfmake/build/vfs_fonts");
            this.pdfMake = pdfMakeModule.default;
            this.pdfMake.vfs = pdfFontsModule.default.pdfMake.vfs;
        }
    }

    generatePdf(invoice: any) {
        this.invoice = invoice;
        let description = "";
        if (invoice.membership) {
            description =
                this.invoice.membership.membershipType.categoryNavigation.name +
                // "\n Starts: " +
                // formatDate(
                //     this.invoice.membership.startDate,
                //     "shortDate",
                //     this.localID
                // ) +
                // " Ends: " +
                // formatDate(
                //     this.invoice.membership.endDate,
                //     "shortDate",
                //     this.localID
                // ) +
                "\n " +
                this.invoice.membership.membershipType.name;
        }

        let def = {
            pageMargins: [64, 10, 20, 100],
            footer: function (currentPage, pageCount) {
                return {
                    margin: 5,
                    columns: [
                        {
                            fontSize: 9,
                            text: [
                                {
                                    text:
                                        "Trilix  -   " +
                                        " Page [ " +
                                        currentPage.toString() +
                                        " / " +
                                        pageCount +
                                        " ]",
                                },
                            ],
                            alignment: "center",
                        },
                    ],
                };
            },
            content: [
                // Header
                {
                    columns: [
                        {
                            image: this.logo,
                            width: 188,
                            height: 66,
                            margin: [0, 0, 0, 10],
                        },
                        {
                            text: "INVOICE",
                            style: "invoiceTitle",
                            width: "*",
                        },
                    ],
                },
                {
                    columns: [
                        {
                            stack: [
                                {
                                    columns: [
                                        {
                                            text: invoice.organization.address1,
                                            style: "invoiceSubTitle",
                                            width: "*",
                                        },
                                    ],
                                },
                                {
                                    columns: [
                                        {
                                            text: invoice.organization.address2,
                                            style: "invoiceSubTitle",
                                            width: "*",
                                        },
                                    ],
                                },
                                {
                                    columns: [
                                        {
                                            text: invoice.organization.address3,
                                            style: "invoiceSubTitle",
                                            width: "*",
                                        },
                                    ],
                                },
                                {
                                    columns: [
                                        {
                                            text:
                                                invoice.organization.city +
                                                ", " +
                                                invoice.organization.state +
                                                ", " +
                                                invoice.organization.zip,
                                            style: "invoiceSubTitle",
                                            width: "*",
                                        },
                                    ],
                                },
                                {
                                    columns: [
                                        {
                                            text: invoice.organization.website,
                                            link:
                                                "https://" +
                                                invoice.organization.website,
                                            style: "invoiceSubTitle",
                                            width: "*",
                                        },
                                    ],
                                },
                            ],
                        },
                        {},
                    ],
                },
                // Billing Details
                {
                    columns: [
                        {
                            width: "70%",
                            stack: [
                                {
                                    columns: [
                                        {
                                            text: "Bill To:",
                                            style: "invoiceBillingAddressTitle",
                                            width: "*",
                                        },
                                    ],
                                },
                                {
                                    columns: [
                                        {
                                            text: invoice.billingAddress
                                                .billToName,
                                            style: "invoiceBillingAddress",
                                        },
                                    ],
                                },
                                // Billing Address
                                {
                                    columns: [
                                        {
                                            text: this.invoice.billingAddress
                                                .streetAddress,
                                            style: "invoiceBillingAddress",
                                        },
                                    ],
                                },
                                {
                                    columns: [
                                        {
                                            text:
                                                this.invoice.billingAddress
                                                    .city +
                                                ", " +
                                                this.invoice.billingAddress
                                                    .state +
                                                ", " +
                                                this.invoice.billingAddress.zip,
                                            style: "invoiceBillingAddress",
                                        },
                                    ],
                                },
                            ],
                        },
                        {
                            width: "30%",
                            table: {
                                widths: ["50%", "50%"],
                                body: [
                                    [
                                        {
                                            text: "Invoice",
                                        },
                                        {
                                            text: invoice.invoiceId,
                                        },
                                    ],
                                    [
                                        {
                                            text: "Date",
                                        },
                                        {
                                            text: formatDate(
                                                invoice.date,
                                                "MM/dd/yy",
                                                this.localID
                                            ),
                                        },
                                    ],
                                    [
                                        {
                                            text: "Created",
                                        },
                                        {
                                            text: invoice.userName,
                                        },
                                    ],
                                ],
                            },
                        },
                    ],
                },
                // Membership Type
                // Items
                "\n",
                {
                    table: {
                        // headers are automatically repeated if the table spans over multiple pages
                        // you can declare how many rows should be treated as headers
                        headerRows: 1,
                        widths: ["10%", "60%", "15%", "15%"],
                        body: [
                            // Table Header
                            [
                                {
                                    text: "Quantity",
                                    style: ["itemsHeader"],
                                },
                                {
                                    text: "Description",
                                    style: ["itemsHeader"],
                                },
                                {
                                    text: "Rate",
                                    style: ["itemsHeader"],
                                },
                                {
                                    text: "Amount",
                                    style: ["itemsHeader"],
                                },
                            ],
                            // Fee Header
                            [
                                {
                                    text: "",
                                },
                                {
                                    text: description,
                                    style: ["itemText"],
                                },
                                {
                                    text: "",
                                    style: ["itemText"],
                                },
                                {
                                    text: "",
                                    style: ["itemText"],
                                },
                            ],
                            // Items
                            ...this.invoice.invoiceDetails.map((p) => [
                                { text: p.quantity, style: "itemNumber" },
                                { text: p.description, style: "itemText" },
                                { text: "$" + p.price, style: "itemCurrency" },
                                { text: "$" + p.amount, style: "itemCurrency" },
                            ]),
                            [
                                {
                                    text:
                                        "Important Announcement: " +
                                        this.invoice.notes,
                                    colSpan: 2,
                                    rowSpan: 3,
                                    style: "itemMessage",
                                },
                                {},
                                {
                                    text: "Total",
                                    style: "itemsFooter",
                                },
                                {
                                    text:
                                        "$" +
                                        this.invoice.invoiceDetails
                                            .reduce(
                                                (sum, p) => sum + p.amount,
                                                0
                                            )
                                            .toFixed(2),
                                    style: "itemTotal",
                                },
                            ],
                            [
                                {
                                    text: "",
                                    colSpan: 2,
                                    style: "itemsFooterTotalValue",
                                },
                                {},
                                {
                                    text: "Balance",
                                    style: "itemsFooterTotalValue",
                                },
                                {
                                    text:
                                        "$" +
                                        this.invoice.invoiceDetails
                                            .reduce(
                                                (sum, p) => sum + p.amount,
                                                0
                                            )
                                            .toFixed(2),
                                    style: "itemTotalBalance",
                                },
                            ],
                            [
                                {
                                    text: "",
                                    style: "itemMessage",
                                },
                                {},
                                {
                                    text: "Balance Due",
                                    style: "itemsFooter",
                                },
                                {
                                    text: formatDate(
                                        invoice.dueDate,
                                        "MM/dd/yy",
                                        this.localID
                                    ),
                                    style: "itemTotal",
                                },
                            ],

                            // END Items
                        ],
                    }, // table
                    layout: {
                        paddingBottom: (
                            rowIndex: number,
                            node: any,
                            colIndex: number
                        ) => {
                            const DEFAULT_PADDING = 2;

                            // Calculate padding for the last element of the table.
                            if (rowIndex === node.table.body.length - 4) {
                                const currentPosition =
                                    node.positions[node.positions.length - 1];
                                const totalPageHeight =
                                    currentPosition.pageInnerHeight;
                                const currentHeight = currentPosition.top;
                                const paddingBottom =
                                    totalPageHeight - currentHeight - 100;
                                return paddingBottom;
                            } else {
                                return DEFAULT_PADDING;
                            }
                        },
                    },
                },
            ],
            styles: {
                invoiceTitle: {
                    fontSize: 45,
                    alignment: "right",
                },
                invoiceSubTitle: {
                    fontSize: 12,
                    alignment: "left",
                },
                // Billing Headers
                invoiceBillingTitle: {
                    fontSize: 14,
                    bold: true,
                    alignment: "left",
                    margin: [0, 20, 0, 5],
                },
                // Billing Details
                invoiceBillingDetails: {
                    alignment: "left",
                },
                invoiceBillingAddressTitle: {
                    margin: [0, 25, 0, 3],
                    bold: true,
                },
                invoiceBillingAddress: {},
                // Items Header
                itemsHeader: {
                    margin: [0, 5, 0, 5],
                    bold: true,
                    alignment: "center",
                    fillColor: "#dedede",
                },
                // Item Title
                itemTitle: {
                    bold: true,
                },
                itemSubTitle: {
                    italics: true,
                    fontSize: 11,
                },
                itemNumber: {
                    margin: [0, 5, 0, 5],
                    alignment: "center",
                    fontSize: 10,
                },
                itemTotal: {
                    margin: [0, 5, 0, 5],
                    alignment: "right",
                },
                itemTotalBalance: {
                    margin: [0, 5, 0, 5],
                    alignment: "right",
                    bold: true,
                },
                itemText: {
                    margin: [0, 5, 0, 5],
                    alignment: "left",
                    fontSize: 12,
                },
                itemCurrency: {
                    margin: [0, 5, 0, 5],
                    alignment: "right",
                    fontSize: 10,
                },
                // Items Footer (Subtotal, Total, Tax, etc)
                itemsFooterTotalValue: {
                    margin: [0, 5, 0, 5],
                    bold: true,
                    alignment: "right",
                },
                itemsFooter: {
                    margin: [0, 5, 0, 5],
                    alignment: "right",
                },
                itemsMessage: {
                    margin: [0, 5, 0, 5],
                    bold: true,
                    alignment: "left",
                },
                sectionHeader: {
                    fontSize: 14,
                    color: "#444444",
                    bold: true,
                    fillColor: "#2361AE",
                    margin: [0, 5, 0, 5],
                },
                section: {
                    fontSize: 10,
                    color: "#000000",
                    margin: [0, 5, 0, 5],
                },
            },
            defaultStyle: {
                columnGap: 20,
            },
        };
        return def;
        // pdfMake.createPdf(content).print({}, window.frames['printPdf']);
    }

    getHeaderImage() {
        this.invoiceService
            .getHeaderImage(this.invoice.organization.organizationId)
            .subscribe(
                (data) => {
                    return new Promise((resolve, reject) => {
                        let reader = new FileReader();
                        reader.addEventListener(
                            "load",
                            () => {
                                this.logo = [reader.result];
                            },
                            false
                        );
                        if (data) {
                            reader.readAsDataURL(data);
                        }
                    });
                },
                (error) => {
                    console.log(error);
                }
            );
    }

    async createImageFromBlob(image: Blob) {
        return new Promise((resolve, reject) => {
            let reader = new FileReader();
            reader.addEventListener(
                "load",
                () => {
                    this.logo = [reader.result];
                },
                false
            );
            if (image) {
                reader.readAsDataURL(image);
            }
        });
    }

    errorIconCss(field: string) {
        return { "has-feedback": this.isFieldValid(field) };
    }

    errorFieldCss(field: string) {
        return { "ng-dirty": this.isFieldValid(field) };
    }

    isFieldValid(field: string) {
        if (
            !this.emailForm.get(field).valid &&
            this.submitted &&
            this.emailForm.get(field).hasError("required")
        ) {
            if (field == "ToEmail") field = "Email";
            this.addErrorMessages = {
                errorType: "required",
                controlName: field,
            };
            return true;
        }
        if (
            !this.emailForm.get(field).valid &&
            this.submitted &&
            this.emailForm.get(field).hasError("pattern")
        ) {
            this.addErrorMessages = {
                errorType: "onlyAlphabetsOneSpace",
                controlName: field,
            };
            return true;
        }
        if (
            !this.emailForm.get(field).valid &&
            this.submitted &&
            this.emailForm.get(field).hasError("email")
        ) {
            this.addErrorMessages = { errorType: "email", controlName: field };
            return true;
        }
        if (
            !this.emailForm.get(field).valid &&
            this.submitted &&
            this.emailForm.get(field).hasError("maxlength")
        ) {
            this.addErrorMessages = {
                errorType: "maxlength",
                maxLengthLimit:
                    this.emailForm.get(field).errors.maxlength.requiredLength,
                controlName: field,
            };
            return true;
        }
    }

    resetSubmitted(field) {
        this.submitted = false;
        this.isFieldValid(field);
    }
}
