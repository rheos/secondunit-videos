#!/usr/bin/env python3
"""Spike S2 CONNECT proxy (throwaway). Usage: proxy.py PORT ALLOW_CSV LOGFILE
Allows only CONNECT <host>:443 for hosts in ALLOW_CSV. Logs every CONNECT (ALLOW or REFUSE) with host:port."""
import asyncio
import sys
import time

PORT = int(sys.argv[1])
ALLOW = {h.strip().lower() for h in sys.argv[2].split(',') if h.strip()}
LOG = sys.argv[3]


def log(kind: str, target: str) -> None:
    with open(LOG, 'a') as f:
        f.write(f"{time.strftime('%H:%M:%S')} {kind} {target}\n")


async def pump(reader: asyncio.StreamReader, writer: asyncio.StreamWriter) -> None:
    try:
        while data := await reader.read(65536):
            writer.write(data)
            await writer.drain()
    except (ConnectionError, asyncio.CancelledError):
        pass
    finally:
        try:
            writer.close()
        except Exception:
            pass


async def handle(reader: asyncio.StreamReader, writer: asyncio.StreamWriter) -> None:
    try:
        line = (await asyncio.wait_for(reader.readline(), 10)).decode('latin1').split()
        while (h := await asyncio.wait_for(reader.readline(), 10)) not in (b'\r\n', b'\n', b''):
            pass
        if len(line) != 3 or line[0] != 'CONNECT':
            log('REFUSE-NONCONNECT', ' '.join(line[:2]))
            writer.write(b'HTTP/1.1 405 Method Not Allowed\r\n\r\n')
            await writer.drain()
            return
        host, _, port = line[1].rpartition(':')
        if port != '443' or host.lower() not in ALLOW:
            log('REFUSE', line[1])
            writer.write(b'HTTP/1.1 403 Forbidden\r\n\r\n')
            await writer.drain()
            return
        ur, uw = await asyncio.wait_for(asyncio.open_connection(host, 443), 15)
        log('ALLOW', line[1])
        writer.write(b'HTTP/1.1 200 Connection Established\r\n\r\n')
        await writer.drain()
        await asyncio.gather(pump(reader, uw), pump(ur, writer))
    except Exception as e:  # noqa: BLE001  (spike: one log line per failure)
        log('ERROR', type(e).__name__)
    finally:
        try:
            writer.close()
        except Exception:
            pass


async def main() -> None:
    srv = await asyncio.start_server(handle, '127.0.0.1', PORT)
    log('START', f'127.0.0.1:{PORT} allow={sorted(ALLOW)}')
    async with srv:
        await srv.serve_forever()


asyncio.run(main())
