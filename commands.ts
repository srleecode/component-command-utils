import { ComponentClass, create, isComponentClass } from "./create.const";

type MethodKeys<T> = {
  [P in keyof T]: T[P] extends Function ? P : never;
}[keyof T];
type Methods<T> = Pick<T, MethodKeys<T>>;
type PropKeys<T> = {
  [P in keyof T]: T[P] extends Function ? never : P;
}[keyof T];
type Props<T> = Pick<T, PropKeys<T>>;
type ResultType<T extends Function> = T extends (...args: any[]) => infer R
  ? R
  : any;

declare global {
  namespace Cypress {
    interface Chainable<Subject> {
      prop<P extends Props<Subject>, K extends keyof P>(property: K): P[K];
      map<
        M extends Methods<Subject>,
        K extends keyof M,
        F extends Function & M[K]
      >(
        method: K,
        ...arrgs: any[]
      ): ResultType<F>;
      tap<F extends Methods<Subject>, K extends keyof F>(
        method: K,
        ...arrgs: any[]
      ): Chainable<Subject>;
      create<T extends ComponentClass>(
        classToCreate: new (element: JQuery) => T
      ): Chainable<T>;
    }
  }
}
/**
 * Custom command to return a specified property in the component command
 * It's usage is similar to the 'its' command, but allows the usage of cypress commands in the component command getter function
 */
Cypress.Commands.add(
  "prop",
  { prevSubject: true },
  (subject, property, ...args) => {
    Cypress.log({
      $el: subject.element,
      displayName: "prop",
      message: `${property} in subject`,
      consoleProps: () => ({ args }),
    });
    if (property in subject) {
      return subject[property];
    }
    throw new Error(`Cannot find ${property} in subject`);
  }
);

/**
 * Custom command to return the result of a component command function
 * Its usage is similar to the 'invoke' command, but allows the usage of cypress commands in the component command function
 */
Cypress.Commands.add(
  "map",
  { prevSubject: true },
  (subject, method, ...args) => {
    Cypress.log({
      $el: subject.element,
      displayName: "map",
      message: method,
      consoleProps: () => ({ args }),
    });
    if (subject[method]) {
      return subject[method](...args);
    }
    throw new Error(`Cannot find ${method} in subject`);
  }
);

/**
 * Custom command to execute a component commands function and returns the calling component command.
 * This allows the chaining of actions on the same component command.
 */
Cypress.Commands.add(
  "tap",
  { prevSubject: true },
  (subject, method, ...args) => {
    Cypress.log({
      $el: subject.element,
      displayName: "tap",
      message: method,
      consoleProps: () => ({ args }),
    });
    if (subject[method]) {
      return cy
        .wrap(subject, { log: false })
        [method](...args)
        .then(() => subject);
    }
    throw new Error(`Cannot find ${method} in subject`);
  }
);

/**
 * Custom command to create a comopnent command from a given JQuery element.
 * This command is normally just used internally in component commands to create sub elements of the component as component commands.
 */
Cypress.Commands.add(
  "create",
  { prevSubject: true },
  (subject, classToCreate, ...args) => {
    if (isComponentClass(subject)) {
      return cy
        .wrap(subject.element, { log: false })
        .then((e) => create(e, classToCreate));
    }
    return cy.wrap(create(subject, classToCreate), { log: false });
  }
);
