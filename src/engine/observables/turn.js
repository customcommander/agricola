import {fromEventPattern} from "rxjs";
import {Interpreter} from "xstate";

/** @param {Interpreter} game */
export default game =>
  fromEventPattern(
    handler => game.onTransition(st => {
      if (st.matches('work.main')) {
        const {turn, tasks} = st.context;
        // List of task ids available from this turn.
        const new_tasks =
          Object.entries(tasks)
            .flatMap(([task_id, def]) =>
              def.turn === turn ? task_id : []);

        // Push to observable.
        handler({turn, new_tasks});
      }
    }),
    handler => game.off(handler));
