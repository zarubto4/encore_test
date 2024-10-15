# grpn-next-logging

Steno logging meets winston meets VPCS meets a determined lunatic.

## Usage

- Logging: `log('app.event').info().write()`
- Error handling: `log(new Error('errors default to the proper level')).write()`
- Includes subclasses: `log(new DOMException('as long as __proto__.__proto__ is name: error')).write()`
- I sure do hate that .write at the end. Good thing we can just abuse type coercion?
  - `+log("now we're talking")`
  - `log("very legal, very annoying") <3 `
- Also maintains the steno data object and merges in new context `log('log.event').data({a: 1}).data({b: 2}) <3`

## Building

- Run `vpcs sys build-library @vpcs/grpn-next-logging` to build the library.

## Running unit tests

- Run `nx test grpn-next-logging` to execute the unit tests via [Jest](https://jestjs.io) (eventually)
