import {Component,ElementRef, EventEmitter} from 'angular2/core';
import {NgIf} from 'angular2/common';
import {HTTP_PROVIDERS} from 'angular2/http';
import {IDbConnection, IDatabase} from '../interface/IDbConnection';
import {MigrationService} from '../services/migration.Service';
import {ClientAlert} from './client.alert';
import * as _ from 'lodash';


@Component({
	selector: 'migration-auto-runner',
	templateUrl: 'client/components/client.component.html',
	styleUrls:['client/css/client.component.css'],
	providers:[
		HTTP_PROVIDERS,
		MigrationService
	],
	directives:[ClientAlert],	
})


export class ClientComponent{
	complete: EventEmitter = new EventEmitter();

	filesToUpload: File[];
	filesToShow: string[];
	dbConnection: IDbConnection;

	isShowRunButton = false;
	isShowRunFromSelectedButton = false;

	selectedFile : string;
	selectedDatabase: IDatabase;

	constructor(private service: MigrationService){
		this.dbConnection = { server: "", userName: "", password: "", databases: [] };
		this.filesToShow = [];
	}

	useDefaultServer(){
		this.dbConnection.server = 'localhost\\sql12';
	}

	useDefaultUserName(){
		this.dbConnection.userName = "sa";
	}

	clearUploadFiles(){
		this.filesToUpload = [];
	}

	fileChangeEvent(fileInput: File[]){
		let self = this;
		let fileReader: FileReader = new FileReader();

        this.filesToUpload = fileInput.target.files;
      
        fileReader.onloadend = function(filesToShow){
      		// you can perform an action with readed data here	      	
			let ret = fileReader.result.split('\n');
			//cannot use this as the scope is limited.
			self.filesToShow = ret;
			self.isShowRunButton = true;
			console.log(self.filesToShow);
	      	
    	}

		let manifestFile = _.find(this.filesToUpload, function(o) {
			//match keword manifest case insensitive
			return o.name.match(/manifest/i);
		});
    	fileReader.readAsText(manifestFile); 
     
    }

    onSelectFile(file){
    	if(this.selectedFile == file){
			this.selectedFile = null;
			this.isShowRunFromSelectedButton = false;
    	}	
		else{
			this.selectedFile = file;
			this.isShowRunFromSelectedButton = true;
		}
    }

    onConnect(){
		let self = this;
		this.service.GetAllAvailableDatabases(this.dbConnection)
			.then(
			dbs=> {
				self.dbConnection.databases = dbs;
				self.selectedDatabase = {
					name: self.dbConnection.databases[0].name
				} 
			},
			error=>{
				console.log(error)
			});
			
    }


    runAll(){
		this.dbConnection.databases = [this.selectedDatabase];
		
		this.service.RunMigrationAll(this.dbConnection, this.filesToUpload)
			.then((res)=>{
				res => console.log('success')
			}
			);
    }


}