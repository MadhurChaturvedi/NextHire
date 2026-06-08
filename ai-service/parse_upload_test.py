import requests
url = 'http://127.0.0.1:8000/parse-file'
file_path = r'd:\PrOjEcT\NextHire\README.md'
with open(file_path, 'rb') as f:
    files = {'file': ("README.md", f, 'text/markdown')}
    r = requests.post(url, files=files, timeout=10)
    print(r.status_code)
    try:
        print(r.json())
    except Exception:
        print(r.text)
