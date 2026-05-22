import { useEffect, useState } from "react";
import { Button } from "../../components/ui";
import { useMediaStore } from "../../store";
import MediaCard from "./MediaCard";
import { mediaStyles as styles } from "./mediaStyles";

function FolderDetails() {
  const {
    selectedFolder: folder,
    selectedFolderType: folderType,
    createChildFolder,
    renameFolder,
    deleteFolder,
    importMedia,
    isSyncing,
  } = useMediaStore();

  const [draftName, setDraftName] = useState(folder.name);

  useEffect(() => {
    setDraftName(folder.name);
  }, [folder.name]);

  async function saveName() {
    const cleanName = draftName.trim();

    if (!cleanName) {
      setDraftName(folder.name);
      return;
    }

    await renameFolder(folder.id, cleanName);
  }

  return (
    <div style={styles.details}>
      <div style={styles.detailsHeader}>
        <div>
          <div style={styles.detailsLabel}>
            {folderType === "power" ? "Power Bin" : "Normal Bin"}
          </div>

          <input
            style={styles.detailsTitleInput}
            value={draftName}
            onChange={(event) => setDraftName(event.target.value)}
            onBlur={saveName}
            onKeyDown={(event) => {
              if (event.key === "Enter") saveName();
            }}
          />
        </div>

        <div style={styles.detailsActions}>
          <Button
            size="sm"
            variant="create"
            onClick={() => createChildFolder(folder.id)}
            disabled={isSyncing}
          >
            + Folder
          </Button>

          <Button
            size="sm"
            variant="import"
            disabled={isSyncing}
            onClick={() => importMedia(folder.id)}
          >
            Import Media
          </Button>

          <Button
            size="sm"
            variant="delete"
            onClick={() => deleteFolder(folder.id)}
            disabled={isSyncing}
          >
            Delete
          </Button>
        </div>
      </div>

      <section style={styles.filesPanel}>
        <div style={styles.filesHeader}>
          <div>
            <h2 style={styles.filesTitle}>Media files</h2>
            <p style={styles.filesSubtitle}>
              {folderType === "power"
                ? "Imported media is also added to the matching Resolve bin."
                : "Imported media is stored as app references for now."}
            </p>
          </div>
        </div>

        {folder.media && folder.media.length > 0 ? (
          <div style={styles.mediaGrid}>
            {folder.media.map((item) => (
              <MediaCard key={item.id} item={item} folderId={folder.id} />
            ))}
          </div>
        ) : (
          <div style={styles.fileGridPlaceholder}>
            <div>
              <div style={styles.emptyIcon}>🎞</div>
              <h3 style={styles.emptyTitle}>No media yet</h3>
              <p style={styles.emptyText}>Import media into this folder.</p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

export default FolderDetails;
