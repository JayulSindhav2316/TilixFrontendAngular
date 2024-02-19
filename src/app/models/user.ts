export class User {
    id: number;
    username: string;
    password: string;
    firstName: string;
    lastName: string;
    token: string;
    refreshToken: string;
    cartId: number;
    ipAddress: string;
    tenantId: string;
    tenantCN:string;
    tenantRCN:string;
    reportEmailSender:string;
    organizationName: string;
    organizationId: number;
    accountName : string;
    isAdmin : boolean;
    isBirthdayRequired : boolean;
}