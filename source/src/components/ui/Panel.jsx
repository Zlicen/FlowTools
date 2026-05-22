function Panel({ children, compact = false, style, ...props }) {
  return (
    <section
      {...props}
      style={{
        ...styles.panel,
        padding: compact ? "18px" : "24px",
        ...style,
      }}
    >
      {children}
    </section>
  );
}

const styles = {
  panel: {
    backgroundColor: "#1f1f1f",
    border: "1px solid #333",
    borderRadius: "14px",
    boxSizing: "border-box",
    color: "white",
  },
};

export default Panel;
