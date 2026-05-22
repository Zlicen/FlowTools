function ModuleTextInput({ value, placeholder, onChange }) {
  return (
    <input
      style={styles.input}
      value={value ?? ""}
      placeholder={placeholder}
      onChange={(event) => onChange(event.target.value)}
    />
  );
}

const styles = {
  input: {
    backgroundColor: "#111",
    color: "white",
    border: "1px solid #333",
    borderRadius: "8px",
    padding: "8px 9px",
    outline: "none",
  },
};

export default ModuleTextInput;