import { Component, Input } from '@angular/core';
import { DailyPayoutList } from '../form/form.component';
import * as Highcharts from 'highcharts';

@Component({
  selector: 'app-highchart-daily',
  templateUrl: './highchart-daily.component.html',
  styleUrls: ['./highchart-daily.component.css']
})
export class HighchartDailyComponent {

  @Input() payoutList: DailyPayoutList;
  temps: Array<number> = [];
  payouts: Array<number> = [];
  dates: Array<string> = [];
  year: Array<number> = [];

  Highcharts: typeof Highcharts = Highcharts;

  chartOptions: any = {
    chart: {
        zoomType: 'xy',
        width: 700,
    },
    credits: 'false',
    title: {
      text: "Daily payouts (A$) and temperatures (°C)",
      margin: 45,
      style: {
          color: '#000000',
          fontSize: 14,
          fontFamily: ['Lucida Sans', 'Lucida Sans Regular', 'Lucida Grande', 'Lucida Sans Unicode'],
      }
    },
    xAxis: [{
        categories: this.dates,
        crosshair: true,
        labels: {
          step: 30,
          fontFamily: ['Lucida Sans', 'Lucida Sans Regular', 'Lucida Grande', 'Lucida Sans Unicode'],
        }
    }],
    yAxis: [{ // Primary yAxis
        labels: {
            style: {
                color: '#000000',
                fontSize: 11,
                fontFamily: ['Lucida Sans', 'Lucida Sans Regular', 'Lucida Grande', 'Lucida Sans Unicode'],
            }
        },
        title: {
            text: 'Temperature',
            style: {
                color: '#000000',
                fontSize: 11,
                fontFamily: ['Lucida Sans', 'Lucida Sans Regular', 'Lucida Grande', 'Lucida Sans Unicode'],
            }
        }
    }, { // Secondary yAxis
        title: {
            text: 'Payout',
            style: {
                color: '#000000',
                fontSize: 11,
                fontFamily: ['Lucida Sans', 'Lucida Sans Regular', 'Lucida Grande', 'Lucida Sans Unicode'],
            }
        },
        labels: {
            formatter: function() {
                return Highcharts.numberFormat(this.value, 0, '.', ',');
            },
            style: {
                color: '#000000',
                fontSize: 11,
                fontFamily: ['Lucida Sans', 'Lucida Sans Regular', 'Lucida Grande', 'Lucida Sans Unicode'],
            }
        },
        opposite: true
    }],
    tooltip: {
        shared: true
    },
    legend: {
        align: 'right',
        verticalAlign: 'top',
        y: 20,
        enabled: true,
        floating: true,
        borderWidth: 1,
        backgroundColor:
            Highcharts.defaultOptions.legend.backgroundColor || "#ffffff",
        shadow: true
    },
    series: [{
        name: 'Payout (A$)',
        type: 'column',
        yAxis: 1,
        data: this.payouts,
        color: '#95c1fb',
        tooltip: {
            valuePrefix: 'A$'
        }
      }, {
        name: 'Maximum temperature (°C)',
        type: 'spline',
        data: this.temps,
        color: '#0000dd',
        tooltip: {
            valueSuffix: '°C'
        }
    }]
}


  ngOnInit() {
    var data = this.payoutList['data'];
    for (var obj in data) {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      this.temps.push(data[obj]['tMax']);
      this.payouts.push(data[obj]['payout']);
      this.dates.push(months[data[obj]['month']-1] + ' ' + data[obj]['day']);
    }
  }
}
