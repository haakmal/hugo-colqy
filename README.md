# Colqy A6.4b.2.1a — Read-only release consolidation audit

This package contains an evidence-based release audit, an implementation plan, a candidate path disposition manifest, and a read-only audit script.

It **does not** modify your Colqy repository.

## Use

From your current Colqy repository root, after extracting this archive:

```sh
python3 tools/audit-public-release.py
python3 tools/audit-public-release.py --json > colqy-current-release-audit.json
```

The JSON redirect creates a report file only if you choose to run it. The script itself never writes or deletes project files. PyYAML is required.

Review `docs/A6_4B21_RELEASE_AUDIT.md` and `docs/release-disposition.csv` before any release migration. The manifest is based on the A6.4a snapshot and A6.4b.2 demonstration package; the current working tree must be checked for later changes.
