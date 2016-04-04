import {IDbConnection, IDatabase} from '../interface/IDbConnection';
import {Injectable} from 'angular2/core';
import {Http, Response, Headers, RequestOptions, Jsonp, URLSearchParams} from 'angular2/http';
import {Observable}     from 'rxjs/Observable';


@Injectable()


export class MigrationService{
	_url = 'http://10.28.17.74:5000';

	constructor(private http: Http){}

	GetAllAvailableDatabases(dbConnection:IDbConnection){
		let uri = this._url + '/allDatabases/' + encodeURIComponent(dbConnection.server) + '/' + encodeURIComponent(dbConnection.userName) 
			+ '/' + encodeURIComponent(dbConnection.password);
		return this.http.get(uri)
			.toPromise()
			.then(
				res => { 
					return <IDatabase[]>res.json(); 
				}
				,this.handleError);

	}

	RunSqlScript(dbConnection: IDbConnection, file: File) {
		let self = this;
		return  new Promise((res, err) => {
			let formData = new FormData();
			let xhr = new XMLHttpRequest();

			let uri = this._url + '/upload/' + encodeURIComponent(dbConnection.server) + '/' + encodeURIComponent(dbConnection.userName)

				+ '/' + encodeURIComponent(dbConnection.password) + '/' + encodeURIComponent(dbConnection.databases[0]);
			formData.append('file', file, file.name);

			xhr.onreadystatechange = function() {
				if (xhr.readyState == 4){
					if (xhr.status === 200) {
						return res(xhr.response);						
					}
					else {
						err(self.handleError({ message: xhr.response }));
					}					
				}
			}
			//formData.append('files', JSON.stringify(dbConnection),'a');
			xhr.open("POST", uri, true);
			
			xhr.send(formData);			
		});
	}

	LoadConnectionInfoList(){
		let uri = this._url + '/allConnectionInfo';
		return this.http.get(uri)
			.toPromise()
			.then(
			res => {
				return <any[]>res.json();
			}
			, this.handleError);

	}

	GetConnectionDetailsById(id: number){
		let uri = this._url + '/connectionInfoDetail/' + encodeURIComponent(id);

		return this.http.get(uri)
			.toPromise()
			.then(
				res =>{
					return res.json();
				}
				,this.handleError);
			
	}

	deleteConnectionInfoByName(name:string){
		let uri = this._url + '/connectionInfo/' + encodeURIComponent(name);
		return this.http.delete(uri)
			.toPromise()
			.then(
			res => {
				return res.status;
			}
			, this.handleError);
	}

	SaveConnectionInfo(dbConnection: IDbConnection, profileName: string) {
		
		let uri = this._url + '/connectionInfo';
		let body = {
			server: dbConnection.server,
			userName: dbConnection.userName,
			password: dbConnection.password,
			database: dbConnection.databases[0],
			profileName: profileName,
		};
		let headers = new Headers({'Content-Type': 'application/json'});
		let options = new RequestOptions({ headers: headers });

		return this.http.post(uri, JSON.stringify(body), options)
			.toPromise()
			.then(
			res => {
				return res;
			}
			, this.handleError);
		
	}
	

	handleError(error: any){
		// in a real world app, we may send the error to some remote logging infrastructure
		// instead of just logging it to the console
		console.error('Error found:' + JSON.stringify(error));
		return Promise.reject(error.message || error.json().error || 'Server error');
	};
}

