import pandas as pd
import numpy as np
import os
import logging
import datetime

from static.db_utils import get_future

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

class DataFrame(db.Model):
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
def hello():
    return render_template('index.html')

def load_dataframe_from_csv(file_loc):
    df = pd.read_csv(file_loc)

    for row in df.iterrows():
        row_dict = row[1].to_dict()
        obj = DataFrame(row_dict)
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
    futures_price = float(form.get('futures_price', get_future()))

    data = DataFrame.query.filter(DataFrame.quarter == 4,
                                  DataFrame.year >= earliest_year,
                                  DataFrame.tMax >= temp_trigger,
                                  DataFrame.priceRatio > strike_price/futures_price)

    df = pd.DataFrame([(d.year, d.priceRatio) for d in data],  columns=['year', 'priceRatio'])

    if df.shape[0] == 0:
        return [{'year': year, 'payout': 0.0} for year in range(earliest_year, 2023)]

    df['coefficient'] = np.where(df['year'] <= 2020, 6, 1)
    df['payout'] = (df['priceRatio']*futures_price - strike_price) * df['coefficient']

    resp = df.groupby('year').sum('payout').reset_index()[['year', 'payout']].to_dict('records')
    years_with_payouts = set(x['year'] for x in resp)
    for year in range(earliest_year, 2023):
        if year not in years_with_payouts:
            resp.append({'year': year, 'payout': 0.0})
    resp.sort(key = lambda x: x['year'])
    return resp


@app.route('/get_daily_data', methods=['POST'])
@cross_origin()
def get_daily_data_for_year():
    form = request.form
    year = int(form['year'])
    strike_price = float(form['strike'])
    temp_trigger = float(form['temp_trigger'])
    futures_price = float(form.get('futures_price', get_future()))
    data = DataFrame.query.filter(DataFrame.year == year,
                                  DataFrame.priceRatio > strike_price/futures_price,
                                  DataFrame.tMax > temp_trigger)
    df = pd.DataFrame([(d.year, d.month, d.day, d.tMax, d.priceRatio) for d in data],
                        columns=['year', 'month', 'day', 'tMax', 'priceRatio'])
    if df.shape[0] == 0:
        return []

    if year < 2021:
        df['payout'] = (df['priceRatio']*futures_price - strike_price)*6
    elif year == 2021:
        df['coefficient'] = np.where(df['month'] <= 10, 6, 1)
        df['payout'] = (df['priceRatio']*futures_price - strike_price) * df['coefficient']
    elif year > 2021:
        df['payout'] = (df['priceRatio']*futures_price - strike_price)
    return df.groupby(['month', 'day'])[['tMax', 'payout']].sum().reset_index().to_dict('records')

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
    DataFrame.query.delete()
    load_dataframe_from_csv(file_loc)
    log.info('Dataframe successfully uploaded!')

@app.cli.command("drop_all_tables")
def drop():
    log.info('All tables dropped!')
    db.drop_all()

@app.cli.command("init_tables")
def init_tables():
    log.info('All tables initialized!')
    db.create_all()


if __name__ == '__main__':
    app.run(port=5724, debug=True)