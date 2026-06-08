import requests
for path in ['/api/resumes/upload','/api/resumes/dev-upload','/api/resumes']:
    try:
        r = requests.post('http://127.0.0.1:5000'+path, timeout=5)
        print(path, r.status_code, r.text[:200])
    except Exception as e:
        print(path, 'ERR', e)
