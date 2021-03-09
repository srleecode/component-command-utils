import { ComponentClass } from "../create.const";

export interface SelectorOptions {
  // root element to use in get. This is useful for selecting component commands from inside a component command, e.g. cy.sharedSpinner({root: this.element})
  root?: ComponentClass | JQuery;
  getElement?: boolean; // use this option to get the JQuery element rather than the class. This is useful for checking that an element doesn't exist as converting to a class will fail as it doesn't exist
  dataCy?: string;
  css?: string;
  index?: number;
  text?: string;
}
