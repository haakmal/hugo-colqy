# Colqy: GitHub Pages setup (default)

Colqy uses Hugo + Pandoc to publish a static website. **GitHub Pages is the default hosting option, not a dependency of the content or theme.** The workflow at `.github/workflows/colqy-pages.yml` uses the existing `tools/build-colqy.py` entrypoint.

## Before you publish

The current development repository may include private details, unfinished content, historic tests and personal contact information. **Do not enable public deployment until you have reviewed `content/`, `data/`, `static/uploads/`, `hugo.toml`, the CMS configuration and the public demonstration entries.** The workflow is deliberately gated by a repository variable.

## 1. Fork or create a repository

1. Create a GitHub repository containing Colqy (or fork the public template once available).
2. In `static/admin/config.yml`, update `backend.repo` to `YOUR_ACCOUNT/YOUR_REPOSITORY` (CI checks that it matches the repository), and confirm `backend.branch` is your publishing branch (`main` by default).
3. Review `hugo.toml`: title, introduction, footer and especially `params.contactEmail`. The Actions build overrides the theme and base URL, but the local Hugo configuration should also be updated for the public release. The installer converts root-absolute CMS asset links to relative links so GitHub Pages project sites work under `/REPOSITORY/admin/`.
4. Keep `data/references.json` as a CSL JSON **array**. Sveltia manages this file; the build derives its citation cache and searchable index.

## 2. Enable GitHub Pages

1. Go to **Settings → Pages → Build and deployment**.
2. Choose **GitHub Actions** as the publishing source (not “Deploy from a branch”).
3. In **Settings → Secrets and variables → Actions → Variables**, add `COLQY_PUBLISH` with value `true` **only after reviewing your content**.
4. Push to `main` or choose **Actions → Colqy — GitHub Pages → Run workflow**. The `validate` job runs on every push; the `publish` job only runs when the opt-in variable is set.
5. After successful deployment, open the Pages URL, `/admin/`, a cited Article and a Book/Chapter. The workflow automatically regenerates citations and `admin/references-index.json` before Hugo builds.

### Base URL and custom domains

`actions/configure-pages` supplies the actual Pages base URL, including `/REPOSITORY/` for project sites or the configured custom domain. To override it, set the optional repository variable `COLQY_BASE_URL` to an absolute URL such as `https://example.org/`. Do not hard-code a GitHub repository path in content templates. Test links, images and CMS at a project subpath and at the root of a custom domain.

### Sveltia sign-in is separate from hosting

GitHub Pages hosts the **static CMS interface**; it does not provide an OAuth server. Sveltia's GitHub backend supports token sign-in for individual authors, or an external OAuth client for a friendlier multi-user sign-in. A GitHub account with write access is required. Do **not** place GitHub tokens or OAuth secrets in `static/admin/config.yml`, Hugo files, public assets or Git history.

For non-technical teams, evaluate the Sveltia CMS Authenticator or a compatible OAuth client and configure the backend `base_url` according to the Sveltia documentation. GitHub PKCE is not currently a reliable substitute. Authentication must be tested independently of the Pages build.

Reference: https://sveltiacms.app/en/docs/backends/github

## 3. Local checks

From repository root:

```sh
python3 tools/check-deployment-a6-4b1.py
python3 tools/build-colqy.py --preflight
python3 tools/build-colqy.py --build --drafts --base-url http://localhost:1313/
```

`--drafts` is **local-only**. The production Actions workflow deliberately excludes drafts. Install Hugo Extended, Pandoc and PyYAML first; the BibTeX CLI importer additionally needs `bibtexparser` but is not required for CI publishing.

## 4. Publishing process

- A Sveltia edit commits Markdown or CSL JSON to GitHub.
- A push to `main` triggers GitHub Actions.
- The build regenerates `data/citation_cache.json` and `static/admin/references-index.json`, then builds Hugo using the `colqy-spatial` theme and the correct Pages base URL.
- The `public/` artifact is deployed through GitHub Pages. Derived caches do not need to be committed by CI.
- If citations or reference keys are invalid, the build **fails** instead of silently publishing stale citation output.

If the branch is protected against direct pushes, adjust Sveltia's editorial workflow or GitHub branch rules; don't disable protection merely to make the CMS work.

## Troubleshooting

- **Actions build is skipped:** confirm `COLQY_PUBLISH=true`, GitHub Pages is configured for Actions, and the workflow is on `main`.
- **Pages returns 404:** check the Pages settings, Actions deployment logs and `COLQY_BASE_URL` override. Project sites need their repository subpath.
- **Missing citations:** inspect the Pandoc step for unknown citation keys or invalid CSL JSON; use `python3 tools/build-colqy.py --check` locally.
- **CMS can't sign in:** GitHub Pages deployment and Sveltia authentication are separate. Check `backend.repo`, write access and your chosen token/OAuth method.
- **Git push rejected:** fetch and inspect remote divergence; resolve conflicts rather than force-pushing.
- **Unexpected private material published:** disable the `COLQY_PUBLISH` variable and remove sensitive files from the public repository and history as appropriate; redeploy a safe version. Public Git history can retain removed files.
