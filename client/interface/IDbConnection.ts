export interface IDbConnection{
	server: string;
	userName: string;
	password: string;
	databases: string[];
}

//model coming back from node server
export interface IDatabase{
	name: string;
}