import {
  ContextConsumer,
  ContextProvider,
  createContext,
} from '@lit/context';

const turn = createContext(Symbol());

export function provide_turn() {
  return new ContextProvider(this, {
    context: turn,
    initialValue: 0
  });
}

export function consume_turn() {
  return new ContextConsumer(this, {
    context: turn,
    subscribe: true
  });
}

