export default interface IJob {
  _id: string;
  company: string;
  position: string;
  status: string; // enum job statuses
  createdBy: string;
  location: string;
  type: string; // enum job types
  createdAt: number;
  updatedAt: number;
}