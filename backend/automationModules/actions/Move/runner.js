async function runMoveActionModule({ runtime }) {
  const objects = runtime.objects || [];

  if (objects.length === 0) {
    throw new Error("Move action needs an object.");
  }

  throw new Error("Move action is connected but not implemented yet.");
}

module.exports = {
  runMoveActionModule,
};