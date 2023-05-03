import requests
from bs4 import BeautifulSoup

def get_future():

    futures_src = 'https://www.asxenergy.com.au/futures_au/dataset'
    resp = requests.get(futures_src)
    soup = BeautifulSoup(resp.text, features='html.parser')
    header = [x.text for x in soup.tr.find_all('td')]
    assert header[0] == 'New South Wales'
    # Find New South Wales table
    table_tag = soup.find('a', attrs={"rel": "ABN"}).parent.parent.parent.parent.parent
    assert table_tag.name == 'table'
    # Find Q423 section tag (tr)
    q423_section = table_tag.find('td', string='Q423').parent
    q423_entries = q423_section.find_all('td')
    # make sure we got the right column
    assert len(q423_entries) == 7
    assert q423_entries[0].attrs.get('title') == 'BNZ2023'
    # last value in the row
    future_price = float(q423_entries[6].text)
    return future_price
