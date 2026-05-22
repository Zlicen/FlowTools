function Toolbar({ children, style }) {
  return <div style={{ ...styles.toolbar, ...style }}>{children}</div>;
}

const styles = {
  toolbar: {
    display: "flex",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "10px",
  },
};

export default Toolbar;
