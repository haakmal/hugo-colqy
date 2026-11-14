# Architecture decision — Books are canonical branch bundles

- A book is one top-level source at `content/sources/<book>/_index.md`.
- Its chapters are regular pages underneath that book folder, ordered by `weight`.
- Hugo renders the book with `layout: book`, and chapters with `layout: chapter`.
- The top-level Work index lists immediate sources, including book bundles, not chapter descendants.
- A book may be referenced by collections and featured indexes without duplicating chapter content.
- PDF attachments are optional page resources. Colqy does not generate or manage PDF versions.
- Chapter navigation is derived at build time, so no separate navigation registry is needed.
- Presentation styles remain external to the content, consistent with the planned post-functionality design phase.
