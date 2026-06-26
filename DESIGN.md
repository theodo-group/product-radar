# Product Radar — Design (QFD)

Goal-driven design for Product Radar: a solo, browser-local tool for positioning a
product against alternatives on a radar chart. This document translates user-facing
goals into measurable functions, the components that realise them, and the trade-offs
taken. It relies on [CONTEXT.md](./CONTEXT.md) for the ubiquitous language (Radar,
Criterion, Profile, Score, Concept) and does not redefine those terms here.

Strength weights used in matrices: **9** strong, **3** medium, **1** weak, blank none.

---

## House of Quality

```tikz
% =====================================================================
% QFD "House of Quality" preamble
% =====================================================================
\usetikzlibrary{arrows.meta, positioning, shapes.geometric, shapes.misc, calc, fit, backgrounds}

\newif\ifqfdshowroof          \qfdshowrooftrue
\newif\ifqfdshowbasement      \qfdshowbasementtrue
\newif\ifqfdshowcompetitive   \qfdshowcompetitivetrue
\newif\ifqfdshowlegend        \qfdshowlegendtrue
\newif\ifqfdshowimportance    \qfdshowimportancetrue
\newif\ifqfdshowcorrlegend    \qfdshowcorrlegendtrue
\newif\ifqfdshowevallegend    \qfdshowevallegendtrue
\newif\ifqfdshowtitle         \qfdshowtitletrue

\def\qfdNW{5}
\def\qfdNH{5}
\def\qfdWhatW{4.0}
\def\qfdImpW{0.9}
\def\qfdCmpW{3}
\def\qfdHdrH{2.6}
\def\qfdBasementN{4}

\def\qfdWhatsTitle{Customer needs}
\def\qfdImpTitle{Imp.\ \%}
\def\qfdPerceptionTitle{Comparative evaluation}
\def\qfdPoorLabel{poor}
\def\qfdExcellentLabel{excellent}
\def\qfdAltOneLabel{Our product}
\def\qfdAltTwoLabel{Competitor A}
\def\qfdAltThreeLabel{Competitor B}
\def\qfdRelTitle{Relation}
\def\qfdCorrTitle{Correlation}
\def\qfdEvalTitle{Evaluation}

\def\qfdProjectTitle{}
\def\qfdConcept{}

\tikzset{
  qfdthin/.style ={line width=0.35pt},
  qfdmed/.style  ={line width=0.7pt},
  qfdstrong/.style={circle, draw, fill=black,
                    minimum size=7pt, inner sep=0pt},
  qfdmod/.style  ={circle, draw,
                    minimum size=7pt, inner sep=0pt, line width=0.8pt},
  qfdweak/.style ={regular polygon, regular polygon sides=3, draw,
                    minimum size=8.5pt, inner sep=0pt, line width=0.7pt},
  qfdrel/.is choice,
  qfdrel/S/.style={qfdstrong},
  qfdrel/M/.style={qfdmod},
  qfdrel/W/.style={qfdweak},
  qfdalt1mk/.style={circle, draw, fill=black,
                    minimum size=6pt, inner sep=0pt, line width=1pt},
  qfdalt1ln/.style={line width=1.2pt},
  qfdalt2mk/.style={regular polygon, regular polygon sides=3, draw,
                    fill=black, minimum size=6pt, inner sep=0pt,
                    line width=0.7pt},
  qfdalt2ln/.style={line width=0.7pt, dashed},
  qfdalt3mk/.style={rectangle, draw, fill=black,
                    minimum size=5pt, inner sep=0pt, line width=0.7pt},
  qfdalt3ln/.style={line width=0.7pt, dotted},
}

\newcommand{\qfdDrawGrid}{%
  \foreach \c in {1,...,\qfdNHm} \draw[qfdthin] (\c, 0) -- (\c, -\qfdNW);
  \foreach \r in {1,...,\qfdNWm} \draw[qfdthin] (0, -\r) -- (\qfdNH, -\r);
  \foreach \r in {1,...,\qfdNWm}
    \draw[qfdthin] (\qfdLeftEdge, -\r) -- (0, -\r);
  \ifqfdshowroof
    \foreach \c in {1,...,\qfdNHm}
      \draw[qfdthin] (\c, 0) -- (\c, \qfdHdrH);
  \fi
  \ifqfdshowcompetitive
    \foreach \r in {1,...,\qfdNWm}
      \draw[qfdthin] (\qfdNH, -\r) -- (\qfdNH+\qfdCmpW, -\r);
  \fi
  \ifqfdshowbasement
    \foreach \r in {1,...,\qfdBasementN}
      \draw[qfdthin] (0, -\qfdNW-\r) -- (\qfdNH, -\qfdNW-\r);
    \foreach \c in {1,...,\qfdNHm}
      \draw[qfdthin] (\c, -\qfdNW) -- (\c, -\qfdNW-\qfdBasementN);
  \fi
}

\newcommand{\qfdDrawRoof}{%
  \ifqfdshowroof
    \foreach \k in {1,...,\qfdNHm} {%
      \pgfmathsetmacro{\rx}{(\k+\qfdNH)/2}
      \pgfmathsetmacro{\ry}{\qfdHdrH + (\qfdNH-\k)/2}
      \pgfmathsetmacro{\lx}{\k/2}
      \pgfmathsetmacro{\ly}{\qfdHdrH + \k/2}
      \draw[qfdthin] (\k, \qfdHdrH) -- (\rx, \ry);
      \draw[qfdthin] (\k, \qfdHdrH) -- (\lx, \ly);
    }%
    \draw[qfdmed] (0, \qfdHdrH)
       -- (\qfdNH/2, \qfdApexY) -- (\qfdNH, \qfdHdrH);
    \foreach \i in {1,...,\qfdNH}
      \foreach \k in {1,...,\qfdNH} {%
        \pgfmathtruncatemacro{\jj}{\i+\k}
        \ifnum\jj>\qfdNH\relax\else
          \pgfmathsetmacro{\xx}{\i + \k/2 - 0.5}
          \pgfmathsetmacro{\yy}{\qfdHdrH + \k/2}
          \coordinate (C-\i-\jj) at (\xx, \yy);
        \fi
      }%
  \fi
}

\newcommand{\qfdDrawScale}{%
  \ifqfdshowcompetitive
    \foreach \tk in {0,1,2,3,4,5} {%
      \pgfmathsetmacro{\tx}{\qfdNH + (\tk+0.5)*\qfdCmpW/6}
      \node[anchor=south, font=\scriptsize] at (\tx, 0.02) {\tk};
    }%
    \node[anchor=south, font=\scriptsize\bfseries, align=center]
         at ({\qfdNH + \qfdCmpW/2}, 0.7) {\qfdPerceptionTitle};
    \node[anchor=north, font=\scriptsize\itshape]
         at ({\qfdNH + 0.45}, -\qfdNW) {\qfdPoorLabel};
    \node[anchor=north, font=\scriptsize\itshape]
         at ({\qfdNH + \qfdCmpW - 0.45}, -\qfdNW) {\qfdExcellentLabel};
  \fi
}

\newcommand{\qfdDrawZoneTitles}{%
  \ifqfdshowimportance
    \node[rotate=90, anchor=west, font=\footnotesize\bfseries]
         at ({-\qfdImpW/2}, 0.12) {\qfdImpTitle};
  \fi
  \node[font=\scriptsize\bfseries, align=center, text width=\qfdWhatW cm]
       at ({\qfdLeftEdge + \qfdWhatW/2},
           {\ifqfdshowroof \qfdHdrH/2 \else 0.6 \fi}) {\qfdWhatsTitle};
}

\newcommand{\qfdDrawTitle}{%
  \ifqfdshowtitle
    \ifx\qfdProjectTitle\empty\else
      \pgfmathsetmacro{\qfdTitleX}{\qfdNH/2}
      \pgfmathsetmacro{\qfdTitleY}{\ifqfdshowroof \qfdApexY \else \qfdHdrH \fi + 0.9}
      \pgfmathsetmacro{\qfdSubW}{\qfdNH + 2}
      \node[anchor=south, font=\large\bfseries, align=center]
           at (\qfdTitleX, \qfdTitleY) {\qfdProjectTitle};
      \ifx\qfdConcept\empty\else
        \node[anchor=north, font=\footnotesize\itshape, align=center,
              text width=\qfdSubW cm]
             at (\qfdTitleX, {\qfdTitleY - 0.1}) {\qfdConcept};
      \fi
    \fi
  \fi
}

\newcommand{\qfdDrawFrames}{%
  \begin{scope}[qfdmed]
    \draw (\qfdLeftEdge, 0) rectangle (\qfdNH, -\qfdNW);
    \ifqfdshowimportance \draw (-\qfdImpW, 0) -- (-\qfdImpW, -\qfdNW); \fi
    \draw (0, 0) -- (0, -\qfdNW);
    \ifqfdshowroof
      \draw (0, 0) rectangle (\qfdNH, \qfdHdrH); \fi
    \ifqfdshowbasement
      \draw (0, -\qfdNW) rectangle (\qfdNH, -\qfdNW-\qfdBasementN); \fi
    \ifqfdshowcompetitive
      \draw (\qfdNH, 0) rectangle (\qfdNH+\qfdCmpW, -\qfdNW); \fi
  \end{scope}
}

\newcommand{\qfdDrawLegend}{%
  \ifqfdshowlegend
    \pgfmathsetmacro{\qfdLegX}{%
      \qfdNH + \ifqfdshowcompetitive \qfdCmpW + 0.7 \else 0.7 \fi}
    \pgfmathsetmacro{\qfdLegBottom}{%
      -2.05
      \ifqfdshowroof    \ifqfdshowcorrlegend - 2.55 \fi \fi
      \ifqfdshowcompetitive \ifqfdshowevallegend - 2.20 \fi \fi}
    \pgfmathsetmacro{\qfdLegY}{\qfdHdrH - 0.4}
    \begin{scope}[shift={(\qfdLegX, \qfdLegY)}]
      \draw[qfdmed, rounded corners=2pt]
        (-0.15, 0.4) rectangle (4.5, \qfdLegBottom);
      \node[anchor=west, font=\footnotesize\bfseries] at (0, 0.1)
        {\qfdRelTitle};
      \draw[qfdthin] (0, -0.15) -- (4.35, -0.15);
      \node[qfdstrong] at (0.22, -0.5)  {};
        \node[anchor=west] at (0.5, -0.5)  {Strong (9)};
      \node[qfdmod]    at (0.22, -0.95) {};
        \node[anchor=west] at (0.5, -0.95) {Medium (3)};
      \node[qfdweak]   at (0.22, -1.4)  {};
        \node[anchor=west] at (0.5, -1.4)  {Weak (1)};
      \ifqfdshowroof \ifqfdshowcorrlegend
        \node[anchor=west, font=\footnotesize\bfseries] at (0, -2.10)
          {\qfdCorrTitle};
        \draw[qfdthin] (0, -2.35) -- (4.35, -2.35);
        \node[anchor=west] at (0, -2.70) {{$+\!+$}\quad very positive};
        \node[anchor=west] at (0, -3.05) {{$+$\phantom{$+$}}\quad positive};
        \node[anchor=west] at (0, -3.40) {{$-$\phantom{$-$}}\quad negative};
        \node[anchor=west] at (0, -3.75) {{$-\!-$}\quad very negative};
      \fi \fi
      \ifqfdshowcompetitive \ifqfdshowevallegend
        \pgfmathsetmacro{\qfdEvalTop}{%
          -2.10 \ifqfdshowroof\ifqfdshowcorrlegend - 2.55 \fi\fi}
        \node[anchor=west, font=\footnotesize\bfseries]
          at (0, \qfdEvalTop) {\qfdEvalTitle};
        \pgfmathsetmacro{\qfdEvalSep}{\qfdEvalTop - 0.25}
        \draw[qfdthin] (0, \qfdEvalSep) -- (4.35, \qfdEvalSep);
        \pgfmathsetmacro{\qfdLegA}{\qfdEvalTop - 0.55}
        \draw[qfdalt1ln] (0.05, \qfdLegA) -- (0.45, \qfdLegA);
          \node[qfdalt1mk] at (0.25, \qfdLegA) {};
          \node[anchor=west, font=\bfseries] at (0.55, \qfdLegA)
            {\qfdAltOneLabel};
        \pgfmathsetmacro{\qfdLegB}{\qfdEvalTop - 0.95}
        \draw[qfdalt2ln] (0.05, \qfdLegB) -- (0.45, \qfdLegB);
          \node[qfdalt2mk] at (0.25, \qfdLegB) {};
          \node[anchor=west] at (0.55, \qfdLegB) {\qfdAltTwoLabel};
        \pgfmathsetmacro{\qfdLegC}{\qfdEvalTop - 1.35}
        \draw[qfdalt3ln] (0.05, \qfdLegC) -- (0.45, \qfdLegC);
          \node[qfdalt3mk] at (0.25, \qfdLegC) {};
          \node[anchor=west] at (0.55, \qfdLegC) {\qfdAltThreeLabel};
      \fi \fi
    \end{scope}
  \fi
}

\newenvironment{qfdhouse}{%
  \begin{tikzpicture}[x=1cm, y=1cm, font=\scriptsize,
                      line cap=round, line join=round]
  \ifqfdshowimportance
    \pgfmathsetmacro{\qfdLeftEdge}{-\qfdWhatW-\qfdImpW}
  \else
    \pgfmathsetmacro{\qfdLeftEdge}{-\qfdWhatW}
  \fi
  \pgfmathsetmacro{\qfdApexY}{\qfdHdrH + \qfdNH/2}
  \pgfmathtruncatemacro{\qfdNHm}{\qfdNH - 1}
  \pgfmathtruncatemacro{\qfdNWm}{\qfdNW - 1}
  \qfdDrawGrid
  \qfdDrawRoof
  \qfdDrawScale
  \qfdDrawZoneTitles
  \qfdDrawTitle
}{%
  \qfdDrawFrames
  \qfdDrawLegend
  \end{tikzpicture}%
}

% --- Product Radar overrides ---
\def\qfdNW{4}
\def\qfdNH{6}
\def\qfdWhatW{3.8}
\def\qfdHdrH{3.6}
\def\qfdWhatsTitle{Goals}
\def\qfdImpTitle{Imp.}
\qfdshowcompetitivefalse

\def\qfdProjectTitle{Product Radar}
\def\qfdConcept{Score up to 5 \textbf{Profiles} against shared
  \textbf{Criteria} on a \textbf{radar chart} to position a product
  at a glance, then share it as a self-contained link.}

\begin{document}
\begin{qfdhouse}
  % --- WHATs (Goals) + importance weights (1-10) ---
  \pgfmathsetmacro{\qfdWhatTextW}{\qfdWhatW - 0.2}
  \foreach \r/\t in {1/{Position at a glance}, 2/{Communicate it},
                     3/{Zero-setup persistence}, 4/{Low-friction editing}}
    \node[anchor=west, font=\scriptsize, text width=\qfdWhatTextW cm, align=left]
      at ({\qfdLeftEdge + 0.1}, {-\r + 0.5}) {\t};
  \foreach \r/\imp in {1/10, 2/8, 3/7, 4/6}
    \node[font=\scriptsize] at ({-\qfdImpW/2}, {-\r + 0.5}) {\imp};

  % --- HOWs (Functions, rotated) ---
  \foreach \c/\t in {1/{Live chart redraw}, 2/{Distinct Profiles},
                     3/{Faithful PNG export}, 4/{Self-contained link},
                     5/{Browser-local library}, 6/{Valid, fluid editing}}
    \node[rotate=90, anchor=west, font=\scriptsize] at ({\c - 0.5}, 0.15) {\t};

  % --- Relations (Goals x Functions) ---
  \node[qfdrel/S] at ({1 - 0.5}, {-1 + 0.5}) {};
  \node[qfdrel/S] at ({2 - 0.5}, {-1 + 0.5}) {};
  \node[qfdrel/M] at ({6 - 0.5}, {-1 + 0.5}) {};
  \node[qfdrel/M] at ({2 - 0.5}, {-2 + 0.5}) {};
  \node[qfdrel/S] at ({3 - 0.5}, {-2 + 0.5}) {};
  \node[qfdrel/S] at ({4 - 0.5}, {-2 + 0.5}) {};
  \node[qfdrel/W] at ({4 - 0.5}, {-3 + 0.5}) {};
  \node[qfdrel/S] at ({5 - 0.5}, {-3 + 0.5}) {};
  \node[qfdrel/S] at ({1 - 0.5}, {-4 + 0.5}) {};
  \node[qfdrel/M] at ({5 - 0.5}, {-4 + 0.5}) {};
  \node[qfdrel/S] at ({6 - 0.5}, {-4 + 0.5}) {};

  % --- Roof correlations (Function x Function) ---
  \node[font=\scriptsize] at (C-1-2) {$+$};
  \node[font=\scriptsize] at (C-1-3) {$+\!+$};
  \node[font=\scriptsize] at (C-1-5) {$-$};
  \node[font=\scriptsize] at (C-1-6) {$+\!+$};
  \node[font=\scriptsize] at (C-2-3) {$+$};
  \node[font=\scriptsize] at (C-3-4) {$+$};
  \node[font=\scriptsize] at (C-4-5) {$+$};
  \node[font=\scriptsize] at (C-4-6) {$+$};
  \node[font=\scriptsize] at (C-5-6) {$+$};

  % --- Basement: target / difficulty / abs weight / rel weight % ---
  \foreach \r/\lbl in {0/Target, 1/Difficulty, 2/Abs.\ wt, 3/Rel.\ wt \%}
    \node[anchor=east, font=\scriptsize\itshape]
      at ({-0.2}, {-\qfdNW - \r - 0.5}) {\lbl};
  \foreach \c/\tgt/\diff/\abs/\rel in
    {1/{$\leq$100ms}/2/144/25,
     2/{5 distinct}/2/114/20,
     3/{$\geq$2$\times$}/3/72/12,
     4/{lossless}/3/79/14,
     5/{0 network}/2/81/14,
     6/{$\leq$1 click}/3/84/15} {
    \node[font=\scriptsize] at ({\c - 0.5}, {-\qfdNW - 0.5}) {\tgt};
    \node[font=\scriptsize] at ({\c - 0.5}, {-\qfdNW - 1.5}) {\diff};
    \node[font=\scriptsize] at ({\c - 0.5}, {-\qfdNW - 2.5}) {\abs};
    \node[font=\scriptsize\bfseries] at ({\c - 0.5}, {-\qfdNW - 3.5}) {\rel};
  }
\end{qfdhouse}
\end{document}
```

---

## 1. Goals — the WHATs

| ID  | Goal                                                                              | Weight | Source                                              |
|-----|-----------------------------------------------------------------------------------|:------:|-----------------------------------------------------|
| G1  | Position a product against alternatives across several dimensions, readable in one glance | 10 | `README.md`, `RadarChart.vue`                       |
| G2  | Communicate that positioning to others without them needing the app               |   8    | `utils/png.ts`, `utils/share.ts`, `ShareImport.vue` |
| G3  | Keep and revisit my radars with zero setup — no account, no server                |   7    | `storage.ts`, `RadarList.vue`                       |
| G4  | Build and adjust a radar with minimal friction                                    |   6    | `CriteriaEditor.vue`, `ScoreGrid.vue`, `utils/reorder.ts` |

_Fairness of comparison (the "higher is better" discipline in `CONTEXT.md`) is treated
as a constraint on G1, not a separate goal._

## 2. Functions — the HOWs

Direction: ↑ higher is better, ↓ lower is better, → fixed capability / invariant.

| ID  | Function                                          | Dir | Target (now)                                                              | Target (future) |
|-----|---------------------------------------------------|:---:|--------------------------------------------------------------------------|-----------------|
| F1  | Redraw the chart live as the Radar changes        |  ↓  | ≤ 100 ms per edit (feels instant)                                        | ≤ 50 ms         |
| F2  | Keep up to 5 Profiles distinguishable on one chart|  →  | 5 Profiles × 7 Criteria, distinct palette colour + legend, no manual disambiguation | —     |
| F3  | Export the chart as a faithful raster image       |  ↑  | PNG ≥ 2× resolution, white bg, includes name + Concept, 1 click          | —               |
| F4  | Encode an entire Radar into a self-contained link |  →  | Lossless round-trip, no server, untrusted import validated & clamped     | —               |
| F5  | Keep the whole Radar library in the browser       |  →  | 0 network calls, survives reload/restart, auto-save; open/duplicate/delete each ≤ 1 action | — |
| F6  | Frictionless, always-valid editing                |  ↓  | Drag-reorder Criteria & Profiles; set a Score in ≤ 1 interaction; cardinality 3–7 / 1–5, Score 0–5, no nulls, unique names all unbreakable | — |

## 3. Cascade — Goals → Functions → How → Components

- **G1** Position a product at a glance  _W:10_
  - **F1** Live chart redraw  _↓ ≤100 ms_
    - **How**: Vue 3 reactivity drives a hand-built inline **SVG** chart that recomputes polygon points from Scores.
      - **Component**: `RadarChart.vue`, Vue reactivity
    - **How**: canvas charting lib (Chart.js) or imperative D3 — _rejected, see T1_
  - **F2** Distinguishable Profiles  _→_
    - **How**: fixed 8-colour `PROFILE_PALETTE` (≥ MAX_PROFILES) + legend + semi-transparent fills.
      - **Component**: `PROFILE_PALETTE` (`types.ts`), `RadarChart.vue` legend
- **G2** Communicate the positioning  _W:8_
  - **F3** Faithful raster export  _↑_
    - **How**: serialise the live SVG → draw into a 2× `<canvas>` → `toBlob` PNG; white bg; download or clipboard.
      - **Component**: `utils/png.ts`
    - **How**: server-side render / `html2canvas` / raw SVG download — _rejected, see T2_
  - **F4** Self-contained share link  _→_
    - **How**: `base64url(JSON(payload))` in `/share?d=` query; history-mode route; import validates & clamps.
      - **Component**: `utils/share.ts`, `RadarEditor.vue` (build link), `ShareImport.vue`, `useRadars.importRadar`, SPA fallback (`nginx try_files`, Pages `404.html`)
    - **How**: server-stored short link, or compressed payload (LZ) — _rejected, see T3_
- **G3** Zero-setup persistence  _W:7_
  - **F5** Browser-local library  _→_
    - **How**: one `localStorage` key holds the `Radar[]`; deep `watch` auto-persists; CRUD via `useRadars`.
      - **Component**: `storage.ts`
    - **How**: IndexedDB, or backend sync — _rejected, see T4_
- **G4** Low-friction editing  _W:6_
  - **F6** Frictionless, always-valid editing  _↓ / → invariant_
    - **How**: pointer-based drag reorder + grid score entry; invariants enforced by `MIN/MAX` constants, `ensureScores`, and `importRadar` clamping.
      - **Component**: `utils/reorder.ts`, `ScoreGrid.vue`, `CriteriaEditor.vue`, `ProfilesEditor.vue`, `storage.ensureScores`

## 4. House — Goals × Functions

Cells: link strength (9 strong / 3 medium / 1 weak / blank none). Importance row = `Σ(weight × strength)`.

|            | F1 | F2 | F3 | F4 | F5 | F6 |
|------------|:--:|:--:|:--:|:--:|:--:|:--:|
| G1 (10)    |  9 |  9 |    |    |    |  3 |
| G2 (8)     |    |  3 |  9 |  9 |    |    |
| G3 (7)     |    |    |    |  1 |  9 |    |
| G4 (6)     |  9 |    |    |    |  3 |  9 |
| **Σ**      |144 |114 | 72 | 79 | 81 | 84 |
| **Rel %**  | 25 | 20 | 13 | 14 | 14 | 15 |

**Top engineering priorities (from importance):** the chart-rendering pair **F1 + F2 carries 45%** of the weight — they are the only functions that strongly serve the heaviest goal (G1 = 10), and F1 doubles into G4's editing feel. Sharing (F3 + F4 = 27%) is the most feature-visible part of the app but ranks below rendering: **getting the chart live and legible is where correctness matters most.** F3 (PNG), the headline README feature, ranks last by weight.

## 5. Roof — Function × Function tradeoffs

Symbols: `◎` strong reinforcement, `○` mild reinforcement, `×` mild conflict, `⊗` strong conflict.

|        | F1 | F2 | F3 | F4 | F5 | F6 |
|--------|:--:|:--:|:--:|:--:|:--:|:--:|
| **F1** | —  | ○  | ◎  |    | ×  | ◎  |
| **F2** |    | —  | ○  |    |    |    |
| **F3** |    |    | —  | ○  |    |    |
| **F4** |    |    |    | —  | ○  | ○  |
| **F5** |    |    |    |    | —  | ○  |
| **F6** |    |    |    |    |    | —  |

**Conflicts that actually shape the design:**

- **F1 × F5 (auto-save vs live redraw).** Persistence deep-`watch`es the whole `radars` array and synchronously `JSON.stringify`s the entire store on every change, so each Score edit pays a full-store serialize on the main thread — competing with F1's ≤100 ms redraw budget. Harmless at current scale; degrades as the library grows. Owned by the §7 budget (F1 row) and the §8 watched tension; no ADR yet.

**Reinforcements that justify the architecture:**

- **F1 ◎ F3** — the hand-built SVG chosen for F1 is what makes PNG export faithful and dependency-free; the T1 bet pays off twice.
- **F1 ◎ F6** — live redraw is the feedback loop that makes editing feel frictionless.
- **F4 ○ F6** — F6's cardinality caps (≤7 Criteria, ≤5 Profiles) bound the uncompressed payload, protecting F4's long-URL weakness.
- **F4 ○ F5** — share-import reuses F5's `importRadar` validation/clamping; one code path.

## 6. Components & anchors

Function → component mapping is in the §3 cascade tree. Components whose decision is
anchored in an ADR:

| ID | Component                              | Realises | ADR      |
|----|----------------------------------------|----------|----------|
| C1 | `RadarChart.vue` (hand-built SVG)      | F1, F2   | —        |
| C2 | `utils/png.ts`                         | F3       | —        |
| C3 | `utils/share.ts` + `ShareImport.vue`   | F4       | ADR-0001 |
| C4 | `storage.ts` (`useRadars`)             | F5, F6   | —        |
| C5 | `utils/reorder.ts`, editors, `ScoreGrid.vue` | F6 | —        |

## 7. Critical performance budget

Ranked from §4 importance and the §5 conflict. Each row names the fallback if the target
is missed — a target without a fallback is a wish.

| Rank | Function     | Target            | Watched on                        | If we miss it                                                              |
|------|--------------|-------------------|-----------------------------------|----------------------------------------------------------------------------|
| 1    | F1 redraw    | ≤ 100 ms per edit | devtools profile, 5×7 radar       | Debounce / decouple the deep-`watch` persist from the keystroke path (also resolves F1×F5) |
| 2    | F2 distinct  | 5 Profiles legible| visual review at 5 Profiles       | Pattern fills in addition to colour + per-Profile show/hide toggle         |
| 3    | F6 invariants| states unbreakable| hostile import + editor edge cases| Centralise validation in one module (today split editor ↔ `importRadar`)   |
| 4    | F4 link size | fits URL limits   | URL length at 7×5 + names/Concept | LZ-compress payload before base64; else fall back to a server short-link   |

## 8. Tradeoffs — Got / Paid / ADR

| ID | Tradeoff                                        | Got                                              | Paid                                                          | ADR      |
|----|-------------------------------------------------|--------------------------------------------------|--------------------------------------------------------------|----------|
| T1 | Hand-built SVG over a charting library          | Geometry control, exportable SVG (enables F3), tiny deps | Must hand-build axes / legend / scaling                | —        |
| T2 | Client SVG→canvas PNG over server / `html2canvas` | Zero infra, faithful (chart is already SVG), no heavy deps | Raster not vector; font-embedding & canvas-taint caveats | —      |
| T3 | Self-contained link over server short-link / compression | Zero backend, links never expire, works on static hosting | Long URLs, full data in URL, no revoke / edit-after-share | ADR-0001 |
| T4 | localStorage over IndexedDB / backend           | Trivially simple, synchronous, enough at small scale | ~5 MB quota; whole-store serialize per edit (F1×F5); single-origin | —    |

### Tensions being watched (unresolved by design)

- **F1 × F5 store-serialize.** Not optimising while the library is tiny. **Trigger to revisit:** a stored library large enough that a Score edit's full-store serialize is perceptible, or the ≤100 ms budget is breached in profiling.
- **Validation split across editor and `importRadar` (F6).** Same rules live in two places; drift risk. **Trigger:** a third entry path appears, or the two diverge in a bug.
- **"Higher is better" is a hint, not enforced.** **Trigger:** users repeatedly create inverted Criteria (e.g. _Price_ instead of _Affordability_) and misread charts.

## 9. Inconsistencies spotted

- **README persistence claim.** `README.md` says persistence is "IndexedDB or localStorage"; `storage.ts` uses localStorage only (see T4). **Recommended resolution:** correct the README to say localStorage. _(Not changed in this design pass.)_
- **Two deploy pipelines.** Both Coolify/nginx and the GitHub Pages workflow (`.github/workflows/deploy-pages.yml`) deploy on push to `main`; the README documents only Coolify and the canonical domain (`product-radar.apoena.dev` vs the Pages custom domain) is unstated. **Recommended resolution:** state which target is canonical and whether Pages is a mirror. _(Not changed in this design pass.)_

---

## How to keep this honest

- When a new ADR lands → add its components to §6 and re-score affected rows.
- When a spike / measurement returns numbers → update §7 `Target` / `Watched on`.
- WHATs change rarely; HOWs change with each release; matrices (§§4–6) are recomputed when either side changes.
- If a section becomes empty after edits, delete it — empty sections lie.
