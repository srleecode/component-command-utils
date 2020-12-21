import { ComponentClass } from "./create.const";
import { SelectorOptions } from "./model/selector-options.model";

export const get = (
  selector: SelectorOptions = {},
  defaultQuery: string
): Cypress.Chainable<JQuery> => {
  const query = getQuery(selector, defaultQuery);
  const baseItem = cy.get(query);
  return getSelectedItem(baseItem, selector);
};

export const find = (
  component: ComponentClass,
  selector: SelectorOptions = {},
  defaultQuery: string
): Cypress.Chainable<JQuery> => {
  const query = getQuery(selector, defaultQuery);
  const baseItem = cy.wrap(component.element).find(query);
  return getSelectedItem(baseItem, selector);
};

const getQuery = (selector: SelectorOptions, defaultQuery: string): string => {
  const { dataCy, css } = selector;
  if (dataCy) {
    return `${defaultQuery}[data-cy=${dataCy}]`;
  } else if (css) {
    return `${defaultQuery}${css}`;
  }
  return defaultQuery;
};

const getSelectedItem = (
  baseItem: Cypress.Chainable<JQuery>,
  selector: SelectorOptions
) => {
  const { index, text } = selector;
  if (index !== undefined) {
    return baseItem.eq(index);
  } else if (text !== undefined) {
    return baseItem.contains(text);
  }
  return baseItem;
};
