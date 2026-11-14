# Getting started

Colqy is a repository-backed publishing system. You own your site and content; the original demo repository is not a shared CMS service.

## Requirements

- Git and a GitHub account for GitHub-backed editing and publishing.
- Python 3.12+ with `PyYAML>=6,<7`.
- Hugo **Extended** (the provided GitHub workflow uses version 0.150.0).
- Pandoc with the `--citeproc` option.
- A compatible Chromium-based browser for Sveltia Local Repository mode.
- Optional: `bibtexparser>=1.4,<2` for the command-line BibTeX importer. Browser-based importing does not require this Python dependency.

## A. Use your own GitHub repository

1. Create your own repository from the **public Colqy repository**, or fork it when available. Use a private repository until you've checked its contents and permissions. Do not clone and publish the development repository's historical Git data.
2. Clone your repository and enter its root directory.
3. Point Sveltia to your repository (not the original maintainer's):

   ```sh
   python3 tools/configure-colqy-github.py --repo YOUR_ACCOUNT/YOUR_REPO --dry-run
   python3 tools/configure-colqy-github.py --repo YOUR_ACCOUNT/YOUR_REPO --apply
   ```

   This changes `backend.repo` and `backend.branch` in `static/admin/config.yml`. It **does not** create a repository or configure GitHub authentication.
4. Review `hugo.toml`, `data/site_content.yaml`, `data/navigation.yaml`, `data/theme.yaml`, `content/` and `data/references.json`. Replace Mira Vale's fictional identity, demonstration links and references with your own content when ready.
5. Run the local build and inspect all public pages before enabling deployment.
6. Commit to **your** repository. Configure GitHub Pages to use **GitHub Actions**; leave `COLQY_PUBLISH` unset until ready. See [GitHub Pages](github-pages.md).
7. Open your deployed `/admin/` path. Sign in with a supported Sveltia GitHub authentication method and an account with write access to **your** repository. GitHub Pages does not provide CMS authentication.
8. Make a small test edit, save, check the GitHub commit and confirm the published page updates after the Actions build.

Never commit personal access tokens or OAuth secrets into `static/admin/config.yml`, site data or Markdown.

## B. Work locally without GitHub authentication

```sh
python3 -m venv .venv
. .venv/bin/activate
python -m pip install 'PyYAML>=6,<7'
python3 tools/build-colqy.py --preflight
python3 tools/serve-colqy-citations.py
```

Open `http://localhost:1313/admin/` in a compatible Chromium browser, select **Local Repository**, and grant access to the Colqy folder. Edit and save locally. Browser permissions and exact UI wording vary by Sveltia version. Alternatively, edit Markdown and YAML in a text editor.

For a production-like local build:

```sh
python3 tools/build-colqy.py --build --base-url http://localhost:1313/
```

For draft examples, use `--drafts`. The production Actions build excludes drafts.

## First publication checklist

- [ ] The repository and `backend.repo` belong to you.
- [ ] Site identity, contact details, public references and announcements are intentional.
- [ ] `COLQY_PUBLISH` is unset until the privacy and content review passes.
- [ ] An Article with citations and a Book with Chapters render successfully.
- [ ] Images and CMS assets load at the final GitHub Pages project subpath or custom domain.
- [ ] `/admin/` opens and a test save commits to the correct repository.
- [ ] A clean build succeeds without drafts.

See [Troubleshooting](troubleshooting.md) for common errors.
