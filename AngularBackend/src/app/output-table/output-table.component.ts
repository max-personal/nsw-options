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

  constructor(private dataService: DataService) {
  }

  checkSmth() {
    console.log(this.formResponse)
  }

  ngOnInit() {
    this.dataService.responseEmitter.subscribe((response) => {
      this.formResponse = response;
      console.log('L5!');
      console.log(response);
    })
  }


}
