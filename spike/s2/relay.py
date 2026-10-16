#!/usr/bin/env python3
"""Spike S2 stdio MCP relay (throwaway). Usage: relay.py SPOOL_DIR
Newline-delimited JSON-RPC on stdio. Tools contact_sheet(page, times[]) and stills(page, times[]).
One tool call = one request file in SPOOL/req, then wait up to 180 s for SPOOL/rep/<id>.json."""
import json
import os
import sys
import time
import uuid

SPOOL = sys.argv[1]
TIMES = {'type': 'array', 'items': {'type': 'number'}}
TOOLS = [
    {'name': 'contact_sheet', 'description': 'Draw a contact sheet of a page at the given times (at most 12).',
     'inputSchema': {'type': 'object', 'properties': {'page': {'type': 'string'}, 'times': {**TIMES, 'maxItems': 12}},
                     'required': ['page', 'times']}},
    {'name': 'stills', 'description': 'Draw full-size stills of a page at the given times (at most 4).',
     'inputSchema': {'type': 'object', 'properties': {'page': {'type': 'string'}, 'times': {**TIMES, 'maxItems': 4}},
                     'required': ['page', 'times']}},
]


def send(obj: dict) -> None:
    sys.stdout.write(json.dumps(obj) + '\n')
    sys.stdout.flush()


def call(name: str, args: dict) -> dict:
    rid = uuid.uuid4().hex[:12]
    tmp = os.path.join(SPOOL, 'req', f'.{rid}.tmp')
    with open(tmp, 'w') as f:
        json.dump({'id': rid, 'tool': name, 'page': args.get('page'), 'times': args.get('times')}, f)
    os.rename(tmp, os.path.join(SPOOL, 'req', f'{rid}.json'))
    rep = os.path.join(SPOOL, 'rep', f'{rid}.json')
    deadline = time.time() + 180
    while time.time() < deadline:
        if os.path.exists(rep):
            with open(rep) as f:
                r = json.load(f)
            return {'content': [{'type': 'text', 'text': r['text']}], 'isError': bool(r.get('error'))}
        time.sleep(0.25)
    return {'content': [{'type': 'text', 'text': 'sheet worker timed out'}], 'isError': True}


for raw in sys.stdin:
    raw = raw.strip()
    if not raw:
        continue
    msg = json.loads(raw)
    mid, method = msg.get('id'), msg.get('method')
    if method == 'initialize':
        send({'jsonrpc': '2.0', 'id': mid, 'result': {
            'protocolVersion': msg['params'].get('protocolVersion', '2024-11-05'),
            'capabilities': {'tools': {}}, 'serverInfo': {'name': 'sheet', 'version': '0.0.1'}}})
    elif method == 'tools/list':
        send({'jsonrpc': '2.0', 'id': mid, 'result': {'tools': TOOLS}})
    elif method == 'tools/call':
        p = msg['params']
        send({'jsonrpc': '2.0', 'id': mid, 'result': call(p['name'], p.get('arguments') or {})})
    elif method == 'ping':
        send({'jsonrpc': '2.0', 'id': mid, 'result': {}})
    elif mid is not None:
        send({'jsonrpc': '2.0', 'id': mid, 'error': {'code': -32601, 'message': 'method not found'}})
