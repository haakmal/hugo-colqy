# Colqy CMS — Increment 05

Sveltia CMS is an **optional browser editor**. The canonical content remains Markdown, YAML front matter and media inside your Git repository. Hugo works without the CMS.

## Fork owner responsibilities

Every user supplies their own GitHub repository, static hosting account and optional domain. Colqy does **not** provide hosting or an authentication service.

The file `static/admin/config.yml` is publicly served. **Never put a GitHub token, OAuth secret or password in it.**

## Setup

1. Edit `static/admin/config.yml` and replace `REPLACE_USERNAME/REPLACE_REPOSITORY` with your own `owner/repository`.
2. Update `backend.branch` if your default branch isn't `main`.
3. Commit and push the changes.
4. Open `https://YOUR-SITE/admin/`. On a local Hugo server, `http://localhost:1313/admin/` verifies that the editor loads, but does not itself confirm GitHub publishing.
5. Select **Sign In with Token**. Generate a fine-grained GitHub personal access token limited to your fork, granting **Contents: read and write**. Keep the token out of Git and out of shared devices.
6. Edit an example source and save. Verify the GitHub commit and the next site deployment. Run `git pull` locally to retrieve any CMS edits.

For an OAuth sign-in, set up your own [Sveltia CMS Authenticator](https://github.com/sveltia/sveltia-cms-auth) and GitHub OAuth application. That is optional and is not part of this starter.

## Content mappings

| CMS section | Source files |
|---|---|
| Pages and projects | `content/sources/<slug>/index.md` |
| Books | `content/sources/<slug>/_index.md` |
| Chapters — A Short Inquiry | `content/sources/example-thesis/*.md` |
| Site pages | `content/_index.md`, `content/about.md` |

For another book, duplicate `example_book_chapters` in `static/admin/config.yml`, change the unique collection name and the folder path. Book chapters need `book_chapter: true`, `layout: chapter`, an order `weight`, and a suitable public `url`. The book landing page remains a separate `Books` entry.

CMS *collections* here mean editing groups. They are distinct from the website's `collections` taxonomy field.

## Media and richer pages

Each ordinary page is a Hugo leaf bundle, so images can live beside its `index.md`. See `docs/CONTENT_BLOCKS.md` for Hugo shortcodes. Use the Markdown source editing mode for complex shortcode markup: visual editors can alter shortcode syntax. The final Hugo-rendered page, not the CMS preview, is authoritative.

The CMS is loaded from an external CDN and needs internet access. Sveltia remains a beta project; its behaviour can change between releases.

## Limitations

- Not a WYSIWYG web page builder.
- Book chapter management is configured explicitly for each book.
- A local CMS login does not automatically push to or read from your local Git files.
- No contact form, private file storage, user database or media streaming service is introduced in this increment.
- `/admin/` is publicly reachable, but writing requires repository credentials. `noindex` is not access control.

Documentation: [Sveltia setup](https://sveltiacms.app/en/docs/start), [GitHub backend](https://sveltiacms.app/en/docs/backends/github), [page bundles](https://sveltiacms.app/en/docs/collections/entries/slugs).
