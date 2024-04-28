import {
  ContextConsumer,
  ContextProvider,
  createContext,
} from '@lit/context';

const turn_context = createContext('game-turn');

export function provide_turn() {
  return new ContextProvider(this, {
    context: turn_context,
    initialValue: 0
  });
}

export function consume_turn() {
  return new ContextConsumer(this, {
    context: turn_context,
    subscribe: true
  });
}

