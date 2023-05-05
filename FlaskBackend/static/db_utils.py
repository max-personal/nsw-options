import logging
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

def combine_payouts_and_temps(payouts, temps):
    ans = []
    if not payouts:
        for temp_item in temps:
            temp_item['payout'] = 0.0
            ans.append(temp_item)
        return ans
    curr_pos, payout_item = 0, payouts[0]
    for temp_item in temps:
        date = (temp_item['month'], temp_item['day'])
        if (payout_item.get('month'), payout_item.get('day')) != date:
            ans.append({'month': temp_item['month'],
                        'day': temp_item['day'],
                        'tMax': temp_item['tMax'],
                        'payout': 0.0})
        else:
            ans.append({'month': temp_item['month'],
                        'day': temp_item['day'],
                        'tMax': temp_item['tMax'],
                        'payout': round(payout_item['payout'], 2)})
            curr_pos += 1
            payout_item = payouts[curr_pos] if curr_pos < len(payouts) else {}
    return ans
