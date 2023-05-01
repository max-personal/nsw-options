import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
// import { Chart } from 'node_modules/chart.js';

import { registerLocaleData } from '@angular/common';

import localeAu from '@angular/common/locales/en-AU';
import { DataService } from '../services/data.service';
registerLocaleData(localeAu);

interface YearPayout {
  year: number; payout: number,
}

export interface YearPayoutList extends Array<YearPayout>{}

export interface ResponseConfigObject {
  computedAnnualPayouts: YearPayoutList;
  pending: boolean;
  dbErrorMessage: boolean;
  emptyFormWarning: boolean;
}

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.css'],
})
export class FormComponent implements OnInit {

  earliest_year = 2000;
  temp_trigger = 40.0;
  strike = 300.0;
  emptyFormWarning: boolean = false;

  // dataChart: Chart = null;

  responseConfig: ResponseConfigObject = {
    computedAnnualPayouts: null,
    pending: false,
    dbErrorMessage: false,
    emptyFormWarning: false
  }

  constructor(private http: HttpClient, private dataService: DataService) {
  }

  computeFunction() {
    this.responseConfig.dbErrorMessage = false;

    if ((this.earliest_year == null) || (this.temp_trigger == null) || (this.strike == null)) {
      this.responseConfig.computedAnnualPayouts = null;
      this.emptyFormWarning = true;
      console.log('Form - case 1!')
      this.dataService.raiseEmitterEvent(this.responseConfig);
    }

    else if ((this.earliest_year < 1998) || (this.earliest_year > 2022) || (this.earliest_year % 1 != 0)) {
      alert('The year should be an integer value between 1998 and 2022!');
      this.earliest_year = 2000;
      return;
    }

    else {

      var formData: any = new FormData();
      formData.append('earliest_year', this.earliest_year);
      formData.append('temp_trigger', this.temp_trigger.toFixed(1));
      formData.append('strike', this.strike.toFixed(1));

      this.emptyFormWarning = false;

      this.http.post('https://nsw-options.herokuapp.com/get_payouts', formData)
      .subscribe((res: YearPayoutList) =>
        {
          this.responseConfig.pending = false;
          this.responseConfig.computedAnnualPayouts = res;
          this.dataService.raiseEmitterEvent(this.responseConfig);
        },
        (error) => {
          console.log('Error!');
          this.responseConfig.pending = false;
          this.responseConfig.dbErrorMessage = true;
          this.dataService.raiseEmitterEvent(this.responseConfig);
          return
        }
      );

      this.responseConfig.pending = true;
      // console.log(this.responseConfig.pending)
      this.responseConfig.computedAnnualPayouts = null;
      console.log('Form - case 4!')
      this.dataService.raiseEmitterEvent(this.responseConfig);
    };
  }

  resetValues() {
    this.earliest_year = 2000;
    this.temp_trigger = 40.0;
    this.strike = 300.0;
    this.emptyFormWarning = false;
    this.responseConfig.computedAnnualPayouts = null;
    this.responseConfig.pending = false;
    this.responseConfig.dbErrorMessage = false;

    console.log('Form - case 5!')
    this.dataService.raiseEmitterEvent(this.responseConfig);
  }

  ngOnInit() {
    console.log('Form - case 6!')
    console.log(this.responseConfig)
    this.dataService.raiseEmitterEvent(this.responseConfig);
  }

}
