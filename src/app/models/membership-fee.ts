export interface MembershipFee {
    feeId?: number;
    name: string;
    description?: string;
    feeAmount?: number;
    glAccountId?: number;
    isMandatory?: number;
    billingFrequency?: number;
    status?: number;
    membershhipTypeId?: number;
    isRequired: boolean;
}
