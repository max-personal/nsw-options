import { Component, Input, OnInit } from '@angular/core';
import { Chart, ChartConfiguration, Colors, registerables } from 'node_modules/chart.js'

Chart.register(Colors);

Chart.register(...registerables);

@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.css']
})
export class ChartComponent implements OnInit {

  @Input() payoutListStr: string;
  payoutList = null;


  constructor() {}

  ngOnInit() {
    this.payoutList = JSON.parse(this.payoutListStr);

    var years = [];
    var payouts = [];

    for (var obj in this.payoutList) {
      years.push(this.payoutList[obj]['year']);
      payouts.push(this.payoutList[obj]['payout']);
    }

    const chartConfig: ChartConfiguration = {
        type: 'bar',
        data: {
          labels: years,
          datasets: [{
            label: 'Payout',
            data: payouts,
            borderWidth: 0.7,
            borderColor: '#000000',
            barPercentage: 0.8,
            backgroundColor: '#95c1fb',
          }]
        },
        options: {
          responsive: true,
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                font: {
                  family: "'Lucida Sans', 'Lucida Sans Regular', 'Lucida Grande', 'Lucida Sans Unicode', Geneva, Verdana, sans-serif",
                  size: 12,
                  weight: '300',
                }
              }
            },

            x: {
              ticks: {
                font: {
                  family: "'Lucida Sans', 'Lucida Sans Regular', 'Lucida Grande', 'Lucida Sans Unicode', Geneva, Verdana, sans-serif",
                  size: 12,
                  weight: '300',
                }
              }
            },
          },
          plugins: {
            title: {
              display: true,
              text: 'Annual Payouts (A$)',
              font: {
                family: "'Lucida Sans', 'Lucida Sans Regular', 'Lucida Grande', 'Lucida Sans Unicode', Geneva, Verdana, sans-serif",
                size: 18,
                weight: '300',
              }
            },
            legend: {
              display: false,
              position: 'bottom',
              title: {
                text: 'Payout',
              }
            }
          }
        }
      }
  
    new Chart('myChart', chartConfig);

    new Chart('myChartMini', chartConfig);


  }
}
