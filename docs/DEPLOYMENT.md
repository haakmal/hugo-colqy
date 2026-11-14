# Deployment: bring your own infrastructure

Colqy is a **forkable website starter**, not a hosted website service. Each adopter controls their own Git repository, hosting account, DNS, domain (if any), CMS credentials, and optional media/contact service. **Do not commit credentials or tokens.**

## Test locally first

```sh
hugo server -D
hugo --minify
```

Hugo writes the static website to `public/`. Any provider that serves static HTML can host this output. **Cloudflare is recommended, not mandatory**; there is no Cloudflare SDK or runtime dependency in the starter.

## Cloudflare Pages (reference deployment)

1. Fork Colqy into your GitHub account, then connect *your own* Cloudflare account to the fork under Workers & Pages.
2. Select Git integration and the production branch (`main`, unless you changed it).
3. Configure build command `hugo -b $CF_PAGES_URL`, output directory `public`, and `HUGO_VERSION` matching the local version.
4. Deploy to the assigned `*.pages.dev` address. You do **not** need a domain.
5. Add a custom domain later if desired. This requires DNS configuration under your control; no DNS changes to an existing site are necessary while testing.

## Other static hosts

Run `hugo --minify` during CI or locally, then publish the generated `public/` directory. Configure `baseURL` or Hugo's `-b` build flag for that host. A custom domain is optional. The CMS and contact form are **not implemented yet**; their later integrations will use accounts managed by each adopter.

## Data ownership and safety

- Markdown/YAML and checked-in media belong to the adopting repository.
- Treat build logs and Git history as public unless access is restricted.
- The `public/` directory is build output, not your canonical content.
- Uploaded media may need external storage later; storage is not provided by Colqy.
