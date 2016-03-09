import {Component,ElementRef, EventEmitter, OnInit, ViewChild} from 'angular2/core';
import {NgIf, CORE_DIRECTIVES} from 'angular2/common';
import {HTTP_PROVIDERS} from 'angular2/http';
import {IDbConnection, IDatabase} from '../interface/IDbConnection';
import {MigrationService} from '../services/migration.Service';
//import { Alert } from 'ng2-bootstrap/ng2-bootstrap';
import {IAlert} from '../interface/IAlert';
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
	directives: [ClientAlert]	
	//directives: [Alert]
})


export class ClientComponent{
	@ViewChild(ClientAlert) clientAlert: ClientAlert; 
	complete: EventEmitter = new EventEmitter();

	filesToUpload: File[];
	filesToShow: string[];
	dbConnection: IDbConnection;

	isShowRunButton = false;
	isShowRunFromSelectedButton = false;

	selectedFile : string;
	selectedDatabase: IDatabase;

	alert: IAlert;

	constructor(private service: MigrationService){
		this.dbConnection = { server: "", userName: "", password: "", databases: [] };
		this.filesToShow = [];
	}

	useDefaultServer(){
		this.dbConnection.server = 'localhost\\sql12';
		//this.alerts.push({ msg: 'Another alert!', type: 'warning', closable: true });
		this.clientAlert.addAlert({
			message: 'Another alert!',
			type: 'warning'
		});
	}

	useDefaultUserName(){
		this.dbConnection.userName = "sa";
		this.clientAlert.addAlert({
			message: 'default name is used',
			type: 'danger'
		});
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

    OnInit(){

    }



}