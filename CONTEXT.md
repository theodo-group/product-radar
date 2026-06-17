# Context — Product Radar

Ubiquitous language for the product-radar app. Terms here should appear verbatim in code, tests, UI copy, commit messages, and conversation.

## Glossary

### Radar

The top-level entity. A user creates a Radar, names it, defines its **Criteria** (3–7), and adds its **Profiles** (up to 5). A Radar is the unit of save / open / delete / share.

- **Aliases to avoid:** _chart_ (the chart is the visualization of the Radar, not the Radar itself), _comparison_ (we use Radar even when only one Profile is plotted).

### Criterion

A single named dimension on the radar chart (one "spoke"). Examples: _Price_, _Battery life_, _Ease of use_. A radar has **between 3 and 7 Criteria**. Flat — Criteria do not nest.

- **Aliases to avoid:** _branch_ (the user's original term — implies a hierarchy that does not exist), _axis_ (acceptable but reserved for the geometric/visual concept, not the domain concept).

### Profile

One labeled shape on the radar — a set of Scores, one per Criterion. Examples: _Us-Now_, _Us-Target_, _Competitor X_. A radar has **up to 5 Profiles** total. Neutral term covering both self-snapshots and competitors.

- **Aliases to avoid:** _product_ (too narrow — _Us-Target_ isn't a product yet, it's an aspiration), _snapshot_ (implies point-in-time, awkward for competitors).

### Score

A single integer in **{0, 1, 2, 3, 4, 5}** assigned to one (Criterion, Profile) pair. 0 = worst on this Criterion; 5 = best. Every Profile must have a Score for every Criterion of its Radar — no nulls, no "N/A".

- **Aliases to avoid:** _note_ (French calque — use _Score_), _rating_ (acceptable in user-facing copy, but _Score_ is canonical in code).

### Concept

A short free-text subtitle on a Radar that names the product and helps the reader identify its typical performances at a glance. Optional — a Radar may have an empty Concept. Rendered under the Radar name (the title) on the chart, wrapping to a second line when long.

- **Aliases to avoid:** _subtitle_ (that's the visual role, not the domain term), _description_ (too generic — a Concept is a tight positioning phrase, not prose), _tagline_ (acceptable in user-facing copy, but _Concept_ is canonical in code).

## Conventions

### Higher is better

All Criteria must be phrased so that a higher Score is more desirable (e.g. _Affordability_, not _Price_; _Onboarding speed_, not _Time-to-onboard_). The app does not invert any axis. This is a naming discipline imposed on the user via UI hint text, not enforced by code.

Consequence: a larger Profile shape on the radar always means a "stronger" Profile, making visual comparison meaningful.

### Cardinality

- A Radar has **3 to 7 Criteria** (inclusive), and **1 to 5 Profiles** (inclusive).
- Within one Radar, Criterion names are unique. Profile names are unique.
- A Profile's Scores cover every Criterion in its Radar — exactly one Score per (Criterion, Profile) pair.
