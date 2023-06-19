type GetAllJobsValidatedInput = {
    search: string;
    status: string;
    type: string;
    sort: string;
    page: number;
    limit: number;
    skip: number;
}

export default GetAllJobsValidatedInput;