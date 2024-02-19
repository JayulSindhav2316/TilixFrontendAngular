export interface UserVerification {
    userId: number;
    verificationRequired: boolean;
    emailDisplay: string;
    phoneDisplay: string;
    verificationToken: string;
    tenantName: string;
    verificationTimeLimit: number;
}