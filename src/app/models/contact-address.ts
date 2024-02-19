export class ContactAddress {
    addressId: number;
    label: string;
    addressType: { name: string, code: string };
    streetAddress: string;
    city: string;
    country: string;
    countryCode: string;
    stateCode: string;
    state: string;
    zip: string;
    isPrimary: boolean;
}
