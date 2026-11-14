# Getting started

Colqy is a publishing system you own, not an account on the original demo website. **Choose one of the following paths.**

## Option A — GitHub only (no local installation)

You do **not** need to install Git, Hugo, Pandoc or Python to use Colqy through GitHub Pages and Sveltia. GitHub Actions builds the site for you.

1. Sign in to GitHub. Use Colqy's public repository as a **template** or fork it into **your account**. Give the new repository a name and keep it private while reviewing the demonstration content.
2. In your new repository, open `static/admin/config.yml`, choose **Edit**, and change the backend to your repository:

   ```yaml
   backend:
     name: github
     repo: YOUR_ACCOUNT/YOUR_REPO
     branch: main
   ```

   Commit the change. This sets the repository Sveltia will edit; it does not configure authentication.
3. Review `hugo.toml`, `data/`, `content/`, media, references, site announcements and contact information. Replace Mira Vale's fictional identity as needed. Removing a sensitive file in a later commit does not erase it from Git history.
4. Go to **Settings → Pages → Build and deployment** and select **GitHub Actions**.
5. Once you are ready to publish, go to **Settings → Secrets and variables → Actions → Variables**, create `COLQY_PUBLISH` with value `true`, and commit a change or manually run the workflow from **Actions**.
6. When deployment succeeds, open the site's `/admin/` path. Use a supported Sveltia GitHub authentication method and a GitHub account with write access to **your repository**. GitHub Pages hosting does not provide CMS authentication.
7. Make a small edit, save it, confirm the commit appears in **your** GitHub repository and wait for the Actions build to publish the update.

For GitHub authentication, project subpaths, custom domains and deployment troubleshooting, see [GitHub Pages setup](github-pages.md). Never place tokens or OAuth secrets in public configuration files.

## Option B — Local development (copyable installation commands)

Start by installing the prerequisites for your operating system.

**Fedora:**

```bash
sudo dnf install -y git python3 python3-pip hugo pandoc
```

**Ubuntu 24.04:**

```bash
sudo apt-get update
sudo apt-get install -y git python3 python3-venv python3-pip pandoc curl tar
```

Ubuntu's Hugo package may be too old. Install the pinned Hugo Extended binary using the commands in [Local installation](install.md#ubuntu-2404-lts).

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

For verification commands and a complete Windows setup, follow **[Local installation](install.md)**. Check Python 3.12+, Hugo Extended 0.132+ and Pandoc `--citeproc` before proceeding.

### Clone your own site and install Python dependencies

Replace the placeholders with your own repository name. On Linux/macOS:

```bash
git clone https://github.com/YOUR_ACCOUNT/YOUR_REPO.git
cd YOUR_REPO
python3 -m venv .venv
source .venv/bin/activate
python -m pip install 'PyYAML>=6,<7'
```

On macOS, use `python3.12 -m venv .venv` if the default `python3` is older. On Windows, use the commands in [Local installation](install.md#get-your-own-colqy-repository).

### Configure Sveltia and preview

```bash
python tools/configure-colqy-github.py --repo YOUR_ACCOUNT/YOUR_REPO --dry-run
python tools/configure-colqy-github.py --repo YOUR_ACCOUNT/YOUR_REPO --apply
python tools/build-colqy.py --preflight
python tools/serve-colqy-citations.py
```

Keep this terminal running. Open <http://localhost:1313/> for the website and <http://localhost:1313/admin/> for Sveltia. In a Chromium-based browser, choose **Local Repository** and grant access to the project directory. Local editing does not require GitHub authentication. Use the citation-aware server above instead of plain `hugo server` so new citations render automatically.

To build a production-style static site, stop the server (`Ctrl+C`) and run:

```bash
python tools/build-colqy.py --build --base-url http://localhost:1313/
```

This generates `public/` but does **not** start a web server. Add `--drafts` only for local test builds; production publishing excludes drafts.

## First publication checklist

- [ ] The GitHub repository and Sveltia `backend.repo` belong to you.
- [ ] Site identity, contact details, references and announcements are intentional.
- [ ] The required local dependencies pass preflight, **or** the GitHub Actions workflow succeeds.
- [ ] `COLQY_PUBLISH` stays unset until the privacy/content review is complete.
- [ ] Articles with citations, Books with Chapters, and media render correctly.
- [ ] Assets and `/admin/` work at your Pages URL, including a repository subpath when applicable.
- [ ] A test Sveltia save commits to your repository.

See [Troubleshooting](troubleshooting.md) if a command fails.
