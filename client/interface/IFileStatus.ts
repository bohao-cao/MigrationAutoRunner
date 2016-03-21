export enum Status { Success, Failed, Busy, None };

export interface IFileStatus{
	fileName: string;
	status: Status;
}