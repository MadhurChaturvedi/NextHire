import json
mods=['fastapi','uvicorn','spacy','nltk','sklearn','pypdf','docx','sentence_transformers','dotenv','numpy']
missing=[]
for m in mods:
    try:
        __import__(m)
    except Exception as e:
        missing.append(m)
print(json.dumps({'missing':missing}))
