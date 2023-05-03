import { Component, OnInit } from '@angular/core';
import { DataService } from './services/data.service';
import { YearPayoutList } from './form/form.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {

  hasChart: boolean = false;
  computedAnnualPayouts: YearPayoutList = null;

  constructor(private dataService: DataService) {
  }

  ngOnInit() {
    this.dataService.responseEmitter.subscribe((response) => {
      this.computedAnnualPayouts = response.computedAnnualPayouts;
      this.hasChart = (response.computedAnnualPayouts != null);
    })
  }

}
