import { Component, Input} from 'angular2/core';
import { CORE_DIRECTIVES } from 'angular2/common';
import { Alert } from 'ng2-bootstrap/ng2-bootstrap';
import {IAlert} from '../interface/IAlert';

@Component({
  selector: 'client-alert',
  templateUrl: "client/components/client.alert.html",
  directives: [Alert, CORE_DIRECTIVES],
  //inputs:['message']
})

//types danger, success, warning, info
export class ClientAlert {

  alerts: Array<Object> = [];


  clearAllAlerts(){
    this.alerts = [];
  }


  closeAlert(i: number) {
    this.alerts.splice(i, 1);
  }

  addAlert(message: IAlert) {
    let timeout = 0;
    if (message.type == "warning" || message.type == "success" || message.type == "info")
      timeout = 5000;
    if (message.type == "danger")
    timeout = 0;
    this.alerts.push(
      {
        type: message.type,
        message: message.message,
        closable: true,
        dismissOnTimeout: timeout
      }
    );
      
  }

}