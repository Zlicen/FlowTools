function EmptyState({ title, description, actions, style }) {
  return (
    <div style={{ ...styles.wrapper, ...style }}>
      <div style={styles.icon}>＋</div>
      <h2 style={styles.title}>{title}</h2>
      {description && <p style={styles.description}>{description}</p>}
      {actions && <div style={styles.actions}>{actions}</div>}
    </div>
  );
}

const styles = {
  wrapper: {
    border: "1px dashed rgba(255,255,255,0.16)",
    borderRadius: "18px",
    padding: "30px",
    background:
      "radial-gradient(circle at top, rgba(91,53,255,0.12), transparent 42%), rgba(255,255,255,0.035)",
    textAlign: "center",
  },

  icon: {
    width: "42px",
    height: "42px",
    margin: "0 auto 13px",
    borderRadius: "14px",
    background: "linear-gradient(135deg, rgba(91,53,255,0.25), rgba(255,255,255,0.06))",
    border: "1px solid rgba(255,255,255,0.12)",
    color: "#c4b5fd",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "23px",
    fontWeight: "900",
  },

  title: {
    margin: 0,
    fontSize: "18px",
    letterSpacing: "-0.02em",
  },

  description: {
    margin: "8px auto 0",
    maxWidth: "420px",
    color: "#aeb4c2",
    fontSize: "13px",
    lineHeight: 1.55,
  },

  actions: {
    marginTop: "16px",
    display: "flex",
    justifyContent: "center",
    gap: "8px",
  },
};

export default EmptyState;
