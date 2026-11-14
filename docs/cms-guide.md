# Editing with Sveltia CMS

Sveltia is the editing interface; Markdown, YAML and CSL JSON remain the portable source files. Use the published `/admin/` address or `http://localhost:1313/admin/` locally.

## Access and saving

- **GitHub mode:** `static/admin/config.yml` must specify your own `backend.repo` and branch. Authenticate with an account that can write to that repository. Sveltia saves by creating commits; a later Actions build publishes the result.
- **Local Repository mode:** use a supported browser and grant access to your local project folder. A local save changes files; it does not push them to GitHub.
- If the CMS reports a conflict after another editor's commit, inspect `git fetch`, `git status` and the remote history; don't force-push or overwrite someone else's edits.

## Sections

| Section | What it edits |
|---|---|
| Content | Pages, Projects and Articles. Select the content type rather than typing it manually. |
| Books | Book overview pages and their metadata. |
| Book Chapters | Chapters linked to a parent Book and ordered by weight. |
| Indexes | Automatic or hand-picked selection and List/Grid/Timeline presentation. |
| References | BibTeX import, manual reference entry, search and editing. |
| Site | Homepage, navigation, announcements, identity and appearance. |
| Organisation | Collection labels, tags and reusable statuses. |

## Primary and supporting content

The **Primary content** Markdown field is the main writing area. Pages and Projects can also have **Supporting content** for the Right region. Articles reserve the Right region for generated bibliographies, footnotes, statuses and contextual information. The Article Supporting content field is hidden when empty; legacy values are preserved and warned about rather than silently deleted.

In the primary rich-text Markdown editor, **Insert → Citation** searches the global reference library and inserts portable `[@key]` notation. Citation insertion is not intended for the supporting editor. Other custom components insert Figures, Image + Text and Galleries. Source Markdown can also be edited directly.

## Drafts, metadata and URLs

- Enable **Draft** to exclude an entry from ordinary production builds.
- **Page address** can override the generated route, e.g. `/about/`. Check for collisions.
- **Exclude from automatic listings** is useful for utility Pages such as About.
- Dates are optional; a Timeline Index retains undated entries in an Undated group.
- Collections and Tags are reusable organisational identifiers; display labels may differ from their IDs.
- Local statuses belong to an entry; reusable statuses can be referenced across entries. Global announcements are site-wide.

## Save checks

After saving, reopen the entry to confirm content persists. For GitHub mode, verify the commit and wait for the publishing workflow. A saved citation key is not a formatted citation until Pandoc regenerates the cache. See [References](references.md).
