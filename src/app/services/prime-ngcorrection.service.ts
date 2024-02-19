import { Injectable } from "@angular/core";
import { OverlayPanel } from "primeng/overlaypanel";

@Injectable()
export class PrimeNGCorrectionService {

  init() {
    this.installOverlayPanelFix();
  }
  private installOverlayPanelFix() {
    OverlayPanel.prototype.hide = function (this: OverlayPanel) {
      this.overlayVisible = false;
      this.cd.markForCheck();
      this.render = false;
      this.overlayVisible = false;
    };

    const onAnimationEndSource: Function = OverlayPanel.prototype.onAnimationEnd;
    OverlayPanel.prototype.onAnimationEnd = function (this: OverlayPanel, event: any) {
      onAnimationEndSource.call(this, event);
      if (event.toState === "close") {
        this.render = true;
      }
    };
  }
}