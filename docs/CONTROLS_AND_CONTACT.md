# Operational controls and contact — Increment 06

## Public status controls

`data/site-status.yaml` defines simple public-facing states; these are *display metadata*, not permissions, live stock or a workflow system.

To show a status on any regular source page, add this YAML front matter:

```yaml
status_key: opportunities
```

Hugo reads the corresponding key from `data/site-status.yaml` and renders its label, state and message through `status-notice.html`. The example research page uses `opportunities`. `commissions` is a second sample key; users may add more keys and corresponding CMS fields, or edit the YAML directly.

Edit through the CMS **Operational settings** section, or modify the YAML file directly. Saving through Sveltia creates a Git commit, then your host rebuilds the site. No live update occurs until redeployment.

For a print or other individual item, the existing front matter can hold its own availability metadata. Do not use this static status mechanism to implement real-time sales inventory.

## Contact panel

The pull-out Contact disclosure appears only if a destination is configured in `hugo.toml`:

```toml
[params]
  contactEmail = 'example@university.edu'  # optional, mailto link
  contactFormAction = ''                    # optional, trusted provider endpoint
```

With only `contactEmail`, visitors see a contact link. When `contactFormAction` is configured, the contact panel offers a native HTML form using `POST`, with name, email and message fields. For instance, Formspree provides an endpoint in the form `https://formspree.io/f/REPLACE_WITH_YOUR_OWN_ID` (create your own account and form first).

### Important boundaries

- Colqy does not receive or store form messages. The selected provider handles them.
- The form does not claim success within Colqy; it navigates to the provider's response on submission.
- Browser validation and a honeypot input do not replace server-side anti-spam controls. Configure spam protection at the provider.
- Do not add provider API keys or private credentials to `hugo.toml`, CMS configuration or source files.
- Test contact delivery from a deployed URL before publishing an email address or inviting enquiries.
- Form data is personal information; adopters should review privacy notices and their provider's data practices.

## Applying this increment

The ZIP intentionally **does not overwrite `static/admin/config.yml` or `hugo.toml`**, as those may contain your fork's custom settings. Instead, run `python3 tools/apply-increment-06.py` from the repository root. It patches the Books mapping, CMS operational controls, stylesheet reference and research example. The script is idempotent for the expected Increment 05 configuration and uses only the Python standard library.

Check `static/admin/config.yml` with your existing repository name after running, and test the CMS book landing page and Operational settings. A new book requires a new `files` entry pointing to its `_index.md` file; chapters remain editable via a separate folder collection.
