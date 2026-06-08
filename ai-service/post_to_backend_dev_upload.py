import requests
url = 'http://127.0.0.1:5000/api/resumes/dev-upload'
file_path = r'd:\PrOjEcT\NextHire\README.md'
with open(file_path, 'rb') as f:
    files = {'resume': ('sample_resume.docx', f, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')}
    r = requests.post(url, files=files, timeout=15)
    print(r.status_code)
    try:
        print(r.json())
    except Exception:
        print(r.text)
