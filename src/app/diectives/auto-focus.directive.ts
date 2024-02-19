import { Directive, ElementRef, Input } from '@angular/core';

@Directive({
  selector: '[autoFocus]'
})
export class AutoFocusDirective {
  @Input('autoFocus') isFocused: boolean;
  constructor(private hostElement: ElementRef) {
  }
  ngOnInit() {
    if (this.isFocused) {
      this.hostElement.nativeElement.focus();
    }
  }
}