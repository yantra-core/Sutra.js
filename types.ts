// Sutra.d.ts
type ListenerFunction = (...args: any[]) => void;
type ConditionFunction = (...args: any[]) => boolean;

declare class Sutra {
  private tree: any[];
  private conditions: Record<string, ConditionFunction | ConditionFunction[]>;
  private listeners: Record<string, ListenerFunction[]>;
  private anyListeners?: ListenerFunction[];
  private maps: Record<string, any>; // Adjust as needed
  private operators: string[];
  private operatorAliases: Record<string, string>;
  private nodeIdCounter: number;
  private subtrees?: Record<string, Sutra>;
  private sharedListeners?: boolean;
  private originalConditions?: Record<string, any>; // Adjust as needed

  constructor();

  use(subSutra: Sutra, name: string, insertAt?: number, shareListeners?: boolean): void;

 // Constructor and lifecycle methods
  /** Constructs a new instance of the Sutra class. */
  constructor();

  // Event handling
  /** Registers a listener for a specific event. */
  on(event: string, listener: ListenerFunction): void;

  /** Emits an event to all registered listeners. */
  emit(event: string, ...args: any[]): void;

  /** Registers a listener for any event. */
  onAny(listener: ListenerFunction): void;

  // Condition management
  /** Adds a new condition to the Sutra instance. */
  addCondition(name: string, conditionObj: any): void; // Adjust as needed

  /** Removes a condition by name. */
  removeCondition(name: string): boolean;

  /** Updates an existing condition with new logic. */
  updateCondition(name: string, newConditionObj: any): boolean; // Adjust as needed

  // Action management
  /** Begins a new conditional block. */
  if(...conditions: any[]): Sutra; // Adjust as needed

  /** Defines an action to take if the preceding condition(s) are met. */
  then(actionOrFunction: any, data?: any): Sutra; // Adjust as needed

  /** Defines an action to take if the preceding condition(s) are not met. */
  else(actionOrFunction: any, data?: any): Sutra; // Adjust as needed

  /** Adds a mapping function by name. */
  addMap(name: string, mapFunction: Function): void; // Adjust as needed


  /** Defines a mapping by name to transform data. */
  map(name: string): Sutra;

  /** Retrieves the function associated with a condition. */
  getConditionFunction(name: string): ConditionFunction | undefined;

  /** Retrieves the original condition object by name. */
  getCondition(name: string): any; // Adjust as needed

  /** Finds a node in the Sutra instance by path. */
  findNode(path: string): any; // Adjust as needed

  /** Removes a node by path. */
  removeNode(path: string): void;

  /** Updates a node by path with new data. */
  updateNode(path: string, newNodeData: any): boolean; // Adjust as needed

  /** Executes the Sutra instance for a single tick or evaluation cycle. */
  tick(data: any, gameState?: any): void; // Adjust as needed


  /** Retrieves a subtree by name. */
  getSubtree(subtreeName: string): Sutra | undefined;

  /** Generates a human-readable path from a sutra path. */
  getReadableSutraPath(sutraPath: string): string;

  // Serialization methods
  /** Serializes the Sutra instance to JSON. */
  serializeToJson(): string;

  /** Exports the Sutra instance to a human-readable English description. */
  exportToEnglish(): string;


  // Private methods, not intended for use by the user
  // emitLocal(event: string, ...args: any[]): void;
  // emitShared(event: string, ...args: any[]): void;

  // storeSingleCondition(name: string, conditionObj: any): void; // Adjust as needed
  // resolveOperator(operator: string): string;

  // getNestedValue(obj: any, path: string): any; // Adjust as needed
  // traverseNode(node: any, data: any, gameState: any, mappedData?: any): void; // Adjust as needed
  // processBranch(branch: any[], data: any, gameState: any, mappedData?: any): void; // Adjust as needed
  // executeAction(action: string, data: any, node: any, gameState: any): void; // Adjust as needed
  // updateEntity(entity: any, updateData: any, gameState: any): void; // Adjust as needed
  // updateSutraPaths(nodes: any[], startIndex: number, parentPath: string): void; // Adjust as needed

  // Utility methods
  // executeMap(mapNode: any, data: any, gameState: any): any; // Adjust as needed
  /** Sets an alias for an operator. */
  // setOperatorAlias(alias: string, operator: string): void;
  /** Retrieves all operator aliases. */
  // getOperators(): string[];


}

export { Sutra };
