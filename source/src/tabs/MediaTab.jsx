import { Button } from "../components/ui";
import CreateBinBox from "./MediaTab/CreateBinBox";
import FolderDetails from "./MediaTab/FolderDetails";
import TreeGroup from "./MediaTab/TreeGroup";
import { mediaStyles as styles } from "./MediaTab/mediaStyles";
import { MediaStoreProvider, useMediaStore } from "../store";

function MediaTabContent() {
  const {
    bins,
    selectedFolder,
    syncStatus,
    isSyncing,
    binName,
    setBinName,
    createTopBin,
    runSync,
  } = useMediaStore();

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Media</h1>
          <p style={styles.subtitle}>
            Manage bins and choose which parent bins are shown in DaVinci Resolve.
          </p>
        </div>

        <div style={styles.headerActions}>
          <div style={styles.statusPill}>
            <span style={styles.statusDot} />
            <span>{syncStatus}</span>
          </div>

          <Button
            size="sm"
            variant="sync"
            onClick={runSync}
            disabled={isSyncing}
          >
            Sync
          </Button>
        </div>
      </div>

      <div style={styles.resolveWarning}>
          ⚠ Editing integration made bins directly in DaVinci Resolve is not supported and will create duplicates
      </div>

      <div style={styles.browser}>
        <aside style={styles.sidebar}>
          <CreateBinBox
            title="Bin"
            value={binName}
            onChange={setBinName}
            onCreate={createTopBin}
            disabled={isSyncing}
          />

          <div style={styles.treeSection}>
            <TreeGroup title="Bins" bins={bins} />
          </div>
        </aside>

        <main style={styles.content}>
          {selectedFolder ? (
            <FolderDetails />
          ) : (
            <div style={styles.emptyState}>
              <div>
                <div style={styles.emptyIcon}>📁</div>
                <h2 style={styles.emptyTitle}>Select a folder</h2>
                <p style={styles.emptyText}>
                  Choose a bin from the left side.
                </p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function MediaTab() {
  return (
    <MediaStoreProvider>
      <MediaTabContent />
    </MediaStoreProvider>
  );
}

export default MediaTab;