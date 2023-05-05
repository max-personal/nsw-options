""" Flask commands for external database management """

import os
import click
import logging

from backend import app, db
from lib.models import MainDataTable, MaxTemps, FuturePrice
from lib.admin_utils import load_dataframe_from_csv, load_temps_from_csv

logging.basicConfig(level='INFO',
                    format='%(asctime)s %(name)-20s %(levelname)-8s %(message)s',)
log = logging.getLogger('flask_backend.admin')

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
