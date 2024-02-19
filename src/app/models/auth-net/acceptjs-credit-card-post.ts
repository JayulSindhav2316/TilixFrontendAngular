import { CreditCard } from './credit-card';

export class AcceptJSCreditCardPost {
    authData: {
        clientKey: string,
        apiLoginID: string
    };
    cardData: CreditCard;
}