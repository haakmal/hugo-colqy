# Colqy — Separate development and public repositories

Colqy is developed in a **development repository** and published from a **different GitHub repository**. The development repository retains experimental history; the public repository starts with a clean initial commit. GitHub Pages is the default hosting option, not a dependency of Colqy's content architecture.

**Do not push the development repository to the public remote, use `git push --mirror`, or copy its `.git` directory.** The A6.4b.2.1c exporter creates a clean candidate without inherited history. The A6.4b.4 staging tool copies that candidate and sets the CMS to the public repository owner. Neither tool publishes to GitHub.

## 1. Finish QA and review the candidate

From your **development** repository (after documentation and A6.4c visual QA are complete):

```sh
python3 tools/prepare-public-release.py --audit
python3 tools/prepare-public-release.py --export ../colqy-public-candidate-final
python3 tools/prepare-public-release.py --rehearse ../colqy-public-candidate-final --build
python3 tools/check-public-readiness.py --candidate ../colqy-public-candidate-final
```

The export destination must not exist. Use a new destination name if you already exported an earlier candidate. The readiness audit checks file hashes, public source files, reference JSON, deployment opt-in and possible privacy problems. It cannot establish that all media are appropriately licensed or that the CMS works in a browser; those require manual checks.

**Before release:** confirm the MIT licence is intended and the copyright attribution is correct; verify rights for original and third-party media; review all public content and contact details; test a cited Article, a Book, an Index, local Sveltia editing and GitHub authentication against a repository you control. Ensure GitHub Pages works under a repository subpath as well as at the site root if using a custom domain.

## 2. Stage a separate public working tree

Create an **empty** GitHub repository, for example `YOUR_ACCOUNT/colqy-public`. Do not initialise it with a README, licence or `.gitignore`, since Colqy already supplies these. You can create the remote later if you prefer.

From the **development** repository:

```sh
python3 tools/stage-public-repository.py \
  --candidate ../colqy-public-candidate-final \
  --destination ../colqy-public \
  --repo YOUR_ACCOUNT/colqy-public --dry-run

python3 tools/stage-public-repository.py \
  --candidate ../colqy-public-candidate-final \
  --destination ../colqy-public \
  --repo YOUR_ACCOUNT/colqy-public --stage
```

The staging script changes only the copied Sveltia `backend.repo` field, removes the now-stale export manifest and **does not initialise Git**. Your development repository remains untouched. Inspect `../colqy-public/static/admin/config.yml` and confirm that the repository target is correct. The public release must not ship a placeholder or an unrelated development repository in this field.

## 3. Initialise and publish the public repository (only after QA)

```sh
cd ../colqy-public
git init -b main
git add -A
git diff --cached --stat
git diff --cached --check
git commit -m "Initial public Colqy release candidate"
git remote add origin git@github.com:YOUR_ACCOUNT/colqy-public.git
git push -u origin main
```

Use an HTTPS remote instead of SSH if that is your configured authentication method. If the remote already contains a README or unrelated commits, stop and reconcile rather than force-push.

Keep `COLQY_PUBLISH` **unset** during initial review. After Pages settings, licences, Sveltia authentication and A6.4c QA are confirmed, enable GitHub Actions publishing as documented in [GitHub Pages](github-pages.md). For the first release candidate, create an annotated tag **in the public repository only**:

```sh
git tag -a v1.0.0-rc.1 -m "Colqy public release candidate"
git push origin v1.0.0-rc.1
```

Do not create `v1.0.0` until the release candidate has passed acceptance tests.

## 4. What happens to the development repository?

Nothing. It retains its existing Git remote, branches, history, increment documentation and experimental work. The public repository has a new `origin`, a clean history and its own tags. The two repositories are **not automatically synchronised**.

For future public updates, prepare another clean candidate from development, compare its files with a public working branch, review every change (especially `content/`, `data/` and `static/admin/config.yml`), and commit the selected changes into the **existing public repository**. Never reinitialise or overwrite the public history for subsequent releases.

## 5. Academic users and Sveltia

An author forks or uses the public repository as a template, then configures `backend.repo` for **their own** `OWNER/REPOSITORY`. Their GitHub account must have write permission. A fork does not grant write access to the Colqy upstream repository. Alternatively, they can develop using Sveltia's Local Repository mode and publish through their own Git workflow. Never commit GitHub tokens into the repository.

## Quick distinction

| Development repository | Public repository |
|---|---|
| Historical experiments and tests | Supported release files and Mira Vale demo |
| Existing `.git` and private history | New `.git` created locally after staging |
| Can remain private | Public when explicitly ready |
| Source for future candidates | Stable public tags, releases and issues |
