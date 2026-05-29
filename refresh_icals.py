#!/usr/bin/env python3
"""
Refresh embedded iCal availability data in index.html.

Run this periodically (cron, CI/CD) to keep the pre-fetched availability
data current. The website uses this embedded data for instant availability
checks without CORS issues.

Usage:
    python3 refresh_icals.py [--html path/to/index.html]

Requires: Python 3.7+
"""

import subprocess
import json
import re
import sys
from datetime import date, timedelta
from pathlib import Path

ICALS = [
    ("33825380", "db0bb0f1a2094605a74753169c7fa8f2"),
    ("33760041", "a316c37daf0e4aa8a042707ea26b00e3"),
    ("1505758884972582166", "ac9593ce802647a6b9b8b5cd3e0ca623"),
    ("1505764523387331978", "258f71adbd25442f89dfd2db702d355e"),
    ("959398645193866526", "88e80f2db092405ebaf3ef172b771d0f"),
    ("950750256318960064", "29cb67176e6e44738bc2d997d9878ef0"),
    ("959415706303071560", "67b6e918b5b34b68b33dae58b13b27cd"),
    ("952260705771172731", "674a6b647e5a4a2288cd2b25225ea3ed"),
]

HTML_PATH = Path(sys.argv[1]) if len(sys.argv) > 1 else Path(__file__).parent / "index.html"


def fetch_ical(room_id, token):
    """Download and parse an Airbnb iCal feed."""
    url = f"https://www.airbnb.co.uk/calendar/ical/{room_id}.ics?t={token}"
    r = subprocess.run(
        ["curl", "-sS", "--max-time", "15", url],
        capture_output=True, text=True, timeout=20
    )
    if r.returncode != 0:
        return {"status": "error", "error": r.stderr.strip()}

    text = r.stdout
    booked = []
    lines = text.split("\n")
    start_str = end_str = None

    for line in lines:
        line = line.strip()
        if line.startswith("DTSTART;VALUE=DATE:"):
            start_str = line.split(":")[1]
        elif line.startswith("DTEND;VALUE=DATE:"):
            end_str = line.split(":")[1]
        elif line.startswith("SUMMARY:") and ("Reserved" in line or "Not available" in line):
            if start_str and end_str:
                sy, sm, sd = int(start_str[:4]), int(start_str[4:6]), int(start_str[6:8])
                ey, em, ed = int(end_str[:4]), int(end_str[4:6]), int(end_str[6:8])
                s = date(sy, sm, sd)
                e = date(ey, em, ed)
                d = s
                while d < e:
                    booked.append(d.strftime("%Y-%m-%d"))
                    d += timedelta(days=1)
            start_str = end_str = None

    return {"status": "ok", "booked": sorted(booked), "count": len(booked)}


def update_html(html_path, data):
    """Replace the prefetchedICalData block in index.html with fresh data."""
    html = html_path.read_text(encoding="utf-8")

    # Find and replace the prefetchedICalData JSON
    pattern = r'const prefetchedICalData = \{.*?\};'
    new_block = f'const prefetchedICalData = {json.dumps(data, separators=(",", ":"))};'

    updated = re.sub(pattern, new_block, html, count=1, flags=re.DOTALL)

    if updated == html:
        print("ERROR: Could not find prefetchedICalData in HTML")
        return False

    # Update the fetch date comment
    today = date.today().isoformat()
    updated = updated.replace("(fetched {{{{DATE}}}})", f"(fetched {today})")

    html_path.write_text(updated, encoding="utf-8")
    return True


def main():
    print(f"Refreshing iCal data for {len(ICALS)} listings...")
    print(f"Target: {HTML_PATH}\n")

    result = {}
    total_booked = 0

    for room_id, token in ICALS:
        data = fetch_ical(room_id, token)
        result[room_id] = data
        count = data.get("count", 0)
        total_booked += count
        status = "✓" if data["status"] == "ok" else "✗"
        print(f"  {status} {room_id}: {count} booked dates")

    print(f"\n  Total: {total_booked} booked dates across all listings")

    if not HTML_PATH.exists():
        print(f"\nERROR: {HTML_PATH} does not exist")
        sys.exit(1)

    if update_html(HTML_PATH, result):
        print(f"\n✓ Updated {HTML_PATH} with fresh availability data")
        print(f"  Refresh date: {date.today().isoformat()}")
    else:
        print("\n✗ Failed to update HTML")
        sys.exit(1)


if __name__ == "__main__":
    main()
