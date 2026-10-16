#!/usr/bin/env python3
"""Spike S2 step C (throwaway): boundary probes as agent, each expected to FAIL; then one allowed CONNECT and a
relay self-test through the sheet worker. Writes /srv/ar/out/probes.json. No token in this step."""
import json
import os
import socket
import subprocess
import sys

P = int(os.environ.get('PROXY_PORT', '3128'))
AS_AGENT = ['sudo', '-n', '-u', 'agent', '-H', 'env', '-i', 'PATH=/usr/bin:/bin', 'HOME=/home/agent']
results = []


def run(cmd: list, timeout: int = 40, stdin: str | None = None) -> subprocess.CompletedProcess:
    return subprocess.run(cmd, capture_output=True, text=True, timeout=timeout, input=stdin)


def probe(name: str, shell_cmd: list, expect_fail: bool = True, timeout: int = 40) -> dict:
    r = run(AS_AGENT + shell_cmd, timeout)
    first = (r.stderr or r.stdout).strip().splitlines()[:1]
    rec = {'probe': name, 'exit': r.returncode, 'first_line': first[0][:200] if first else '',
           'expected': 'fail' if expect_fail else 'succeed',
           'result': ('PASS (failed as expected)' if r.returncode != 0 else 'UNEXPECTED SUCCESS') if expect_fail
           else ('PASS (succeeded)' if r.returncode == 0 else 'UNEXPECTED FAILURE')}
    results.append(rec)
    print(f"{rec['probe']}: exit {rec['exit']} -> {rec['result']} | {rec['first_line']}")
    return rec


# who is agent
r = run(['id', 'agent'])
results.append({'probe': 'id agent', 'exit': r.returncode, 'first_line': r.stdout.strip()})
print('id agent:', r.stdout.strip())

probe('read under /home/runner', ['ls', '-la', '/home/runner'])
probe('read a runner file by path', ['cat', '/home/runner/.profile'])
pid = run(['pgrep', '-f', 'Runner.Worker']).stdout.split()
pid = pid[0] if pid else None
results.append({'probe': 'Runner.Worker pid found', 'first_line': 'yes' if pid else 'NO'})
if pid:
    probe('read /proc/<Runner.Worker>/environ', ['cat', f'/proc/{pid}/environ'])
    probe('read /proc/<Runner.Worker>/cmdline', ['cat', f'/proc/{pid}/cmdline'], expect_fail=False)
probe('open /var/run/docker.sock', ['python3', '-c',
      "import socket; s=socket.socket(socket.AF_UNIX); s.connect('/var/run/docker.sock')"])
probe('docker ps', ['docker', 'ps'])
probe('sudo -n true', ['sudo', '-n', 'true'])
probe('write to locked.txt (root 0444 + chattr +i)', ['sh', '-c', 'echo x >> /srv/ar/mv/song/locked.txt'])
probe('replace locked.txt via editable-dir rename', ['sh', '-c',
      'echo x > /srv/ar/mv/song/.new && mv -f /srv/ar/mv/song/.new /srv/ar/mv/song/locked.txt'])
probe('write to a non-editable mirror file', ['sh', '-c', 'echo x >> /srv/ar/mv/song/page.html'])
probe('write to editable notes.txt', ['sh', '-c', 'echo x >> /srv/ar/mv/song/notes.txt'], expect_fail=False)

ip = socket.gethostbyname('example.com')
probe('direct connect example.com:443 by name', ['python3', '-c',
      "import socket; socket.create_connection(('example.com',443),5)"])
probe(f'direct connect to a literal IP ({ip}:443)', ['python3', '-c',
      f"import socket; socket.create_connection(('{ip}',443),5)"])
probe('direct UDP DNS to 8.8.8.8', ['python3', '-c',
      "import socket; s=socket.socket(socket.AF_INET,socket.SOCK_DGRAM); s.settimeout(3); s.connect(('8.8.8.8',53)); s.send(b'x'); s.recv(10)"])
probe('direct IPv6 connect', ['python3', '-c',
      "import socket; socket.create_connection(('2606:4700:4700::1111',443),5)"])
probe('CONNECT example.com:443 through the proxy', ['curl', '-sS', '-m', '15', '-o', '/dev/null', '-x',
      f'http://127.0.0.1:{P}', 'https://example.com/'])
probe('CONNECT api.anthropic.com:443 through the proxy (allowed)', ['curl', '-sS', '-m', '20', '-o', '/dev/null',
      '-w', '%{http_code}', '-x', f'http://127.0.0.1:{P}', 'https://api.anthropic.com/'], expect_fail=False)

# environment names an agent process sees under the two launch shapes (names only, never values)
os.environ['AR_PROBE_SECRET'] = 'x'
r = run(['sudo', '-n', '-u', 'agent', '-H', '--preserve-env=AR_PROBE_SECRET', 'env', 'PATH=/usr/bin:/bin', '/usr/bin/env'])
names_sudo = sorted(l.split('=')[0] for l in r.stdout.splitlines())
r = run(['sudo', '-n', '-u', 'agent', '-H', '--preserve-env=AR_PROBE_SECRET', 'env', '-i', 'PATH=/usr/bin:/bin', '/usr/bin/env'])
names_envi = sorted(l.split('=')[0] for l in r.stdout.splitlines())
results.append({'probe': 'env names: sudo --preserve-env then env (no -i)', 'first_line': ' '.join(names_sudo)})
results.append({'probe': 'env names: sudo --preserve-env then env -i (token would be dropped)', 'first_line': ' '.join(names_envi)})
print('env names (sudo, no -i):', names_sudo)
print('env names (env -i):', names_envi)

# relay self-test: the relay as agent under env -i, one tool call answered by the sheet worker via docker
req = [{'jsonrpc': '2.0', 'id': 1, 'method': 'initialize', 'params': {'protocolVersion': '2025-06-18', 'capabilities': {}, 'clientInfo': {'name': 't', 'version': '0'}}},
       {'jsonrpc': '2.0', 'method': 'notifications/initialized'},
       {'jsonrpc': '2.0', 'id': 2, 'method': 'tools/list'},
       {'jsonrpc': '2.0', 'id': 3, 'method': 'tools/call', 'params': {'name': 'contact_sheet', 'arguments': {'page': 'page.html', 'times': [0]}}}]
r = run(AS_AGENT + ['/usr/bin/python3', '-I', '/opt/ar-tools/relay.py', '/srv/ar/scratch/spool'], timeout=200,
        stdin='\n'.join(json.dumps(m) for m in req) + '\n')
replies = [json.loads(l) for l in r.stdout.splitlines() if l.strip()]
tools = [t['name'] for t in next((x['result']['tools'] for x in replies if x.get('id') == 2), [])]
call = next((x['result'] for x in replies if x.get('id') == 3), {})
rec = {'probe': 'relay self-test (agent, env -i) via sheet worker + docker --network none', 'exit': r.returncode,
       'tools': tools, 'call_is_error': call.get('isError'), 'call_text': (call.get('content') or [{}])[0].get('text', '')[:300],
       'stderr': r.stderr.strip()[:200]}
results.append(rec)
print('relay:', json.dumps(rec))
fc = subprocess.run(['docker', 'run', '--rm', '--network', 'none', '--user', '1001:1001', '--cap-drop', 'ALL',
                     '--security-opt', 'no-new-privileges', 'mcr.microsoft.com/playwright@sha256:b27e719ecbfef153e13fd24e8341736733bf2658b229677eb21ff57ff5d7fb29',
                     'sh', '-c', "fc-list | grep -c DejaVu; fc-list : family | sort -u | wc -l"], capture_output=True, text=True)
results.append({'probe': 'image fonts (DejaVu file count; distinct family lines)', 'first_line': ' / '.join(fc.stdout.split())})
print('image fonts:', fc.stdout.split())

with open('/srv/ar/out/probes.json', 'w') as f:
    json.dump(results, f, indent=1)
unexpected = [x for x in results if 'UNEXPECTED' in x.get('result', '')]
print(f'probes: {len(results)} recorded; unexpected: {len(unexpected)}')
sys.exit(0)
