# Colqy public demonstration: an academic creative practice

## The scenario

**Dr Mira Vale is fictional.** Her site demonstrates a creative academic practice across speculative design, fieldwork, teaching, journal publishing and scholarly writing. All demonstration research titles, authors and publications are invented; do not cite them as real scholarship. Original grayscale SVG diagrams and a three-second synthesized WAV file are bundled. The video example embeds an external Blender Foundation open movie and requires network access.

The example content is **published (`draft: false`)** to behave like a real public website. It is *opt-in* and uses the `/colqy-public-demo/` URL namespace to avoid replacing a user's personal homepage or existing sources. It is separate from the historical `colqy-demo-*` regression fixtures, which remain untouched.

## Install locally

From the Colqy repository root:

```sh
python3 tools/install-public-demo.py --dry-run
python3 tools/install-public-demo.py --apply
python3 tools/build-colqy.py --build --drafts --base-url http://localhost:1313/
python3 tools/serve-colqy-citations.py
```

Open `http://localhost:1313/colqy-public-demo/` to explore the landing page. Do not run a separate Hugo server on the same port as `serve-colqy-citations.py`. The citation-aware watcher rebuilds when Markdown or references change. On the public build, the same citation-aware build runs in GitHub Actions.

**The installer appends only three fictional CSL JSON records to `data/references.json`.** It preserves existing entries and refuses a citation-key conflict with different data. It does not change navigation, homepage, CMS backend, theme settings or private content. Review the dry-run before applying; new public pages will appear on the next production build.

## Feature coverage

| Demo page | What to verify |
|---|---|
| `/colqy-public-demo/` | Landing page and cross-navigation |
| `/colqy-public-demo/about/` | Root-like custom URLs, Page, Right supporting region |
| `/colqy-public-demo/teaching/` | Teaching profile, lists, tables |
| `/colqy-public-demo/field-atlas/` | Project, featured item, gallery, figure, split, positive status |
| `/colqy-public-demo/material-protocols/` | Project, local audio, HTTPS embed, caution status |
| `/colqy-public-demo/research-note/` | Article, multiple citations, footnotes, bibliography, neutral status |
| `/colqy-public-demo/mapping-relations/` | Book, cover, chapters, nested TOC, chapter navigation |
| `/colqy-public-demo/practice/` | Hand-picked Grid Index with thumbnails |
| `/colqy-public-demo/research/` | Automatic List Index by collection and content type |
| `/colqy-public-demo/journal/` | Timeline Index mixing dated Articles and Pages, plus an undated entry |
| `/colqy-public-demo/markdown/` | Markdown syntax, code, tables, tasks, notes and media shortcodes |

### Blog-like publishing

There is no separate Blog content type. The Journal uses a Timeline Index over ordinary dated Pages and Articles. Authors can choose whether a post needs the Article's automatic bibliography or a Page's editable supporting region. The undated example verifies that the Timeline does not silently drop entries without dates.

### Markdown limits

See [Markdown capability matrix](markdown-capabilities.md). Colqy supports Goldmark Markdown with its current configuration and the bundled shortcodes. Do not assume raw HTML, mathematical rendering, Mermaid, executable scripts or arbitrary media providers work without additional configuration. The media shortcode accepts local audio/video assets; the demonstration bundles original audio and an external video embed, but no local MP4 file.

### Personalisation

The public demo does **not** replace your homepage or navigation. To make it the site's primary presentation later, use Sveltia **Site → Navigation** to add links to Practice, Research, Journal, About and Teaching, and edit the Homepage. This will be handled as part of public-release curation, after confirming that the current private content has been removed from the public default.

The same source data works with a different skin. The public demonstration is not intended to determine the design of the later bespoke portfolio skin.

### Status and announcement coverage

The demo includes positive (Field Atlas), caution (Material Protocols), neutral (Research Article) and critical (Book) **local statuses**. A sample global announcement is provided at `examples/public-demo/data/global-statuses-example.yaml`, but is **not installed automatically**: global announcements affect the entire website and should be enabled deliberately through Sveltia's Site settings. The homepage may also list demo items marked `featured: true` after installation; this is intentional and demonstrates featured content without replacing homepage Markdown.
