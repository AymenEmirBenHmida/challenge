import { useState, useCallback } from "react";
import { TimeTableRow } from "../interfaces";
import { DEFAULT_ROWS } from "../constants/timetable";

export const useTimetable = () => {
  // Initialize state with data from localStorage or default rows if none exists
  const [rows, setRows] = useState<TimeTableRow[]>(() => {
    const saved = localStorage.getItem("timetable");
    return saved ? JSON.parse(saved) : DEFAULT_ROWS;
  });
  //use call to leiminate unnecessary rerenders
  const handleCellChange = useCallback(
    (rowIndex: number, cellIndex: number, value: string) => {
      setRows((prev) => {
        const updated = [...prev];
        updated[rowIndex] = {
          ...updated[rowIndex],
          cells: [
            ...updated[rowIndex].cells.slice(0, cellIndex),
            value,
            ...updated[rowIndex].cells.slice(cellIndex + 1),
          ],
        };
        return updated;
      });
    },
    []
  );
  // updating time
  const handleTimeChange = useCallback((rowIndex: number, value: string) => {
    setRows((prev) => {
      const updated = [...prev];
      if (updated[rowIndex].time !== value) {
        updated[rowIndex].time = value;
        console.log(`Updating time for row ${rowIndex} to ${value}`);
        console.log("Updated rows:", updated);
      }
      console.log(updated);
      return updated;
    });
  }, []);
  // Add row
  const addRow = useCallback(() => {
    setRows((prev) => [
      ...prev,
      { time: "New Time", cells: Array(7).fill("") },
    ]);
  }, []);
  // Remove Row
  const removeRow = useCallback((rowIndex: number) => {
    setRows((prev) => prev.filter((_, index) => index !== rowIndex));
  }, []);

  return {
    rows,
    handleCellChange,
    handleTimeChange,
    addRow,
    removeRow,
  };
};
