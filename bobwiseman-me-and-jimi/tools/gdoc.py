import sys, json
from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload
K = '/Users/robin/Documents/novadiem/keys/oauth/google-drive-file-token.json'
cr = Credentials.from_authorized_user_file(K)
if not cr.valid: cr.refresh(Request()); open(K, 'w').write(cr.to_json())
d = build('drive', 'v3', credentials=cr)
cmd = sys.argv[1]
if cmd == 'export':
    fid, out = sys.argv[2], sys.argv[3]
    open(out, 'wb').write(d.files().export(fileId=fid, mimeType='text/html').execute()); print('exported', out)
elif cmd == 'meta':
    print(json.dumps(d.files().get(fileId=sys.argv[2], fields='id,name,webViewLink,permissions(emailAddress,role,type)').execute(), indent=1))
elif cmd == 'create':
    html, title = sys.argv[2], sys.argv[3]
    f = d.files().create(body={'name': title, 'mimeType': 'application/vnd.google-apps.document'}, media_body=MediaFileUpload(html, mimetype='text/html'), fields='id,webViewLink').execute(); print(json.dumps(f))
elif cmd == 'update':
    fid, html = sys.argv[2], sys.argv[3]
    f = d.files().update(fileId=fid, media_body=MediaFileUpload(html, mimetype='text/html'), fields='id,webViewLink').execute(); print(json.dumps(f))
elif cmd == 'share':
    fid, email, role = sys.argv[2], sys.argv[3], sys.argv[4]
    print(d.permissions().create(fileId=fid, body={'type': 'user', 'role': role, 'emailAddress': email}, sendNotificationEmail=False, fields='id').execute())
