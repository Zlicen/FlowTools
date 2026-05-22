function ModuleNumberInput({ value, min, max, step = 1, onChange }) {
  return (
    <input
      style={styles.input}
      type="number"
      min={min}
      max={max}
      step={step}
      value={value ?? ""}
      onChange={(event) => onChange(Number(event.target.value || 0))}
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

export default ModuleNumberInput;