# The daily question bank

The questions for the daily rounds, one year ahead. They are never shipped to
the browser: `scripts/daily/schedule.ts` deals them out to days and writes the
days to the `daily_rounds` table in Supabase, and `/api/daily` hands out a day
only once it has started.

```
content/daily/usa/*.json     the American round
content/daily/world/*.json   the world round (no American places)
```

Every file is a JSON array of questions. A question that is already scheduled
must never be edited in a way that moves its answer: the day it was played on
is fixed in the database.

## A question

```json
{
  "id": "usa-w1-a-001",
  "text": "Where do the Packers play their home games?",
  "lat": 44.5013,
  "lng": -88.0622,
  "category": "stadium",
  "venue": "Lambeau Field",
  "city": "Green Bay",
  "state": "Wisconsin",
  "country": "United States",
  "hint": "The oldest stadium in the league, on the shore of a big lake.",
  "facts": [
    "🏟️ Opened in 1957, capacity 81,441",
    "🧀 Fans are known as Cheeseheads",
    "❄️ Home of the 1967 Ice Bowl",
    "🏆 The team is owned by its fans"
  ],
  "wikipedia": "Lambeau Field"
}
```

| Field | Rule |
|---|---|
| `id` | Unique across the whole bank. `<region>-<wave>-<file letter>-<number>`. |
| `text` | The question. **Never names the city, the state or the country**, nor any other US state or country. Ask about the place, the team, the event or the person instead. |
| `lat`, `lng` | The exact spot of the venue, checked against Wikipedia. |
| `category` | `stadium`, `event`, `club` or `athlete`. |
| `venue` | The place's own name. Shown after the answer, used so two questions about one place never share a round. |
| `city` | The town the place is in. Used so clicking that town's label on the map counts as the answer. |
| `state` | US questions only: the state. |
| `country` | `United States` for the American round, the English country name otherwise. |
| `hint` | One sentence. Follows the same rule as `text`: no city, state or country. |
| `facts` | 3 or 4 short facts, each starting with an emoji. Shown after the answer, so they may name anything. |
| `wikipedia` | The English Wikipedia article whose coordinates the pin was checked against. |

`tests/daily-bank.test.ts` checks every rule it can, including the names.
