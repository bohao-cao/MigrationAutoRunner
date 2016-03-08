import { Component, Input} from 'angular2/core';
import { CORE_DIRECTIVES } from 'angular2/common';
import { Alert } from 'ng2-bootstrap/ng2-bootstrap';

@Component({
  selector: 'client-alert',
  templateUrl: "client/components/client.alert.html",
  directives: [Alert, CORE_DIRECTIVES],
  inputs:['message']
})

export class ClientAlert {
  @Input() message: any;
  // alerts: Array<Object> = [
  //   {
  //     type: 'danger',
  //     msg: 'Oh snap! Change a few things up and try submitting again.'
  //   },
  //   {
  //     type: 'success',
  //     msg: 'Well done! You successfully read this important alert message.',
  //     closable: true
  //   }
  // ];

  // alerts: Array<Object> =[{
  //   type: .type,
  //   msg: this.message.msg
  // }]

  // closeAlert(i: number) {
  //   this.alerts.splice(i, 1);
  // }

  // addAlert() {
  //   this.alerts.push({ msg: 'Another alert!', type: 'warning', closable: true });
  // }

  clostMyAlert(){
    
  }
}