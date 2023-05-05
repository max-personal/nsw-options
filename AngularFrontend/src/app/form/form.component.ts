import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, Validators } from '@angular/forms';
import { yearVal } from '../validators/year.validators';

import { registerLocaleData } from '@angular/common';

import localeAu from '@angular/common/locales/en-AU';
import { DataService } from '../services/data.service';
registerLocaleData(localeAu);

interface AnnualPayout {
  year: number;
  payout: number,
}

interface DailyPayout {
  month: number;
  day: number;
  tMax: number;
  payout: number;
}

export interface AnnualPayoutList extends Array<AnnualPayout>{}
export interface DailyPayoutList {
  year: number;
  data: Array<DailyPayout>;
}

export interface ResponseConfigObject {
  computedAnnualPayouts: AnnualPayoutList;
  computedDailyPayouts: DailyPayoutList,
  year: number,
  tempTrigger: number,
  strikePrice: number,
  futuresPrice: number,
  pending: boolean;
  dbErrorMessage: boolean;
  emptyFormWarning: boolean;
  showDailyChart: boolean;
  pendingDataChart: boolean;
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
    computedDailyPayouts: null,
    year: null,
    tempTrigger: null,
    strikePrice: null,
    futuresPrice: null,
    pending: false,
    dbErrorMessage: false,
    emptyFormWarning: false,
    showDailyChart: false,
    pendingDataChart: false,
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
      tempTrigger: 20,
      strikePrice: 300,
    })
  }

  setDisplayMode(mode: string) {
    this.displayMode = mode;
    this.dataService.raiseDisplayModeEvent(mode)
  }

  broadcastPriceMessage(msg: string) {
    this.priceMessage = msg;
    this.dataService.raisePriceMessageEvent(msg)
  }

  loadFuturesPrice() {
    this.setDisplayMode('message');
    var emptyFormData: any = new FormData();

    this.http.post('http://localhost:5724/future_price', emptyFormData)
      .subscribe((res: any) =>
        {
          var message = 'Futures price updated! The current value is A$' + res.price + '.';
          this.priceMessage = message;
          // this.broadcastPriceMessage(message);
        },
        (error) => {
          var message = 'Website error - please try again in a few minutes!'
          this.priceMessage = message;
          // this.broadcastPriceMessage(message);
        }
      );
      var message = 'Loading the updated futures price...';
      this.priceMessage = message;
      // this.broadcastPriceMessage(message)
  }

  getSavedFuturesPrice = (resolved, rejected) => {
    var emptyFormData: any = new FormData();
    this.http.get('http://localhost:5724/future_price', emptyFormData)
      .subscribe((res: any) =>
        {
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
      .subscribe((res: AnnualPayoutList) =>
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
    var year = formData.get('earliest_year');
    
    formData.set('year', year);
    formData.delete('earliest_year');
    this.http.post('http://localhost:5724/get_daily_data', formData)
    .subscribe((res: DailyPayoutList) =>
      {
        this.responseConfig.computedDailyPayouts = res;
        this.responseConfig.showDailyChart = true;
        this.dataService.raiseEmitterEvent(this.responseConfig);
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
    this.responseConfig.year = earliestYear;
    this.responseConfig.tempTrigger = tempTrigger;
    this.responseConfig.strikePrice = strikePrice;

    var formData: any = new FormData();
    formData.append('earliest_year', earliestYear);
    formData.append('temp_trigger', tempTrigger.toFixed(3));
    formData.append('strike', strikePrice.toFixed(2));
    let promise = new Promise(this.getSavedFuturesPrice);
    promise.then(
      (price) => {
          if (typeof price === 'number') {
            formData.append('futures_price', price.toFixed(2))
            this.responseConfig.futuresPrice = price;
            this.dataService.raiseEmitterEvent(this.responseConfig);
          };
          this.backendYearlyPayouts(formData);
          this.backendDailyPayouts(formData);
        },
      (error) => {
        console.log('Error accessing internal database!');
        this.resetValues()
        alert('Internal database not accessible!')
        }
      )

      // while the response is being calculated
      this.responseConfig.pending = true;
      this.responseConfig.computedAnnualPayouts = null;
      this.dataService.raiseEmitterEvent(this.responseConfig);
      this.responseConfig.showDailyChart = false;

    this.setDisplayMode('table');
  }


  resetValues() {
    this.resetInputForm()
    this.responseConfig.computedAnnualPayouts = null;
    this.responseConfig.pending = false;
    this.responseConfig.dbErrorMessage = false;
    this.responseConfig.year = null;
    this.responseConfig.tempTrigger = null;
    this.responseConfig.strikePrice = null;

    this.dataService.raiseEmitterEvent(this.responseConfig);
    this.setDisplayMode("none");
  }

  ngOnInit() {
    this.dataService.raiseEmitterEvent(this.responseConfig);
  }

}
