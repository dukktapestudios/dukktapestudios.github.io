# Random Ideas

The Random Ideas page reads `data/ideas.json`. Add a new idea by appending an object to the `ideas` array. The page lists entries in that order.

```json
{
  "title": "Working title",
  "type": "Anime",
  "status": "idea only",
  "date": "2026-11-03",
  "premise": "One short paragraph about the idea."
}
```

- `title` — the name of the idea
- `type` — optional kind of idea, such as `Anime`. Shown as a small tag on the card. Leave it out when the idea has no type.
- `status` — where it stands, in a few words (`idea only`, `test comic made`)
- `date` — `YYYY-MM-DD`, or a short written date such as `Nov 3, 2026`
- `premise` — what it is about

Save the file. The next time the page opens, the new entry is on the list.
