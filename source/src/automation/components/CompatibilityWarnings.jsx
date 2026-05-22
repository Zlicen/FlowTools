function CompatibilityWarnings({ warnings }) {
  if (!warnings || warnings.length === 0) return null;

  return (
    <div style={styles.box}>
      {warnings.map((warning) => (
        <div key={warning.id} style={styles.warning}>
          ⚠ {warning.message}
        </div>
      ))}
    </div>
  );
}

const styles = {
  box: {
    marginTop: "10px",
    display: "grid",
    gap: "6px",
  },

  warning: {
    backgroundColor: "#3a2b12",
    border: "1px solid #8a641c",
    color: "#ffd991",
    borderRadius: "8px",
    padding: "8px 10px",
    fontSize: "12px",
    lineHeight: 1.4,
  },
};

export default CompatibilityWarnings;