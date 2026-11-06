#!/usr/bin/env python3
"""Weekly watch for makevoid's Claude Code anime plugin (not released as of Nov 5, 2026).

Reads makevoid's public repos and looks for a new one, not in known-repos.txt, whose name or
description looks like the plugin. On a match it opens an issue assigned to Robin and, when
RHEO_NOTIFY_TOKEN is set, sends the same text to his Telegram. It writes found=true to
GITHUB_OUTPUT so the workflow can switch itself off. Other new repos only go in the job log.

TEST_ISSUE=<number> runs the read, then comments on that issue instead of opening a new one, and
sends the Telegram message too, so a test proves the notification path without a junk issue.
"""
import json
import os
import re
import subprocess
import sys
import urllib.request
from pathlib import Path

USER = "makevoid"
POST = "https://x.com/makevoid/status/2118357685380805095"
LOOKS_LIKE = re.compile(r"anime|manga|episode|film|story|scene|animation", re.I)
NOTIFY_URL = "https://tg.rheo.ca/mcp"
KNOWN = Path(__file__).with_name("known-repos.txt")


def fetch_repos():
    repos, page = [], 1
    while True:
        req = urllib.request.Request(
            f"https://api.github.com/users/{USER}/repos?type=owner&per_page=100&page={page}",
            headers={"Accept": "application/vnd.github+json",
                     "Authorization": f"Bearer {os.environ['GH_TOKEN']}"})
        batch = json.load(urllib.request.urlopen(req, timeout=30))
        if not batch:
            return repos
        repos += batch
        page += 1


def new_repos(repos, known):
    return [r for r in repos if r["name"] not in known and not r["fork"]]


def matches(repos):
    return [r for r in repos if LOOKS_LIKE.search(f"{r['name']} {r['description'] or ''}")]


def gh(*args):
    subprocess.run(["gh", *args, "--repo", os.environ["GITHUB_REPOSITORY"]], check=True)


def telegram(text):
    """Send to Robin's Telegram through Rheo bot. Returns False when no token is set."""
    token = os.environ.get("RHEO_NOTIFY_TOKEN", "").strip()
    if not token:
        print("RHEO_NOTIFY_TOKEN not set, skipping Telegram")
        return False
    body = json.dumps({"jsonrpc": "2.0", "id": 1, "method": "tools/call",
                       "params": {"name": "notify_robin", "arguments": {"text": text}}}).encode()
    req = urllib.request.Request(NOTIFY_URL, data=body, method="POST", headers={
        "Content-Type": "application/json", "Authorization": f"Bearer {token}"})
    res = json.load(urllib.request.urlopen(req, timeout=30))
    if res.get("error") or res.get("result", {}).get("isError"):
        raise RuntimeError(f"notify_robin failed: {res}")
    print("Telegram sent")
    return True


def main():
    known = set(KNOWN.read_text().split())
    repos = fetch_repos()
    if len(repos) < len(known) / 2:  # a bad read must fail, not pass as "nothing new"
        sys.exit(f"read only {len(repos)} repos against {len(known)} known")
    fresh = new_repos(repos, known)
    found = matches(fresh)
    print(f"{len(repos)} repos read, {len(fresh)} new, {len(found)} look like the plugin")
    for r in fresh:
        print(f"  new: {r['name']}: {r['description']}")

    test_issue = os.environ.get("TEST_ISSUE", "").strip()
    if test_issue:
        text = f"Test of the makevoid watch: {len(repos)} repos read, {len(found)} look like the plugin."
        telegram(text)
        gh("issue", "comment", test_issue, "--body", text)
        return
    if not found:
        return

    lines = [f"{r['name']}: {r['html_url']} ({r['description'] or 'no description'})" for r in found]
    text = "makevoid may have released the anime plugin:\n" + "\n".join(lines) + f"\nThe post: {POST}"
    gh("issue", "create", "--title", "makevoid may have released the anime plugin",
       "--assignee", "rheos", "--body", text + "\n\nThis watch has now switched itself off.")
    telegram(text)
    with open(os.environ["GITHUB_OUTPUT"], "a") as out:
        out.write("found=true\n")


if __name__ == "__main__":
    main()
