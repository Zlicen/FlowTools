function SectionHeader({ title, description, eyebrow, actions, style }) {
  return (
    <div style={{ ...styles.wrapper, ...style }}>
      <div style={styles.textArea}>
        {eyebrow && <div style={styles.eyebrow}>{eyebrow}</div>}
        <h1 style={styles.title}>{title}</h1>
        {description && <p style={styles.description}>{description}</p>}
      </div>

      {actions && <div style={styles.actions}>{actions}</div>}
    </div>
  );
}

const styles = {
  wrapper: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: "18px",
    marginBottom: "22px",
  },

  textArea: {
    minWidth: 0,
  },

  eyebrow: {
    display: "inline-flex",
    alignItems: "center",
    height: "24px",
    padding: "0 10px",
    marginBottom: "10px",
    borderRadius: "999px",
    background: "rgba(91,53,255,0.16)",
    border: "1px solid rgba(139,92,246,0.32)",
    color: "#c4b5fd",
    fontSize: "11px",
    fontWeight: "900",
    letterSpacing: "0.04em",
    textTransform: "uppercase",
  },

  title: {
    margin: 0,
    fontSize: "30px",
    lineHeight: 1,
    letterSpacing: "-0.045em",
  },

  description: {
    margin: "10px 0 0",
    color: "#aeb4c2",
    fontSize: "14px",
    lineHeight: 1.55,
    maxWidth: "720px",
  },

  actions: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    flexShrink: 0,
  },
};

export default SectionHeader;
