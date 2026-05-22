function ModuleSettingsField({ label, children }) {
  return (
    <label style={styles.field}>
      <span style={styles.label}>{label}</span>
      {children}
    </label>
  );
}

const styles = {
  field: {
    display: "flex",
    flexDirection: "column",
    gap: "5px",
  },

  label: {
    color: "#aaa",
    fontSize: "11px",
    fontWeight: "bold",
  },
};

export default ModuleSettingsField;