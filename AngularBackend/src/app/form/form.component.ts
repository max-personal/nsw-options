import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { yearVal } from '../validators/year.validators';

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

  emptyFormWarning: boolean = false;
  priceMessage: string;
  displayMode: string;

  responseConfig: ResponseConfigObject = {
    computedAnnualPayouts: null,
    pending: false,
    dbErrorMessage: false,
    emptyFormWarning: false
  }

  inputForm: any;

  constructor(private http: HttpClient, private dataService: DataService, fb: FormBuilder) {

    this.inputForm = fb.group({
        earliestYear: ['', [Validators.required, yearVal.yearValidator]],
        tempTrigger: ['', [Validators.required]],
        strikePrice: ['', [Validators.required]],
      })

    this.resetInputForm()

  }

  get fc() {
    return this.inputForm.controls;
  }

  resetInputForm() {
    this.inputForm.patchValue({
      earliestYear: 2000,
      tempTrigger: 40,
      strikePrice: 300,
    })
  }

  setDisplayMode(mode: string) {
    this.dataService.raiseDisplayModeEvent(mode)
  }

  broadcastPriceMessage(msg: string) {
    console.log('From form: ' + msg)
    this.dataService.raisePriceMessageEvent(msg)
  }

  loadFuturesPrice() {
    this.setDisplayMode('message');
    var emptyFormData: any = new FormData();

    this.http.post('http://localhost:5724/future_price', emptyFormData)
      .subscribe((res: any) =>
        {
          this.broadcastPriceMessage('Futures price updated! The current value is A$' + res.price + '.');
        },
        (error) => {
          this.broadcastPriceMessage('Website error - please try again in a few minutes!');
        }
      );
      this.broadcastPriceMessage('Loading the updated futures price...')
  }

  getSavedFuturesPrice = (resolved, rejected) => {
    var emptyFormData: any = new FormData();
    this.http.get('http://localhost:5724/future_price', emptyFormData)
      .subscribe((res: any) =>
        {
          console.log(res);
          if (Object.entries(res).length === 0) {
            resolved(null);
          }
          else {
            resolved(res.price);
          }
        },
        (error) => {
          rejected('Error!');
        },
      );
  }

  showFuturesPrice () {
    let promise = new Promise(this.getSavedFuturesPrice);
    promise.then((price) => {
      this.setDisplayMode("message");
        if (price != null) {
          this.priceMessage = 'The current futures price is A$' + price + '.';
          this.broadcastPriceMessage(this.priceMessage);
        }
        else {
          this.priceMessage = 'The current futures price is not available. Please use the Load button to retrieve it!';
          this.broadcastPriceMessage(this.priceMessage);
        }
      },
      (error) => {
        console.log(error);
      }
    )
  }

  backendYearlyPayouts(formData) {
      this.http.post('http://localhost:5724/get_yearly_payouts', formData)
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
  }


  backendDailyPayouts(formData) {
    var year = formData.get('earliest_year');;
    formData.set('year', year);
    formData.delete('earliest_year');
    this.http.post('http://localhost:5724/get_daily_data', formData)
    .subscribe((res: YearPayoutList) =>
      {
        console.log(res);
      },
      (error) => {
        console.log('Error!');
        return
      }
    );
}

  computeAllPayouts() {

    var earliestYear = this.fc.earliestYear.value;
    var tempTrigger = this.fc.tempTrigger.value;
    var strikePrice = this.fc.strikePrice.value;

    this.responseConfig.dbErrorMessage = false;

    var formData: any = new FormData();
    formData.append('earliest_year', earliestYear);
    formData.append('temp_trigger', tempTrigger.toFixed(1));
    formData.append('strike', strikePrice.toFixed(1));

    let promise = new Promise(this.getSavedFuturesPrice);
    promise.then(
      (price) => {
          if (price != null) {
            formData.append('futures_price', price)
          };
          this.backendYearlyPayouts(formData);
          this.backendDailyPayouts(formData);
        },
      (error) => {
        console.log('Unexpected error!')
        }
      )

      this.responseConfig.pending = true;
      this.responseConfig.computedAnnualPayouts = null;
      this.dataService.raiseEmitterEvent(this.responseConfig);

    this.setDisplayMode('table');
    this.computeAnnualPayouts();
    this.computeDailyPayouts();
  }

  computeAnnualPayouts() {

    };

  computeDailyPayouts() {

  }

  resetValues() {
    this.resetInputForm()
    this.responseConfig.computedAnnualPayouts = null;
    this.responseConfig.pending = false;
    this.responseConfig.dbErrorMessage = false;

    this.dataService.raiseEmitterEvent(this.responseConfig);
    this.setDisplayMode("none");
  }

  ngOnInit() {
    this.dataService.raiseEmitterEvent(this.responseConfig);
  }

}
