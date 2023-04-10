import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Chart } from 'node_modules/chart.js';

import { registerLocaleData } from '@angular/common';

import localeAu from '@angular/common/locales/en-AU';
registerLocaleData(localeAu);

interface YearPayout {
  year: number; payout: number,
}

export interface YearPayoutList extends Array<YearPayout>{}

@Component({
  selector: 'app-main-component',
  templateUrl: './main-component.component.html',
  styleUrls: ['./main-component.component.css']
})
export class MainComponentComponent {


  earliest_year = 2000;
  temp_trigger = 40.0;
  strike = 300.0;
  emptyFormWarning: boolean = false;

  currentAnswer: YearPayoutList = null;
  currentAnswerStr: string = null;
  dataChart: Chart = null;
  pendingMessage: boolean = false;
  dbErrorMessage: boolean = false;

  
  constructor(private http: HttpClient) {
  }
  
  computeFunction() {
    this.dbErrorMessage = false;

    if ((this.earliest_year == null) || (this.temp_trigger == null) || (this.strike == null)) {
      this.currentAnswer = null;
      this.emptyFormWarning = true;
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
          this.pendingMessage = false;
          this.currentAnswer = res;
          this.currentAnswerStr = JSON.stringify(res)
        },
        (error) => {
          console.log('Error!');
          this.pendingMessage = false;
          this.dbErrorMessage = true;
          return
        }
      );
      
      this.pendingMessage = true;
      this.currentAnswer = null;
    };
  }

  resetValues() {
    this.earliest_year = 2000;
    this.temp_trigger = 40.0;
    this.strike = 300.0;
    this.currentAnswer = null;
    this.emptyFormWarning = false;
    this.pendingMessage = false;
    this.dbErrorMessage = false;
  }

  // checkSomethingApp(x, y) {
  //   console.log(x, y)
  // }

}
