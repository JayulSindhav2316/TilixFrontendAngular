import { HttpParams } from "@angular/common/http";
import {
    Component,
    OnInit,
    forwardRef,
    Input,
    EventEmitter,
    Output,
} from "@angular/core";
import {
    AbstractControl,
    ControlValueAccessor,
    FormBuilder,
    FormGroup,
    FormControl,
    FormGroupDirective,
    FormArray,
} from "@angular/forms";
import {
    NG_VALIDATORS,
    NG_VALUE_ACCESSOR,
    ValidationErrors,
    Validator,
    Validators,
} from "@angular/forms";
//import { LookupService } from '../../services/lookup.service';
import { ContactAddress } from "../../models/contact-address";
import { Router } from "@angular/router";
import { CountryService } from "src/app/services/country.service";
import { StateService } from "src/app/services/state.service";
import { element } from "protractor";
type ChangeCallbackFn<T> = (value: T) => void;
type TouchCallbackFn = () => void;

@Component({
    selector: "app-address",
    templateUrl: "./address.component.html",
    styleUrls: ["./address.component.scss"],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => AddressComponent),
            multi: true,
        },
        {
            provide: NG_VALIDATORS,
            useExisting: forwardRef(() => AddressComponent),
            multi: true,
        },
    ],
})
export class AddressComponent implements ControlValueAccessor, Validator {
    zipFormatLength: number = 0;
    addressFormGroup: FormGroup = this.fb.group({
        addressId: [0],
        addressType: ["", Validators.required],
        streetAddress: ["", [Validators.required, this.noBlankValidator]],
        city: ["", [Validators.required, this.noBlankValidator]],
        country: ["", [Validators.required]],
        state: ["", Validators.required],
        zip: ["", [Validators.required]], // this.zipValidator]],
        isPrimary: [true],
        countryCode: [""],
        stateCode: [""],
    });
    labels: any[];
    stateList: any[];
    allCountries: any[];
    countryList: any[];
    zipFormat: string = "999999";
    addErrorMessages: any = {};
    address: ContactAddress;
    @Input() countries: any;
    @Input() controlId: string;
    @Input() isCompany: boolean;
    @Output() removeControl = new EventEmitter<string>();
    @Input() profileFormSubmitted: boolean;
    @Output() setPrimaryAddress = new EventEmitter<string>();
    @Output() otherFormClicked = new EventEmitter<boolean>();
    @Output() addressChanged = new EventEmitter<boolean>();
    controlValueChanged: {
        addressTypeChanged: boolean;
        streetAddressChanged: boolean;
        cityChanged: boolean;
        statechanged: boolean;
        zipChanged: boolean;
        isPrimaryChanged: boolean;
    };
    disallowChange: boolean;
    addressFormArray: FormArray;
    addressForm: FormGroup;
    onTouched: () => void = () => {};

    constructor(
        private fb: FormBuilder,
        private stateService: StateService,
        private countryService: CountryService,
        private router: Router,
        private rootFormGroup: FormGroupDirective
    ) {
       
       
    }

    validate(control: AbstractControl): ValidationErrors | null {
        if (this.addressFormGroup.valid) {
            return null;
        }
        return {
            invalidForm: {
                valid: false,
                message: "addressForm fields are invalid",
            },
        };
    }

    writeValue(val: any): void {
        if (this.router.url.includes("/contactProfile?entityId")) {
            const address = new ContactAddress();
            address.addressId = val.addressId;
            address.addressType = val.addressType;
            address.streetAddress = val.streetAddress;
            address.city = val.city;
            address.country = val.country;
            address.countryCode = val.countryCode;
            address.stateCode = val.stateCode;
            address.state = val.state;
            address.zip = val.zip;
            address.isPrimary = val.isPrimary;
            this.address = address;
        }
        if (val) {
            if (this.countries && this.countries.length > 0) {
                this.countryList = this.countries;
                if (val.country != "" && val.country != null) {
                    var filterCountry = this.countries.filter(
                        (x) => x.name == val?.country
                    )[0];
                    if (filterCountry && filterCountry.zipFormat) {
                        this.zipFormat = filterCountry.zipFormat
                            ? filterCountry.zipFormat
                            : this.zipFormat;
                    }
                    this.getStatesLookup(val?.country);
                }
            }

            this.addressFormGroup.setValue(val, { emitEvent: false });
        }
    }

    registerOnChange(fn: ChangeCallbackFn<object>): void {
        this.addressFormGroup.valueChanges.subscribe(fn);
    }
    registerOnTouched(fn: TouchCallbackFn): void {
        this.onTouched = fn;
    }

    setDisabledState?(isDisabled: boolean): void {
        if (isDisabled) {
            this.addressFormGroup.disable();
        } else {
            this.addressFormGroup.enable();
        }
        // this.getStatesLookup();
    }

    _removeControl() {
        this.removeControl.emit(this.controlId);
    }

    getStatesLookup(input: string) {
        if (input != "" && input != null) {
            var country = this.countryList.filter((x) => x.name == input)[0];
            let params = new HttpParams();
            if (country && country.countryId) {
                params = params.append("countryId", country.countryId);
                this.stateService
                    .getStateByCountry(params)
                    .subscribe((data: any[]) => {
                        this.stateList = data;
                    });
            }
        }
    }

    getCountries() {
        this.countryService.getAllCountries().subscribe((data: any[]) => {
            this.countryList = data;
            if (this.addressFormGroup.value) {
                var countryFieldValue = this.addressFormGroup.value.country;
                if (countryFieldValue != "" && countryFieldValue != null) {
                    // this.getStatesLookup(countryFieldValue);
                    // this.getZipFormat(countryFieldValue);
                }
            }
        });
    }
    getZipFormat(name: string) {
        this.zipFormat = this.countryList.filter(
            (x) => x.name == name
        )[0].zipFormat;
    }
    ngOnInit(): void {
        this.getCountries();
        this.controlValueChanged = {
            addressTypeChanged: false,
            streetAddressChanged: false,
            cityChanged: false,
            statechanged: false,
            zipChanged: false,
            isPrimaryChanged: false,
        };
        this.disallowChange = false;
        if(this.isCompany){
            this.addressFormArray = this.rootFormGroup.control.get(
                "CompanyAddresses"
            ) as FormArray;
        }
        else {
            this.addressFormArray = this.rootFormGroup.control.get(
                "Addresses"
            ) as FormArray;
        }
       
        console.log("Parent control IsCompany:"+this.isCompany)
        if(this.isCompany){
            this.labels = [
                { name: "Mailing", code: "Mailing" },
                { name: "Shipping", code: "Shipping" },
                { name: "Other", code: "Other" },
            ];
        }
        else {
            this.labels = [
                { name: "Home", code: "Home" },
                { name: "Work", code: "Work" },
                { name: "Other", code: "Other" },
            ];
        }
    }

    handleChange(event) {
        this.setPrimaryAddress.emit(this.controlId);
        if (this.router.url.includes("/contactProfile?entityId")) {
            if (event.checked == this.address.isPrimary)
                this.controlValueChanged.isPrimaryChanged = false;
            if (event.checked != this.address.isPrimary)
                this.controlValueChanged.isPrimaryChanged = true;
            this.allowEditSave();
        }
    }

    resetSubmitted(field) {
        this.profileFormSubmitted = false;
        this.isFieldValid(field);
        this.otherFormClicked.emit(this.profileFormSubmitted);
    }

    isFieldValid(field: string) {
        if (
            !this.addressFormGroup.get(field).valid &&
            this.profileFormSubmitted &&
            this.addressFormGroup.get(field).hasError("required")
        ) {
            if (field == "addressType") field = "Address type";
            if (field == "streetAddress") field = "Street Address";
            if (field == "city") field = "City";
            if (field == "state") field = "State";
            if (field == "zip") field = "Zip";
            if (field == "country") field = "Country";
            this.addErrorMessages = {
                errorType: "required",
                controlName: field,
            };
            if (field == "Address type") {
                this.addErrorMessages = {
                    errorType: "dropdownrequired",
                    controlName: field,
                };
            }
            return true;
        }
        if (field == "zip") {
            if (
                !this.addressFormGroup.get("zip").valid &&
                this.profileFormSubmitted &&
                this.addressFormGroup.get("zip").hasError("zipLengthError")
            ) {
                this.addErrorMessages = {
                    errorType: "creditcardminlength",
                    controlName: field,
                    errorMessage: "enter a valid pin code",
                };
                return true;
            }
        }
    }

    errorIconCss(field: string) {
        return {
            "has-feedback": this.isFieldValid(field),
        };
    }

    errorFieldCss(field: string) {
        return {
            "ng-dirty": this.isFieldValid(field),
        };
    }

    matcher(event: ClipboardEvent, formControlName: string): boolean {
        var allowedRegex = "^[a-zA-Z0-9À-ÖØ-öø-ÿ ,.-]+$";
        if (event.type == "paste") {
            let clipboardData = event.clipboardData;
            let pastedText =
                clipboardData.getData("text") +
                this.addressFormGroup.get(formControlName).value;
            if (!pastedText.match(allowedRegex)) {
                event.preventDefault();
                return false;
            }
            return true;
        }
    }
    noBlankValidator(control: FormControl) {
        const isWhitespace = (control.value || "").trim().length === 0;
        const isValid = !isWhitespace;
        return isValid ? null : { required: true };
    }
    enableSave(event, formControlName) {
        if (this.router.url.includes("/contactProfile?entityId")) {
            switch (formControlName) {
                case "addressType":
                    if (event.value == this.address.addressType)
                        this.controlValueChanged.addressTypeChanged = false;
                    if (event.value != this.address.addressType)
                        this.controlValueChanged.addressTypeChanged = true;
                    break;
                case "streetAddress":
                    if (event.target.value == this.address.streetAddress)
                        this.controlValueChanged.streetAddressChanged = false;
                    if (event.target.value != this.address.streetAddress)
                        this.controlValueChanged.streetAddressChanged = true;
                    break;
                case "city":
                    if (event.target.value == this.address.city)
                        this.controlValueChanged.cityChanged = false;
                    if (event.target.value != this.address.city)
                        this.controlValueChanged.cityChanged = true;
                    break;
                case "state":
                    if (event.value == this.address.state)
                        this.controlValueChanged.statechanged = false;
                    if (event.value != this.address.state)
                        this.controlValueChanged.statechanged = true;
                    break;
                case "country":
                    if (event.value == this.address.country)
                        this.controlValueChanged.statechanged = false;
                    if (event.value != this.address.country)
                        this.controlValueChanged.statechanged = true;
                    break;
                case "zip":
                    let tempZip = event.target.value.replace(/[_-]/g, "");
                    tempZip = tempZip.split(/\s/).join("");
                    let previousZip = this.address.zip.replace(/[_-]/g, "");
                    previousZip = previousZip.split(/\s/).join("");
                    if (tempZip == previousZip)
                        this.controlValueChanged.zipChanged = false;
                    if (tempZip != previousZip)
                        this.controlValueChanged.zipChanged = true;
                    break;
            }
            this.allowEditSave();
        }
    }

    allowEditSave() {
        if (
            this.controlValueChanged.addressTypeChanged ||
            this.controlValueChanged.streetAddressChanged ||
            this.controlValueChanged.cityChanged ||
            this.controlValueChanged.statechanged ||
            this.controlValueChanged.zipChanged ||
            this.controlValueChanged.isPrimaryChanged
        )
            this.disallowChange = true;
        if (
            !this.controlValueChanged.addressTypeChanged &&
            !this.controlValueChanged.streetAddressChanged &&
            !this.controlValueChanged.cityChanged &&
            !this.controlValueChanged.statechanged &&
            !this.controlValueChanged.zipChanged &&
            !this.controlValueChanged.isPrimaryChanged
        )
            this.disallowChange = false;
        this.addressChanged.emit(this.disallowChange);
    }

    zipValidator(control: FormControl) {
        let zip = control.value.replace(/[_-]/g, "");
        const zipLength =
            zip.length == 5 ? true : zip.length == 9 ? true : false;
        console.log(zipLength);
        return zipLength ? null : { zipLengthError: true };
    }

    countryFieldChangeEvent(event) {
        this.getStatesLookup(event.value);
        this.addressFormGroup.controls["state"].reset();
        this.addressFormGroup.controls["zip"].reset();
        this.enableSave(event, "country");
        var country = this.countryList?.filter((x) => x.name == event.value)[0];
        if (country) {
            this.addressFormGroup.controls.countryCode.setValue(
                country.shortName
            );
            if (country.zipFormat) {
                this.zipFormat = country.zipFormat;
                this.zipFormatLength = this.zipFormat.length;
            }
        }
    }

    stateFieldChangeEvent(event) {
        this.enableSave(event, "state");
        this.addressFormGroup.controls["zip"].reset();
        if (event.value != null && this.stateList.length > 0) {
            var state = this.stateList?.filter((x) => x.name == event.value)[0];
            if (state) {
                this.addressFormGroup.controls.stateCode.setValue(
                    state.shortName
                );
            }
        }
    }

    zipBlurEvent(event, id) {
        this.addressForm = this.addressFormArray.controls[id] as FormGroup;
        var input = this.addressFormGroup.value?.zip;
        if (input) {
            let zip = input.replace(/[_-]/g, "");
            var zipLength = zip.length;
            var country = this.addressFormGroup.value?.country;
            if (country && this.countryList?.length > 0) {
                var res = this.countryList.filter((x) => x.name == country)[0];
                if (res && res.zipFormat) {
                    var zipFormat = res.zipFormat.replace(/[_-]/g, "");
                    var zipFormatlength = zipFormat.length;
                    if (zipLength != zipFormatlength) {
                        this.addressFormGroup.controls.zip.setErrors({
                            zipLengthError: true,
                        });
                        this.addressForm.setErrors({ zipLengthError: true });
                    }
                }
            }
        }
    }
}
