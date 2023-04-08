
import pandas as pd
import numpy as np
import json
import logging

from static.db_utils import get_future

from flask import Flask, render_template, request
from flask_cors import CORS, cross_origin
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
    totalDemand = db.Column(db.Float, nullable=False)
    price = db.Column(db.Float, nullable=False)
    date = db.Column(db.String, nullable=False)
    time = db.Column(db.String, nullable=False)
    tMax = db.Column(db.Float)
    meanPrice = db.Column(db.Float, nullable=False)
    year = db.Column(db.Integer, nullable=False)
    quarter = db.Column(db.Integer, nullable=False)

    def __init__(self, _id, totalDemand, price, date, time, tMax, meanPrice, year, quarter):
        self._id = _id
        self.totalDemand = totalDemand
        self.price = price
        self.date = date
        self.time = time
        self.tMax = tMax
        self.meanPrice = meanPrice
        self.year = year
        self.quarter = quarter

    # # The string representation of the class
    # def __repr__(self):
    #     return str(self.passengerId) + ' - ' + str(self.name) 

def load_data(file_loc):
    assert DataFrame.query.count() == 0
    df = pd.read_csv(file_loc)

    # Iterate and load the data     
    for row in df.itertuples(index=False):

        _id, totalDemand, price, date, time, tMax, meanPrice, year, quarter = row
        obj = DataFrame(_id, totalDemand, price, date, time, tMax, meanPrice, year, quarter)
        db.session.add(obj)

    db.session.commit()

@app.route('/get_payouts', methods=['POST'])
@cross_origin()
def get_payouts():
    log.info(300)
    print(302)
    form = request.form
    if not [x in form for x in ['earliest_year, temp_trigger, strike']]:
        return {}
    earliest_year = int(form['earliest_year'])
    temp_trigger = float(form['temp_trigger'])
    strike = float(form['strike'])
    future = get_future()
    log.info(future)
    data = DataFrame.query.filter(DataFrame.quarter == 4, DataFrame.year >= earliest_year)
    df = pd.DataFrame([(d.tMax, d.price, d.meanPrice, d.year) for d in data],  columns=['tMax', 'price', 'meanPrice', 'year'])
    df['scaledPrice'] = df['price']*future/df['meanPrice']
    df['payout'] = np.where((df['scaledPrice'] > strike) & (df['tMax'] >= temp_trigger), df['scaledPrice'] - strike, 0)
    return df.groupby('year').sum('payout').reset_index()[['year', 'payout']].to_dict('records')

@app.cli.command("load-data")
def load_full_data():
    db.create_all()
    if DataFrame.query.count() > 0:
        return 'Database already exists!'
    load_data('static/full_df.csv')
    return 'Loaded the big database!'

@app.cli.command("update-data")
def update_full_data():
    db.create_all()
    DataFrame.query.delete()
    load_data('static/full_df.csv')
    return 'Updated the big database!'

@app.cli.command("load-mini-data")
def load_mini_data():
    db.create_all()
    if DataFrame.query.count() > 0:
        return
    load_data('static/mini_df.csv')
    return 'Loaded the small database!'

@app.route('/')
def hello():
    return render_template('index.html')

@app.route('/count_items')
def count_items():
    return f'The table has {DataFrame.query.count()} items!'

@app.cli.command("drop-all-tables")
def drop():
    db.drop_all()
    return 'Everything dropped!'

@app.route('/test-post', methods=['POST'])
@cross_origin()
def test_post():
    form = str(dict(request.form))
    return f'Form received: {form}'

@app.route('/get_price/<date_i>/<time_i>')
def get_price(date_i, time_i):
    # update_data_if_needed()
    record = DataFrame.query.filter_by(date=date_i, time=time_i).first()
    if not record:
        return '<h1>Price not found!</h1>'
    return f'<h1>Price is {record.price}</h1>'

if __name__ == '__main__':
    app.run(port=5724, debug=True)