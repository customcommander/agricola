const {pure, escalate} = require('xstate/lib/actions');

module.exports = pure((ctx, e) => {
  const taskId = e.task;
  const taskNotAvail = ctx.task[taskId].available == false;
  if (taskNotAvail) {
    return escalate({message: `action '${taskId}' is not available.`});
  }
});
