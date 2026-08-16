# Codex Queue

Each queued post lives in one self-contained folder:

```text
publishing/codex-queue/<slug>/
├── post.md
└── media/          optional
```

Copy `_template`, rename the folder to the final lowercase slug, and edit
`post.md`.

- `publishAt` with an explicit timezone schedules the post.
- No `publishAt` means the post waits for manual release.
- Put source images or videos in `media/` and reference them as
  `media/filename.jpg` in Markdown and frontmatter.
- Commit the queue bundle to `main`. The automated runner consumes at most one
  due post per run.

The runner converts images to safe browser delivery files, strips embedded
public metadata, transcodes video to MP4, enforces the ndcodex media budget,
publishes through the existing safe lane, triggers Netlify, and lets the build
regenerate the graph.

Media example:

```yaml
images:
  - "media/hero.jpg"
media:
  - kind: image
    src: "media/hero.jpg"
    role: hero
    alt: "Describe the image for someone who cannot see it."
```

```markdown
![Describe the image](media/hero.jpg)
```

Useful checks:

```bash
node scripts/drip-codex.mjs --status
node scripts/drip-codex.mjs --dry-run
```

Manual release:

```bash
node scripts/drip-codex.mjs --publish --slug <slug> --wait
```
