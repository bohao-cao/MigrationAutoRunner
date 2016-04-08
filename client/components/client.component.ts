import {Component,ElementRef, EventEmitter, OnInit, ViewChild, AfterViewInit} from 'angular2/core';
import {NgIf, CORE_DIRECTIVES, NgForm} from 'angular2/common';
import {HTTP_PROVIDERS} from 'angular2/http';
import {IDbConnection, IDatabase} from '../interface/IDbConnection';
import {IFileStatus, Status} from '../interface/IFileStatus';
import {IConnectionProfile} from '../interface/IConnectionProfile';
import {IConnectionProfileDetail} from '../interface/IConnectionProfileDetail';
import {MigrationService} from '../services/migration.Service';
import {IAlert} from '../interface/IAlert';
import {ClientAlert} from './client.alert';
import { Alert } from 'ng2-bootstrap/ng2-bootstrap';
import _ from 'lodash';
import async from 'async';


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


export class ClientComponent implements AfterViewInit {
	@ViewChild(ClientAlert) clientAlert: ClientAlert; 
	complete: EventEmitter = new EventEmitter();

	filesToUpload: File[];
	//This is the files recorded in the manifest
	filesToShow: IFileStatus[];
	dbConnection: IDbConnection;

	isShowRunButton = false;
	isShowRunFromSelectedButton = false;
	isConnecting = false;

	selectedFile : IFileStatus;
	selectedDatabase: string;

	alert: IAlert;

	profileName: string;
	isShowConnectionName: boolean;
	isKeepAllLogs: boolean;

	conectionInfoList: IConnectionProfile[] = [];
	selectedConnInfo: IConnectionProfile = {profileName:"", _id:0};
	selectedConnInfoStr: String;

	constructor(private service: MigrationService){
		this.dbConnection = { server: "", userName: "", password: "", databases: [] };
		this.filesToShow = [];
		this.isKeepAllLogs = true;

		this.loadConnectionInfo();

	}

	ngAfterViewInit() {
		// viewChild is set
		this.clientAlert.addAlert({
			message: 'For known issues please visit https://github.com/bohao-cao/MigrationAutoRunner/issues',
			type: 'info',
			timeout: 30000
		});
	}

	//view event handler
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

	loadConnectionInfo(){
		let self = this;
		this.service.LoadConnectionInfoList()
			.then(
			list => {
				self.conectionInfoList = list;
				if (list.length > 0){
					self.selectedConnInfo = list[0];
					self.selectedConnInfoStr = list[0].profileName;
				}

			},
			err => {
				console.log(err);
			}
			);
	}

	deleteSelected(){
		let self = this;
		this.service.deleteConnectionInfoByName(this.selectedConnInfo.profileName)
			.then(
			() => {
				self.loadConnectionInfo();				
				if (self.conectionInfoList.length > 0)
					self.selectedConnInfo = self.conectionInfoList[0];
				this.clientAlert.addAlert({
					message: 'Connection Info successfully deleted.',
					type: 'success'
				});
			},
			err => {
				this.clientAlert.addAlert({
					message: 'Error during delete connection info:' + err,
					type: 'danger'
				});
			}
			);
	}

	saveConnectionInfo() {
		//validation
		let dbConnection = _.clone(this.dbConnection);
		dbConnection.databases = [this.selectedDatabase];	
		this.isShowConnectionName = false;
		this.service.SaveConnectionInfo(dbConnection, _.escape(this.profileName)).then(
			success=>{
				this.profileName = "";
				this.loadConnectionInfo();
				this.clientAlert.addAlert({
					message: 'Connection Info successfully saved.',
					type: 'success'
				});
			},
			error=>{
				this.profileName = "";
				this.clientAlert.addAlert({
					message: 'Error during save connection info:' + error,
					type: 'danger'
				});
			});

	}

	//connect with select profile
	connectWithSelected(){
		let self = this;
		this.service.GetConnectionDetailsById(self.selectedConnInfo._id).then(
					data=>{
						self.dbConnection.server = data.server;
						self.dbConnection.userName = data.userName;
						self.dbConnection.password = data.password;
						let connection:IDbConnection = {
							server: data.server,
							userName: data.userName,
							password: data.password,
							databases: []
						}
						self.onConnect(connection).then(()=>{
							self.selectedDatabase = data.database;	
						});
						
						
					});					
								
	}

	onSelectedChanged(event){
		this.selectedConnInfo = this.conectionInfoList.find(o => o.profileName === this.selectedConnInfoStr);
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
					status: Status.None,
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

    clearAllLogs(){
		this.clientAlert.clearAllAlerts();
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

    //service call
    onConnect(connection: IDbConnection){
		let self = this;
		this.isConnecting = true;
		return this.service.GetAllAvailableDatabases(connection)
			.then(
			dbs=> {
				let viewDbs: string[] = [];
				_(dbs).forEach(function(db: IDatabase) {
					viewDbs.push(db.name);
				});

				self.dbConnection.databases = viewDbs;
				self.selectedDatabase = viewDbs[0];	
				self.isConnecting = false;				
			},
			error=>{
				let errorOutput = "error when login:" + error;
				self.clientAlert.addAlert({
					message: errorOutput,
					type: 'danger'
				});
				self.isConnecting = false;	
			});
			
    }

    runAll(){       	
		var self = this;
		if(!self.isKeepAllLogs)
			self.clientAlert.clearAllAlerts();
		let dbConnection = _.clone(this.dbConnection);
		dbConnection.databases = [this.selectedDatabase];	
		let tasks = [];

		function finalCallback(err, result) {
			if (err) {
				let errOutput = 'Run all terminated due to errors.'
				self.clientAlert.addAlert({
					message: errOutput,
					type: 'warning'
				});
			}
			else {
				let success = 'Run all succeeded.'
				self.clientAlert.addAlert({
					message: success,
					type: 'success'
				});
			}
		};
		
		//fileToShow has the correct sequence
		_(this.filesToShow).forEach(function(fileView: IFileStatus) {
			for (let i = 0; i < self.filesToUpload.length; i++) {
				if (_.trim(self.filesToUpload[i].name.toString()) === _.trim(fileView.fileName)) {
					//let idx = i;
					let f = self.runSqlScript;
					tasks.push(function(callback) {
						f(self, dbConnection, i, fileView, callback);
					});
				}
			}
		});

		async.series(tasks, finalCallback);
    }

    runFromSelected(){
		var self = this;
		if (!self.isKeepAllLogs)
			self.clientAlert.clearAllAlerts();
		
		let dbConnection = _.clone(this.dbConnection);
		dbConnection.databases = [this.selectedDatabase];
		let tasks = [];

		function finalCallback(err, result) {
			if (err) {
				let errOutput = 'Run all terminated due to errors.'
				self.clientAlert.addAlert({
					message: errOutput,
					type: 'warning'
				});
			}
			else {
				let success = 'Run all succeeded.'
				self.clientAlert.addAlert({
					message: success,
					type: 'success'
				});
			}
		};

		let isFoundStartingPoint = false;
		//fileToShow has the correct sequence
		_(this.filesToShow).forEach(function(fileView: IFileStatus) {
			if (fileView.fileName !== self.selectedFile.fileName && !isFoundStartingPoint)
				return;
			else if (fileView.fileName === self.selectedFile.fileName) {
				isFoundStartingPoint = true;
			}

			for (let i = 0; i < self.filesToUpload.length; i++) {
				if (_.trim(self.filesToUpload[i].name.toString()) === _.trim(fileView.fileName)) {
					//let idx = i;
					let f = self.runSqlScript;
					tasks.push(function(callback) {
						f(self, dbConnection, i, fileView, callback);
					});
				}
			}
		});

		async.series(tasks, finalCallback);
    }

    //private utility methods

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

		_.pull(manifestFiles, "");

		return _.isEqual(realFiles.sort(), manifestFiles.sort());
    }

    private runSqlScript(self, dbConnection, fileToUploadIndex, fileView: IFileStatus, callback) {
		fileView.status = Status.Busy;
		self.service.RunSqlScript(dbConnection, self.filesToUpload[fileToUploadIndex])
			.then(
			data => {
				fileView.status = Status.Success;
				callback(null);
			})
			.catch(
			error => {
				let errOutput = "Error executing " + fileView.fileName + " : " + error._result;
				self.clientAlert.addAlert({
					message: errOutput,
					type: 'danger'
				});
				fileView.status = Status.Failed;
				callback(error);
			});
	}


}