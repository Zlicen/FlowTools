async function runDuplicateActionModule({ runtime }) {
  const objects = runtime.objects || [];

  if (objects.length === 0) {
    throw new Error("Duplicate action needs an object.");
  }

  throw new Error("Duplicate action is connected but not implemented yet.");
}

module.exports = {
  runDuplicateActionModule,
};