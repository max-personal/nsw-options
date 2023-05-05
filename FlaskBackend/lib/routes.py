
import datetime
import logging

import numpy as np
import pandas as pd

from backend import app, db
from lib.models import FuturePrice, MaxTemps, MainDataTable
from lib.utils import get_future, combine_payouts_and_temps

from flask import render_template, request
from flask_cors import cross_origin

logging.basicConfig(level='INFO',
                    format='%(asctime)s %(name)-20s %(levelname)-8s %(message)s',)
log = logging.getLogger('flask_backend.routes')

@app.route('/')
def main_page():
    return render_template('index.html')

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
    years_with_payouts = set(x['year'] for x in resp)
    for year in range(earliest_year, 2023):
        if year not in years_with_payouts:
            resp.append({'year': year, 'payout': 0.0})
    resp.sort(key=lambda x: x['year'])
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
