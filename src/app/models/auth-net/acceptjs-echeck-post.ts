import { BankAccount } from './bank-account';

export class AcceptJSEcheckPost {
    authData: {
        clientKey: string,
        apiLoginID: string
    };
    bankData: BankAccount;
}