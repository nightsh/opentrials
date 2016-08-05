from __future__ import print_function
from __future__ import unicode_literals

import io
import requests
import json
import time

def create_pybossa_tasks():
    return

def get_trials():
    """
    Get all trials with more than one source record, but do not collect
    too many for just a demo. Will stop somewhere between 100 and 200, depending
    on how many relevant records we find.
    As for the moment precision and correctness are not important and we only want
    "some" data to work with while defining the workflow, some areas might be sloppy
    and/or need improvements. WIP.
    """
    min_sources = 2
    print('Querying OT API for trials with number of sources > {0}'.format(min_sources))
    trials = []
    trials_page = 0
    while len(trials) < 100:
        trials_page += 1
        print('page {1}: Collected {0} trials'.format(len(trials), trials_page))
        raw_trials = make_request(trials_page)
        trials.extend(filter_trials(raw_trials, min_sources=min_sources))
    print('Got a total of {0} trials'.format(len(trials)))
    return trials

def filter_trials(raw_trials, min_sources):
    """
    Filter the input for only the trials containing more than N sources.
    Also only lets go the selected trial properties.
    """
    results = []
    for trial in raw_trials:
        if len(trial['records']) >= min_sources:
            item = {
                'title': trial['public_title'],
                'description': trial['brief_summary'],
                'url': trial['url'],
                'gender': trial['gender'],
                'id': trial['id'],
                'records': trial['records']
            }
            results.append(item)
    return results

def make_request(page=None):
    """
    Fetch an API payload using the passed page number
    """
    if page is None:
        page = 1
    url = 'http://api.opentrials.net/v1/search'
    params = {'per_page': 100,
              'page': page}
    r = requests.get(url, params=params)
    json = r.json()
    try:
        return json['items']
    except:
        # Since we don't yet care about the exceptions, we move on
        return []

if __name__ == '__main__':
    # Trying to create some support for incremental updates
    output = 'tasks/trials_records_{0}.tasks.json'.format(int(time.time()))
    with io.open(output, mode='wb') as tasks_file:
        tasks = get_trials()
        tasks_file.write(json.dumps(tasks, ensure_ascii=False, indent=4).encode('utf8'))
    print('Tasks collection complete')
