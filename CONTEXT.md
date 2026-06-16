# Context — Product Radar

Ubiquitous language for the product-radar app. Terms here should appear verbatim in code, tests, UI copy, commit messages, and conversation.

## Glossary

### Radar
The top-level entity. A user creates a Radar, names it, defines its **Criteria** (3–7), and adds its **Profiles** (up to 5). A Radar is the unit of save / open / delete / share.

- **Aliases to avoid:** *chart* (the chart is the visualization of the Radar, not the Radar itself), *comparison* (we use Radar even when only one Profile is plotted).

### Criterion
A single named dimension on the radar chart (one "spoke"). Examples: *Price*, *Battery life*, *Ease of use*. A radar has **between 3 and 7 Criteria**. Flat — Criteria do not nest.

- **Aliases to avoid:** *branch* (the user's original term — implies a hierarchy that does not exist), *axis* (acceptable but reserved for the geometric/visual concept, not the domain concept).

### Profile
One labeled shape on the radar — a set of Scores, one per Criterion. Examples: *Us-Now*, *Us-Target*, *Competitor X*. A radar has **up to 5 Profiles** total. Neutral term covering both self-snapshots and competitors.

- **Aliases to avoid:** *product* (too narrow — *Us-Target* isn't a product yet, it's an aspiration), *snapshot* (implies point-in-time, awkward for competitors).

### Score
A single integer in **{0, 1, 2, 3, 4, 5}** assigned to one (Criterion, Profile) pair. 0 = worst on this Criterion; 5 = best. Every Profile must have a Score for every Criterion of its Radar — no nulls, no "N/A".

- **Aliases to avoid:** *note* (French calque — use *Score*), *rating* (acceptable in user-facing copy, but *Score* is canonical in code).

## Conventions

### Higher is better
All Criteria must be phrased so that a higher Score is more desirable (e.g. *Affordability*, not *Price*; *Onboarding speed*, not *Time-to-onboard*). The app does not invert any axis. This is a naming discipline imposed on the user via UI hint text, not enforced by code.

Consequence: a larger Profile shape on the radar always means a "stronger" Profile, making visual comparison meaningful.

### Cardinality
- A Radar has **3 to 7 Criteria** (inclusive), and **1 to 5 Profiles** (inclusive).
- Within one Radar, Criterion names are unique. Profile names are unique.
- A Profile's Scores cover every Criterion in its Radar — exactly one Score per (Criterion, Profile) pair.



