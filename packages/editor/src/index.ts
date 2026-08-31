import * as runtime from '@curvenote/runtime';
import type { types as runtimeTypes } from '@curvenote/runtime';
import type { Reducer } from 'redux';
import * as collab from './collab';

export const runtimeReducer = runtime.reducer as unknown as Reducer<
  runtimeTypes.State['runtime']
>;

export * from './store';
export { Editor } from './components';

export { default as views } from './views';
export type { NodeViewProps } from './views';

export { setup, opts, store } from './connect';
export type { Options } from './connect';
export { runtime, collab };

export { isEditable, setEditable } from './prosemirror/plugins/editable';
export { createEditorState } from './prosemirror';
