import { Component, Input, OnInit } from '@angular/core';
import { YearPayoutList } from '../form/form.component';
import * as Highcharts from 'highcharts';

@Component({
  selector: 'app-highchart-yearly',
  templateUrl: './highchart-yearly.component.html',
  styleUrls: ['./highchart-yearly.component.css']
})

export class HighchartYearlyComponent {

  @Input() payoutList: YearPayoutList;
  chartWidth: number = 700;
  years: Array<number> = [];
  payouts: Array<Array<number>> = [];

  Highcharts: typeof Highcharts = Highcharts;

  chartOptions: any = {
    chart: {
      type: "column",
      width: this.chartWidth,
    },
    colors: ['#95c1fb'],
    title: {
      text: "Annual payouts (A$)",
      style: {
          color: '#000000',
          fontSize: 14,
          fontFamily: ['Lucida Sans', 'Lucida Sans Regular', 'Lucida Grande', 'Lucida Sans Unicode'],
      }
    },
    xAxis: {
      categories: this.years,
      title: {
        text: null
      },
      labels: {
        style: {
            fontSize: 11,
            fontFamily: ['Lucida Sans', 'Lucida Sans Regular', 'Lucida Grande', 'Lucida Sans Unicode'],
        }
      }
    },
    yAxis: {
      min: 0,
      labels: {
        overflow: "justify",
        format: "{value:,.0f}",
        style: {
            fontSize: 11,
            fontFamily: ['Lucida Sans', 'Lucida Sans Regular', 'Lucida Grande', 'Lucida Sans Unicode'],
        }
      },
      title: {
        text: null,
      }
    },
    plotOptions: {
      bar: {
        dataLabels: {
          enabled: true
        },
      },
      series: {
          borderColor: '#000000',
          borderWidth: 0.7,
          borderRadius: 0,
      }
    },
    legend: {
      align: 'right',
      verticalAlign: 'top',
      floating: true,
      borderWidth: 1,
      backgroundColor:
        Highcharts.defaultOptions.legend.backgroundColor || "#FFFFFF",
      shadow: true
    },
    credits: {
      enabled: false
    },
    series: [
      {
        name: 'Payout (A$)',
        data: this.payouts,
      }
    ]
  };


  ngOnInit() {
    for (var obj in this.payoutList) {
      this.years.push(this.payoutList[obj]['year']);
      this.payouts.push([this.payoutList[obj]['year'], parseFloat(this.payoutList[obj]['payout'].toFixed(2))]);
    }
    this.chartWidth = 100 + this.years.length * 50;
    console.log(this.chartWidth)

  }
}
