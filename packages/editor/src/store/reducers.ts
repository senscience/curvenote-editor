import type { Reducer, UnknownAction } from 'redux';
import { combineReducers } from 'redux';
import state from './state/reducers';
import ui from './ui/reducers';
import suggestion from './suggestion/reducers';
import attrs from './attrs/reducers';
import type { EditorActions } from './types';
import type { EditorsState } from './state/types';
import type { UIState } from './ui/types';
import type { SuggestionState } from './suggestion/types';
import type { AttributesState } from './attrs/types';

export type EditorSliceState = {
  state: EditorsState;
  ui: UIState;
  suggestion: SuggestionState;
  attrs: AttributesState;
};

const reducer = combineReducers({
  state,
  ui,
  suggestion,
  attrs,
}) as unknown as Reducer<EditorSliceState, EditorActions | UnknownAction>;

export default reducer;
