import { Role } from './role';

export interface Staff {
    staffId? : number;
    firstName? : string;
    lastName? : string;
    email? : string;
    department? : string;
    userName? : string;
    password? : string;
    status? : number;
    lastAccessed? : Date;
    roles? : Role[];
}
