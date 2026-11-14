# First-run setup: your own GitHub repository or local Sveltia

**Colqy is a forkable publishing system, not a hosted CMS account.** The demo repository's `static/admin/config.yml` may refer to its original author's GitHub repository. **You cannot edit that repository through Sveltia without write access.** Each author must connect their own fork or work locally. GitHub Pages publishes the site; it does not grant CMS write permissions.

## Option A — GitHub fork and Sveltia (default public setup)

1. **Fork or create your own Colqy repository** under your GitHub account. Clone it to your computer. Keep it private while you review demo content, personal information and deployment settings.
2. From the repository root, set Sveltia's backend to your own repository:

   ```sh
   python3 tools/configure-colqy-github.py --repo YOUR_GITHUB_NAME/YOUR_COLQY_REPO --dry-run
   python3 tools/configure-colqy-github.py --repo YOUR_GITHUB_NAME/YOUR_COLQY_REPO --apply
   ```

   This updates `backend.repo` and `backend.branch` in `static/admin/config.yml`. **Do not use the original maintainer's repository.** You can also edit those fields in YAML manually. Never put tokens in the YAML.
3. Review `hugo.toml` (site title, base URL and contact details), `data/site_content.yaml`, `data/navigation.yaml`, `content/`, `data/references.json` and the current theme settings. Remove private information **before** making the repository public. Removing a file in a later commit does not erase it from Git history.
4. Install the opt-in demo using `python3 tools/install-public-demo.py --dry-run` and `--apply` if you want the fictional example site. This does not replace your homepage or navigation.
5. Commit and push your configuration to **your** repository. In **Settings → Pages**, select **GitHub Actions** as the deployment source. Review the content before setting repository variable `COLQY_PUBLISH=true`. Follow [GitHub Pages deployment](github-pages.md).
6. Open your own published `/admin/` URL (for a project site, typically `https://YOUR_NAME.github.io/YOUR_REPO/admin/`). Sign in through a supported Sveltia GitHub authentication method with write access to **your repository**. Token/OAuth setup is separate from GitHub Pages and must not be committed as a secret.
7. Make a test edit in Sveltia, save, and confirm it commits to **your** repository. The GitHub Actions build will process citations and publish the site after a successful deployment.

The `backend.repo` setting does not automatically create or authorise a GitHub repository. Sveltia authentication must be configured and tested separately. See Sveltia's current GitHub backend documentation: https://sveltiacms.app/en/docs/backends/github

## Option B — Local Repository mode (no GitHub login for editing)

1. Clone or extract Colqy onto your computer. Install Hugo Extended, Pandoc with citeproc, Python and PyYAML as documented in [GitHub Pages setup](github-pages.md).
2. Run `python3 tools/serve-colqy-citations.py` from the repository root. This starts the citation-aware Hugo development server; avoid starting another Hugo server on the same port.
3. Open `http://localhost:1313/admin/` in a Chromium-based browser supporting local folder access. Choose Sveltia's **Local Repository** workflow and grant access to the Colqy project directory. Exact browser permission prompts vary by browser and Sveltia version.
4. Edit the fictional demo or create a Page, Project or Article. Save to the local repository. Verify Hugo reloads and citations appear after the watcher processes them.
5. When ready to publish, connect your own Git remote and follow Option A. Local editing does not require access to the original Colqy GitHub repository.

**Important:** Browser support for local directory access is not universal. If Local Repository mode is unavailable, use a compatible Chromium browser or edit Markdown/YAML directly and preview through Hugo.

## Troubleshooting

- **Sveltia tries to save to the original repository:** `static/admin/config.yml` still has the wrong `backend.repo`. Change it to your own `OWNER/REPO` and reload `/admin/`.
- **403 or permission error:** verify the signed-in GitHub account has write access to the configured repository and that your token/OAuth method has the necessary repository permissions.
- **Sveltia can't find content:** confirm the configured branch and folder structure, and inspect the browser console. GitHub Pages publication and CMS saving are separate systems.
- **Citations appear as raw Markdown:** start the citation-aware watcher locally or check the Pandoc step in GitHub Actions; a plain Hugo build can use stale citation cache.
- **Project-site assets fail:** verify the Pages base URL and avoid hard-coded root paths in templates. The public demo URLs are authored under `/colqy-public-demo/`; test these paths with the final hosting base URL.
- **Git push rejected:** fetch and inspect remote divergence before rebasing. Do not force-push to resolve ordinary CMS/Git conflicts.
