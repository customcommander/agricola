import { concatMap, distinct, from } from "rxjs";

export default (game$) =>
  game$.pipe(
    concatMap(st => from(Object.values(st.context.tasks))),
    distinct(task => task.change_id)
  );