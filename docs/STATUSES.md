# Colqy — Modular statuses (A4.1)

A4.1 adds the data contract and Hugo rendering. Sveltia editing is scheduled for A4.2.

## Local statuses

Add to any Page, Project, Article, Book, Chapter or Index front matter:

```yaml
statuses:
  - heading: Mentorship
    value: Available
    note: Enquiries welcome.
    appearance: positive
  - heading: PhD supervision
    value: Unavailable
    note: Not currently accepting candidates.
```

`heading` and `value` are free text. `note` is optional. `appearance` is an
optional semantic hint: neutral, positive, caution or critical. Styling is
intentionally provisional.

## Shared and global statuses

Edit `data/statuses.yaml`:

```yaml
shared:
  sabbatical:
    heading: Availability
    value: On sabbatical
    note: Replies may be delayed.
    appearance: neutral
global:
  - shared: sabbatical
```

Any source may reuse the same definition:

```yaml
statuses:
  - shared: sabbatical
```

Global means the theme can place the announcement site-wide. The current theme
places global announcements in its footer. `global: []` disables them.

## Backwards compatibility

Existing `status_key` and `data/site-status.yaml` continue working unchanged.
If a source has a nonempty `statuses` list, it takes precedence over
`status_key`, avoiding duplicate notices. `draft` remains a separate Hugo
publishing control. CMS Operational Settings remain unchanged until A4.2.

## Tests

Check the legacy notice on Example Research. Add two local statuses to a test
source; confirm both render. Add a shared definition, reference it from two
sources, then change its value. Test a global assignment in the footer on
multiple pages. Finally test Book, Chapter and Index status placement.
