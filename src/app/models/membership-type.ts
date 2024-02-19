
import { MembershipFee } from './membership-fee';
export interface MembershipType {
    membershipTypeId?: number;
    name?: string;
    code?: string;
    description?: string;
    period?: number;
    paymentFrequency?: number;
    status?: number;
    category?: number;
    periodName?: string;
    categoryName?: string;
    membershipFees: MembershipFee[];
    startDate?: string;
    endDate?: string;
    units?: number;
}
