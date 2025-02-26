import React from "react";
import { TimetableRowProps } from "../interfaces";
import Button from "@mui/material/Button";

export const TimetableRow: React.FC<TimetableRowProps> = ({
  row,
  rowIndex,
  onTimeChange,
  onCellChange,
  onRemove,
}) => (
  <tr>
    <td className="border p-2">
      <input
        type="text"
        value={row.time}
        onChange={(e) => {
          const newValue = e.target.value;
          console.log(`Time input changed: ${newValue}`);
          onTimeChange(rowIndex, newValue);
        }}
        className="w-full p-1 border rounded"
      />
    </td>
    {row.cells.map((cell, cellIndex) => (
      <td key={cellIndex} className="border p-2">
        <input
          type="text"
          value={cell}
          onChange={(e) => onCellChange(rowIndex, cellIndex, e.target.value)}
          className="w-full p-1 border rounded"
        />
      </td>
    ))}
    <td className="border p-2">
      <Button
        variant="contained"
        color="error"
        onClick={() => onRemove(rowIndex)}
        className="text-xs"
      >
        Remove
      </Button>
    </td>
  </tr>
);
