import { Button } from "../../components/ui";
import { mediaStyles as styles } from "./mediaStyles";

function CreateBinBox({ title, value, onChange, onCreate, disabled }) {
  return (
    <div style={styles.createBox}>
      <div style={styles.createTitle}>📁 New {title}</div>

      <div style={styles.createRow}>
        <input
          style={styles.input}
          value={value}
          placeholder="Enter name..."
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") onCreate();
          }}
        />

        <Button size="sm" variant="add" onClick={onCreate} disabled={disabled}>
          Add
        </Button>
      </div>
    </div>
  );
}

export default CreateBinBox;