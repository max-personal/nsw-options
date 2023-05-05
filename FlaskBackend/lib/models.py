from backend import db

class MainDataTable(db.Model):
    """ The main table used for calculating yearly payouts"""
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
    """ List of daily temperatures """
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
    """ This database is expected to have at most one row: with the most recent future price """

    timestamp = db.Column(db.DateTime, nullable=False, primary_key=True)
    price = db.Column(db.Float)

    def __init__(self, timestamp, price):
        self.timestamp = timestamp
        self.price = price

    def __repr__(self):
        return f'Time {self.timestamp} - price {self.price}'
