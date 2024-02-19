import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-field-error-display',
  templateUrl: './field-error-display-component.component.html',
  styleUrls: ['./field-error-display-component.component.scss']
})
export class FieldErrorDisplayComponent {
  @Input() displayError: boolean;
  @Input() addErrorMessages : any = {};
}
