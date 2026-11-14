# Source of truth — Colqy

**Version:** 0.2 / Increment 02  
**Status:** Working foundation and collection views  
**Purpose:** An open, forkable academic and creative website starter whose published site can be adapted without rewriting its canonical content.

## Product definition

A complete public GitHub repository that users can fork, configure and deploy as their own website. The starter provides a small, neutral, modern academic interface, editable source documents, a documented rendering structure and an optional CMS integration in a later increment. A highly customised personal portfolio is a separate reference implementation, not a default assumption.

## Design principles

1. **One canonical source per item.** Collection and page views reference existing content rather than duplicate it.
2. **Presentation independence.** A replacement theme should render the same agreed content schema without migrating prose or media.
3. **Discipline-neutral defaults.** No content type is compulsory because of a presumed field of practice.
4. **Source ownership.** Content remains portable Markdown, YAML and media files managed in Git.
5. **Progressive capability.** Site remains usable without JavaScript, a CMS or a custom domain.
6. **Low-maintenance deployment.** Hugo build and static hosting; do not introduce an application server without a documented need.
7. **Accessibility.** Semantic HTML, keyboard access, responsive layouts, legible text and reduced-motion support.
8. **Clear limitations.** The starter is forkable, not a drag-and-drop general-purpose CMS or an institutional LMS.

## Content vocabulary

- **Page/source:** canonical document including metadata, Markdown and optional media.
- **Kind:** semantic label (`research`, `essay`, `project` etc.); not a different storage engine.
- **Book:** planned ordered hierarchy of pages/chapters, with its own landing page.
- **Collection:** named set of references to canonical sources; may span kinds.
- **Template:** Hugo HTML plus partials and the styles/scripts necessary to render a source.
- **View:** presentation of one or many items (index, grid, gallery, timeline, reading).

## Distribution and identity

**Product name:** Colqy. The distributed product is a forkable static-site starter, not a hosted platform. Adopters bring their own GitHub repository and hosting (Cloudflare Pages is one supported option); the publicly hosted demonstration, if any, is not an account or service shared with adopters.

## Technical boundaries

- Core: Hugo, Markdown + YAML, standard HTML/CSS/JS, Git.
- Optional CMS: Sveltia CMS or another file-based editor, integrated once schema is stable.
- Hosting: Cloudflare Pages initially; Hugo output must remain host-portable.
- Media: standard web images/audio/video; large-storage integration is optional, not required in starter.
- Contact and commerce: optional external services; no native payments, message storage or inventory backend.
- Site status: simple configuration values at build time (for example: accepting enquiries).

## Initial acceptance criteria

- Fresh checkout builds without Node dependencies or external themes.
- Landing page, source index, profile and sample documents render on desktop and mobile.
- Source content can move between views without duplicated Markdown.
- A new theme can replace the default while respecting a documented data contract.
- Publishing never depends on an editor/CMS being online.

## Change control

Record schema-breaking decisions in `docs/ARCHITECTURE.md` before implementing them. Increment packages should be independently committable and describe changed paths. Do not retrofit the upstream starter to mirror one individual's portfolio.
