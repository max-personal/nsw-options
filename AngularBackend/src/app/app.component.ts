import { Component, OnInit } from '@angular/core';
import { DataService } from './services/data.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {

  hasChart: boolean = false;

  constructor(private dataService: DataService) {
  }

  ngOnInit() {
    this.dataService.responseEmitter.subscribe((response) => {
      this.hasChart = (response.computedAnnualPayouts != null);
      console.log('Chart: ' + this.hasChart)
    })
  }

}
