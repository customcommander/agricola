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

const supply = createContext(Symbol());

export function provide_supply() {
  return new ContextProvider(this, { context: supply });
}

export function consume_supply() {
  return new ContextConsumer(this, { context: supply, subscribe: true });
}

const messages = createContext(Symbol());

export function provide_messages() {
  return new ContextProvider(this, { context: messages });
}

export function consume_messages() {
  return new ContextConsumer(this, { context: messages });
}

