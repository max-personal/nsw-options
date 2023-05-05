
""" Scripts for populating databases from external CSV files """
import pandas as pd

from backend import db
from lib.models import MainDataTable, MaxTemps

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