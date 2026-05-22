function ModuleSettingsBox({ children }) {
  return <div style={styles.box}>{children}</div>;
}

const styles = {
  box: {
    marginTop: "10px",
    backgroundColor: "#181818",
    border: "1px solid #333",
    borderRadius: "10px",
    padding: "12px",
    display: "grid",
    gap: "10px",
  },
};

export default ModuleSettingsBox;