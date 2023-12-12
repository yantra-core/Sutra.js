# Sutra

![sutra](https://github.com/yantra-core/sutra/assets/70011/5a257357-3d50-4215-a564-8f3955fc3e83)

![Build Status](https://github.com/yantra-core/sutra/actions/workflows/nodejs.yml/badge.svg)

## JavaScript Behavior Tree Library
Sutra is a versatile library for creating and managing behavior trees in JavaScript. It allows for easy definition of complex behavior patterns using a simple and intuitive syntax.

## Features

- **Conditional Logic** - Simple `if`, `then`, `else` constructs to define trees
- **Composite Conditions** - Composite conditional logic using `AND`, `OR`, `NOT`
- **Nested Subtrees** - Re-use Sutras for easy-to-understand composability of complex behavior
- **Dynamic Condition Evaluation** - Evaluate conditions based on entity data or global game state
- **Action Control** - Define action objects with scoped parameters
- **Data Transformation with `.map()`** - Transform context data within the tree using custom mapping functions
- **Node Management** - `add`, `update`, `find`, and `remove` nodes within the tree
- **Tree Querying** - Query and manipulate the tree using intuitive string selectors
- **Event-Driven Architecture** - `.on()` and `.emit()` methods for managing actions
- **Human-readable Exports** - Support for exporting sutras to plain English
- **Sutra JSON Format** - Import and Export tree definitions in `sutra.json` format

<p>
Sutras can be exported to a human-readable format. If you don't prefer using code to define your Sutra we have a Visual Editor <a href="https://yantra.gg/mantra/examples/offline/sutra-level-editor">currently in development</a>.
</p>

`./examples` folder for easy to understand examples

### Crafting Sutras

Here we have the human read-able *exported* Sutra definition that we will get at the end:

```md
if isBoss
  if isHealthLow
    updateEntity
      color: 0xff0000
      speed: 5
```

Written as Javascript, this Sutra will be responsible for changing the color and speed of `isBoss` when `isHealthLow`.

```js
sutra
  .if('isBoss')
  .if('isHealthLow')
  .then('updateEntity', { color: 0xff0000, speed: 5 });
```

### How

The following code will create a Sutra that changes the color of the Boss entity when it's health is low.

```js
import Sutra from '@yantra-core/sutra';

// creates a new sutra instance
const sutra = new Sutra();

// adds a new condition as function which returns value
sutra.addCondition('isBoss', (entity) => entity.type === 'BOSS');

// adds a new condition using DSL conditional object
sutra.addCondition('isHealthLow', {
  op: 'lessThan',
  property: 'health',
  value: 50
});

sutra
  .if('isBoss')
  .if('isHealthLow')
  .then('updateEntity', { color: 0xff0000, speed: 5 });

// exports the sutra as json
const json = sutra.toJSON();
console.log(json);

// exports the sutra as plain english
const english = sutra.toEnglish();
console.log(english);
```

*Remark: The fluent chaining APIs are optional. Keep reading*

## Running a Sutra with Data

Now that we have crafted a suitable Sutra for detecting if the boss's health is low, we will need to send some data to the Sutra in order to run the behavioral tree logic. 

For this example, we will create a simple array of entities:

```js
// create a simple array of entities
let allEntities = [
  { id: 1, type: 'BOSS', health: 100 },
  { id: 2, type: 'PLAYER', health: 100 }
];
```

Then we'll create a simple `gameTick()` function to iterate through our Entities array:

```js
// create a gameTick function for processing entities with sutra.tick()
function gameTick () {
  allEntities.forEach(entity => {
    sutra.tick(entity);
  });
}
```

Now that we have a way to send data into our Sutra, we'll need to listen for events on the Sutra in order to know if any of our conditional actions have triggered.

```js
// listen for all events that the sutra instance emits
sutra.onAny(function(ev, data, node){
  // console.log('onAny', ev, data);
})

// listen for specific events that the sutra instance emits
sutra.on('updateEntity', function(entity, node){
  // here we can write arbitrary code to handle the event
  console.log('updateEntity =>', JSON.stringify(entity, true, 2));
  // In `mantra`, we simply call game.emit('updateEntity', data);
});
```

Now that we have defined our Sutra, defined data to send our Sutra, and have added event listeners to the Sutra. We can run our `gameTick()` function once with the Boss at full-health, then again with the Boss at low health.

```js
// run the game tick with Boss at full health
// nothing should happen
gameTick();

// run the game tick with Boss at low health
// `updateEntity` event should be emitted
allEntities[0].health = 40;
gameTick();
```

Results in:

```
updateEntity => {
  id: 1,
  type: 'BOSS',
  health: 40,
  color: 0xff0000,
  speed: 5
 }
```

It's that simple. This demonstrates a single-level conditional action using basic logic.

## Composition

In the first example, we created a simple compositional if statement which used two conditions, `isBoss` and `isHealthLow`. Sutra supports conditional composition as well as deeply nested behavior trees. All of the following Sutras will yield the same results.

### Fluent Composition with Scoped Actions

```js
sutra
  .if('isBoss')
  .then((rules) => {
    rules
      .if('isHealthLow')
      .then('updateEntity', { color: 0xff0000, speed: 5 });
  })

```

### Nested

```js
sutra.addAction({
  if: 'isBoss',
  then: [{
    if: 'isHealthLow',
    then: [{
      action: 'updateEntity',
      data: { color: 0xff0000, speed: 5 } // Example with multiple properties
    }]
  }]
});
```

### Flat

```js
sutra.addAction({
  if: ['isBoss', 'isHealthLow'],
  then: [{
    action: 'updateEntity',
    data: { color: 0xff0000, speed: 5 }
  }]
});
```
### Flat Fluent

```js
sutra
  .if('isBoss', 'isHealthLow')
  .then('updateEntity', { color: 0xff0000, speed: 5 })
```

## Compositional Conditions

It's also possible to create a compositional condition using a logic operator. The default logical operator always defaults to `and`.


```js
// Composite AND condition
sutra.addCondition('isBossAndHealthLow', {
  op: 'and', // and, or, not
  conditions: ['isBoss', 'isHealthLow']
});
```

## Using Nested Sutras with Subtrees

Nested Sutras with subtrees provide a powerful way to organize complex behavior trees into modular, manageable sections. This feature allows you to create distinct Sutras for different aspects of your game logic and then integrate them into a main Sutra. Each subtree can have its own conditions and actions, which are executed within the context of the main Sutra.

### Implementing Nested Sutras

Consider a tower defense game where we need separate logic for round management and NPC actions. We can create two Sutras: `roundSutra` for round logic and `npcLogic` for NPC behavior.

see: `./examples/nested-sutra.js`

```javascript
import Sutra from '@yantra-core/sutra';

let roundSutra = new Sutra();
roundSutra.addCondition('roundStarted', (entity, gameState) => gameState.roundStarted === true);
roundSutra.addCondition('roundEnded', (entity, gameState) => gameState.roundEnded === true);
roundSutra.addCondition('roundRunning', {
  op: 'not',
  conditions: ['roundEnded']
});

let npcLogic = new Sutra();
npcLogic.addCondition('isSpawner', (entity) => entity.type === 'UnitSpawner');
npcLogic.addAction({
  if: 'isSpawner',
  then: [{
    action: 'spawnEnemy',
    data: {
      type: 'ENEMY',
      position: { x: 100, y: 50 },
      health: 100
    }
  }]
});

let levelSutra = new Sutra();
levelSutra.use(roundSutra);
levelSutra.use(npcLogic, 'npcLogic'); // optionally, identify the subtree with name
levelSutra.addAction({
  if: 'roundRunning',
  subtree: 'npcLogic'
});
```

In this setup, `roundSutra` and `npcLogic` are defined separately with their specific conditions and actions. Then, they are integrated into the main `levelSutra`. The roundRunning condition in `levelSutra` governs whether the npcLogic subtree should be executed.

### Running Nested Sutras

To run a nested Sutra, you call the tick method on the main Sutra with relevant `data` and `gameState`. The main Sutra evaluates its conditions and decides whether to invoke the actions or subtrees.

```js
levelSutra.tick({ type: 'UnitSpawner' }, { roundStarted: true, roundEnded: false });

```

## Global Game State Scope

In many cases, your Sutra will need to reference a context outside of the Entity it's evaluating. For example, a global `gameData` object may have information about the boundary size of the level, or a global constant value such as `maxUnits` which is required as reference for a spawner.

For Global Game State, `sutra.tick()` supports an additional context property as it's second argument. 


```js
const gameState = { isGameRunning: false };
const allEntities = [
  { id: 1, type: 'BOSS', health: 40 },
  { id: 2, type: 'PLAYER', health: 100 }
];

sutra.addCondition('isGameRunning', (entity, gameState) => gameState.isGameRunning);
sutra.addCondition('isBoss', (entity) => entity.type === 'BOSS');
sutra.addCondition('isHealthLow', {
  op: 'lessThan',
  property: 'health',
  value: 50
});

sutra.addAction({
  if: ['isGameRunning', 'isBoss', 'isHealthLow'],
  then: [{
    action: 'updateEntity',
    data: { speed: 5 }
  }]
});

allEntities.forEach(entity => {
  sutra.tick(entity, gameState);
});
// nothing happens, `isGameRunning` condition returns false

// update the global game state
gameState.isGameRunning = true;

allEntities.forEach(entity => {
  sutra.tick(entity, gameState);
});
// `updateEntity` will be emitted
```

## Using `.map()` to Transform Data

The `.map()` method allows you to transform context data dynamically within your behavior tree. This is particularly useful for modifying or enriching data based on complex logic or external factors.

```js
sutra.addMap('transformData', (context) => {
  // Custom logic to transform the context data
  context.customProp = 'hello world';
});

sutra
  .if('someCondition')
  .then((rules) => {
    rules
      .map('transformData')
      .if('anotherCondition')
      .then('someAction');
  });
```
In this example, `transformData` is a mapping function that alters the context by adding `customProp`. This transformed context is then used in the subsequent conditions and actions.

## Dynamic Action Values

Some Sutras may require a dynamic value by function reference when evaluating triggered actions. For example, if you wanted to change the Boss's color to a random color instead of providing a static color.

In this example, you will pass a function reference as a value, which will be dynamically executed upon each condition evaluation using the appropriate tree scope.

```js
// Function to generate a random color integer
function generateRandomColorInt(entity, gameState, node) {
  // entity is the entity scoped which is being evaluated
  // gameState is the optional second argument to sutra.tick(entity, gameState)
  // node is the reference to current Sutra Tree node element
  return Math.floor(Math.random() * 255);
}

sutra.addAction({
  if: ['isBoss', 'isHealthLow'],
  then: [{
    action: 'updateEntity',
    data: { color: generateRandomColorInt, speed: 5 }
  }]
});

```

## Conditional and Logic Operators

Sutra supports a range of conditional and logic operators, enabling complex decision-making structures within behavior trees.

| Operator               | Alias            | Description                                       | Example Usage                                          |
|------------------------|------------------|---------------------------------------------------|--------------------------------------------------------|
| `equals`               | `eq`, `==`       | True if a property equals a given value.          | `{ "op": "equals", "property": "type", "value": "BOSS" }` |
| `notEquals`            | `neq`, `!=`      | True if a property does not equal a given value.  | `{ "op": "notEquals", "property": "type", "value": "BOSS" }` |
| `lessThan`             | `lt`, `<`        | True if a property is less than a given value.    | `{ "op": "lessThan", "property": "health", "value": 50 }` |
| `lessThanOrEqual`      | `lte`, `<=`      | True if a property is less than or equal to a value. | `{ "op": "lessThanOrEqual", "property": "health", "value": 50 }` |
| `greaterThan`          | `gt`, `>`        | True if a property is greater than a given value. | `{ "op": "greaterThan", "property": "health", "value": 50 }` |
| `greaterThanOrEqual`   | `gte`, `>=`      | True if a property is greater than or equal to a value. | `{ "op": "greaterThanOrEqual", "property": "health", "value": 50 }` |
| `and`                  | `&&`, `and`      | True if all provided conditions are true.         | `{ "op": "and", "conditions": ["isBoss", "isHealthLow"] }` |
| `or`                   | `||`, `or`       | True if any of the provided conditions are true.  | `{ "op": "or", "conditions": ["isBoss", "isPlayer"] }` |
| `not`                  | `!`, `not`       | True if the provided condition is false.          | `{ "op": "not", "condition": "isBoss" }` |

## Sutra Behavior Tree JSON Protocol Specification (RFC)

### Overview
The Sutra JSON protocol provides a structured format for defining behavior trees in game development. This format enables the specification of complex game logic through a series of conditional checks and actions.

### Structure

- **Root Element**: An array of nodes, where each node represents a conditional check and its corresponding actions or nested nodes.

### Node Elements

- **`if`**: Specifies a condition to be evaluated. Can be a string for named conditions or a composite condition object.
- **`then`**: An array of action objects or nested nodes to execute if the condition is true.
- **`else`**: (Optional) An array of action objects or nested nodes to execute if the condition is false.

### Conditional Operators

- **`lessThan`, `greaterThan`, `equals`, `notEquals`, `lessThanOrEqual`, `greaterThanOrEqual`**: Compare a property of an entity against a value.
- **`and`, `or`, `not`**: Logical operators for combining conditions.

### Composite Condition Object

- A composite condition object uses logical operators (`and`, `or`, `not`) to combine multiple conditions.
- **Example**: `{ "op": "and", "conditions": ["isBoss", "isHealthLow"] }`

### Action Object

- **`action`**: A string representing the action to be executed.
- **`data`**: (Optional) An object containing additional data or parameters for the action.

### Nested Nodes

- Nodes can contain nested `then` and `else` elements, allowing for complex branching logic within the behavior tree.

### Example

```json
[
  {
    "if": { "op": "and", "conditions": ["isBoss", "isHealthLow"] },
    "then": [
      {
        "action": "initiateBossFight",
        "data": { "strategy": "aggressive" }
      },
      {
        "if": "isPlayerNear",
        "then": [{ "action": "attackPlayer" }],
        "else": [{ "action": "patrolArea" }]
      }
    ]
  }
]
```

### Copyright Yantra Works 2023
### AGPL