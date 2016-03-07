import {IDbConnection} from '../interface/IDbConnection';
import {Injectable} from 'angular2/core';
import {Http, Response, Headers, RequestOptions, Jsonp, URLSearchParams} from 'angular2/http';
import {Observable}     from 'rxjs/Observable';


@Injectable()


export class MigrationService{
	_url = 'http://localhost:5000';


	constructor(private http: Http){}

	GetAllAvailableDatabases(dbConnection:IDbConnection){
		let uri = this._url + '/allDatabases/' + encodeURIComponent(dbConnection.server) + '/' + encodeURIComponent(dbConnection.userName) 
			+ '/' + encodeURIComponent(dbConnection.password);
		return this.http.get(uri)
			.toPromise()
			.then(res => <string[]>res.json()
			, this.handleError)
			.then(data => { return data;});

	}

	RunMigrationAll(dbConnection: IDbConnection, files: File[]){
		return new Promise((res, err)=>{
			let formData = new FormData();
			let xhr = new XMLHttpRequest();
			for (var i = 0; i < files.length; i++) {
				formData.append('files', files[i], files[i].name);
			}
			xhr.open("POST", this._url+"/upload", true);
			xhr.send(formData);			
		})

		
	}


	handleError(error: any){
		// in a real world app, we may send the error to some remote logging infrastructure
		// instead of just logging it to the console
		console.error('Error found:' + error);
		return Promise.reject(error.message || error.json().error || 'Server error');
	}
}

