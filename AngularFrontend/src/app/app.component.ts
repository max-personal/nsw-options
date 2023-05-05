import { Component, OnInit } from '@angular/core';
import { DataService } from './services/data.service';
import { AnnualPayoutList, DailyPayoutList, ResponseConfigObject } from './form/form.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {

  responseConfig: ResponseConfigObject = null;
  showAnnualChart: boolean = false;
  showDailyChart: boolean = false;
  computedAnnualPayouts: AnnualPayoutList = null;
  computedDailyPayouts: DailyPayoutList = null;

  constructor(private dataService: DataService) {
  }

  ngOnInit() {
    this.dataService.responseEmitter.subscribe((response) => {
      this.responseConfig = response;
      this.computedAnnualPayouts = response.computedAnnualPayouts;
      this.computedDailyPayouts = response.computedDailyPayouts;
      this.showAnnualChart = (response.computedAnnualPayouts != null);
      this.showDailyChart = response.showDailyChart;
    })
  }

}
