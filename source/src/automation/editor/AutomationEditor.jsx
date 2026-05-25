import { useMemo, useRef, useState } from "react";
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
import AutomationBlockCard from "./AutomationBlockCard";
import AutomationModulePill from "./AutomationModulePill";
import { InfoIcon } from "./EditorTooltip";
import { styles } from "./automationEditorStyles";
import {
  MODULE_DRAG_DISTANCE,
  MIN_LEFT_PANEL_WIDTH,
  MAX_LEFT_PANEL_WIDTH,
  MIN_RIGHT_PANEL_WIDTH,
  MAX_RIGHT_PANEL_WIDTH,
  MIN_CENTER_PANEL_WIDTH,
  RESIZER_WIDTH,
  getModuleKindFromCategory,
  getCollectionKeyFromKind,
  getCategoryDescription,
  getDropPositionFromPoint,
  reorderBlocks,
} from "./automationEditorUtils";

function AutomationEditor({
  automation,
  onChange,
  onUpdateAutomation,
  onRun,
  onRunBlock,
  runResult,
}) {
  const [collapsedCategories, setCollapsedCategories] = useState({});
  const [selectedModuleId, setSelectedModuleId] = useState(null);
  const [renamingBlockId, setRenamingBlockId] = useState(null);
  const [dragData, setDragData] = useState(null);
  const [dropTarget, setDropTarget] = useState(null);
  const [dragPosition, setDragPosition] = useState(null);
  const [leftPanelWidth, setLeftPanelWidth] = useState(MIN_LEFT_PANEL_WIDTH);
  const [rightPanelWidth, setRightPanelWidth] = useState(MIN_RIGHT_PANEL_WIDTH);

  const editorShellRef = useRef(null);
  const dragDataRef = useRef(null);
  const dropTargetRef = useRef(null);

  const blocks = useMemo(
    () => cloneBlocks(automation.blocks || []).map(normalizeBlock),
    [automation.blocks]
  );

  const moduleWarningsById = useMemo(
    () => getModuleWarningsById(blocks),
    [blocks]
  );

  const selectedModule = useMemo(() => {
    for (const block of blocks) {
      const collections = [{ collectionKey: "modules", moduleKind: "module" }];

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
    commitBlocks([...blocks, createBlock()]);
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

    if (selectedModule?.block.id === blockId) {
      setSelectedModuleId(null);
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
      blocks.map((block) =>
        block.id === updatedBlock.id ? normalizeBlock(updatedBlock) : block
      )
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

  function startPanelResize(event, panelSide) {
    if (event.button !== 0) return;

    event.preventDefault();
    event.stopPropagation();

    const shell = editorShellRef.current;
    if (!shell) return;

    const shellRect = shell.getBoundingClientRect();
    const startLeftWidth = leftPanelWidth;
    const startRightWidth = rightPanelWidth;

    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";

    function clamp(value, min, max) {
      return Math.max(min, Math.min(max, value));
    }

    function handlePointerMove(moveEvent) {
      const maxLeftWidth =
        shellRect.width -
        startRightWidth -
        MIN_CENTER_PANEL_WIDTH -
        RESIZER_WIDTH * 2;

      const maxRightWidth =
        shellRect.width -
        startLeftWidth -
        MIN_CENTER_PANEL_WIDTH -
        RESIZER_WIDTH * 2;

      if (panelSide === "left") {
        const nextLeftWidth = moveEvent.clientX - shellRect.left;

        setLeftPanelWidth(
  clamp(
    nextLeftWidth,
    MIN_LEFT_PANEL_WIDTH,
    Math.min(MAX_LEFT_PANEL_WIDTH, maxLeftWidth)
  )
);
      }

      if (panelSide === "right") {
        const nextRightWidth = shellRect.right - moveEvent.clientX;

        setRightPanelWidth(
  clamp(
    nextRightWidth,
    MIN_RIGHT_PANEL_WIDTH,
    Math.min(MAX_RIGHT_PANEL_WIDTH, maxRightWidth)
  )
);
      }
    }

    function cleanup() {
      document.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("pointerup", handlePointerUp);
      document.removeEventListener("pointercancel", handlePointerCancel);

      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    }

    function handlePointerUp() {
      cleanup();
    }

    function handlePointerCancel() {
      cleanup();
    }

    document.addEventListener("pointermove", handlePointerMove);
    document.addEventListener("pointerup", handlePointerUp);
    document.addEventListener("pointercancel", handlePointerCancel);
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
    <div
      ref={editorShellRef}
      style={{
        ...styles.editorShell,
        gridTemplateColumns: `${leftPanelWidth}px ${RESIZER_WIDTH}px minmax(0, 1fr) ${RESIZER_WIDTH}px ${rightPanelWidth}px`,
      }}
    >
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
                            const collectionKey = getCollectionKeyFromKind(moduleKind);
                            if (!collectionKey) return;

                            const instance = createModuleInstance(moduleDefinition);

                            if (!firstBlock) {
                              const newBlock = createBlock();

                              commitBlocks([
                                {
                                  ...newBlock,
                                  [collectionKey]: [instance],
                                },
                              ]);

                              setSelectedModuleId(instance.id);
                              return;
                            }

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

      <div
        style={styles.panelResizer}
        onPointerDown={(event) => startPanelResize(event, "left")}
        title="Resize modules panel"
      >
        <div style={styles.panelResizerLine} />
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
              onRunBlock={onRunBlock}
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

      <div
        style={styles.panelResizer}
        onPointerDown={(event) => startPanelResize(event, "right")}
        title="Resize settings panel"
      >
        <div style={styles.panelResizerLine} />
      </div>

      {renderSettingsPanel()}
      {renderFloatingModule()}
    </div>
  );
}

export default AutomationEditor;