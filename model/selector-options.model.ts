import { ComponentClass } from "../create.const";

export interface SelectorOptions {
  // root element to use in get. This is useful for selecting component commands from inside a component command, e.g. cy.sharedSpinner({root: this.element})
  root?: ComponentClass | JQuery;
  dataCy?: string;
  css?: string;
  index?: number;
  text?: string;
}
