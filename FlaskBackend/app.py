import pandas as pd
import numpy as np
import os
import logging
import datetime

from static.db_utils import get_future, combine_payouts_and_temps

import click
from flask import Flask, render_template, request
from flask_cors import cross_origin
from sqlalchemy import create_engine
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)

app.config['SECRET_KEY'] = 'F72jhg99d7ncpf'
app.config['SQLALCHEMY_DATABASE_URI']        = 'sqlite:///db.sqlite3'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

engine = create_engine('sqlite:///db.sqlite3')

db = SQLAlchemy(app)

logging.basicConfig(level='INFO',
                    format='%(asctime)s %(name)-20s %(levelname)-8s %(message)s',)
log = logging.getLogger('flask_backend')

class MainDataTable(db.Model):
    _id = db.Column(db.Integer, nullable=False, primary_key=True)
    tMax = db.Column(db.Float)
    price = db.Column(db.Float, nullable=False)
    meanPrice = db.Column(db.Float, nullable=False) # mean price for quarter
    priceRatio = db.Column(db.Float, nullable=False) # price/meanPrice, helpful for computations
    year = db.Column(db.Integer, nullable=False)
    quarter = db.Column(db.Integer, nullable=False)
    month = db.Column(db.Integer, nullable=False)
    day = db.Column(db.Integer, nullable=False)
    time = db.Column(db.String, nullable=False)

    def __init__(self, row_dict):
        self.tMax = row_dict['tMax']
        self.price = row_dict['price']
        self.meanPrice = row_dict['meanPrice']
        self.priceRatio = row_dict['priceRatio'] # faster to get it computed in pandas than here
        self.year = row_dict['year']
        self.quarter = row_dict['quarter']
        self.month = row_dict['month']
        self.day = row_dict['day']
        self.time = row_dict['time']

    # The string representation of the class
    def __repr__(self):
        return f'{self.date} - {self.time} - {self.totalDemand} - {self.meanPrice}'

class MaxTemps(db.Model):
    _id = db.Column(db.Integer, nullable=False, primary_key=True)
    tMax = db.Column(db.Float)
    year = db.Column(db.Integer, nullable=False)
    month = db.Column(db.Integer, nullable=False)
    day = db.Column(db.Integer, nullable=False)

    def __init__(self, row_dict):
        self.tMax = row_dict['tMax']
        self.year = row_dict['year']
        self.month = row_dict['month']
        self.day = row_dict['day']

    # The string representation of the class
    def __repr__(self):
        return f'{self.year}-{self.month}-{self.day}: {self.tMax} °C'

class FuturePrice(db.Model):
    """ This database is expected to have at most one row with the most recent future price """

    timestamp = db.Column(db.DateTime, nullable=False, primary_key=True)
    price = db.Column(db.Float)

    def __init__(self, timestamp, price):
        self.timestamp = timestamp
        self.price = price

    def __repr__(self):
        return f'Time {self.timestamp} - price {self.price}'

@app.route('/')
def main_page():
    return render_template('index.html')

def load_dataframe_from_csv(file_loc):
    df = pd.read_csv(file_loc)
    for row in df.iterrows():
        row_dict = row[1].to_dict()
        obj = MainDataTable(row_dict)
        db.session.add(obj)
    db.session.commit()

def load_temps_from_csv(file_loc):
    df = pd.read_csv(file_loc)
    for row in df.iterrows():
        row_dict = row[1].to_dict()
        month, day, year = row_dict['Dates'].split('/')
        obj = MaxTemps({'year': year,
                        'month': month,
                        'day': day,
                        'tMax': row_dict['Tmax']})
        db.session.add(obj)
    db.session.commit()

@app.route('/future_price', methods=['GET', 'POST'])
@cross_origin()
def get_future_price():
    """ The GET request checks the local database and returns the timestamp/price or None if nothing is stored. 
        The POST request checks the website and, as long as there is no error, updates the database. """
    if request.method == 'GET':
        price_item = FuturePrice.query.first()
        if price_item:
            return {'timestamp': price_item.timestamp, 'price': price_item.price}
        return {}
    if request.method == 'POST':
        timestamp = datetime.datetime.now()
        try:
            future_price = get_future()
        except Exception:
            log.info('Website error!')
            return {}
        FuturePrice.query.delete()
        price_item = FuturePrice(timestamp=timestamp, price=future_price)
        db.session.add(price_item)
        db.session.commit()
        return {'timestamp': timestamp, 'price': future_price}

@app.route('/get_yearly_payouts', methods=['POST'])
@cross_origin()
def get_payouts():
    form = request.form
    earliest_year = int(form['earliest_year'])
    temp_trigger = float(form['temp_trigger'])
    strike_price = float(form['strike'])
    if 'futures_price' in form:
        futures_price = float(form['futures_price'])
    else:
        futures_price = get_future()

    data = MainDataTable.query.filter(MainDataTable.quarter == 4,
                                  MainDataTable.year >= earliest_year,
                                  MainDataTable.tMax >= temp_trigger,
                                  MainDataTable.priceRatio > strike_price/futures_price)

    df = pd.DataFrame([(d.year, d.priceRatio) for d in data],  columns=['year', 'priceRatio'])

    if df.shape[0] == 0:
        return [{'year': year, 'payout': 0.0} for year in range(earliest_year, 2023)]

    df['payout'] = (df['priceRatio']*futures_price - strike_price) * np.where(df['year'] <= 2020, 6, 1)

    resp = df.groupby('year').sum('payout').reset_index()[['year', 'payout']].to_dict('records')
    return resp


@app.route('/get_daily_data', methods=['POST'])
@cross_origin()
def get_daily_data_for_year():
    form = request.form
    year = int(form['year'])
    strike_price = float(form['strike'])
    temp_trigger = float(form['temp_trigger'])
    futures_price = float(form.get('futures_price', get_future()))
    data = MainDataTable.query.filter(MainDataTable.year == year,
                                  MainDataTable.priceRatio > strike_price/futures_price,
                                  MainDataTable.tMax > temp_trigger)
    df = pd.DataFrame([(d.year, d.month, d.day, d.priceRatio) for d in data],
                        columns=['year', 'month', 'day', 'priceRatio'])
    if df.shape[0] == 0:
        df['payout'] = []
    elif year < 2021:
        df['payout'] = (df['priceRatio']*futures_price - strike_price)*6
    elif year == 2021:
        df['coefficient'] = np.where(df['month'] <= 10, 6, 1)
        df['payout'] = (df['priceRatio']*futures_price - strike_price) * df['coefficient']
    elif year > 2021:
        df['payout'] = (df['priceRatio']*futures_price - strike_price)
    payouts = df.groupby(['month', 'day'])[['payout']].sum().reset_index().to_dict('records')

    data_temps = MaxTemps.query.filter(MaxTemps.year == year)
    temps = [{'month': d.month, 'day': d.day, 'tMax': d.tMax} for d in data_temps]

    return {'year': year, 'data': combine_payouts_and_temps(payouts, temps)}

@app.cli.command("update_dataframe")
@click.option('--file_loc')
def update_full_data(file_loc):
    if not file_loc:
        log.error('Specify the location under --file_loc!')
        return
    if not os.path.isfile(file_loc):
        log.error('The specified file does not exist!')
        return
    db.create_all()
    MainDataTable.query.delete()
    load_dataframe_from_csv(file_loc)
    log.info('Dataframe successfully uploaded!')

@app.cli.command("update_max_temps")
@click.option('--file_loc')
def update_max_temps(file_loc):
    if not file_loc:
        log.error('Specify the location under --file_loc!')
        return
    if not os.path.isfile(file_loc):
        log.error('The specified file does not exist!')
        return
    db.create_all()
    MaxTemps.query.delete()
    db.session.commit()
    load_temps_from_csv(file_loc)
    log.info('Temperatures table successfully uploaded!')

@app.cli.command("drop_all_tables")
def drop_all_tables():
    db.drop_all()
    log.info('All tables dropped!')

@app.cli.command("init_tables")
def init_tables():
    db.create_all()
    log.info('All tables initialized!')

@app.cli.command("drop_futures_price")
def drop_futures_price():
    FuturePrice.query.delete()
    db.session.commit()
    log.info('Futures price dropped!')


if __name__ == '__main__':
    app.run(port=5724, debug=True)