# CMS composition — Increment 08

Corrective patch for Increment 07. The Figure and Image + Text components now use Sveltia's native `image` picker rather than requiring manually entered paths. Gallery is now an expandable `list` of image objects, each with an uploadable image, alternative text and caption. The number of images is not fixed; the 2/3 column selection controls display only.

Hugo shortcode syntax and canonical content paths are unchanged. Existing two-image galleries using Increment 07's syntax can be reopened in the editor. Custom hand-written syntax or reordered attributes may require editing in Markdown source mode.

## Media location
For ordinary sources, the existing CMS configuration `media_folder: ''` and `public_folder: ''` stores uploaded media beside `content/sources/<slug>/index.md`. Site-level shared uploads remain in `static/uploads`. Sveltia's GitHub backend saves to the remote repository: pull updates before expecting them to appear in local Hugo.

## Acceptance
Create a figure, split, and gallery; use the media picker to upload; add three then ten gallery images, reorder and delete; save to GitHub; reopen each component and verify values; pull locally and inspect the actual Hugo render. The CMS preview is not a pixel-perfect Hugo preview.

## Increment 09 is planning-first
Before modifying CMS layouts, map **each section**: Sources, Site pages, Books and chapters, Organisation/tags/collections, Media, and Settings/statuses. Classify native Sveltia functions to retain, configuration improvements, and custom additions. Obtain an agreed section-by-section information architecture before implementing. The public default skin is a separate later phase.
