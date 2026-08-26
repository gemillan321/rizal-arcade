import assert from "node:assert/strict";
import test from "node:test";
import { parseRosterRows, studentDisplayName } from "../app/roster.ts";

test("treats one enrollment workbook as one section despite mixed course codes", () => {
  const rows = [
    ["School Year:", "2026-2027"],
    ["Term:", "1st Term"],
    ["Subject Code:", "RIZLIFE"],
    ["Subject Name:", "Life and Works of Rizal"],
    ["Section:", "CS241/SF242"],
    ["Units:", 3],
    ["Instructor:", "Sample Instructor"],
    [], [], [], [], [], [],
    ["#", "STUDENT ID", "LAST NAME", "FIRST NAME", "MIDDLE NAME", "COURSE CODE", "EMAIL"],
    [1, "2026-0001", "Dela Cruz", "Ana", "M", "BSCS", "ana@example.edu"],
    [2, "2026-0002", "Santos", "Ben", "", "BSIT", "ben@example.edu"],
  ];
  const roster = parseRosterRows(rows, "sample.xlsx");
  assert.equal(roster.sectionCode, "CS241/SF242");
  assert.equal(roster.students.length, 2);
  assert.deepEqual(roster.students.map((student) => student.courseCode), ["BSCS", "BSIT"]);
  assert.equal(studentDisplayName(roster.students[0]), "Ana D.");
});
