# Markdown and media capabilities

The demonstration page `/colqy-public-demo/markdown/` exercises the **actual Colqy spatial theme**, rather than merely displaying Markdown syntax as code. Use it for regression testing after theme changes.

| Capability | Test / support |
|---|---|
| Headings H1–H6 | Hierarchy and mobile spacing |
| Bold, italic, combined emphasis, strikethrough | Inline typography |
| Inline code and fenced code | Escaping and horizontal overflow |
| Links, automatic URLs, escaped characters | Link behaviour and keyboard focus |
| Ordered, unordered and nested lists | Indentation and reading order |
| Task checkboxes | Goldmark GFM task list extension |
| Tables with alignment | Desktop and narrow-screen overflow |
| Blockquotes and horizontal rules | Editorial rhythm |
| Footnotes | Explanatory notes distinct from bibliography |
| CSL citations | Single and multiple keys; automatic bibliography after Pandoc processing |
| Markdown images | Relative page-bundle images, alt text, lightbox |
| `figure` | Caption, alt text, width |
| `split` | Image left/right and Markdown body |
| `gallery` + `gallery-item` | 2- or 3-column layouts and lightbox |
| `media` | Local audio/video files; example includes original WAV audio |
| `embed` | HTTPS iframe with title and caption; external providers may block it |
| Supporting content | Page/Project Right region; Article reserves Right for references |
| Dated Pages and Articles | Timeline Index for journal/blog usage |

**Not included by default:** raw HTML (Goldmark `unsafe=false`), LaTeX math, Mermaid, executable JS and automatically generated responsive image variants. Syntax inside fenced code must remain literal; a citation such as `[@colqyVale2025]` inside code should not be processed.

## Shortcode examples

These are copyable examples. Store image files in the same page bundle as `index.md`.

```go-html-template
{{< figure src="diagram.svg" alt="Diagram description" caption="Figure caption" width="wide" >}}

{{< split src="diagram.svg" side="right" alt="Diagram description" >}}
Markdown alongside the image.
{{< /split >}}

{{< gallery columns="2" label="Research images" >}}
{{< gallery-item src="one.svg" alt="First study" caption="Study one" >}}
{{< gallery-item src="two.svg" alt="Second study" caption="Study two" >}}
{{< /gallery >}}

{{< media kind="audio" src="recording.wav" title="Field recording" >}}
{{< media kind="video" src="documentation.mp4" title="Project documentation" poster="poster.svg" >}}
{{< embed src="https://www.youtube-nocookie.com/embed/VIDEO_ID" title="Descriptive video title" >}}
```

The video example above is **syntax only**; a valid local MP4 must be provided for playback. External embeds require HTTPS and may depend on the provider's availability and privacy policy.
