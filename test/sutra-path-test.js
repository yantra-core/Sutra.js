import tap from 'tape';
import Sutra from '../lib/sutra.js';

tap.test('Sutra Library Tests', (parent) => {

  parent.test('should handle incorrect data types for "if" and "then" properties', (t) => {
    const sutra = new Sutra();
  
    // Test case with "if" as a string
    const nodeWithIfString = {
      if: 'incorrectString',
      then: [{ action: 'testAction' }]
    };
    sutra.addAction(nodeWithIfString);
    const ifStringUpdate = sutra.updateNode('tree.if', { if: 'isFalse' });
    t.equal(ifStringUpdate, false, 'updateNode should return false or not update when "if" is a string');
  
    // Test case with "then" as a string
    const nodeWithThenString = {
      if: 'isTrue',
      then: 'incorrectString'
    };
    sutra.addAction(nodeWithThenString);
    const thenStringUpdate = sutra.updateNode('tree.if', { if: 'isFalse' });
    t.equal(thenStringUpdate, false, 'updateNode should return false or not update when "then" is a string');
  
    t.end();
  });
  
  parent.test('should add and find a node using sutraPath', (t) => {
    const sutra = new Sutra();
    const testNode = { if: 'isTrue', then: [{ action: 'testAction' }] };
    sutra.addAction(testNode);

    // Assuming the first node added gets sutraPath 'this.tree[0]'
    const foundNode = sutra.findNode('tree[0]');
    t.equal(foundNode, testNode, 'findNode should retrieve the correct node using sutraPath');
    t.end();
  });

  parent.test('should update a node correctly using sutraPath', (t) => {

    const sutra = new Sutra();

    sutra.addAction({ if: 'isTrue', then: [{ action: 'testAction' }] });

    const updatedNodeData = { if: 'isFalse', then: [{ action: 'anotherAction' }] };
    const updateSuccess = sutra.updateNode('tree[0]', updatedNodeData);

    t.equal(updateSuccess, true, 'updateNode should return true on success');
    t.equal(sutra.findNode('tree[0]').if, 'isFalse', 'updateNode should update the condition using sutraPath');
    t.end();
  });

  parent.test('should update a deeply nested node correctly using sutraPath', (t) => {
    const sutra = new Sutra();

    // Adding conditions for testing
    sutra.addCondition('isTrue', () => true);
    sutra.addCondition('isFalse', () => false);

    // Create a nested node structure
    const nestedNode = {
      if: 'isTrue',
      then: [
        {
          if: 'isTrue',
          then: [{ action: 'nestedAction' }],
          else: [{ action: 'elseAction' }]
        }
      ]
    };
    sutra.addAction(nestedNode);

    // Update the deeply nested node using its sutraPath
    const updatedNestedNodeData = { if: 'isFalse' };
    const updateNestedSuccess = sutra.updateNode('tree[0].then[0]', updatedNestedNodeData);

    t.equal(updateNestedSuccess, true, 'updateNode should return true on success for deeply nested node');
    t.equal(sutra.findNode('tree[0].then[0]').if, 'isFalse', 'updateNode should update the condition of the deeply nested node using sutraPath');
    t.end();
  });

  parent.test('should handle invalid sutraPath correctly', (t) => {
    const sutra = new Sutra();
    sutra.addAction({ if: 'isTrue', then: [{ action: 'testAction' }] });
  
    const invalidPath = 'tree[1]';
    const foundNode = sutra.findNode(invalidPath);
    t.equal(foundNode, undefined, 'findNode should return undefined for invalid sutraPath');
    t.end();
  });
  
  parent.test('should handle missing array index correctly', (t) => {
    const sutra = new Sutra();
    sutra.addAction({ if: 'isTrue', then: [{ action: 'testAction' }] });
  
    const missingIndex = 'tree[0].then[1]';
    const foundNode = sutra.findNode(missingIndex);
    t.equal(foundNode, undefined, 'findNode should return undefined for missing array index');
    t.end();
  });
  
  parent.test('should handle empty tree correctly', (t) => {
    const sutra = new Sutra();
  
    const emptyPath = 'tree[0]';
    const foundNode = sutra.findNode(emptyPath);
    t.equal(foundNode, undefined, 'findNode should return undefined when tree is empty');
    t.end();
  });

  parent.test('should handle updating non-existent node correctly', (t) => {
    const sutra = new Sutra();
    // ... Create some structure ...
  
    const nonExistentPath = 'tree[1]';
    const updateSuccess = sutra.updateNode(nonExistentPath, { if: 'isFalse' });
    t.equal(updateSuccess, false, 'updateNode should return false when trying to update a non-existent node');
    t.end();
  });
  
  parent.test('should handle finding non-existent node correctly', (t) => {
    const sutra = new Sutra();
    // ... Create some structure ...
  
    const nonExistentPath = 'tree[1]';
    const foundNode = sutra.findNode(nonExistentPath);
    t.equal(foundNode, undefined, 'findNode should return undefined when trying to find a non-existent node');
    t.end();
  });

  parent.test('should update a complex nested node correctly using sutraPath', (t) => {
    const sutra = new Sutra();
  
    // Adding conditions for testing
    sutra.addCondition('isTrue', () => true);
    sutra.addCondition('isFalse', () => false);
  
    // Create a complex nested node structure
    const complexNestedNode = {
      if: 'isTrue',
      then: [
        {
          if: 'isTrue',
          then: [
            {
              if: 'isTrue',
              then: [{ action: 'deepAction1' }],
              else: [{ action: 'deepAction2' }]
            },
            {
              if: 'isTrue',
              then: [{ action: 'deepAction3' }],
              else: [{ action: 'deepAction4' }]
            }
          ],
          else: [{ action: 'elseAction1' }]
        },
        {
          if: 'isTrue',
          then: [{ action: 'simpleAction' }]
        }
      ],
      else: [{ action: 'elseAction2' }]
    };
    sutra.addAction(complexNestedNode);
  
    // Update a deeply nested node using its sutraPath
    const updatedNestedNodeData = { if: 'isFalse', then: [{ action: 'updatedAction' }] };
    const updateNestedSuccess = sutra.updateNode('tree[0].then[0].then[1]', updatedNestedNodeData);
  
    t.equal(updateNestedSuccess, true, 'updateNode should return true on success for deeply nested node');
    const updatedNode = sutra.findNode('tree[0].then[0].then[1]');
    t.equal(updatedNode.if, 'isFalse', 'updateNode should update the condition of the deeply nested node');
    t.equal(updatedNode.then[0].action, 'updatedAction', 'updateNode should update the action of the deeply nested node');
    t.end();
  });

});