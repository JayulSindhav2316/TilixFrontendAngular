import {Component} from '@angular/core';
import {AppComponent} from './app.component';
import {VersionComponent} from './shared/version/version.component'
@Component({
    selector: 'app-footer',
    template: `
        <div class="layout-footer">
            <a target="blank" id="footerlogolink" href="https://www.membermax.com">
                <img id="footer-logo" height="64"
                     [src]="'assets/layout/images/logo-' + (app.layoutMode === 'light' ? 'trilix' : 'trilix-dark') + '.png'" alt="posedion-layout">
            </a>
            <div class="social-icons">
                <app-version></app-version>
            </div>
        </div>
    `
})
export class AppFooterComponent {

    constructor(public app: AppComponent) {}


}
