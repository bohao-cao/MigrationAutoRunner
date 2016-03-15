import {Component,ElementRef, EventEmitter, OnInit, ViewChild} from 'angular2/core';
import {NgIf, CORE_DIRECTIVES, NgForm} from 'angular2/common';
import {HTTP_PROVIDERS} from 'angular2/http';
import {IDbConnection, IDatabase} from '../interface/IDbConnection';
import {IFileStatus} from '../interface/IFileStatus';
import {MigrationService} from '../services/migration.Service';
import {IAlert} from '../interface/IAlert';
import {ClientAlert} from './client.alert';
import { Alert } from 'ng2-bootstrap/ng2-bootstrap';
import _ from 'lodash';
import {async} from 'async';

@Component({
	selector: 'migration-auto-runner',
	templateUrl: 'client/components/client.component.html',
	styleUrls:['client/css/client.component.css'],
	providers:[
		HTTP_PROVIDERS,
		MigrationService
	],
	directives: [ClientAlert]	
})


export class ClientComponent{
	@ViewChild(ClientAlert) clientAlert: ClientAlert; 
	complete: EventEmitter = new EventEmitter();

	filesToUpload: File[];
	//This is the files recorded in the manifest
	filesToShow: IFileStatus[];
	dbConnection: IDbConnection;

	isShowRunButton = false;
	isShowRunFromSelectedButton = false;

	selectedFile : string;
	selectedDatabase: string;

	alert: IAlert;

	profileName: string;
	isShowConnectionName: boolean;

	constructor(private service: MigrationService){
		this.dbConnection = { server: "", userName: "", password: "", databases: [] };
		this.filesToShow = [];
	}

	useDefaultServer(){
		this.dbConnection.server = 'localhost\\sql12';		
		this.clientAlert.addAlert({
			message: 'Default user name' + this.dbConnection.server + 'is used.',
			type: 'info'
		});
	}

	useDefaultUserName(){
		this.dbConnection.userName = "sa";
		this.clientAlert.addAlert({
			message: 'Default user name' + this.dbConnection.userName + 'is used.',
			type: 'info'
		});
	}

	clearUploadFiles(){
		this.filesToUpload = [];
	}

	discardConnectionInfo(){
		this.clientAlert.addAlert({
			message: 'Connection info is not saved',
			type: 'info'
		});
		this.profileName = "";
		this.isShowConnectionName = false;
	}
	saveConnectionInfo() {
		let dbConnection = _.clone(this.dbConnection);
		dbConnection.databases = [this.selectedDatabase];	
		this.isShowConnectionName = false;
		this.service.SaveConnectionInfo(dbConnection, this.profileName).then(
			success=>{

			},
			error=>{

			});

	}

	fileChangeEvent(fileInput: File[]){
		let self = this;
		this.filesToShow = [];
		let fileReader: FileReader = new FileReader();
        this.filesToUpload = fileInput.target.files;
      
        fileReader.onloadend = function(filesToShow){
      		// you can perform an action with readed data here	      	
			let ret = fileReader.result.split('\n');
			//cannot use this as the scope is limited.
			_(ret).forEach(function(file){
					self.filesToShow.push({
					fileName: file,
					isSuccess: false,
					isShowStatus: false
				});
			})
			
			if (self.isFilesAndManifestMatch())
				self.isShowRunButton = true;
			else{
				self.filesToShow = [];
				self.clientAlert.addAlert({
					message: 'not a match!',
					type: 'danger'
				});
			}
				
	      	
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
				let viewDbs: string[] = [];
				_(dbs).forEach(function(db: IDatabase) {
					viewDbs.push(db.name);
				});

				self.dbConnection.databases = viewDbs;
				self.selectedDatabase = viewDbs[0];					
			},
			error=>{
				let errorOutput = "error when login:" + error;
				self.clientAlert.addAlert({
					message: errorOutput,
					type: 'danger'
				});
			});
			
    }


    runAll(){    	
		var self = this;
		let dbConnection = _.clone(this.dbConnection);
		dbConnection.databases = [this.selectedDatabase];			

		//fileToShow has the correct sequence
		_(this.filesToShow).forEach(function(file: IFileStatus){

			for (var i = 0; i < self.filesToUpload.length; i++){
				if (_.trim(self.filesToUpload[i].name.toString())==_.trim(file.fileName)){
					self.service.RunSqlScript(dbConnection, self.filesToUpload[i])
						.then(
						data => {
							
							file.isShowStatus = true;
							file.isSuccess = true;
						})
						.catch(
						error => {
							let errOutput = "error executing " + file.fileName + " : " + error._result;
							self.clientAlert.addAlert({
								message:  errOutput,
								type: 'danger'
							});
							file.isShowStatus = true;
							file.isSuccess = false;

						});					
				}
			}

			// var fileToUpload = _.find(self.filesToUpload, function(f:File) {
			// 	let fileNameMatchKey = '/' + file.fileName + '/i';
			// 	//match keword manifest case insensitive
			// 	return _.trim(f.name.toString())==file.fileName;
			// });


		})
    }

    private isFilesAndManifestMatch() : boolean{
		let realFiles: string[]=[];
		let manifestFiles: string[]=[];

		_(this.filesToUpload).forEach(function(f: File) {
			if (f.name.match(/manifest/i))
				return;

			realFiles.push(_.trim(f.name.toString()));
		});


		_(this.filesToShow).forEach(function(f: IFileStatus) {
			manifestFiles.push(_.trim(f.fileName));
		});


		return _.isEqual(realFiles.sort(), manifestFiles.sort());



    }



}