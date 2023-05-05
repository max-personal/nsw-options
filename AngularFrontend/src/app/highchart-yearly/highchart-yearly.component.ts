import { Component, Input, OnInit } from '@angular/core';
import { AnnualPayoutList } from '../form/form.component';
import * as Highcharts from 'highcharts';

@Component({
  selector: 'app-highchart-yearly',
  templateUrl: './highchart-yearly.component.html',
  styleUrls: ['./highchart-yearly.component.css']
})

export class HighchartYearlyComponent {

  @Input() payoutList: AnnualPayoutList;
  years: Array<number> = [];
  payouts: Array<Array<number>> = [];

  Highcharts: typeof Highcharts = Highcharts;


  chartOptions: any = {
    chart: {
      type: "column",
      width: 750,
    },
    colors: ['#337ab7'],
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
        // format: "{value:,.0f}",
          formatter: function() {
              return Highcharts.numberFormat(this.value, 0, '.', ',');
          },
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
        Highcharts.defaultOptions.legend.backgroundColor || "#ffffff",
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

  }
}
