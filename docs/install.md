# Install Colqy locally

This guide is for people who want to run Colqy on their own computer. **If you only want to publish through GitHub Pages and edit through the deployed Sveltia CMS, you do not need to install Git, Hugo, Pandoc or Python locally.** Follow [Getting started](getting-started.md#option-a-github-only-no-local-installation).

Local development needs Git, Python **3.12 or newer**, Hugo **Extended 0.132 or newer** (the Colqy GitHub Actions build uses **0.150.0**), and Pandoc with `--citeproc`. A Chromium-based browser is recommended for Sveltia's Local Repository mode. Run only the commands for your operating system.

## Fedora Linux

Open a terminal:

```bash
sudo dnf install -y git python3 python3-pip hugo pandoc
```

Check the installations:

```bash
git --version
python3 --version
hugo version
pandoc --version
pandoc --help | grep -- --citeproc
```

The Hugo output must contain `extended` and the version must be **0.132 or newer**. If your distribution's Hugo package is older or not Extended, follow the pinned Linux Hugo installation below.

## Ubuntu 24.04 LTS

Open a terminal:

```bash
sudo apt-get update
sudo apt-get install -y git python3 python3-venv python3-pip pandoc curl tar
```

Ubuntu's Hugo package may be too old for Colqy's Markdown alert support. Install the version used by Colqy's GitHub Actions workflow:

```bash
ARCH="$(uname -m)"
case "$ARCH" in
  x86_64) ARCH=amd64 ;;
  aarch64) ARCH=arm64 ;;
  *) echo "Unsupported CPU architecture: $ARCH"; exit 1 ;;
esac
mkdir -p "$HOME/.local/bin"
curl -fL "https://github.com/gohugoio/hugo/releases/download/v0.150.0/hugo_extended_0.150.0_linux-${ARCH}.tar.gz" -o /tmp/colqy-hugo.tar.gz
tar -xzf /tmp/colqy-hugo.tar.gz -C "$HOME/.local/bin" hugo
export PATH="$HOME/.local/bin:$PATH"
hugo version
```

To make that directory available in future Bash sessions:

```bash
grep -qxF 'export PATH="$HOME/.local/bin:$PATH"' "$HOME/.bashrc" || echo 'export PATH="$HOME/.local/bin:$PATH"' >> "$HOME/.bashrc"
```

Verify the other tools:

```bash
git --version
python3 --version
pandoc --version
pandoc --help | grep -- --citeproc
```

For other Ubuntu/Debian releases, check the Python version and Pandoc `--citeproc` support. Older packages may require upgrading from their official release distributions.

## macOS (Homebrew)

If Homebrew is not installed, install it from [brew.sh](https://brew.sh/) and follow its instructions to add `brew` to your PATH. Then run:

```bash
brew update
brew install git python@3.12 hugo pandoc
```

Verify:

```bash
git --version
python3.12 --version
hugo version
pandoc --version
pandoc --help | grep -- --citeproc
```

Use `python3.12` for the virtual-environment creation command below; `python3` may still refer to Apple's older system Python.

## Windows (PowerShell)

In PowerShell, use Windows Package Manager (`winget`):

```powershell
winget install --id Git.Git --exact
winget install --id Python.Python.3.12 --exact
winget install --id Hugo.Hugo.Extended --exact
winget install --id JohnMacFarlane.Pandoc --exact
```

Close and reopen PowerShell so the updated PATH is recognised, then verify:

```powershell
git --version
py -3.12 --version
hugo version
pandoc --version
pandoc --help | Select-String citeproc
```

If `winget` reports a package is unavailable, use that application's official installation instructions. Ensure Hugo reports **Extended**.

## Get your own Colqy repository

Create a repository under **your** GitHub account using Colqy's public repository as a template or fork. Copy the HTTPS clone URL of **your repository**, then run:

**Linux/macOS:**

```bash
git clone https://github.com/YOUR_ACCOUNT/YOUR_REPO.git
cd YOUR_REPO
python3 -m venv .venv
source .venv/bin/activate
python -m pip install 'PyYAML>=6,<7'
```

On macOS, replace `python3 -m venv` with `python3.12 -m venv` if needed.

**Windows PowerShell:**

```powershell
git clone https://github.com/YOUR_ACCOUNT/YOUR_REPO.git
cd YOUR_REPO
py -3.12 -m venv .venv
.\.venv\Scripts\python.exe -m pip install 'PyYAML>=6,<7'
```

The virtual environment keeps Python dependencies separate from your operating system. You do not need to install Node.js or run `npm` for the standard Colqy setup. The command-line BibTeX importer optionally requires `python -m pip install 'bibtexparser>=1.4,<2'`; BibTeX import in Sveltia does not.

## Configure, verify and preview

Replace `YOUR_ACCOUNT/YOUR_REPO` with the GitHub repository you created.

**Linux/macOS (virtual environment active):**

```bash
python tools/configure-colqy-github.py --repo YOUR_ACCOUNT/YOUR_REPO --dry-run
python tools/configure-colqy-github.py --repo YOUR_ACCOUNT/YOUR_REPO --apply
python tools/build-colqy.py --preflight
python tools/serve-colqy-citations.py
```

**Windows PowerShell:**

```powershell
.\.venv\Scripts\python.exe tools\configure-colqy-github.py --repo YOUR_ACCOUNT/YOUR_REPO --dry-run
.\.venv\Scripts\python.exe tools\configure-colqy-github.py --repo YOUR_ACCOUNT/YOUR_REPO --apply
.\.venv\Scripts\python.exe tools\build-colqy.py --preflight
.\.venv\Scripts\python.exe tools\serve-colqy-citations.py
```

Keep the terminal open. In a Chromium-based browser, visit:

- **Site:** <http://localhost:1313/>
- **Editor:** <http://localhost:1313/admin/>

Choose **Local Repository** in Sveltia and grant access to the local Colqy folder. This edits local files without signing in to GitHub. GitHub-backed editing requires separate authentication and write access to **your** repository.

## Check a production-style build

Stop the development server with `Ctrl+C`, then run:

```bash
python tools/build-colqy.py --build --base-url http://localhost:1313/
```

On Windows, use `.\.venv\Scripts\python.exe` instead of `python`. This creates `public/` and does **not** start a server. Use the citation-aware server for interactive preview.

## If a check fails

- **`hugo: command not found`**: restart your terminal, check PATH, and verify `hugo version`. On Linux, ensure `$HOME/.local/bin` is on PATH if using the pinned binary.
- **Hugo not Extended or too old**: install Hugo Extended 0.150.0 using the pinned Linux instructions or an appropriate up-to-date package.
- **Python older than 3.12**: install a newer Python, then recreate `.venv` with it.
- **Pandoc lacks `--citeproc`**: upgrade Pandoc; an older distribution package may not support Colqy's citation pipeline.
- **`ModuleNotFoundError: yaml`**: install PyYAML in the virtual environment and run the tools with that environment's Python.
- **Port 1313 already in use**: stop the other Hugo process before starting `serve-colqy-citations.py`.
- **Sveltia cannot save**: confirm Local Repository mode or configure your own GitHub repository and authentication; you cannot save to the public demo's repository.

For GitHub Pages publishing, continue with [GitHub Pages setup](github-pages.md). For additional failures, see [Troubleshooting](troubleshooting.md).
