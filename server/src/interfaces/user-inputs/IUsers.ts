export interface IUserForRegisterDTO {
    name: string;
    lastName: string;
    email: string;
    password: string;
}

export interface IUserForUpdateDTO {
    name?: string;
    lastName?: string;
    email?: string;
    location?: string;
}