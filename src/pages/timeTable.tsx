import React, { useState, useEffect } from "react";
import { useMutation } from "@apollo/client";
import { TimeTableRow } from "../interfaces";
import { CREATE_FOLDER } from "../api/mutations";

// Days of the week for column headers
const daysOfWeek = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const TimeTable: React.FC = () => {
  // Retrieve timetable from localStorage if present. Otherwise, use default timetable.
  const [rows, setRows] = useState<TimeTableRow[]>(() => {
    const saved = localStorage.getItem("timetable");
    return saved
      ? JSON.parse(saved)
      : [
          { time: "8:00 - 10:00", cells: Array(7).fill("") },
          { time: "10:00 - 12:00", cells: Array(7).fill("") },
          { time: "13:00 - 15:00", cells: Array(7).fill("") },
          { time: "15:00 - 17:00", cells: Array(7).fill("") },
        ];
  });

  // GraphQL mutation to create a folder (i.e., a material)
  const [createFolder] = useMutation(CREATE_FOLDER);

  // Save the current timetable in localStorage anytime rows change
  useEffect(() => {
    localStorage.setItem("timetable", JSON.stringify(rows));
  }, [rows]);

  // Update a specific cell when text input changes
  const handleCellChange = (
    rowIndex: number,
    cellIndex: number,
    value: string
  ) => {
    const updatedRows = [...rows];
    updatedRows[rowIndex].cells[cellIndex] = value;
    setRows(updatedRows);
  };

  // Update a row's time string
  const handleTimeChange = (rowIndex: number, value: string) => {
    const updatedRows = [...rows];
    updatedRows[rowIndex].time = value;
    setRows(updatedRows);
  };

  // Adds a new row with default values
  const addRow = () => {
    const newRow: TimeTableRow = { time: "New Time", cells: Array(7).fill("") };
    setRows([...rows, newRow]);
  };

  // Removes a row by index
  const removeRow = (rowIndex: number) => {
    const updatedRows = rows.filter((_, index) => index !== rowIndex);
    setRows(updatedRows);
  };

  // Save timetable by creating folders for unique cell values that haven't been created before.
  const saveTimetable = async () => {
    // Save current timetable locally
    localStorage.setItem("timetable", JSON.stringify(rows));
    console.log("Saved Timetable:", rows);

    // Collect unique, non-empty cell values from all rows
    const uniqueCells = new Set<string>();
    rows.forEach((row) => {
      row.cells.forEach((cell) => {
        const trimmed = cell.trim();
        if (trimmed) uniqueCells.add(trimmed);
      });
    });

    // Retrieve list of materials (cells) already created from localStorage
    const createdMaterialsStored = localStorage.getItem("createdMaterials");
    const createdMaterials: Set<string> = createdMaterialsStored
      ? new Set(JSON.parse(createdMaterialsStored))
      : new Set();

    // Loop over each unique cell value and create a folder only if it hasn't been created before
    for (let cellValue of uniqueCells) {
      if (createdMaterials.has(cellValue)) {
        console.log(`Material "${cellValue}" already created. Skipping.`);
        continue;
      }
      try {
        await createFolder({
          variables: {
            input: {
              name: cellValue,
              parentId: import.meta.env.VITE_ROOT_FOLDER_ID,
            },
          },
        });
        console.log(`Folder created for "${cellValue}"`);
        // Mark this material as created by adding it to the set
        createdMaterials.add(cellValue);
      } catch (err) {
        console.error(`Error creating folder for "${cellValue}":`, err);
      }
    }
    // Store the updated set of created materials for future checks
    localStorage.setItem(
      "createdMaterials",
      JSON.stringify([...createdMaterials])
    );
  };

  return (
    <div style={{ overflow: "auto" }}>
      <h2>Student Timetable</h2>
      <div className="timeTable-wrapper">
        <table cellPadding="5" style={{ overflow: "auto" }}>
          <thead>
            <tr>
              <th>Time</th>
              {daysOfWeek.map((day) => (
                <th key={day}>{day}</th>
              ))}
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={rowIndex}>
                <td>
                  <input
                    type="text"
                    value={row.time}
                    onChange={(e) => handleTimeChange(rowIndex, e.target.value)}
                  />
                </td>
                {row.cells.map((cell, cellIndex) => (
                  <td key={cellIndex}>
                    <input
                      type="text"
                      value={cell}
                      onChange={(e) =>
                        handleCellChange(rowIndex, cellIndex, e.target.value)
                      }
                    />
                  </td>
                ))}
                <td>
                  <button onClick={() => removeRow(rowIndex)}>Remove</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button onClick={addRow}>Add Row</button>
      <button onClick={saveTimetable}>Save Timetable</button>
    </div>
  );
};

export default TimeTable;
