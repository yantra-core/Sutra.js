# Sutra

![sutra](https://github.com/yantra-core/sutra/assets/70011/5a257357-3d50-4215-a564-8f3955fc3e83)


## JavaScript Behavior Tree Library
Sutra is a versatile library for creating and managing behavior trees in JavaScript. It allows for easy definition of complex behavior patterns using a simple and intuitive syntax.

## Features

- **Conditional Logic** - Simple `if`, `then`, `else` constructs to define trees
- **Composite Conditions** - Composite conditional logic using `AND`, `OR`, `NOT`
- **Dynamic Condition Evaluation** - Evaluate conditions based on entity data or global game state
- **Action Control** - Define action objects with scoped parameters
- **Node Management** - `add`, `update`, `find`, and `remove` nodes within the tree
- **Tree Querying** - Query and manipulate the tree using intuitive string selectors
- **Event-Driven Architecture** - `.on()` and `.emit()` methods for managing actions
- **Human-readable Exports** - Support for exporting sutras to plain English
- **Sutra JSON Format** - Import and Export tree definitions in `sutra.json` format

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



## Simple Usage Example

Below is an example of how Sutra can be used to define behavior logic for a boss fight in a game:

```javascript
import Sutra from '@yantra-core/sutra';

// Create a new instance of Sutra
let sutra = new Sutra();

// Define conditions
sutra.addCondition('isBoss', (entity) => entity.type === 'BOSS');
sutra.addCondition('isHealthLow', {
  op: 'lessThan',
  property: 'health',
  value: 50
});

// Define an action
sutra.addAction({
  if: 'isBoss',
  then: [{
    if: 'isHealthLow',
    then: [{ 
      action: 'entity::update', 
      data: { color: 0xff0000, speed: 5 }
    }]
  }]
});

// Event listener for the action
sutra.on('entity::update', (entity, data) => {
  // Here is where you would put your custom code
  console.log(`Updated entity ${entity.id} with`, data);
});

// Example game entities
let allEntities = [
  { id: 1, type: 'BOSS', health: 100 },
  { id: 2, type: 'PLAYER', health: 100 }
];

// Game loop
function gameTick() {
  allEntities.forEach(entity => {
    sutra.tick(entity);
  });
}

// Running the game tick
gameTick(); // No action triggered
allEntities[0].health = 30; // Boss health drops below 50
gameTick(); // Action 'entity::update' is triggered
```


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
