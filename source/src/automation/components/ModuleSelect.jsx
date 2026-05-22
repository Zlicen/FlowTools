function ModuleSelect({ value, options, onChange }) {
  return (
    <select
      style={styles.input}
      value={value}
      onChange={(event) => onChange(event.target.value)}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
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

export default ModuleSelect;