import { Component, EventEmitter, forwardRef, Input, OnInit, Output } from '@angular/core';
import { AbstractControl, ControlValueAccessor, FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { NG_VALIDATORS, NG_VALUE_ACCESSOR, ValidationErrors, Validator, Validators } from '@angular/forms';
import { InvoiceItemService } from 'src/app/services/invoice-item.service';
import { HttpParams } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { CurrencyPipe } from '@angular/common';
import { MessageService } from 'primeng/api';
import { EntityService } from 'src/app/services/entity.service';

type ChangeCallbackFn<T> = (value: T) => void;
type TouchCallbackFn = () => void;

@Component({
  selector: 'app-line-item',
  templateUrl: './line-item.component.html',
  styleUrls: ['./line-item.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => LineItemComponent),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => LineItemComponent),
      multi: true
    },
    CurrencyPipe
  ]
})

export class LineItemComponent implements OnInit {

  lineItmeFormGroup = this.formBuilder.group({
    InvoiceDetailId: [0],
    LineItemId: [0],
    ItemCode: ['', [Validators.required]],
    ItemCodeSearch: [''],
    Description: ['', [Validators.required]],
    DescriptionSearch: [''],
    Quantity: ['', [Validators.required]],
    Rate: ['', Validators.required],
    Amount: [''],
    StockCount: [0],
    ItemType: [0],
    EnableStock: [],
    BillableEntityId: [0],
    Status : [0]
  });

  addErrorMessages: any = {};
  itemList: any[];
  $filtered = new BehaviorSubject([]);

  showDescription: boolean;
  showItemCode: boolean;
  showItemSearch: boolean;
  showDescriptionSearch: boolean;
  stockCount: number = 0;
  itemType: number = 0;
  existingQuantity: number = 0;
  runningStockCount: number = 0;
  enableStock: boolean;
  status : number;

  @Input() controlId: string;
  @Input() entity: any;
  @Input() invoiceFormSubmitted: boolean;
  @Output() otherFormClicked = new EventEmitter<{ validation: boolean, itemId: number, billableEntityId: number, invalidQty: boolean, errorMessage: string }>();


  onTouched: () => void = () => { };
  relationsList: any;

  constructor(private formBuilder: FormBuilder,
    private invoiceItemService: InvoiceItemService,
    private currencyPipe: CurrencyPipe,
    private messageService: MessageService,
    private entityService: EntityService) {
    this.showDescription = false;
    this.showItemCode = false;
    this.showItemSearch = true;
    this.showDescriptionSearch = true;
  }

  ngOnInit(): void {
    if (this.entity) {
      this.getRelations();
      this.lineItmeFormGroup.get("BillableEntityId").setValue(this.entity.entityId.toString());
    }
  }

  getInvoiceItems(itemCode) {
    let searchParams = new HttpParams();
    searchParams = searchParams.append('itemCode', itemCode);
    searchParams = searchParams.append('status', 1);
    const opts = { params: searchParams };
    console.log('Search Code:' + JSON.stringify(opts));
    this.invoiceItemService.getInvoiceItemsByCode(opts).subscribe((data: any) => {
      this.showDescription = true;
      this.showDescriptionSearch = false;
      console.log(data);
      this.$filtered.next([...data]);

    });
  }

  getInvoiceItemsByName(name) {
    let searchParams = new HttpParams();
    searchParams = searchParams.append('name', name);
    searchParams = searchParams.append('status', 1);
    const opts = { params: searchParams };
    console.log('Search Name:' + JSON.stringify(opts));
    this.invoiceItemService.getInvoiceItemsByName(opts).subscribe((data: any) => {
      this.showItemCode = true;
      this.showItemSearch = false;
      console.log(data);
      this.$filtered.next([...data]);

    });
  }

  validate(control: AbstractControl): ValidationErrors | null {
    if (this.lineItmeFormGroup.valid) {
      return null;
    }
    return { invalidForm: { valid: false, message: 'Item fields are invalid' } };
  }

  writeValue(val: any): void {
    if (val) {
      if (val.LineItemId > 0) {
        this.stockCount = val.StockCount;
        this.runningStockCount = val.StockCount;
        this.itemType = val.ItemType;
        this.enableStock = val.EnableStock;
        this.existingQuantity = val.Quantity;
        this.showItemSearch = false;
        this.showDescriptionSearch = false;
        this.showItemCode = true;
        this.showDescription = true;
        this.status = val.Status
      }
      else {
        this.showItemSearch = true;
        this.showDescriptionSearch = true;
        this.showItemCode = false;
        this.showDescription = false;
      }

      this.lineItmeFormGroup.setValue(val, { emitEvent: false });
    }
  }

  registerOnChange(fn: ChangeCallbackFn<object>): void {
    this.lineItmeFormGroup.valueChanges.subscribe(fn);
  }

  registerOnTouched(fn: TouchCallbackFn): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    if (isDisabled) {
      this.lineItmeFormGroup.disable();
    } else {
      this.lineItmeFormGroup.enable();
    }
  }

  errorIconCss(field: string) {
    return { 'has-feedback': this.isFieldValid(field) };
  }

  errorFieldCss(field: string) {
    return { 'ng-dirty': this.isFieldValid(field) };
  }

  resetSubmitted(field) {
    this.invoiceFormSubmitted = false;
    this.isFieldValid(field);
    this.otherFormClicked.emit({ validation: this.invoiceFormSubmitted, itemId: 0, billableEntityId: 0, invalidQty: false, errorMessage: '' });
  }


  isFieldValid(field: string) {
    if ((!this.lineItmeFormGroup.get(field).valid) && (this.invoiceFormSubmitted) && (this.lineItmeFormGroup.get(field).hasError('required'))) {
      if (field == 'ItemCode') {
        field = 'Item Code'
        this.addErrorMessages = { errorType: 'required', controlName: field };
      }
      if (field == 'Description') {
        field = 'Description'
        this.addErrorMessages = { errorType: 'required', controlName: field };
      }
      if (field == 'Quantity') {
        field = 'Quantity'
        this.addErrorMessages = { errorType: 'required', controlName: field };
      }
      if (field == 'Rate') {
        field = 'Rate'
        this.addErrorMessages = { errorType: 'required', controlName: field };
      }
      if (field == 'Amount') {
        field = 'Amount'
        this.addErrorMessages = { errorType: 'required', controlName: field };
      }
      return true;
    }

    if (this.lineItmeFormGroup.get(field).hasError('minFeeRequired')) {
      this.addErrorMessages = { errorType: 'minFeeRequired', controlName: 'Amount' };
      return true;
    }

  }

  getItemsByCode(event: any) {
    let itemCode = this.lineItmeFormGroup.get('ItemCodeSearch').value;
    this.itemList = [];

    if (itemCode.length > 2) {
      this.getInvoiceItems(itemCode);
    }
  }
  getItemsByName(event: any) {
    let description = this.lineItmeFormGroup.get('DescriptionSearch').value;
    this.itemList = [];

    if (description.length > 2) {
      this.getInvoiceItemsByName(description);
    }
  }

  setItems(item: any) {
    console.log("Selected value:" + JSON.stringify(item));
    this.itemType = item.itemType;
    this.stockCount = item.stockCount;
    this.enableStock = item.enableStock;

    if (this.enableStock && item.stockCount <= 0) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No stocks available for this item.', life: 3000 });
      this.lineItmeFormGroup.reset();
      return;
    }
    if (item.stockCount <= 0) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No stocks available for this item.', life: 3000 });
      this.lineItmeFormGroup.reset();
      return;
    }
    else {
      this.lineItmeFormGroup.get('InvoiceDetailId').setValue(0);
      this.lineItmeFormGroup.get('LineItemId').setValue(item.itemId);
      this.lineItmeFormGroup.get('Description').setValue(item.description);
      this.lineItmeFormGroup.get('ItemCode').setValue(item.itemCode);
      this.lineItmeFormGroup.get('Quantity').setValue(1);
      this.lineItmeFormGroup.get('Rate').setValue(item.unitRate.toFixed(2));
      let quantity = this.lineItmeFormGroup.get('Quantity').value;
      let rate = this.lineItmeFormGroup.get('Rate').value;
      let amount = rate * quantity;
      this.lineItmeFormGroup.get('Amount').setValue(amount.toFixed(2));
      this.otherFormClicked.emit({ validation: true, itemId: item.itemId, billableEntityId: this.lineItmeFormGroup.value?.BillableEntityId, invalidQty: false, errorMessage: '' });
    }
  }

  quantityChanged(event: any) {
    let maxQuantity = this.existingQuantity + this.stockCount;
    this.runningStockCount = this.runningStockCount - 1;
    console.log("Quantity value:" + this.lineItmeFormGroup.get('Quantity').value);

    let quantity = parseInt(this.lineItmeFormGroup.get('Quantity').value);
    if (quantity < 1) {
      quantity = 1;
      this.lineItmeFormGroup.get('Quantity').setValue(1);
    }
    if (this.enableStock && this.stockCount <= 0 && quantity > this.existingQuantity) {
      // this.stockCount = this.stockCount - quantity;
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No stocks available for this item.', life: 3000 });
      this.lineItmeFormGroup.get('Quantity').setValue(quantity);
      this.otherFormClicked.emit({ validation: true, itemId: 0, billableEntityId: 0, invalidQty: true, errorMessage: 'No stocks available for this item.' });
    }
    else if (this.enableStock && quantity > maxQuantity) {
      // this.stockCount = this.stockCount - quantity;
      let message = 'Only ' + this.stockCount + ' item(s) left in the stock';
      this.messageService.add({ severity: 'error', summary: 'Error', detail: message, life: 3000 });
      this.lineItmeFormGroup.get('Quantity').setValue(quantity);
      this.runningStockCount = 0;
      this.otherFormClicked.emit({ validation: true, itemId: 0, billableEntityId: 0, invalidQty: true, errorMessage: message });
    }
    else {
      // this.stockCount = this.stockCount - quantity;
      let rate = this.lineItmeFormGroup.get('Rate').value;
      let amount = rate * quantity;
      let totalamount = amount.toFixed(2);
      this.lineItmeFormGroup.get('Amount').setValue(totalamount);
      this.otherFormClicked.emit({ validation: true, itemId: 0, billableEntityId: 0, invalidQty: false, errorMessage: '' });
    }
  }

  rateChanged(event: any) {
    console.log("Rate value:" + this.lineItmeFormGroup.get('Quantity').value);
    let quantity = this.lineItmeFormGroup.get('Quantity').value;
    let rate: any = parseFloat(this.lineItmeFormGroup.get('Rate').value).toFixed(2);
    if (rate < 0) {
      rate = 0;
      this.lineItmeFormGroup.get('Rate').setValue(rate.toFixed(2));
    }
    let amount: any = rate * quantity;
    let totalamount = amount.toFixed(2);
    this.lineItmeFormGroup.get('Amount').setValue(totalamount);
    this.otherFormClicked.emit({ validation: true, itemId: 0, billableEntityId: 0, invalidQty: false, errorMessage: '' });
  }


  amountChanged(event: any) {
    console.log("Rate value:" + this.lineItmeFormGroup.get('Quantity').value);
    let quantity = this.lineItmeFormGroup.get('Quantity').value;
    let amount: any = parseFloat(this.lineItmeFormGroup.get('Amount').value).toFixed(2);
    let rate: any = parseFloat(this.lineItmeFormGroup.get('Rate').value).toFixed(2);
    if (amount < 0) {
      amount = 0;
      this.lineItmeFormGroup.get('Amount').setValue(amount.toFixed(2));
    }
    let totalRate: any = rate * quantity;
    let finalAmount = totalRate.toFixed(2);
    if (amount > finalAmount) {

      this.lineItmeFormGroup.get('Amount').setValue(finalAmount);
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Item(s) amount cannot be greater than item(s) price.', life: 3000 });
      this.otherFormClicked.emit({ validation: true, itemId: 0, billableEntityId: 0, invalidQty: false, errorMessage: '' });
    }
    else {
      let totalamount = amount;
      this.lineItmeFormGroup.get('Amount').setValue(totalamount);
      this.otherFormClicked.emit({ validation: true, itemId: 0, billableEntityId: 0, invalidQty: false, errorMessage: '' });
    }
  }

  itemSearchValidation(event) {
    if (event.target.value.length == 0) {
      this.lineItmeFormGroup.reset();
      this.showDescription = false;
      this.showItemCode = false;
      this.showItemSearch = true;
      this.showDescriptionSearch = true;
      this.otherFormClicked.emit({ validation: true, itemId: 0, billableEntityId: 0, invalidQty: false, errorMessage: '' });
    }
  }

  getRelations() {
    console.log('Get relations:' + this.entity.entityId.toString());
    let searchParams = new HttpParams();
    searchParams = searchParams.append('entityId', this.entity.entityId.toString());
    const opts = { params: searchParams };
    this.entityService.getRelationListByEntityId(opts).subscribe((data: any) => {
      console.log(data);
      if (data) {
        this.relationsList = data;
      }
    });
  }
}
