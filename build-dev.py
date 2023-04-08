# Author: David Moutray (DMoots)
# Source: https://github.com/dmoutray/angular-flask/blob/master/build-dev.py

import os
import re
import subprocess
import shutil
import time

if 'dist' in os.listdir():
    os.chdir('..')

directories = os.listdir()
print(directories)

assert 'static' in directories

for directory in directories:
    if not re.match(r'[_\.]', directory) and \
    os.path.isdir(directory) and \
    directory not in ['static', 'templates', 'env', 'instance', 'angular-flask']:
        break


os.chdir(directory)
# print('Building...')
# subprocess.call(('ng build --watch --base-href /static/ '), shell=True)
# print('Built!')

# os.chdir()

dir_exists = True

try:
    files = os.listdir(f'dist/{directory}')
    static_files = [file for file in files if re.fullmatch(r'.+(\.js(\.map)?|\.ico)', file)]
    html_files = [file for file in files if re.fullmatch(r'.+\.html', file)]
    # print(os.getcwd())
    # print(static_files)
    # print(html_files)
    for file in static_files:
        shutil.copyfile(f'dist/{directory}/{file}', f'../static/{file}')
    for file in html_files:
        shutil.copyfile(f'dist/{directory}/{file}', f'../templates/{file}')
except Exception as e:
    dir_exists = False
    print(e)
