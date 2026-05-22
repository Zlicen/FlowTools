export function createId(prefix) {
  return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 99999)}`;
}

export function createBlock() {
  return {
    id: createId("block"),
    name: "New Block",
    isOpen: true,
    modules: [],
  };
}

export function normalizeBlock(block) {
  return {
    ...block,
    isOpen: block.isOpen ?? true,

    modules:
      block.modules ||
      block.objects ||
      [],
  };
}

export function duplicateBlock(block) {
  const normalizedBlock = normalizeBlock(block);

  return {
    ...JSON.parse(JSON.stringify(normalizedBlock)),
    id: createId("block"),
    name: `${normalizedBlock.name} Copy`,
    isOpen: true,
  };
}

export function duplicateModule(module) {
  return {
    ...JSON.parse(JSON.stringify(module)),
    id: createId("module"),
  };
}

export function cloneBlocks(blocks) {
  return blocks.map((block) => {
    const normalizedBlock = normalizeBlock(block);

    return {
      ...normalizedBlock,
      modules: [...(normalizedBlock.modules || [])],
    };
  });
}