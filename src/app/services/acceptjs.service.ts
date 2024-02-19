import { Injectable, OnDestroy, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { CreditCard } from '../models/auth-net/credit-card';
import { BankAccount } from '../models/auth-net/bank-account';
import { AcceptJSResponse } from '../models/auth-net/acceptjs-response';
import { AcceptJSEcheckPost } from '../models/auth-net/acceptjs-echeck-post';
import { Config } from '../models/auth-net/config';
import { TK_CONFIG } from './tk-config';
import { Observable, isObservable, Unsubscribable } from 'rxjs';
import { AuthNetService } from '../services/auth-net.service';
import { AuthService } from '../services/auth.service';
declare var Accept: any;

@Injectable({
  providedIn: 'root'
})
export class AcceptJSEcheckService {

  private element: HTMLScriptElement;
  private activeConfig: Config = null;
  private unsubscribeConfig: Unsubscribable;
  merchantInfo: any;
  constructor(private authService: AuthService,private authNetService: AuthNetService) {
  }
  public generateEcheckPaymentNonce(bankAccount: BankAccount): Promise<string> {
    let config = JSON.parse(localStorage.getItem('currentMerchantInfo'));
    const secureData: AcceptJSEcheckPost = {
      authData: {
        clientKey:  config.clientKey,
        apiLoginID: config.apiLoginID
      },
      bankData: bankAccount
    };

    return new Promise((resolve, reject) => {
      Accept.dispatchData(secureData, (response: AcceptJSResponse) => {
        if (response.messages.resultCode === 'Error') {
          reject(response);
          return;
        }
        const nonce = response.opaqueData.dataValue;
        resolve(nonce);
      });
    });
  }
 
}