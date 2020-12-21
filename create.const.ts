const isJQuery = (arg: HTMLElement | JQuery): arg is JQuery =>
  (arg as JQuery).jquery !== undefined;

export class ComponentClass {
  constructor(public element: JQuery) {}
}

export const isComponentClass = (
  arg: ComponentClass | JQuery
): arg is ComponentClass => (arg as ComponentClass).element !== undefined;

export const create = <T extends ComponentClass>(
  subject: HTMLElement | JQuery,
  classToCreate: new (element: JQuery) => T
): T => {
  if (subject === undefined) {
    throw new Error(
      `Tried to create ${(classToCreate as any).name} when subject is undefined`
    );
  }
  if (isJQuery(subject)) {
    return new classToCreate(subject);
  }
  return new classToCreate(Cypress.$(subject));
};
