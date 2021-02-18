import { ComponentClass, isComponentClass } from "./create.const";
import { SelectorOptions } from "./model/selector-options.model";

export const get = <T extends ComponentClass>(
  selector: SelectorOptions = {},
  classToCreate: new (element: JQuery) => T,
  defaultQuery: string
): Cypress.Chainable<T> => {
  const query = getQuery(selector, defaultQuery);
  let baseItem: Cypress.Chainable<JQuery>;
  if (selector.root) {
    const element = isComponentClass(selector.root)
      ? selector.root.element
      : selector.root;
    baseItem = cy.wrap(element, { log: false }).find(query, { log: false });
  } else {
    baseItem = cy.get(query, { log: false });
  }
  return getSelectedItem(baseItem, selector).then((element) => {
    Cypress.log({
      $el: element,
      name: "getComponentCommand",
      displayName: "getCC",
      message: classToCreate.name,
      consoleProps: () => ({ selector, defaultQuery }),
    });
    return new classToCreate(element);
  });
};

export const findElement = (
  component: ComponentClass | JQuery,
  selector: SelectorOptions = {},
  defaultQuery?: string
): Cypress.Chainable<JQuery> => {
  const query = getQuery(selector, defaultQuery);
  const element = isComponentClass(component) ? component.element : component;
  const baseItem = cy.wrap(element, { log: false }).find(query, { log: false });
  return getSelectedItem(baseItem, selector);
};

export const find = <T extends ComponentClass>(
  component: ComponentClass | JQuery,
  selector: SelectorOptions = {},
  classToCreate: new (element: JQuery) => T,
  defaultQuery?: string,
  isLogged = false
): Cypress.Chainable<T> =>
  findElement(component, selector, defaultQuery).then((element) => {
    if (isLogged) {
      Cypress.log({
        $el: element,
        name: "findCC",
        message: classToCreate.name,
        consoleProps: () => ({ selector, defaultQuery }),
      });
    }
    if (element && element.length) {
      return new classToCreate(element.first());
    }
    return undefined;
  });

export const findAll = <T extends ComponentClass>(
  component: ComponentClass | JQuery,
  selector: SelectorOptions = {},
  classToCreate: new (element: JQuery) => T,
  defaultQuery?: string,
  isLogged = false
): Cypress.Chainable<T[]> =>
  findElement(component, selector, defaultQuery).then((element) => {
    if (isLogged) {
      Cypress.log({
        $el: element,
        name: "findAllCC",
        message: classToCreate.name,
        consoleProps: () => ({ selector, defaultQuery }),
      });
    }
    if (element) {
      if (element.length === 1) {
        return [new classToCreate(element)];
      } else if (element.length > 1) {
        return element.toArray().map((i) => new classToCreate(Cypress.$(i)));
      }
    }
    return undefined;
  });

export const getText = (
  component: ComponentClass | JQuery,
  selector: SelectorOptions = {},
  invokeArguments: string | string[] = "text"
) => {
  let element = isComponentClass(component)
    ? findElement(component, selector)
    : cy.wrap(component);
  return typeof invokeArguments === "string"
    ? element.invoke(invokeArguments)
    : element.invoke(...(invokeArguments as [string, string]));
};

const getQuery = (selector: SelectorOptions, defaultQuery: string): string => {
  const { dataCy, css } = selector;
  if (dataCy) {
    return `${defaultQuery || ""}[data-cy=${dataCy}]`;
  } else if (css) {
    return `${defaultQuery || ""}${css}`;
  }
  return defaultQuery;
};

const getSelectedItem = (
  baseItem: Cypress.Chainable<JQuery>,
  selector: SelectorOptions
) => {
  const { index, text } = selector;
  if (index !== undefined) {
    return baseItem.eq(index, { log: false });
  } else if (text !== undefined) {
    return baseItem.contains(text, { log: false });
  }
  return baseItem;
};
