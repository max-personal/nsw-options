import { Component, OnInit, Input, ViewEncapsulation } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DataService } from '../services/data.service';
import { DailyPayoutList, ResponseConfigObject } from '../form/form.component';
import { FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-highchart-daily-dropdown',
  templateUrl: './highchart-daily-dropdown.component.html',
  styleUrls: ['./highchart-daily-dropdown.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class HighchartDailyDropdownComponent implements OnInit {

  years: Array<number> = [1999, 2000, 2001, 2002, 2003, 2004, 2005, 2006,
                          2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014,
                          2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022];
  @Input() responseConfig: ResponseConfigObject;
  selectYearForm: any = null;
  isSubmitted = false;
  yearSelectedStr: string;


  constructor(private http: HttpClient, private dataService: DataService, public fb: FormBuilder) {

    this.selectYearForm = fb.group({
      yearSelected: ['', [Validators.required]],
    })
    }

  changeYear(e: any) {
    this.yearSelectedStr = e.target.value
  }

  updateDailyChart() {
    var formData = new FormData()
    formData.append('year', this.yearSelectedStr);
    formData.append('temp_trigger', this.responseConfig.tempTrigger.toFixed(1));
    formData.append('strike', this.responseConfig.strikePrice.toFixed(1));
    formData.append('futures_price', this.responseConfig.futuresPrice.toFixed(1));

    this.http.post('http://localhost:5724/get_daily_data', formData)
    .subscribe((res: DailyPayoutList) =>
      {
        this.responseConfig.computedDailyPayouts = res;
        this.responseConfig.showDailyChart = true;
        this.responseConfig.pendingDataChart = false;
        this.responseConfig.year = parseInt(this.yearSelectedStr);
        this.dataService.raiseEmitterEvent(this.responseConfig);

      },
      (error) => {
        console.log('Error!');
        return
      }
    );

    // need to reinitialize the chart component
    this.responseConfig.showDailyChart = false;
    this.responseConfig.pendingDataChart = true;
    this.dataService.raiseEmitterEvent(this.responseConfig);
}


  ngOnInit() {
  }

}
