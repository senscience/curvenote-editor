# @senscience/curvenote-editor

A fork of [`@curvenote/editor`](https://github.com/curvenote/editor) with the
Material UI layer removed and React 19 support. MIT licensed, copyright Curvenote
Inc.; see `LICENSE`.

A ProseMirror-based editor for MyST markdown, exposing a redux store, an `Editor`
component and the ProseMirror plugins and node views that go with them.

## Why this fork exists

`@material-ui/core@4` caps its `react` peer at `^17` and calls
`ReactDOM.findDOMNode` in `Portal`, `Tooltip`, `Popover`, `Menu`, `MenuList`,
`ButtonBase`, `RootRef` and `Unstable_TrapFocus` — all removed in React 19.
`views/NodeView.tsx` additionally called `ReactDOM.render`, also removed. Upstream's
last npm release was November 2022, so there is no version to upgrade to.

## What is different

The public API is deliberately narrower than upstream's: the Material UI
components (`EditorMenu`, `InlineActions`, `Suggestion`, `Keyboard`, `Attributes`,
`SelectWidth`, `MenuIcon`), the interactive widget layer and the sidenotes
integration are gone, and consumers bring their own UI. `setup()` takes two
arguments, `Options` has no `theme`, and `State` has no `sidenotes` slice.

`CHANGES.md` in the repository root records every divergence, why it was made, and
the known debt that came with it.

## Install

Published to GitHub Packages, so the `@senscience` scope needs to point there:

```sh
npm config set @senscience:registry https://npm.pkg.github.com
npm config set //npm.pkg.github.com/:_authToken $(gh auth token)
```

```sh
npm install @senscience/curvenote-editor
```

## Peer dependencies

React 19, `react-redux@9`, `redux@5` and `redux-thunk@3`, plus `@curvenote/schema`,
`@curvenote/runtime`, `fuse.js` and the ProseMirror packages listed in
`package.json`.

Note that `react-redux@9` requires `redux@^5`, and `redux-thunk@3` dropped its
default export: `import { thunk } from 'redux-thunk'`.

`prosemirror-tables` and `prosemirror-gapcursor` are peers rather than
dependencies on purpose. Each registers a global selection JSON ID in
`prosemirror-state`, so a second copy in the tree throws
`RangeError: Duplicate use of selection JSON ID cell` as soon as both load.
