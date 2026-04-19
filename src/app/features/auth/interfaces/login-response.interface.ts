import { Role } from "./role.interface";

export interface LoginResponse {
    token: string;
    email: string;
    fullname : string;
    role: Role;
};