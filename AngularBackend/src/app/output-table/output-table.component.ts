import { Component, OnInit } from '@angular/core';
import { DataService } from '../services/data.service';
import { ResponseConfigObject } from '../form/form.component';

@Component({
  selector: 'app-output-table',
  templateUrl: './output-table.component.html',
  styleUrls: ['./output-table.component.css']
})
export class OutputTableComponent implements OnInit {

  formResponse: ResponseConfigObject;
  displayMode: string;
  priceMessage: string;

  constructor(private dataService: DataService) {
  }

  ngOnInit() {
    this.dataService.responseEmitter.subscribe((response) => {
      this.formResponse = response;
    })

    this.dataService.displayModeEmitter.subscribe((response) => {
      this.displayMode = response;
    })

    this.dataService.priceMessageEmitter.subscribe((response) => {
      console.log('Caught price!')
      console.log(this.priceMessage)
      this.priceMessage = response;
    })
  }


}
