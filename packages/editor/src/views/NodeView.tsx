import React from 'react';
import type { Root } from 'react-dom/client';
import { createRoot } from 'react-dom/client';
import { Node } from 'prosemirror-model';
import { EditorView } from 'prosemirror-view';
import { Provider } from 'react-redux';
import { isEditable } from '../prosemirror/plugins/editable';
import { ref } from '../connect';
import { GetPos, NodeViewProps } from './types';

export type Options = {
  wrapper: 'span' | 'div';
  className?: string;
  enableSelectionHighlight?: boolean;
};

export type NodeViewPos = {
  node: Node;
  view: EditorView;
  getPos: GetPos;
};

export class ReactWrapper {
  dom: HTMLElement;

  node: Node;

  view: EditorView;

  getPos: GetPos;

  isSelectionHighlightEnabled: boolean;

  private Child: React.FunctionComponent<NodeViewProps>;

  private root: Root;

  private open = false;

  private edit: boolean;

  constructor(NodeView: React.FunctionComponent<NodeViewProps>, nodeViewPos: NodeViewPos, options: Options) {
    const { node, view, getPos } = nodeViewPos;
    this.node = node;
    this.view = view;
    this.getPos = getPos;
    this.Child = NodeView;
    this.isSelectionHighlightEnabled = !!options.enableSelectionHighlight;
    this.dom = document.createElement(options.wrapper);
    if (options.className) this.dom.classList.add(options.className);
    this.edit = isEditable(view.state);
    this.root = createRoot(this.dom);
    this.renderReact();
  }

  private renderReact() {
    const { Child } = this;
    this.root.render(
      <Provider store={ref.store()}>
        <Child
          {...{
            node: this.node,
            view: this.view,
            getPos: this.getPos,
            open: this.open,
            edit: this.edit,
          }}
        />
      </Provider>,
    );
  }

  selectNode() {
    this.open = true;
    this.edit = isEditable(this.view.state);
    this.renderReact();
    if (!this.edit || !this.isSelectionHighlightEnabled) return;
    this.dom.classList.add('ProseMirror-selectednode');
  }

  deselectNode() {
    this.open = false;
    this.edit = isEditable(this.view.state);
    this.renderReact();
    if (!this.isSelectionHighlightEnabled) return;
    this.dom.classList.remove('ProseMirror-selectednode');
  }

  update(node: Node) {
    // TODO: this has decorations in the args!
    if (!node.sameMarkup(this.node)) return false;
    this.node = node;
    this.edit = isEditable(this.view.state);
    this.renderReact();
    return true;
  }

  destroy() {
    // ProseMirror destroys node views synchronously while updating the DOM,
    // which can happen from inside a React event handler — unmounting a root
    // during React's own render throws. Defer to the next microtask.
    const { root } = this;
    queueMicrotask(() => root.unmount());
  }
}

function createNodeView(
  Editor: React.FunctionComponent<NodeViewProps>,
  options: Options = { wrapper: 'div' },
) {
  return (node: Node, view: EditorView, getPos: boolean | GetPos) =>
    new ReactWrapper(Editor, { node, view, getPos: getPos as GetPos }, options);
}

export default createNodeView;
