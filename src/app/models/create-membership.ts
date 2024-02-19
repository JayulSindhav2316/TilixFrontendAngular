export interface CreateMembership {
    membershipInventoryId?: number;
    entityId?: number;
    feeId?: number[];
    additionalEntityId?: number[];
    invoiceCreated?: boolean;
    status?: boolean;
}
