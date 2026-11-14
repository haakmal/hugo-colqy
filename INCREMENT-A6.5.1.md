# Colqy A6.5.1 — Automatic Sveltia repository binding

This patch targets the public `hugo-colqy` repository snapshot provided for A6.5.1. It preserves the Hugo/Pandoc build and reference system. Only the generated Sveltia configuration is bound to the repository during deployment.

## Install

From the public repository root:

```sh
git status --short
tar -xzf ~/Downloads/colqy_increment-A6.5.1.tar.gz
python3 tools/apply-increment-a6-5-1.py --dry-run
python3 tools/apply-increment-a6-5-1.py --apply
python3 tools/test-a6-5-1.py
python3 tools/check-deployment-a6-4b1.py
```

Requires PyYAML (`python3 -m pip install 'PyYAML>=6,<7'`). The installer refuses unexpected modifications to the existing workflow and validator. No content, references, or theme files are touched.

## Verify and commit

```sh
git diff --check
git diff --stat
git status --short
git add .github/workflows/colqy-pages.yml static/admin/config.yml \
  tools/check-deployment-a6-4b1.py tools/bind-cms-repository.py \
  tools/apply-increment-a6-5-1.py tools/test-a6-5-1.py \
  docs/A6_5_1_REPOSITORY_BINDING.md INCREMENT-A6.5.1.md
git commit -m "fix: bind deployed Sveltia to each repository (A6.5.1)"
git push origin main
```

Check GitHub Actions validation. The publish job runs only if `COLQY_PUBLISH=true`; it will generate and verify `public/admin/config.yml` before uploading the Pages artifact. The tracked source remains a neutral template.

**For future public-template users:** a fork or clone must still use its own GitHub repository and appropriate Sveltia authentication. This patch prevents accidental inheritance of the original repository in the deployed CMS.
