import {
  ContextConsumer,
  ContextProvider,
  createContext,
} from '@lit/context';

const turn = createContext(Symbol());

export function provide_turn() {
  return new ContextProvider(this, {
    context: turn
  });
}

export function consume_turn() {
  return new ContextConsumer(this, {
    context: turn,
    subscribe: true
  });
}

const tasks = createContext(Symbol());

export function provide_tasks() {
  return new ContextProvider(this, { context: tasks });
}

export function consume_tasks() {
  return new ContextConsumer(this, { context: tasks, subscribe: true });
}

