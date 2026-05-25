export function createId(prefix) {
  return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 99999)}`;
}

export function deepClone(value) {
  if (value === undefined || value === null) return value;

  try {
    return JSON.parse(JSON.stringify(value));
  } catch (error) {
    console.error("Failed to deep clone automation value:", error);
    return value;
  }
}

export function createBlock() {
  return {
    id: createId("block"),
    name: "New Block",
    isOpen: true,
    modules: [],
  };
}

export function normalizeBlock(block = {}) {
  return {
    ...block,
    isOpen: block.isOpen ?? true,
    modules: Array.isArray(block.modules)
      ? block.modules
      : Array.isArray(block.objects)
        ? block.objects
        : [],
  };
}

export function cloneModule(module) {
  return deepClone(module);
}

export function cloneBlock(block) {
  const normalizedBlock = normalizeBlock(block);

  return {
    ...deepClone(normalizedBlock),
    modules: (normalizedBlock.modules || []).map(cloneModule),
  };
}

export function duplicateModule(module) {
  return {
    ...cloneModule(module),
    id: createId("module"),
  };
}

export function duplicateBlock(block) {
  const normalizedBlock = normalizeBlock(block);

  return {
    ...cloneBlock(normalizedBlock),
    id: createId("block"),
    name: `${normalizedBlock.name || "Block"} Copy`,
    isOpen: true,

    // IMPORTANT:
    // Every module inside the duplicated block needs a new id.
    // Otherwise editing the duplicated module can update the original too.
    modules: (normalizedBlock.modules || []).map(duplicateModule),
  };
}

export function cloneBlocks(blocks = []) {
  return blocks.map((block) => cloneBlock(block));
}