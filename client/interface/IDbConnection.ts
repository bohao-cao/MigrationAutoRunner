export interface IDbConnection{
	server: string;
	userName: string;
	password: string;
	databases: IDatabase[];
}

export interface IDatabase{
	name: string;
}