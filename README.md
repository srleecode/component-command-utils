# Component commands

When writing E2E tests you want to abstract the selection of elements, as the selectors can be brittle and the more instances of them there are the harder it is to update them. This abstraction can happen in a few different ways. For example, page objects or [component test harnesses](https://material.angular.io/cdk/test-harnesses/overview), the most common cypress way of doing this is to use [custom commands](https://docs.cypress.io/api/cypress-api/custom-commands.html).

Component commands are custom commands that expose functions and getters for a specific component. There are two primary benefits to using component commands in your tests:
 - they make tests easier to read and understand by exposing straightforward and testable APIs.
 - they make tests more robust and less likely to break by reducing the number of times a selector gets defined. With component commands, changing a selector requires only one place to be updated.

The below is an example of a component command being used for a shared/table component. An

```ts
cy.sharedTable() // component command for the shared table component
  .map('getColumn', 1) // getColumn function in the component command class that retrieves a sub component class Column
  .prop('title') // title property in the sub component class Column
  .should('eq', 'Account number');
```

This component command is defined below:

```ts
declare global {
  namespace Cypress {
    interface Chainable<Subject> {
      sharedTable(): Chainable<SharedTable>
    }
  }
}

class Column {
    constructor(public element: JQuery) {}

    get title(): Cypress.Chainable<string> {
        return cy
            .wrap(this.element, { log: false })
            .invoke('text')
            .then(text => text.trim());
    }
}

export class SharedTable {
    constructor(public element: JQuery) {}

    getColumn(index: number): Cypress.Chainable<Column> {
        return find(this, { index: index - 1}, Column, 'th');
    }
}

Cypress.Commands.add('sharedTable', (selector?: SelectorOptions) => get(selector, SharedTable, 'shared-table'));
```

It is often the case that you want to select not just a component, but a particular instance of that component. Instance based selection can be accomplished by passing a SelectorOptions object to the component command. Some examples are: 
 - data-cy: selecting a table component with a particular data-cy attribute
 - index: selecting the second table component
 - css: selecting a table component with a particular css class or id
 - text: selecting a button component with particular text in it.

```ts
interface SelectorOptions {
    dataCy?: string;
    css?: string;
    index?: number;
    text?: string;
}
```

## Methods and custom commands that can be used with component commands

### Custom commands

 - prop - returns a specified property in the component command. It's usage is similar to the 'its' command, but allows the usage of cypress commands in the component command getter function
 - map - returns the result of a component command function. Its usage is similar to the 'invoke' command, but allows the usage of cypress commands in the component command function
 - tap - executes a component commands function and returns the calling component command. This allows the chaining of actions on the same component command.
 - create - creates a comopnent command from a given JQuery element. This command is normally just used internally in component commands to create sub elements of the component as component commands. For example, a column in a table

#### Methods

 - get - used to create component commands without any base element, e.g. a table
 - find - used to create component commands using a base element, e.g. cell in a table
 - findElement - used to select a jquery element
 - findAll - used to crreate multiple component commands, e.g. rows in a table 

## Points to note

### The component command elements should be at the component tag level

The component tag level is where you add data-cy attributes and it is from this level that you can select all the required sub elements that are required in the methods or properties of the component command. Operations, however, should happen on the basic HTML elements. This is because Cypress has internal waiting mechanisms. These mechanisms don't work if the operations occur at higher levels and will get skipped if you use jquery to perform the operations. In general, this means that all operations need to first select a sub element to do the operation on and then use cypress commands to perform the operation. 

For example, if the operation happens at the component level, e.g. shared-button, then it will lead to hard to debug issues. While you can click on the shared-button component element, the disabled check that cypress does internally won't find anything as the attibute when the button is disabled isn't at this level it is on the actual button, so you won't get the right error message.

### All sub components used in a subcomponent should be created as classes

All interaction with a component command should be done using its api. This means that any sub components that are used should be exposed as properties, methods or used internally in methods.

### Falling back to JQuery might be needed in some cases

Falling back to JQuery might be needed in some cases. For example, 
 - getting array of the values in all the chips for a chips component. Trying to do this with just cypress will end up with Chainable<Chainable<string>[]>, so falling back to jquery in this instance is needed.

### Checking an element doesn't exist

To check that an element doesn't exist you can use the selector options getElement property in the get function. This will get the element instead of trying to convert it into a component which would fail as the element doesn't exist.

### Don't put everything in the component command

This point is similar to this [best practice](https://docs.cypress.io/api/cypress-api/custom-commands.html#Best-Practices) for cypress custom commands: "Don’t make everything a custom command". A component command is an api fpr interacting with a specific component. While it is a great way to reduce duplication there are other methods that might be more appropriate. For example, if you had a selector that was used only in a single test, e.g. a selector for an element only in a storybook instance, then it might not make sense for it to be exposed as part of the component commands api. It can instead be a function . This function could be defined in the test file if it is only used in one test file or a shared file if it was used in multiple tests.