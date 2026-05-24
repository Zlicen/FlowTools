import { useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { automationTheme, getReadableTextColor } from "../automationTheme";
import {
  cloneBlocks,
  createBlock,
  duplicateBlock,
  duplicateModule,
  normalizeBlock,
} from "../automationBlockHelpers";
import { moduleCategories, moduleRegistry } from "../modules/moduleRegistry";
import {
  createModuleInstance,
  updateModuleInBlock,
} from "../modules/moduleHelpers";
import { getModuleWarningsById } from "../modules/moduleCompatibility";

const MODULE_DRAG_DISTANCE = 6;

function getDropPositionFromPoint(clientY, element) {
  const rect = element.getBoundingClientRect();
  const y = clientY - rect.top;
  return y < rect.height / 2 ? "before" : "after";
}

function getModuleKindFromCategory() {
  return "module";
}

function getCollectionKeyFromKind() {
  return "modules";
}

function getCategoryDescription(categoryId) {
  if (categoryId === "objects") {
    return "Drag objects into blocks and choose their action in settings.";
  }

  return "Automation modules.";
}

function getModuleLetter(moduleKind) {
  if (moduleKind === "object") return "O";
  if (moduleKind === "action") return "A";
  return "M";
}

function reorderBlocks(currentBlocks, draggedBlockId, targetBlockId, position) {
  if (draggedBlockId === targetBlockId) return currentBlocks;

  const nextBlocks = [...currentBlocks];
  const draggedIndex = nextBlocks.findIndex((block) => block.id === draggedBlockId);
  const targetIndex = nextBlocks.findIndex((block) => block.id === targetBlockId);

  if (draggedIndex === -1 || targetIndex === -1) return currentBlocks;

  const [draggedBlock] = nextBlocks.splice(draggedIndex, 1);
  const updatedTargetIndex = nextBlocks.findIndex((block) => block.id === targetBlockId);
  const insertIndex = position === "after" ? updatedTargetIndex + 1 : updatedTargetIndex;

  nextBlocks.splice(insertIndex, 0, draggedBlock);

  return nextBlocks;
}

function reorderModules(currentModules, draggedModuleId, targetModuleId, position) {
  if (draggedModuleId === targetModuleId) return currentModules;

  const nextModules = [...currentModules];
  const draggedIndex = nextModules.findIndex((module) => module.id === draggedModuleId);
  const targetIndex = nextModules.findIndex((module) => module.id === targetModuleId);

  if (draggedIndex === -1 || targetIndex === -1) return currentModules;

  const [draggedModule] = nextModules.splice(draggedIndex, 1);
  const updatedTargetIndex = nextModules.findIndex((module) => module.id === targetModuleId);
  const insertIndex = position === "after" ? updatedTargetIndex + 1 : updatedTargetIndex;

  nextModules.splice(insertIndex, 0, draggedModule);

  return nextModules;
}

function getTooltipPosition(anchorElement) {
  if (!anchorElement) {
    return { top: 0, left: 0 };
  }

  const rect = anchorElement.getBoundingClientRect();
  const tooltipWidth = 260;
  const spacing = 10;

  let left = rect.left + rect.width / 2 - tooltipWidth / 2;
  let top = rect.bottom + spacing;

  left = Math.max(12, Math.min(left, window.innerWidth - tooltipWidth - 12));

  if (top + 90 > window.innerHeight) {
    top = rect.top - 90 - spacing;
  }

  return {
    top,
    left,
  };
}

function InfoIcon({ text }) {
  if (!text) return null;

  return (
    <SmartTooltip content={text}>
      <span style={styles.infoIcon}>i</span>
    </SmartTooltip>
  );
}

function WarningIcon({ warnings }) {
  if (!warnings || warnings.length === 0) return null;

  return (
    <SmartTooltip content={warnings.join("\n")} variant="warning">
      <span style={styles.warningIcon}>!</span>
    </SmartTooltip>
  );
}

function SmartTooltip({ children, content, variant = "info" }) {
  const [isHovering, setIsHovering] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const anchorRef = useRef(null);

  function showTooltip(event) {
    event.stopPropagation();

    const rect = anchorRef.current?.getBoundingClientRect();
    if (!rect) return;

    const tooltipWidth = 260;
    const spacing = 10;

    let left = rect.left + rect.width / 2 - tooltipWidth / 2;
    const top = rect.bottom + spacing;

    left = Math.max(12, Math.min(left, window.innerWidth - tooltipWidth - 12));

    setPosition({ top, left });
    setIsHovering(true);
  }

  function hideTooltip(event) {
    event.stopPropagation();
    setIsHovering(false);
  }

  return (
    <span
      ref={anchorRef}
      style={variant === "warning" ? styles.warningIconWrap : styles.infoWrap}
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onPointerDown={(event) => event.stopPropagation()}
      onClick={(event) => event.stopPropagation()}
    >
      {children}

      {isHovering &&
        createPortal(
          <div
            style={{
              ...styles.smartTooltip,
              ...(variant === "warning" ? styles.smartWarningTooltip : {}),
              top: position.top,
              left: position.left,
            }}
          >
            {content}
          </div>,
          document.body
        )}
    </span>
  );
}

function AutomationEditor({
  automation,
  onChange,
  onUpdateAutomation,
  onRun,
  runResult,
}) {
  const [collapsedCategories, setCollapsedCategories] = useState({});
  const [selectedModuleId, setSelectedModuleId] = useState(null);
  const [renamingBlockId, setRenamingBlockId] = useState(null);
  const [dragData, setDragData] = useState(null);
  const [dropTarget, setDropTarget] = useState(null);
  const [dragPosition, setDragPosition] = useState(null);

  const dragDataRef = useRef(null);
  const dropTargetRef = useRef(null);

  const blocks = useMemo(
    () => cloneBlocks(automation.blocks || []).map(normalizeBlock),
    [automation.blocks]
  );

  const moduleWarningsById = useMemo(() => getModuleWarningsById(blocks), [blocks]);

  const selectedModule = useMemo(() => {
    for (const block of blocks) {
      const collections = [
  { collectionKey: "modules", moduleKind: "module" },
];

      for (const collection of collections) {
        const module = (block[collection.collectionKey] || []).find(
          (item) => item.id === selectedModuleId
        );

        if (module) {
          return {
            module,
            block,
            collectionKey: collection.collectionKey,
            moduleKind: collection.moduleKind,
          };
        }
      }
    }

    return null;
  }, [blocks, selectedModuleId]);

  function commitBlocks(nextBlocks) {
    const updateAutomation = onChange || onUpdateAutomation;

    if (typeof updateAutomation !== "function") {
      console.error("AutomationEditor missing update function");
      return;
    }

    updateAutomation({
      ...automation,
      blocks: cloneBlocks(nextBlocks).map(normalizeBlock),
    });
  }

  function clearDragState() {
    dragDataRef.current = null;
    dropTargetRef.current = null;
    setDragData(null);
    setDropTarget(null);
    setDragPosition(null);
  }

  function setCurrentDragData(nextData) {
    dragDataRef.current = nextData;
    setDragData(nextData);
  }

  function setCurrentDropTarget(nextTarget) {
    dropTargetRef.current = nextTarget;
    setDropTarget(nextTarget);
  }

  function toggleCategory(categoryId) {
    setCollapsedCategories((current) => ({
      ...current,
      [categoryId]: !current[categoryId],
    }));
  }

  function addBlock() {
    const nextBlock = createBlock();

    commitBlocks([...blocks, nextBlock]);
  }

  function updateBlockName(block, name) {
    commitBlocks(
      blocks.map((item) =>
        item.id === block.id
          ? {
              ...item,
              name,
            }
          : item
      )
    );
  }

  function toggleBlock(block) {
    commitBlocks(
      blocks.map((item) =>
        item.id === block.id
          ? {
              ...item,
              isOpen: !item.isOpen,
            }
          : item
      )
    );
  }

  function copyBlock(blockId) {
    const block = blocks.find((item) => item.id === blockId);
    if (!block) return;

    commitBlocks([...blocks, duplicateBlock(block)]);
  }

  function deleteBlock(blockId) {
    commitBlocks(blocks.filter((block) => block.id !== blockId));

    if (selectedModule) {
      const isInDeletedBlock = selectedModule.block.id === blockId;
      if (isInDeletedBlock) setSelectedModuleId(null);
    }
  }

  function moveBlock(blockId, direction) {
    const currentIndex = blocks.findIndex((block) => block.id === blockId);
    if (currentIndex === -1) return;

    const nextIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    if (nextIndex < 0 || nextIndex >= blocks.length) return;

    const nextBlocks = [...blocks];
    const [movedBlock] = nextBlocks.splice(currentIndex, 1);
    nextBlocks.splice(nextIndex, 0, movedBlock);

    commitBlocks(nextBlocks);
  }

  function updateBlock(updatedBlock) {
    commitBlocks(
      blocks.map((block) => (block.id === updatedBlock.id ? normalizeBlock(updatedBlock) : block))
    );
  }

  function getCategoryColor(categoryId) {
  if (categoryId === "objects") return automationTheme.objectColor;
  if (categoryId === "actions") return automationTheme.actionColor;
  if (categoryId === "targets") return automationTheme.targetColor;

  return automationTheme.moduleColor;
}

  function canDropInZone(collectionKey, data = dragDataRef.current) {
  if (!data) return false;

  return collectionKey === "modules";
}

  function updateDropTargetFromPoint(clientX, clientY) {
    const data = dragDataRef.current;
    if (!data) return;

    const element = document.elementFromPoint(clientX, clientY);
    if (!element) {
      setCurrentDropTarget(null);
      return;
    }

    const moduleElement = element.closest("[data-automation-module-id]");
    const zoneElement = element.closest("[data-automation-zone]");

    if (moduleElement) {
      const blockId = moduleElement.getAttribute("data-block-id");
      const collectionKey = moduleElement.getAttribute("data-collection-key");
      const moduleId = moduleElement.getAttribute("data-automation-module-id");

      if (collectionKey && blockId && moduleId && canDropInZone(collectionKey, data)) {
        if (data.source === "placed-module" && data.moduleId === moduleId) {
          setCurrentDropTarget(null);
          return;
        }

        setCurrentDropTarget({
          type: collectionKey,
          blockId,
          moduleId,
          position: getDropPositionFromPoint(clientY, moduleElement),
        });

        return;
      }
    }

    if (zoneElement) {
      const blockId = zoneElement.getAttribute("data-block-id");
      const collectionKey = zoneElement.getAttribute("data-collection-key");

      if (collectionKey && blockId && canDropInZone(collectionKey, data)) {
        setCurrentDropTarget({
          type: collectionKey,
          blockId,
          position: "end",
        });

        return;
      }
    }

    setCurrentDropTarget(null);
  }

  function insertLibraryModule(blockId, collectionKey, moduleDefinition, targetModuleId, position) {
    const instance = createModuleInstance(moduleDefinition);

    const nextBlocks = blocks.map((block) => {
      if (block.id !== blockId) return block;

      const currentItems = [...(block[collectionKey] || [])];

      if (!targetModuleId || position === "end") {
        currentItems.push(instance);
      } else {
        const targetIndex = currentItems.findIndex((item) => item.id === targetModuleId);
        const insertIndex =
          targetIndex === -1
            ? currentItems.length
            : position === "after"
              ? targetIndex + 1
              : targetIndex;

        currentItems.splice(insertIndex, 0, instance);
      }

      return {
        ...block,
        [collectionKey]: currentItems,
      };
    });

    commitBlocks(nextBlocks);
    setSelectedModuleId(instance.id);
  }

  function movePlacedModule({
    sourceBlockId,
    sourceCollectionKey,
    moduleId,
    targetBlockId,
    targetCollectionKey,
    targetModuleId,
    position,
  }) {
    let movedModule = null;

    const removedBlocks = blocks.map((block) => {
      if (block.id !== sourceBlockId) return block;

      const sourceItems = [...(block[sourceCollectionKey] || [])];
      const sourceIndex = sourceItems.findIndex((item) => item.id === moduleId);

      if (sourceIndex === -1) return block;

      [movedModule] = sourceItems.splice(sourceIndex, 1);

      return {
        ...block,
        [sourceCollectionKey]: sourceItems,
      };
    });

    if (!movedModule) return;

    const nextBlocks = removedBlocks.map((block) => {
      if (block.id !== targetBlockId) return block;

      const targetItems = [...(block[targetCollectionKey] || [])];

      if (!targetModuleId || position === "end") {
        targetItems.push(movedModule);
      } else {
        const targetIndex = targetItems.findIndex((item) => item.id === targetModuleId);
        const insertIndex =
          targetIndex === -1
            ? targetItems.length
            : position === "after"
              ? targetIndex + 1
              : targetIndex;

        targetItems.splice(insertIndex, 0, movedModule);
      }

      return {
        ...block,
        [targetCollectionKey]: targetItems,
      };
    });

    commitBlocks(nextBlocks);
    setSelectedModuleId(movedModule.id);
  }

  function handleDropTarget(dropData = dropTargetRef.current) {
    const data = dragDataRef.current;

    if (!data || !dropData) {
      clearDragState();
      return;
    }

    if (dropData.type === "block" && data.source === "block") {
      commitBlocks(reorderBlocks(blocks, data.blockId, dropData.blockId, dropData.position));
      clearDragState();
      return;
    }

    if (!canDropInZone(dropData.type, data)) {
      clearDragState();
      return;
    }

    if (data.source === "library") {
      insertLibraryModule(
        dropData.blockId,
        dropData.type,
        data.moduleDefinition,
        dropData.moduleId,
        dropData.position
      );

      clearDragState();
      return;
    }

    if (data.source === "placed-module") {
      movePlacedModule({
        sourceBlockId: data.blockId,
        sourceCollectionKey: data.collectionKey,
        moduleId: data.moduleId,
        targetBlockId: dropData.blockId,
        targetCollectionKey: dropData.type,
        targetModuleId: dropData.moduleId,
        position: dropData.position,
      });

      clearDragState();
    }
  }

  function handleZoneDragOver(event, block, collectionKey) {
    event.preventDefault();
    event.stopPropagation();
    updateDropTargetFromPoint(event.clientX, event.clientY);
  }

  function handleZoneDrop(event, block, collectionKey) {
    event.preventDefault();
    event.stopPropagation();
    handleDropTarget();
  }

  function handleModuleDragOver(event, block, module, moduleKind, index) {
    event.preventDefault();
    event.stopPropagation();
    updateDropTargetFromPoint(event.clientX, event.clientY);
  }

  function startLibraryPointerDrag(event, moduleDefinition) {
    if (event.button !== 0) return;

    const moduleKind = getModuleKindFromCategory(moduleDefinition.categoryId);
    if (!moduleKind) return;

    const startX = event.clientX;
    const startY = event.clientY;
    let didStartDrag = false;

    function handlePointerMove(moveEvent) {
      const distance = Math.hypot(moveEvent.clientX - startX, moveEvent.clientY - startY);

      if (!didStartDrag && distance >= MODULE_DRAG_DISTANCE) {
        didStartDrag = true;

        setCurrentDragData({
          source: "library",
          moduleKind,
          moduleDefinition,
        });
      }

      if (didStartDrag) {
        setDragPosition({
          x: moveEvent.clientX,
          y: moveEvent.clientY,
        });
        updateDropTargetFromPoint(moveEvent.clientX, moveEvent.clientY);
      }
    }

    function handlePointerUp(upEvent) {
      document.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("pointerup", handlePointerUp);
      document.removeEventListener("pointercancel", handlePointerCancel);

      if (didStartDrag) {
        updateDropTargetFromPoint(upEvent.clientX, upEvent.clientY);
        handleDropTarget();
      }

      clearDragState();
    }

    function handlePointerCancel() {
      document.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("pointerup", handlePointerUp);
      document.removeEventListener("pointercancel", handlePointerCancel);
      clearDragState();
    }

    document.addEventListener("pointermove", handlePointerMove);
    document.addEventListener("pointerup", handlePointerUp);
    document.addEventListener("pointercancel", handlePointerCancel);
  }

  function startPlacedModulePointerDrag(event, block, module, moduleKind, collectionKey) {
    if (event.button !== 0) return;

    const startX = event.clientX;
    const startY = event.clientY;
    let didStartDrag = false;

    function handlePointerMove(moveEvent) {
      const distance = Math.hypot(moveEvent.clientX - startX, moveEvent.clientY - startY);

      if (!didStartDrag && distance >= MODULE_DRAG_DISTANCE) {
        didStartDrag = true;

        setCurrentDragData({
          source: "placed-module",
          moduleKind,
          blockId: block.id,
          collectionKey,
          moduleId: module.id,
        });
      }

      if (didStartDrag) {
        setDragPosition({
          x: moveEvent.clientX,
          y: moveEvent.clientY,
        });
        updateDropTargetFromPoint(moveEvent.clientX, moveEvent.clientY);
      }
    }

    function handlePointerUp(upEvent) {
      document.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("pointerup", handlePointerUp);
      document.removeEventListener("pointercancel", handlePointerCancel);

      if (didStartDrag) {
        updateDropTargetFromPoint(upEvent.clientX, upEvent.clientY);
        handleDropTarget();
      }

      clearDragState();
    }

    function handlePointerCancel() {
      document.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("pointerup", handlePointerUp);
      document.removeEventListener("pointercancel", handlePointerCancel);
      clearDragState();
    }

    document.addEventListener("pointermove", handlePointerMove);
    document.addEventListener("pointerup", handlePointerUp);
    document.addEventListener("pointercancel", handlePointerCancel);
  }

  function handleBlockDragStart(event, block) {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", block.name);

    setCurrentDragData({
      source: "block",
      blockId: block.id,
    });
  }

  function handleBlockDragOver(event, blockId) {
    if (dragDataRef.current?.source !== "block") return;

    event.preventDefault();
    event.stopPropagation();

    setCurrentDropTarget({
      type: "block",
      blockId,
      position: getDropPositionFromPoint(event.clientY, event.currentTarget),
    });
  }

  function handleBlockDrop(event) {
    event.preventDefault();
    event.stopPropagation();
    handleDropTarget();
  }

  function copyModule(block, collectionKey, module) {
    const nextBlock = {
      ...block,
      [collectionKey]: [...(block[collectionKey] || []), duplicateModule(module)],
    };

    updateBlock(nextBlock);
  }

  function deleteModule(block, collectionKey, moduleId) {
    const nextBlock = {
      ...block,
      [collectionKey]: (block[collectionKey] || []).filter((module) => module.id !== moduleId),
    };

    updateBlock(nextBlock);

    if (selectedModuleId === moduleId) {
      setSelectedModuleId(null);
    }
  }

  function updateSelectedModule(updatedModule) {
    if (!selectedModule) return;

    const updatedBlock = updateModuleInBlock(selectedModule.block, updatedModule);
    updateBlock(updatedBlock);
  }

  function renderModulePill({ module, block, moduleKind, collectionKey, index }) {
    return (
      <AutomationModulePill
        key={module.id}
        module={module}
        block={block}
        moduleKind={moduleKind}
        collectionKey={collectionKey}
        index={index}
        selectedModuleId={selectedModuleId}
        setSelectedModuleId={setSelectedModuleId}
        dragData={dragData}
        dropTarget={dropTarget}
        moduleWarningsById={moduleWarningsById}
        getCategoryColor={getCategoryColor}
        copyModule={copyModule}
        deleteModule={deleteModule}
        handleZoneDrop={handleZoneDrop}
        handleModuleDragOver={handleModuleDragOver}
        startPlacedModulePointerDrag={startPlacedModulePointerDrag}
      />
    );
  }

  function renderBlockLane({ block, title, collectionKey, moduleKind }) {
    const items = block[collectionKey] || [];
    const canDrop = canDropInZone(collectionKey);
    const isActiveDrop =
      dropTarget?.blockId === block.id && dropTarget?.type === collectionKey;

    return (
      <div
        style={{
          ...styles.blockLane,
          ...(canDrop ? styles.availableDropSection : {}),
          ...(isActiveDrop ? styles.activeDropSection : {}),
        }}
        data-automation-zone="true"
        data-block-id={block.id}
        data-collection-key={collectionKey}
        onDragOver={(event) => handleZoneDragOver(event, block, collectionKey)}
        onDrop={(event) => handleZoneDrop(event, block, collectionKey)}
      >
        <div style={styles.laneHeader}>
          <h3 style={styles.laneTitle}>{title}</h3>
        </div>

        <div style={styles.pillList}>
          {items.length === 0 && (
            <div
              style={{
                ...styles.dropZone,
                ...(canDrop ? styles.availableDropZone : {}),
              }}
            >
              Drop {title.toLowerCase()}
            </div>
          )}

          {items.map((module, index) =>
            renderModulePill({
              module,
              block,
              moduleKind,
              collectionKey,
              index,
            })
          )}
        </div>
      </div>
    );
  }

  function renderFloatingModule() {
    if (!dragData) return null;

    let label = "";

    if (dragData.source === "library") {
      label = dragData.moduleDefinition.name;
    }

    if (dragData.source === "placed-module") {
      const block = blocks.find((item) => item.id === dragData.blockId);
      const module = block?.[dragData.collectionKey]?.find(
        (item) => item.id === dragData.moduleId
      );

      label = moduleRegistry[module?.type]?.name || module?.name || "";
    }

    if (dragData.source === "block") {
      const block = blocks.find((item) => item.id === dragData.blockId);
      label = block?.name || "Block";
    }

    if (!dragPosition) return null;

    return (
      <div
        style={{
          ...styles.floatingDrag,
          left: dragPosition.x + 14,
          top: dragPosition.y + 14,
        }}
      >
        {label}
      </div>
    );
  }

  function renderSettingsPanel() {
    if (!selectedModule) {
      return (
        <aside style={styles.settingsPanel}>
          <h2 style={styles.settingsTitle}>Settings</h2>
          <div style={styles.settingsEmpty}>Select a module to edit its settings.</div>
        </aside>
      );
    }

    const { module, block } = selectedModule;
    const definition = moduleRegistry[module.type];
    const SettingsComponent = definition?.SettingsComponent;

    return (
      <aside style={styles.settingsPanel}>
        <h2 style={styles.settingsTitle}>Settings</h2>

        <div style={styles.settingsModuleTopRow}>
          <div>
            <h3 style={styles.settingsModuleName}>{definition?.name || module.type}</h3>
            <div style={styles.settingsModuleBlock}>{block.name}</div>
          </div>
        </div>

        {SettingsComponent ? (
          <SettingsComponent module={module} onUpdate={updateSelectedModule} />
        ) : (
          <div style={styles.settingsEmpty}>This module has no settings.</div>
        )}
      </aside>
    );
  }

  return (
    <div style={styles.editorShell}>
      <div style={styles.libraryPanel}>
        <div style={styles.libraryHeader}>
          <div>
            <h2 style={styles.panelTitle}>Modules</h2>
            <div style={styles.panelSubtitle}>Drag modules into blocks.</div>
          </div>
        </div>

        <div style={styles.categoryList}>
          {moduleCategories.map((category) => {
            const isCollapsed = collapsedCategories[category.id];
            const categoryColor = getCategoryColor(category.id);

            return (
              <div key={category.id} style={styles.categoryCard}>
                <button style={styles.categoryHeader} onClick={() => toggleCategory(category.id)}>
                  <span>{isCollapsed ? "▶" : "▼"}</span>
                  <span style={styles.categoryHeaderName}>{category.name}</span>

                  <InfoIcon text={getCategoryDescription(category.id)} />
                </button>

                {!isCollapsed && (
                  <div style={styles.libraryModuleList}>
                    {category.modules.map((moduleDefinition) => {
                      const moduleKind = getModuleKindFromCategory(moduleDefinition.categoryId);
                      const color = getCategoryColor(moduleDefinition.categoryId);
                      const textColor = getReadableTextColor(color);

                      return (
                        <button
                          key={moduleDefinition.id}
                          style={{
                            ...styles.libraryModule,
                            backgroundColor: color,
                            color: textColor,
                          }}
                          onPointerDown={(event) =>
                            startLibraryPointerDrag(event, moduleDefinition)
                          }
                          onClick={() => {
                            const firstBlock = blocks[0];

                            if (!firstBlock) {
                              const newBlock = createBlock();
                              const collectionKey = getCollectionKeyFromKind(moduleKind);

                              if (!collectionKey) return;

                              const instance = createModuleInstance(moduleDefinition);

                              commitBlocks([
                                {
                                  ...newBlock,
                                  [collectionKey]: [instance],
                                },
                              ]);

                              setSelectedModuleId(instance.id);
                              return;
                            }

                            const collectionKey = getCollectionKeyFromKind(moduleKind);
                            if (!collectionKey) return;

                            const instance = createModuleInstance(moduleDefinition);

                            commitBlocks(
                              blocks.map((block, index) =>
                                index === 0
                                  ? {
                                      ...block,
                                      [collectionKey]: [
                                        ...(block[collectionKey] || []),
                                        instance,
                                      ],
                                    }
                                  : block
                              )
                            );

                            setSelectedModuleId(instance.id);
                          }}
                        >
                          <span style={styles.libraryModuleName}>
                            {moduleDefinition.name}
                          </span>

                          <InfoIcon text={moduleDefinition.description} />
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <main style={styles.workspace}>
        <div style={styles.workspaceTop}>
          <div>
            <h1 style={styles.workspaceTitle}>Automation</h1>
            <div style={styles.workspaceSubtitle}>Objects with actions inside settings</div>
          </div>

          <button style={styles.addBlockButton} onClick={addBlock}>
            + Block
          </button>
        </div>

        <div style={styles.blockList}>
          {blocks.length === 0 && (
            <div style={styles.emptyDrop}>
              Add a block, then drag object modules into it.
            </div>
          )}

          {blocks.map((block, blockIndex) => (
            <AutomationBlockCard
              key={block.id}
              block={block}
              blockIndex={blockIndex}
              dragData={dragData}
              dropTarget={dropTarget}
              renamingBlockId={renamingBlockId}
              setRenamingBlockId={setRenamingBlockId}
              updateBlockName={updateBlockName}
              copyBlock={copyBlock}
              deleteBlock={deleteBlock}
              moveBlock={moveBlock}
              totalBlocks={blocks.length}
              toggleBlock={toggleBlock}
              renderBlockLane={renderBlockLane}
              handleBlockDragStart={handleBlockDragStart}
              handleBlockDragOver={handleBlockDragOver}
              handleBlockDrop={handleBlockDrop}
              clearDragState={clearDragState}
            />
          ))}
        </div>

        {runResult && (
          <pre
            style={{
              ...styles.runResult,
              borderColor: runResult.success ? "#2f6f3e" : "#7c3333",
              color: runResult.success ? "#a9f0b6" : "#ffb8b8",
            }}
          >
            {JSON.stringify(runResult, null, 2)}
          </pre>
        )}
      </main>

      {renderSettingsPanel()}
      {renderFloatingModule()}
    </div>
  );
}

function AutomationBlockCard({
  block,
  blockIndex,
  dragData,
  dropTarget,
  renamingBlockId,
  setRenamingBlockId,
  updateBlockName,
  copyBlock,
  deleteBlock,
  moveBlock,
  totalBlocks,
  toggleBlock,
  renderBlockLane,
  handleBlockDragStart,
  handleBlockDragOver,
  handleBlockDrop,
  clearDragState,
}) {
  const blockTextColor = getReadableTextColor(automationTheme.blockColor);
  const isDraggingThisBlock =
    dragData?.source === "block" && dragData.blockId === block.id;

  return (
    <div
      style={{
        ...styles.blockCard,
        backgroundColor: automationTheme.blockColor,
        color: blockTextColor,
        ...(isDraggingThisBlock ? styles.draggingItem : {}),
      }}
      onDragOver={(event) => handleBlockDragOver(event, block.id)}
      onDrop={handleBlockDrop}
    >
      {dropTarget?.type === "block" &&
        dropTarget.blockId === block.id &&
        dropTarget.position === "before" && <div style={styles.blockDropLine} />}

      <div style={styles.blockHeader}>
        <div style={styles.blockTitleArea}>
          <div style={styles.blockMoveButtons}>
            <button
              style={{
                ...styles.blockMoveButton,
                ...(blockIndex === 0 ? styles.disabledBlockMoveButton : {}),
              }}
              onPointerDown={(event) => event.stopPropagation()}
              onClick={(event) => {
                event.stopPropagation();
                moveBlock(block.id, "up");
              }}
              title="Move block up"
              disabled={blockIndex === 0}
            >
              ↑
            </button>

            <button
              style={{
                ...styles.blockMoveButton,
                ...(blockIndex === totalBlocks - 1
                  ? styles.disabledBlockMoveButton
                  : {}),
              }}
              onPointerDown={(event) => event.stopPropagation()}
              onClick={(event) => {
                event.stopPropagation();
                moveBlock(block.id, "down");
              }}
              title="Move block down"
              disabled={blockIndex === totalBlocks - 1}
            >
              ↓
            </button>
          </div>

          <div style={styles.blockNumber}>{blockIndex + 1}</div>

          {renamingBlockId === block.id ? (
            <input
              style={styles.blockNameInput}
              value={block.name}
              autoFocus
              onPointerDown={(event) => event.stopPropagation()}
              onClick={(event) => event.stopPropagation()}
              onChange={(event) => updateBlockName(block, event.target.value)}
              onBlur={() => setRenamingBlockId(null)}
              onKeyDown={(event) => {
                if (event.key === "Enter") setRenamingBlockId(null);
                if (event.key === "Escape") setRenamingBlockId(null);
              }}
            />
          ) : (
            <button
              style={styles.blockNameButton}
              onClick={() => toggleBlock(block)}
              title="Open/close block"
            >
              {block.name}
            </button>
          )}

          <span style={styles.blockStats}>
  {(block.modules || []).length} module
  {(block.modules || []).length === 1 ? "" : "s"}
</span>
        </div>

        <div style={styles.blockButtons}>
          <button
            style={styles.renameButton}
            onPointerDown={(event) => event.stopPropagation()}
            onClick={(event) => {
              event.stopPropagation();
              setRenamingBlockId(block.id);
            }}
          >
            Rename
          </button>

          <button
            style={styles.iconButton}
            onPointerDown={(event) => event.stopPropagation()}
            onClick={(event) => {
              event.stopPropagation();
              copyBlock(block.id);
            }}
            title="Duplicate block"
          >
            ⧉
          </button>

          <button
            style={styles.iconDeleteButton}
            onPointerDown={(event) => event.stopPropagation()}
            onClick={(event) => {
              event.stopPropagation();
              deleteBlock(block.id);
            }}
            title="Delete block"
          >
            ×
          </button>

          <button
            style={styles.expandButton}
            onClick={() => toggleBlock(block)}
            title="Open/close block"
          >
            {block.isOpen ? "▾" : "▸"}
          </button>
        </div>
      </div>

      {dropTarget?.type === "block" &&
        dropTarget.blockId === block.id &&
        dropTarget.position === "after" && <div style={styles.blockDropLine} />}

      {block.isOpen && (
        <div style={styles.blockBody}>
          {renderBlockLane({
  block,
  title: "Modules",
  collectionKey: "modules",
  moduleKind: "module",
})}
        </div>
      )}
    </div>
  );
}

function AutomationModulePill({
  module,
  block,
  moduleKind,
  collectionKey,
  index,
  selectedModuleId,
  setSelectedModuleId,
  dragData,
  dropTarget,
  moduleWarningsById,
  getCategoryColor,
  copyModule,
  deleteModule,
  handleZoneDrop,
  handleModuleDragOver,
  startPlacedModulePointerDrag,
}) {
  const definition = moduleRegistry[module.type];
  const isSelected = selectedModuleId === module.id;
  const categoryColor = getCategoryColor(definition?.categoryId);
  const textColor = getReadableTextColor(categoryColor);
  const warnings = moduleWarningsById[module.id] || [];
  const hasWarnings = warnings.length > 0;
  const isDraggingThisModule =
    dragData?.source === "placed-module" && dragData.moduleId === module.id;

  const showBefore =
    dropTarget?.type === collectionKey &&
    dropTarget?.blockId === block.id &&
    dropTarget?.moduleId === module.id &&
    dropTarget?.position === "before";

  const showAfter =
    dropTarget?.type === collectionKey &&
    dropTarget?.blockId === block.id &&
    dropTarget?.moduleId === module.id &&
    dropTarget?.position === "after";

  return (
    <div
      style={styles.moduleWrap}
      data-automation-module-id={module.id}
      data-block-id={block.id}
      data-collection-key={collectionKey}
      onDragOver={(event) =>
        handleModuleDragOver(event, block, module, moduleKind, index)
      }
      onDrop={(event) => handleZoneDrop(event, block, collectionKey)}
    >
      {showBefore && (
        <div
          style={{
            ...styles.moduleDropLine,
            top: -4,
          }}
        />
      )}

      <button
        type="button"
        style={{
          ...styles.modulePill,
          backgroundColor: categoryColor,
          color: textColor,
          ...(isSelected ? styles.selectedModulePill : {}),
          ...(isDraggingThisModule ? styles.draggingItem : {}),
        }}
        onPointerDown={(event) =>
          startPlacedModulePointerDrag(event, block, module, moduleKind, collectionKey)
        }
        onClick={(event) => {
          event.stopPropagation();
          setSelectedModuleId(module.id);
        }}
      >
        <WarningIcon warnings={warnings} />

        <span style={styles.pillName}>{definition?.name || module.type}</span>

        <span style={styles.pillButtons}>
          <button
            type="button"
            style={styles.pillMiniButton}
            title="Duplicate module"
            onPointerDown={(event) => event.stopPropagation()}
            onClick={(event) => {
              event.stopPropagation();
              copyModule(block, collectionKey, module);
            }}
          >
            ⧉
          </button>

          <button
            type="button"
            style={styles.pillMiniDeleteButton}
            title="Delete module"
            onPointerDown={(event) => event.stopPropagation()}
            onClick={(event) => {
              event.stopPropagation();
              deleteModule(block, collectionKey, module.id);
            }}
          >
            ×
          </button>
        </span>
      </button>

      {showAfter && (
        <div
          style={{
            ...styles.moduleDropLine,
            bottom: -4,
          }}
        />
      )}
    </div>
  );
}

const styles = {
  editorShell: {
    display: "grid",
    gridTemplateColumns: "260px minmax(0,1fr) 300px",
    gap: "12px",
    minHeight: 0,
    height: "100%",
  },

  libraryPanel: {
    backgroundColor: automationTheme.panelColor,
    border: `1px solid ${automationTheme.borderColor}`,
    borderRadius: "14px",
    padding: "12px",
    minHeight: 0,
    overflow: "auto",
  },

  libraryHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "12px",
  },

  panelTitle: {
    margin: 0,
    fontSize: "18px",
  },

  panelSubtitle: {
    color: "#999",
    fontSize: "12px",
    marginTop: "4px",
  },

  categoryList: {
    display: "grid",
    gap: "10px",
  },

  categoryCard: {
    backgroundColor: "#161616",
    border: "1px solid #2b2b2b",
    borderRadius: "12px",
    overflow: "hidden",
  },

  categoryHeader: {
    width: "100%",
    border: "none",
    backgroundColor: "#202020",
    color: "white",
    padding: "10px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    cursor: "pointer",
    fontWeight: "bold",
    textAlign: "left",
  },

  categoryHeaderName: {
    flex: 1,
  },

  libraryModuleList: {
    display: "grid",
    gap: "7px",
    padding: "8px",
  },

  libraryModule: {
    border: "none",
    borderRadius: "10px",
    padding: "10px",
    fontWeight: "bold",
    cursor: "grab",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "8px",
    textAlign: "left",
  },

  libraryModuleName: {
    flex: 1,
    minWidth: 0,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },

  workspace: {
    minHeight: 0,
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },

  workspaceTop: {
    backgroundColor: automationTheme.panelColor,
    border: `1px solid ${automationTheme.borderColor}`,
    borderRadius: "14px",
    padding: "12px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  workspaceTitle: {
    margin: 0,
    fontSize: "22px",
  },

  workspaceSubtitle: {
    color: "#999",
    fontSize: "12px",
    marginTop: "4px",
  },

  addBlockButton: {
    backgroundColor: automationTheme.accentColor,
    color: "white",
    border: "none",
    borderRadius: "10px",
    padding: "9px 12px",
    fontWeight: "bold",
    cursor: "pointer",
  },

  blockList: {
    minHeight: 0,
    overflow: "auto",
    display: "grid",
    gap: "12px",
    paddingRight: "4px",
  },

  emptyDrop: {
    border: "1px dashed #444",
    borderRadius: "14px",
    padding: "30px",
    color: "#888",
    textAlign: "center",
  },

  blockCard: {
    position: "relative",
    border: "1px solid rgba(255,255,255,.08)",
    borderRadius: "16px",
    padding: "12px",
    boxShadow: "0 10px 30px rgba(0,0,0,.25)",
  },

  blockHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "12px",
  },

  blockTitleArea: {
    flex: 1,
    display: "grid",
    gridTemplateColumns: "auto auto minmax(100px, 1fr) auto",
    alignItems: "center",
    gap: "8px",
    minWidth: 0,
  },

  blockMoveButtons: {
    display: "flex",
    flexDirection: "column",
    gap: "2px",
  },

  blockMoveButton: {
    width: "22px",
    height: "18px",
    border: "none",
    borderRadius: "5px",
    backgroundColor: "rgba(255,255,255,.12)",
    color: "inherit",
    cursor: "pointer",
    fontSize: "10px",
    lineHeight: 1,
  },

  disabledBlockMoveButton: {
    opacity: 0.3,
    cursor: "not-allowed",
  },

  blockNumber: {
    width: "28px",
    height: "28px",
    borderRadius: "999px",
    backgroundColor: "rgba(255,255,255,.12)",
    display: "grid",
    placeItems: "center",
    fontWeight: "bold",
  },

  blockNameButton: {
    border: "none",
    background: "transparent",
    color: "inherit",
    textAlign: "left",
    fontWeight: "bold",
    fontSize: "16px",
    minWidth: 0,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    cursor: "pointer",
  },

  blockNameInput: {
    minWidth: 0,
    backgroundColor: "rgba(0,0,0,.2)",
    color: "inherit",
    border: "1px solid rgba(255,255,255,.25)",
    borderRadius: "8px",
    padding: "6px 8px",
    fontWeight: "bold",
    outline: "none",
  },

  blockStats: {
    justifySelf: "center",
    color: "#ddd",
    fontSize: "12px",
    fontWeight: "bold",
    textAlign: "center",
  },

  blockButtons: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },

  renameButton: {
    border: "none",
    borderRadius: "8px",
    padding: "7px 9px",
    backgroundColor: "rgba(255,255,255,.12)",
    color: "inherit",
    cursor: "pointer",
    fontWeight: "bold",
  },

  iconButton: {
    width: "32px",
    height: "32px",
    border: "none",
    borderRadius: "8px",
    backgroundColor: "rgba(255,255,255,.12)",
    color: "inherit",
    cursor: "pointer",
    fontWeight: "bold",
  },

  iconDeleteButton: {
    width: "32px",
    height: "32px",
    border: "none",
    borderRadius: "8px",
    backgroundColor: "rgba(255,60,60,.18)",
    color: "inherit",
    cursor: "pointer",
    fontWeight: "bold",
  },

  expandButton: {
    width: "32px",
    height: "32px",
    border: "none",
    borderRadius: "8px",
    backgroundColor: "rgba(255,255,255,.12)",
    color: "inherit",
    cursor: "pointer",
    fontWeight: "bold",
  },

  blockBody: {
    marginTop: "12px",
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: "10px",
  },

  blockLane: {
    minHeight: "120px",
    backgroundColor: "rgba(0,0,0,.16)",
    border: "1px solid rgba(255,255,255,.1)",
    borderRadius: "12px",
    padding: "10px",
  },

  availableDropSection: {
    borderColor: "rgba(115,87,255,.55)",
  },

  activeDropSection: {
    boxShadow: "0 0 0 1px rgba(115,87,255,.55)",
  },

  laneHeader: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "8px",
  },

  laneTitle: {
    margin: 0,
    fontSize: "13px",
  },

  pillList: {
    display: "grid",
    gap: "7px",
  },

  dropZone: {
    minHeight: "40px",
    border: "1px dashed rgba(255,255,255,.14)",
    borderRadius: "10px",
    display: "grid",
    placeItems: "center",
    color: "rgba(255,255,255,.55)",
    fontSize: "12px",
  },

  availableDropZone: {
    borderColor: "rgba(115,87,255,.6)",
    color: "#d8d0ff",
  },

  moduleWrap: {
    position: "relative",
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },

  moduleDropLine: {
    position: "absolute",
    left: 0,
    right: 0,
    height: "3px",
    borderRadius: "999px",
    backgroundColor: "#7357ff",
    boxShadow: "0 0 10px rgba(115,87,255,.75)",
    pointerEvents: "none",
    zIndex: 20,
  },

  modulePill: {
    border: "none",
    borderRadius: "10px",
    padding: "9px",
    display: "flex",
    alignItems: "center",
    gap: "7px",
    cursor: "grab",
    fontWeight: "bold",
    minWidth: 0,
  },

  selectedModulePill: {
    boxShadow: "0 0 0 2px rgba(255,255,255,.55)",
  },

  draggingItem: {
    opacity: 0.45,
  },

  pillName: {
    flex: 1,
    minWidth: 0,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    textAlign: "left",
  },

  pillButtons: {
    display: "flex",
    gap: "4px",
  },

  pillMiniButton: {
    width: "24px",
    height: "24px",
    border: "none",
    borderRadius: "6px",
    backgroundColor: "rgba(0,0,0,.2)",
    color: "inherit",
    cursor: "pointer",
    fontWeight: "bold",
  },

  pillMiniDeleteButton: {
    width: "24px",
    height: "24px",
    border: "none",
    borderRadius: "6px",
    backgroundColor: "rgba(255,0,0,.2)",
    color: "inherit",
    cursor: "pointer",
    fontWeight: "bold",
  },

  infoWrap: {
    position: "relative",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#f2f2f2",
  },

  infoIcon: {
    width: "16px",
    height: "16px",
    borderRadius: "999px",
    display: "inline-grid",
    placeItems: "center",
    backgroundColor: "rgba(255,255,255,.25)",
    fontSize: "11px",
    fontWeight: "bold",
    flexShrink: 0,
  },

  warningIconWrap: {
    position: "relative",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
  },

  warningIcon: {
    width: "18px",
    height: "18px",
    borderRadius: "999px",
    display: "inline-grid",
    placeItems: "center",
    backgroundColor: "#ff3b3b",
    color: "white",
    fontSize: "12px",
    fontWeight: "900",
    flexShrink: 0,
  },

  smartTooltip: {
    position: "fixed",
    width: "260px",
    backgroundColor: "#080808",
    border: "1px solid #555",
    borderRadius: "8px",
    padding: "10px",
    color: "#f2f2f2",
    fontSize: "12px",
    fontWeight: 400,
    fontStyle: "normal",
    textAlign: "left",
    lineHeight: 1.45,
    zIndex: 999999,
    boxShadow: "0 10px 32px rgba(0,0,0,.75)",
    pointerEvents: "none",
    whiteSpace: "normal",
    textTransform: "none",
  },

  smartWarningTooltip: {
    borderColor: "#ff3b3b",
  },

  settingsPanel: {
    backgroundColor: automationTheme.panelColor,
    border: `1px solid ${automationTheme.borderColor}`,
    borderRadius: "14px",
    padding: "12px",
    minHeight: 0,
    overflow: "auto",
  },

  settingsTitle: {
    margin: "0 0 12px",
    fontSize: "18px",
  },

  settingsEmpty: {
    color: "#888",
    fontSize: "13px",
    lineHeight: 1.45,
  },

  settingsModuleTopRow: {
    marginBottom: "12px",
    paddingBottom: "12px",
    borderBottom: "1px solid #333",
  },

  settingsModuleName: {
    margin: 0,
    fontSize: "16px",
  },

  settingsModuleBlock: {
    marginTop: "4px",
    color: "#999",
    fontSize: "12px",
  },

  floatingDrag: {
    position: "fixed",
    zIndex: 10000,
    backgroundColor: "#111",
    border: "1px solid #555",
    borderRadius: "10px",
    color: "white",
    padding: "10px 12px",
    pointerEvents: "none",
    boxShadow: "0 12px 30px rgba(0,0,0,.45)",
  },

  blockDropLine: {
    height: "3px",
    borderRadius: "999px",
    backgroundColor: "#7357ff",
    boxShadow: "0 0 10px rgba(115,87,255,.65)",
    margin: "6px 0",
  },

  runResult: {
    margin: 0,
    border: "1px solid",
    borderRadius: "12px",
    padding: "12px",
    backgroundColor: "#101010",
    overflow: "auto",
  },
};

export default AutomationEditor;