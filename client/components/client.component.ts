import {Component,ElementRef, EventEmitter, OnInit, ViewChild} from 'angular2/core';
import {NgIf, CORE_DIRECTIVES} from 'angular2/common';
import {HTTP_PROVIDERS} from 'angular2/http';
import {IDbConnection, IDatabase} from '../interface/IDbConnection';
import {IFileStatus} from '../interface/IFileStatus';
import {MigrationService} from '../services/migration.Service';
//import { Alert } from 'ng2-bootstrap/ng2-bootstrap';
import {IAlert} from '../interface/IAlert';
import {ClientAlert} from './client.alert';
import { Alert } from 'ng2-bootstrap/ng2-bootstrap';
import _ from 'lodash';


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
	//This is the files recorded in the manifest
	filesToShow: IFileStatus[];
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
			message: 'Default server name is used!',
			type: 'info'
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
		var self = this;
		this.dbConnection.databases = [this.selectedDatabase];

		//fileToShow has the correct sequence
		_(this.filesToShow).forEach(function(file: IFileStatus){

			for (var i = 0; i < self.filesToUpload.length; i++){
				if (_.trim(self.filesToUpload[i].name.toString())==_.trim(file.fileName)){
					self.service.RunSqlScript(self.dbConnection, self.filesToUpload[i])
						.then(
						success => {
							file.isShowStatus = true;
							file.isSuccess = true;
						},
						error => {
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


		return _.isEqual(realFiles, manifestFiles);



    }



}