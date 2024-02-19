import { MembershipFee } from './membership-fee';
export interface MembershipSession {
    billableEntityId: number;
    primaryMemberEntityId: number; // Added for LBOLT-1032
    entityId: number;
    currentTab?: number;
    membershipId?: number;
    membershipTypeId?: number;
    membershipFeeIds?: number[];
    additionalMembers?: number[];
    startDate?: string;
    endDate?: string;
    notes?: string;
    maxUnits?: number;
    membershipFees?:number[];
    isCompanyBillable?:boolean;
 }
 