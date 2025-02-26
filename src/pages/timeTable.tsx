import React, { useCallback, useEffect } from "react";
import { useMutation } from "@apollo/client";
import { CREATE_FOLDER } from "../api/mutations";
import Button from "@mui/material/Button";
import { DAYS_OF_WEEK } from "../constants/timetable";
import { TimetableRow } from "../components/timeTableRow";
import { useTimetable } from "../hooks/useTimeTable";

// TimeTable component for managing and displaying a student's weekly schedule
const TimeTable: React.FC = () => {
  // Custom hook that manages timetable state and operations
  const { rows, handleCellChange, handleTimeChange, addRow, removeRow } =
    useTimetable();

  // Apollo mutation hook for creating folders
  const [createFolder] = useMutation(CREATE_FOLDER);

  // Persist timetable data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("timetable", JSON.stringify(rows));
  }, [rows]);

  // Handler to save timetable data and create folders for each unique subject
  const saveTimetable = useCallback(async () => {
    try {
      // Extract unique subject names from timetable cells
      const uniqueCells = new Set<string>();
      rows.forEach((row) => {
        row.cells.forEach((cell) => {
          const trimmed = cell.trim();
          if (trimmed) uniqueCells.add(trimmed);
        });
      });

      // Get previously created materials from localStorage
      const createdMaterialsStored = localStorage.getItem("createdMaterials");
      const createdMaterials: Set<string> = createdMaterialsStored
        ? new Set(JSON.parse(createdMaterialsStored))
        : new Set();

      // Create folders for new subjects that haven't been created before
      for (const cellValue of uniqueCells) {
        if (createdMaterials.has(cellValue)) continue;

        await createFolder({
          variables: {
            input: {
              name: cellValue,
              parentId: import.meta.env.VITE_ROOT_FOLDER_ID,
            },
          },
          refetchQueries: ["GET_FOLDERS"], // Refresh folder list after creation
        });
        createdMaterials.add(cellValue);
      }

      // Update localStorage with newly created materials
      localStorage.setItem(
        "createdMaterials",
        JSON.stringify([...createdMaterials])
      );
    } catch (error) {
      console.error("Error saving timetable:", error);
    }
  }, [rows, createFolder]);

  return (
    <div className="overflow-auto p-4">
      <h2 className="text-2xl mb-4">Student Timetable</h2>
      <div className="timeTable-wrapper">
        {/* Timetable grid with days of week as columns */}
        <table className="min-w-full border-collapse">
          <thead>
            <tr>
              <th className="border p-2">Time</th>
              {DAYS_OF_WEEK.map((day) => (
                <th key={day} className="border p-2">
                  {day}
                </th>
              ))}
              <th className="border p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {/* Render each timetable row with time slots and subjects */}
            {rows.map((row, rowIndex) => (
              <TimetableRow
                key={rowIndex}
                row={row}
                rowIndex={rowIndex}
                onTimeChange={handleTimeChange}
                onCellChange={handleCellChange}
                onRemove={removeRow}
              />
            ))}
          </tbody>
        </table>
      </div>
      {/* Control buttons for adding rows and saving timetable */}
      <div className="mt-4 space-x-2">
        <Button variant="contained" color="primary" onClick={addRow}>
          Add Row
        </Button>
        <Button variant="contained" color="secondary" onClick={saveTimetable}>
          Save Timetable
        </Button>
      </div>
    </div>
  );
};

export default TimeTable;
