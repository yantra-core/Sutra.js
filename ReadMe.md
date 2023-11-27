# Sutra

## JavaScript Behavior Tree Library

Sutra is a versatile library for creating and managing behavior trees in JavaScript. It allows for easy definition of complex behavior patterns using a simple and intuitive syntax.

## Features

- Simple `if`, `then`, `else` syntax for defining behavior trees.
- Action objects with scoped parameters for dynamic behavior control.
- Import and Export of `sutra.json` format for behavior tree definitions.
- Supports plain English exports for easy understanding and debugging.
- Event-driven architecture with `.on()` and `.emit()` methods for actions.
- Dynamic condition evaluation with support for entity data.

## Sutra Behavior Tree JSON Protocol Specification (RFC)

### Overview
The Sutra JSON protocol defines a structure for representing behavior trees in game development, enabling the definition of game logic in a structured, readable format.

### Structure

- **Root Element**: An array of condition-action objects.
- **Condition-Action Object**: Each object represents a conditional ("if") and its corresponding actions ("then").

### Elements

- **`if`**: A string representing a condition to be evaluated.
- **`then`**: An array of action objects or nested condition-action objects to execute if the condition is true.
- **`else`**: (Optional) An array of action objects to execute if the condition is false.

### Action Object

- **`action`**: A string representing the action type.
- **`parameters`**: (Optional) An object containing parameters for the action.

### Example

```json
[
  {
    "if": "gameStarts",
    "then": [
      {
        "action": "displayMessage",
        "parameters": {
          "message": "Welcome to the Boss Fight!"
        }
      },
      {
        "action": "spawnBoss",
        "parameters": {
          "bossName": "Giant Orc",
          "health": 500
        }
      }
    ]
  }
]

```
### Copyright Yantra Works 2023
### AGPL