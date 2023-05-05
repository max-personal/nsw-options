import { Component, OnInit } from '@angular/core';
import { DataService } from '../services/data.service';
import { ResponseConfigObject } from '../form/form.component';

@Component({
  selector: 'app-output-table',
  templateUrl: './output-table.component.html',
  styleUrls: ['./output-table.component.css']
})
export class OutputTableComponent implements OnInit {

  responseConfig: ResponseConfigObject;
  displayMode: string;
  // priceMessage: string;

  constructor(private dataService: DataService) {
  }

  ngOnInit() {
    this.dataService.responseEmitter.subscribe((response) => {
      this.responseConfig = response;
    })

    this.dataService.displayModeEmitter.subscribe((response) => {
      this.displayMode = response;
    })

    // this.dataService.priceMessageEmitter.subscribe((response) => {
    //   this.priceMessage = response;
    // })
  }


}
