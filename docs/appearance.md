# Appearance and spatial layout

The default public theme is `themes/colqy-spatial`. The theme's configuration lives in `data/theme.yaml` and can be edited through **Site → Appearance** in Sveltia.

## Spatial model

- **Left and Right** are independent main content regions. An empty Right region does not automatically expand Left to full width.
- The **control rail** is normally on the extreme right, with an option to move it left.
- The **header** sits above the regions and may retract when scrolling, depending on settings.
- **Global announcements** occupy a persistent bottom rail, separate from local statuses.
- On mobile, the main regions form a reading sequence and supporting material can open in a contextual panel.

Pages and Projects may author supporting Markdown; Articles reserve the Right region for references and contextual material. Books use it for navigation. Source-level image/text alignment is independent of the main viewport zones.

## Theme settings

The current configuration includes `shell.controls`, `shell.header_sticky`, `shell.left_percent`, `shell.right_percent`, `display` metadata and eyebrow toggles, mobile supporting behaviour and motion. Keep Left/Right percentages complementary. Classification and date visibility are independent: hiding one should not hide the other.

## Creating a new skin

Prefer a separate theme directory rather than changing the content schema. A custom skin should continue to support the canonical front matter, source types, citations, statuses, index modes and Sveltia data contracts. Test it against Mira Vale and draft regression fixtures. See [Architecture](architecture.md).

The current `colqy-spatial` skin is the public default; a bespoke personal skin can be developed independently after the public baseline is released.
