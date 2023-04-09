import os
import re
import shutil

if 'dist' in os.listdir():
    os.chdir('..') # we're in the main directory

directories = os.listdir()

assert 'static' in directories

for directory in directories:
    if not re.match(r'[_\.]', directory) and \
    os.path.isdir(directory) and \
    directory not in ['static', 'templates', 'env', 'instance', 'angular-flask']:
        break

os.chdir(directory)
# We're in the Angular project directory

dir_exists = True

try:
    files = os.listdir(f'dist/{directory}')
    static_files = [file for file in files if re.fullmatch(r'.+(\.js(\.map)?|\.ico)', file)]
    html_files = [file for file in files if re.fullmatch(r'.+\.html', file)]

    for file in static_files:
        shutil.copyfile(f'dist/{directory}/{file}', f'../static/{file}')
    for file in html_files:
        shutil.copyfile(f'dist/{directory}/{file}', f'../templates/{file}')

    # correct link to chart.umd.js

    shutil.copyfile('node_modules/chart.js/dist/chart.umd.js', '../static/chart.umd.js')
    shutil.copyfile('node_modules/chart.js/dist/chart.umd.js.map', '../static/chart.umd.js.map')
    file = f'../templates/{html_files[0]}'
    with open(file, 'r') as f:
        text = re.sub(r'<script src="[\w/.]+chart.umd.js"></script>', '<script src="chart.umd.js"></script>' ,f.read())
    with open(file, 'w') as f:
        f.write(text)

except Exception as e:
    dir_exists = False
    print(e)
