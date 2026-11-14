# Composable content blocks — Increment 03

All components are optional Hugo shortcodes embedded in canonical Markdown files in `content/sources/<slug>/index.md`. Standard Markdown continues to work unchanged. Assets such as images, audio and video can live alongside the Markdown file in the same page bundle.

## Figure

```go-html-template
{{< figure src="diagram.jpg" alt="Detailed description of the diagram" caption="Figure 1. Process model" width="wide" >}}
```

Width: `standard` (default), or `wide`. Supply descriptive alt text for meaningful images. Captions may contain simple Markdown.

## Image and text

```go-html-template
{{< split src="diagram.jpg" alt="Process diagram" side="left" caption="Process overview" >}}
### Interpretation

Your **Markdown** goes here, including lists and links.
{{< /split >}}
```

Use `side="right"` for text-left and image-right on desktop. On narrow screens the image comes first and text second.

## Gallery

```go-html-template
{{< gallery columns="3" label="Prototype documentation" >}}
  {{< gallery-item src="view-a.jpg" alt="Front view of the prototype" caption="Front" >}}
  {{< gallery-item src="view-b.jpg" alt="Side view of the prototype" caption="Side" >}}
{{< /gallery >}}
```

Two or three columns are supported, with a responsive fallback. Give every meaningful image an alt description.

## Audio and video

```go-html-template
{{< media kind="audio" src="field-recording.mp3" title="Field recording" caption="Recording from the site visit" >}}
{{< media kind="video" src="demonstration.mp4" title="Prototype demonstration" poster="poster.jpg" caption="Prototype in use" >}}
```

Uses native controls, without autoplay. Audio needs a transcript and video may need subtitles or captions, supplied separately. High-resolution or large media can be linked from an external host rather than committed to Git.

## External embedded pages

```go-html-template
{{< embed src="https://example.org/demo" title="Interactive experiment" caption="Hosted demonstration" >}}
```

The iframe URL must use HTTPS and include a descriptive title. Third-party sites may disallow embedding or introduce privacy/tracking concerns. Prefer a regular link when embedding offers little benefit.

## Maintenance and theme compatibility

The component names and parameter conventions form a **theme compatibility contract**. An alternative theme needs to provide the same shortcodes (or clearly document unsupported content). `css/blocks.css` provides functional layouts only; a purpose-designed public default skin is scheduled after the core publishing features are stable.

This increment does not include a WYSIWYG editor, carousel, media transcoding, streaming platform or third-party CMS. Hugo builds may not detect media assets that have been misspelled; always inspect the rendered page.
