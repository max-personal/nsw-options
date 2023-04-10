import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  currentAnswerFromInputToOutput: any[];
  warningFromInputToOutput: boolean;
  pendingMessage: boolean;


  fwdAnswerToOutput($event) { 
    this.currentAnswerFromInputToOutput = $event; 
  }

  fwdWarningToOutput($event) { 
    this.warningFromInputToOutput = $event; 
  }

  fwdPendingMessage($event) { 
    this.pendingMessage = $event; 
  }


}
