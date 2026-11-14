# Colqy A6.5.1 — Automatic Sveltia repository binding

## Why this exists

Forking, cloning or using a GitHub template copies `static/admin/config.yml`. If that file names the original `haakmal/hugo-colqy` repository, Sveltia will try to edit the original repository. GitHub permissions normally prevent unauthorised writes, but the configuration is misleading.

**Source file:** `static/admin/config.yml` always retains `repo: YOUR_ACCOUNT/YOUR_REPOSITORY`. It is deliberately neutral. Do not put a personal repository name back into the public template.

**Deployed file:** After Hugo builds, `tools/bind-cms-repository.py` writes the repository name into **only** `public/admin/config.yml`. GitHub Actions supplies `GITHUB_REPOSITORY`. The generated file is then checked before upload. Source files are never rewritten.

## GitHub Pages — fork or template

1. Fork the public repository or create a new repository from its template.
2. In **Settings → Pages**, select **GitHub Actions** as the source.
3. In **Settings → Secrets and variables → Actions → Variables**, set `COLQY_PUBLISH` to `true` only when ready to publish. New forks do not automatically inherit this setting.
4. Push to `main` or manually run **Colqy — GitHub Pages**.
5. The build binds the deployed CMS to that repository. Check the published `/admin/config.yml` (or project-subpath `/admin/config.yml`) and confirm `backend.repo` matches your repository.
6. Open the deployed `/admin/` and configure GitHub authentication as documented. Repository binding does **not** grant permissions or set up OAuth.

The validation job accepts the neutral source template, while publishing requires a valid `GITHUB_REPOSITORY` and verifies the generated config. Do not turn on publishing before reviewing your content and media rights.

## Cloning into a new repository

A plain clone retains the original Git remote. To publish from your own GitHub repository, create an empty repository and change the remote explicitly:

```sh
git remote -v
git remote rename origin upstream
git remote add origin git@github.com:YOUR_ACCOUNT/YOUR_REPOSITORY.git
git remote -v
git push -u origin main
```

Only do this when the new GitHub repository exists and you intend to push there. The generated CMS configuration will use **your** `GITHUB_REPOSITORY` during that repository's Actions build, regardless of the original clone URL.

## Local development

For Sveltia's **Local Repository mode**, no GitHub repository binding is needed. Run the local Hugo development server normally. The source config remains neutral. GitHub-backed CMS mode on an unconfigured local build will not work until explicitly bound and authenticated.

To preview a generated, repository-bound site locally, after a normal Hugo build:

```sh
python3 tools/build-colqy.py --build --base-url http://127.0.0.1:1313/
python3 tools/bind-cms-repository.py --site public --repo YOUR_ACCOUNT/YOUR_REPOSITORY --apply
python3 tools/bind-cms-repository.py --site public --repo YOUR_ACCOUNT/YOUR_REPOSITORY --check
```

The two commands above intentionally modify **only** `public/admin/config.yml`, not the tracked `static/admin/config.yml`. They do not start a server.

## Alternative hosting

Use the same host-independent build and supply the intended GitHub repository to the binding step:

```sh
python3 tools/build-colqy.py --build --base-url "$SITE_URL"
COLQY_REPOSITORY=YOUR_ACCOUNT/YOUR_REPOSITORY python3 tools/bind-cms-repository.py --site public --apply
COLQY_REPOSITORY=YOUR_ACCOUNT/YOUR_REPOSITORY python3 tools/bind-cms-repository.py --site public --check
```

Run the binding step **after Hugo** and **before uploading `public/`**. Do not assume the host automatically provides a repository identity. Do not bind Sveltia to a repository the user does not own or have permission to edit.

## Troubleshooting

- **Validation fails because the source is fixed to a particular repository:** reapply A6.5.1 or restore the neutral placeholder in `static/admin/config.yml`.
- **Build succeeds but CMS points at the original repository:** confirm the deployment invokes `bind-cms-repository.py` after the build and before upload. Inspect the deployed config, not just the source file.
- **Missing `public/admin/config.yml`:** build Hugo before binding.
- **GitHub Actions publish job skipped:** `COLQY_PUBLISH` is not `true`. This is expected for new forks.
- **GitHub CMS login or permissions fail:** repository binding does not configure OAuth or grant write permissions. Check the Sveltia authentication setup and your GitHub access.
- **Rejected Git push:** check `git remote -v`, then fetch and reconcile divergence; don't force-push to solve routine conflicts.

## Release test

```sh
python3 tools/test-a6-5-1.py
python3 tools/check-deployment-a6-4b1.py
```

Then inspect the GitHub Actions run. Its validation step must pass for the neutral source, and the publish step must check the generated configuration before deploying.
