const { ObjectId } = require('mongoose').Types;

// export interface IGetAllJobsValidatedInput {
//     userId: string;
//     search: string;
//     status: string;
//     type: string;
//     sort: string;
//     page: number;
//     limit: number;
//     skip: number;
// }

export interface IGetAllJobsInputDTO {
    search: string;
    status: string;
    type: string;
    sort: string;
    page: number;
    limit: number;
    skip: number;
}

export interface ICreateJobInputDTO {
    company: string;
    position: string;
    status: string;
    createdBy: string;
    location: string;
    type: string;
}

export interface IUpdateJobInputDTO {
    userId: string;
    jobId: string;
    company: string;
    position: string;
    status: string;
    location: string;
    type: string;
}
