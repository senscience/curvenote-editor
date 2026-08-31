# Changes from upstream

This is a fork of [curvenote/editor](https://github.com/curvenote/editor), MIT licensed.
Only `packages/editor` is published, as `@senscience/curvenote-editor`.

## Provenance

The fork branched from upstream `main` at commit
[`c601b99`](https://github.com/curvenote/editor/commit/c601b99) —
_"minimal changes to deal with ESM changes in dependencies"_, 2025-03-26.

That commit is **not** the same as the published `@curvenote/editor@0.17.6`. Upstream
edited `packages/editor/package.json` after publishing 0.17.6 and never bumped the
version, so the repository's peer ranges are wider than the tarball's (`react` is
`^16.8 || ^17.0 || ^18.0` here, `^17.0.2` on npm). Upstream carries no git tags, so the
commit SHA above is the only precise reference point. Our version string starts at
`0.17.6-senscience.0` because 0.17.6 is the nearest published release, not because the
tree matches it.

Upstream's last substantive work was September 2023 and the last npm release was
2022-11-23. We do not sync from upstream: our API is deliberately narrower, so a merge
could only reintroduce what we removed.

## Why the fork exists

`@material-ui/core@4` caps its `react` peer at `^17` and calls `ReactDOM.findDOMNode` in
`Portal`, `Tooltip`, `Popover`, `Menu`, `MenuList`, `ButtonBase`, `RootRef` and
`Unstable_TrapFocus` — all removed in React 19. `views/NodeView.tsx` additionally called
`ReactDOM.render`, also removed. The host application is on React 19, renders its own
toolbar and suggestion menu, and needs none of the Material UI surface.

## Removed

- **Material UI UI layer** — `components/{Menu,InlineActions,Suggestion,Attributes}`,
  `components/Keyboard.tsx`, and `components/hooks/useClickOutside.ts`, orphaned with them.
- **Public API narrowed** — `components/index.ts` exports `Editor` only, and the root
  barrel no longer re-exports the whole components tree. Anything that imported
  `EditorMenu`, `InlineActions`, `Suggestion`, `Keyboard`, `Attributes`, `SelectWidth` or
  `MenuIcon` must supply its own.
- **Demo app and webpack** — webpack existed solely to bundle `demo/` (`entry:
  ./demo/index.tsx`), and the demo consumed exactly the deleted components. `dist` no
  longer ships a 1.78 MiB `demo.min.js`.
- **Cypress and Jest** — the single component test covered the deleted `LinkActions`.
- **Interactive widgets** — `r-components.ts` (sole importer of `@curvenote/components`,
  a lit-element 2 package), `views/WidgetView.tsx`, and the `button`, `display`,
  `dynamic`, `range`, `switch` and `variable` entries in the `nodeViews` map.
- **sidenotes** — `sidenotes@1.1.1` pins `react` to `^17.0.2` with no newer release
  allowing React 19. The comment *decoration* layer in
  `prosemirror/plugins/comments.ts` is untouched, so the `addComment` and `removeComment`
  thunks still work; only the coupling that selected a margin note when the caret entered
  a comment is gone.
- **Changesets** — `changeset publish` would have published every package in the
  monorepo under its upstream `@curvenote/*` name.

## Changed

- **`views/NodeView.tsx` rewritten on `createRoot`.** `ClassWrapper`, the class ref and
  the `setState` channel are gone; `open` and `edit` are fields on `ReactWrapper` and
  `selectNode`/`deselectNode`/`update` re-render through `root.render()`. This sidesteps
  `createRoot`'s asynchronous mount, which would have left a ref-based `setState` firing
  against `null`. `destroy()` is new — upstream had none, leaking a React root per image,
  code block, footnote and mention — and defers `unmount()` to a microtask, because
  ProseMirror destroys node views synchronously while updating the DOM, possibly from
  inside a React event handler, and unmounting during React's own render throws.
- **`setup()` takes two arguments.** Both flags of the old third parameter
  (`setupComponents`, `setupSidenotes`) are gone.
- **`Options` has no `theme`.** Its only consumer was Material UI's `ThemeProvider` in
  `NodeView`.
- **`State` has no `sidenotes` slice.** Hosts must drop the sidenotes reducer from their
  `combineReducers`.
- **`PopperPlacementType` is defined locally** in `store/ui/types.ts`, copied verbatim
  from Material UI's `Popper` — deliberately *not* from popper.js, whose union is wider
  (Material UI dropped `auto`, `auto-start` and `auto-end`, leaving 12 of 15 values).
- **`dist` is flat.** Dropping `demo` from `tsconfig.include` left one root, so tsc emits
  to `dist/` rather than `dist/src/`; `main` and `types` follow.

## Dependencies

- peers: `react ^19`, `react-dom ^19`, `react-redux ^9`, `redux ^5`, `redux-thunk ^3`
- **`react-redux@9` requires `redux@^5`**, so hosts must move `redux` 4 → 5 and
  `redux-thunk` 2 → 3. `redux-thunk@3` dropped its default export:
  `import thunkMiddleware from 'redux-thunk'` becomes `import { thunk } from 'redux-thunk'`.
- dropped as unused: `@material-ui/{core,icons,pickers}`, `@date-io/date-fns`,
  `classnames`, `date-fns`, `use-inline-memo`, `lodash.isequal`,
  `scroll-into-view-if-needed`, and `ts-jest`, which upstream kept in `dependencies`
- `prosemirror-tables` and `prosemirror-gapcursor` moved from `dependencies` to
  `peerDependencies`. Both register a global selection JSON ID in
  `prosemirror-state` (`cell` and `gapcursor`), so a second copy throws
  `RangeError: Duplicate use of selection JSON ID cell` at runtime the moment
  both are loaded. Upstream had them as ordinary dependencies, which only
  happened to work while every consumer resolved the same version.
- `katex` `^0.15` → `^0.16.22`, matching the host so the bundle carries one copy
- `typescript` `latest` → `^5.9`, and `turbo`/`prettier` pinned likewise. Unpinned tool
  versions were how a fresh install pulled Turbo 2, which renamed `pipeline` to `tasks`
  and broke every build.
- dropped `"resolution": { "react": "17.0.2" }` — a field no package manager reads

## Known debt

- `@curvenote/schema@0.12.18` is untouched: no React, no Material UI, nothing to strip.
  It parses MyST through `mystjs@0.0.13` and `markdown-it@12`, while the host renders
  through `myst-parser@1.x` and `myst-to-react`. Two MyST implementations, so the same
  text can in principle be read differently when edited than when displayed.
- `codemirror@5` survives for `views/CodeBlockView.tsx` alone.
- `@curvenote/runtime` depends on `redux ^4`, so an installed tree carries both redux 4
  and redux 5. Redux is stateless helpers, so this is benign, but `npm why redux` looks
  alarming.
- `store/attrs` and `openAttributeEditor` are still exported but unreachable — they were
  only entered from `WidgetView`'s context menu.
