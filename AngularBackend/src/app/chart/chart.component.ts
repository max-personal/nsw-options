import { Component, OnInit } from '@angular/core';
import { Chart, ChartConfiguration, Colors, registerables } from 'node_modules/chart.js'
import { YearPayoutList } from '../form/form.component';
import { DataService } from '../services/data.service';

Chart.register(Colors);

Chart.register(...registerables);

@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.css']
})
export class ChartComponent implements OnInit {

  // formResponse: ResponseConfigObject;
  payoutList: YearPayoutList;

  constructor(private dataService: DataService) {
  }

  checkSmth() {
    console.log(this.payoutList)
  }

  renderChart() {
    const myChart = new Chart('myChart', {
      type: 'bar',
      data: {
        labels: [2020, 2021, 2022],
        datasets: [{
          label: 'Payout',
          data: [5, 10, 16],
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
    });
  }

  ngOnInit() {

    this.dataService.responseEmitter.subscribe((response) => {
      console.log('Payout list caught by chart!');
      this.payoutList = response?.computedAnnualPayouts;
      console.log(this.payoutList)


      var years = [];
      var payouts = [];

      for (var obj in this.payoutList) {
        years.push(this.payoutList[obj]['year']);
        payouts.push(this.payoutList[obj]['payout']);
      }

    })
  }
}
