""" This is a script linking the Angular frontend and the Flask backend.
Run the following script in a command line from AngularFrontend to be able to view the entire project 
through the backend port:

for /L %i in (1,1,500) do (
  ng build --base-href /static/   && python3 ..\build-dev.py   && timeout 1
)
"""

import os
import re
import shutil

if 'dist' in os.listdir():
    os.chdir('..') # we're in the main directory

directories = os.listdir()

assert 'FlaskBackend' in directories

frontend_dir = 'AngularFrontend'

os.chdir(frontend_dir)
# We're in the Angular project directory

dir_exists = True

try:
    files = os.listdir(f'dist/{frontend_dir}')
    static_files = [file for file in files if re.fullmatch(r'.+(\.js(\.map)?|\.ico)', file)]
    html_files = [file for file in files if re.fullmatch(r'.+\.html', file)]

    for file in static_files:
        shutil.copyfile(f'dist/{frontend_dir}/{file}', f'../FlaskBackend/backend/static/{file}')
    for file in html_files:
        shutil.copyfile(f'dist/{frontend_dir}/{file}', f'../FlaskBackend/backend/templates/{file}')

except Exception as e:
    dir_exists = False
    print(e)
