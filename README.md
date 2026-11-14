# Colqy

**A portable publishing system for academic research and creative practice.**

Colqy brings together a Markdown-first content library, [Hugo](https://gohugo.io/) static-site generation, [Sveltia CMS](https://sveltiacms.app/) editing, and [Pandoc](https://pandoc.org/) with CSL citations. Publish research, writing, projects, books, journals and curated collections without locking your work into a proprietary page builder.

Included is a website for a **Mira Vale** a *fictional academic and creative practitioner*. It demonstrates Colqy's capabilities and can be replaced with your own identity, content, and visual skin. Colqy is a publishing foundation, not a prescribed portfolio layout but is a modular system that can be used for various applications such as a blog, portfolio, gallery, academic writing repository complete with reference management, and minor book editorial system with a convenient CMS.

## What Colqy can publish

| Content | Capabilities |
| --- | --- |
| **Pages** | Flexible Markdown, custom URLs, and optional supporting content |
| **Projects** | Figures, image/text compositions, galleries, media and image lightboxes |
| **Articles** | Dated writing, inline citations, formatted bibliographies and footnotes |
| **Books** | Multi-chapter publications, table of contents and chapter navigation |
| **Indexes** | Automatic collection/tag filters or hand-picked entries; List, Grid and Timeline views |
| **Journal / blog** | Chronological Pages and Articles, including undated entries, without a separate Blog type |
| **Site information** | Collections, tags, local/reusable statuses and global announcements |

Colqy supports common Markdown structures including tables, task lists, code blocks and GitHub-style callouts—alongside custom media components. See the [content guide](docs/content-guide.md) and the included `/markdown/` demonstration.

## Getting started

> [!NOTE] 
> This repository has been designed from the perspective of academics who are not familiar with setting up a website in this fashion.

You have **two ways to start**. Choose the one that suits you:

### Option A — GitHub only (no software installation)

You can publish Colqy using GitHub Actions without installing Hugo, Python or Pandoc on your computer.

1. Sign in to GitHub. Create **your own repository** from Colqy's public template or fork. The original Colqy repository is not your editable website.
2. In your repository on GitHub, open `static/admin/config.yml`, select **Edit**, and set the backend to your own repository:

   ```yaml
   backend:
     name: github
     repo: YOUR_ACCOUNT/YOUR_REPO
     branch: main
   ```

3. Commit the change. Review `hugo.toml`, the fictional Mira Vale content, contact details, announcements and reference library before publishing.
4. In **Settings → Pages**, select **GitHub Actions** as the publishing source.
5. In **Settings → Secrets and variables → Actions → Variables**, create `COLQY_PUBLISH` with value `true` **only when you are ready to publish**.
6. Run the Colqy workflow in **Actions** or push a commit to `main`. After deployment, open your site's `/admin/` address and configure a supported Sveltia GitHub authentication method with write access to **your** repository.

GitHub Pages hosting does **not** automatically sign you into Sveltia. See the [step-by-step Getting Started guide](docs/getting-started.md) and [GitHub Pages setup](docs/github-pages.md).

### Option B — Run Colqy locally

Install the required software with the commands for your operating system. **Linux (Fedora):**

```bash
sudo dnf install -y git python3 python3-pip hugo pandoc
```

**Ubuntu 24.04:**

```bash
sudo apt-get update
sudo apt-get install -y git python3 python3-venv python3-pip pandoc curl tar
```

Ubuntu may provide an older Hugo version; follow the [pinned Hugo Extended installation](docs/install.md#ubuntu-2404-lts) before continuing.

**macOS (Homebrew):**

```bash
brew update
brew install git python@3.12 hugo pandoc
```

**Windows (PowerShell):**

```powershell
winget install --id Git.Git --exact
winget install --id Python.Python.3.12 --exact
winget install --id Hugo.Hugo.Extended --exact
winget install --id JohnMacFarlane.Pandoc --exact
```

See **[Local installation: all platforms](docs/install.md)** for exact version checks, Ubuntu's Hugo installation, Windows commands, troubleshooting and first-run instructions. Colqy requires Python 3.12+, Hugo Extended 0.132+ and Pandoc with `--citeproc`; the GitHub Actions workflow uses Hugo Extended 0.150.0.

After creating **your own** Colqy repository, clone it. On Linux/macOS:

```bash
git clone https://github.com/YOUR_ACCOUNT/YOUR_REPO.git
cd YOUR_REPO
python3 -m venv .venv
source .venv/bin/activate
python -m pip install 'PyYAML>=6,<7'
python tools/configure-colqy-github.py --repo YOUR_ACCOUNT/YOUR_REPO --dry-run
python tools/configure-colqy-github.py --repo YOUR_ACCOUNT/YOUR_REPO --apply
python tools/build-colqy.py --preflight
python tools/serve-colqy-citations.py
```

On macOS, use `python3.12 -m venv .venv` if `python3` is older. On Windows, follow the PowerShell equivalent in [Local installation](docs/install.md).

Open **http://localhost:1313/** for the site or **http://localhost:1313/admin/** for Sveltia. In a supported Chromium browser, select **Local Repository** and grant access to your Colqy folder. This does not require GitHub login. Keep the development-server terminal running while editing.

The citation-aware server is important: plain `hugo server` will not regenerate Colqy's Pandoc citations automatically.

## Explore the demonstration

The fictional Mira Vale site shows how one academic can publish across research and practice:

| Example | What it demonstrates |
| --- | --- |
| `/` | Homepage, identity, featured material and navigation |
| `/about/` | Academic profile, custom page URL and supporting content |
| `/practice/` | Grid Index of creative projects and visual work |
| `/research/` | Curated research outputs and scholarly writing |
| `/journal/` | Timeline Index and blog-like publishing |
| `/mapping-relations/` | Book overview, chapters and navigation |
| `/markdown/` | Markdown syntax, media, callouts, citations and footnotes |

These examples are **starter content**, not required structures. Authors can change navigation, collections, source types, layout settings and presentation without modifying Hugo templates.

## Editing and references

Sveltia provides editors for Content, Books, Chapters, Indexes, References and Site settings. Pages and Projects can use both primary and supporting Markdown; Articles reserve the supporting region for references, footnotes and contextual information.

Paste BibTeX or add references manually in **References**. In the primary Markdown editor, use **Insert → Citation** to insert keys such as `[@smith2024]`. Pandoc formats the citations and bibliography during the citation-aware build. The canonical bibliography remains a portable CSL JSON array in `data/references.json`.

Read the [CMS guide](docs/cms-guide.md) and [References guide](docs/references.md) for the full workflow.

## Project structure

```text
content/                  Markdown, page bundles and media
data/                     Site settings, navigation, statuses and references
static/admin/             Sveltia CMS configuration and extensions
themes/colqy-spatial/     Default responsive public skin
tools/                    Build, citation and setup utilities
demo-fixtures/            Development regression fixtures
.github/workflows/        Opt-in GitHub Pages publishing
```

Colqy's content schema, theme and hosting configuration are designed to remain separate. The default skin uses independently scrollable Left and Right content regions, contextual supporting material and responsive navigation rails. See [Appearance](docs/appearance.md) and [Architecture](docs/architecture.md) for extending or replacing the skin.

## Documentation

- [Getting started](docs/getting-started.md) · [CMS editing](docs/cms-guide.md) · [Troubleshooting](docs/troubleshooting.md)
- [Content and Markdown](docs/content-guide.md) · [Books](docs/books.md) · [Indexes](docs/indexes.md)
- [References](docs/references.md) · [Journal / blogging](docs/blogging.md)
- [Appearance](docs/appearance.md) · [Feature catalogue](docs/feature-catalogue.md)
- [GitHub Pages](docs/github-pages.md) · [Alternative hosting](docs/hosting-contract.md)
- [Development](docs/development.md) · [Architecture](docs/architecture.md) · [Release model](docs/release-model.md)

## Licence

See [LICENSE](LICENSE) for the repository's licence. Demonstration media and third-party assets may have separate attribution or usage requirements; review them before redistributing or publishing a derivative site.
