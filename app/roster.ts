export type RosterStudent = {
  studentId: string;
  lastName: string;
  firstName: string;
  middleName: string;
  courseCode: string;
  email: string;
};

export type ParsedRoster = {
  fileName: string;
  schoolYear: string;
  term: string;
  subjectCode: string;
  subjectName: string;
  sectionCode: string;
  instructor: string;
  students: RosterStudent[];
};

function text(value: unknown) {
  if (value === null || value === undefined) return "";
  return String(value).trim();
}

function label(value: unknown) {
  return text(value).toUpperCase().replace(/[^A-Z0-9]/g, "");
}

export function studentDisplayName(student: Pick<RosterStudent, "firstName" | "lastName">) {
  const initial = student.lastName.trim().charAt(0).toUpperCase();
  return `${student.firstName.trim()}${initial ? ` ${initial}.` : ""}`;
}

export function parseRosterRows(rows: Array<Array<unknown>>, fileName: string): ParsedRoster {
  const metadata = new Map<string, string>();
  rows.slice(0, 13).forEach((row) => {
    const key = label(row[0]);
    if (key) metadata.set(key, text(row[1]));
  });

  const headerIndex = rows.findIndex((row) => row.some((cell) => label(cell) === "STUDENTID"));
  if (headerIndex < 0) throw new Error("The file does not contain a STUDENT ID roster column.");
  const header = rows[headerIndex].map(label);
  const column = (name: string) => header.indexOf(name);
  const required = ["STUDENTID", "LASTNAME", "FIRSTNAME", "COURSECODE", "EMAIL"];
  if (required.some((name) => column(name) < 0)) throw new Error("The roster must include Student ID, name, course code, and email columns.");

  const students = rows.slice(headerIndex + 1).flatMap((row) => {
    const studentId = text(row[column("STUDENTID")]);
    if (!studentId) return [];
    const student: RosterStudent = {
      studentId,
      lastName: text(row[column("LASTNAME")]),
      firstName: text(row[column("FIRSTNAME")]),
      middleName: column("MIDDLENAME") >= 0 ? text(row[column("MIDDLENAME")]) : "",
      courseCode: text(row[column("COURSECODE")]),
      email: text(row[column("EMAIL")]).toLowerCase(),
    };
    if (!student.firstName || !student.lastName) throw new Error(`Student ${studentId} is missing a first or last name.`);
    return [student];
  });

  const sectionCode = metadata.get("SECTION") ?? "";
  const schoolYear = metadata.get("SCHOOLYEAR") ?? "";
  const term = metadata.get("TERM") ?? "";
  if (!sectionCode || !schoolYear || !term) throw new Error("The file must include Section, School Year, and Term metadata.");
  if (students.length === 0) throw new Error("No student rows were found in this file.");
  if (new Set(students.map((student) => student.studentId.toLowerCase())).size !== students.length) throw new Error("The file contains a duplicate Student ID.");

  return {
    fileName,
    schoolYear,
    term,
    subjectCode: metadata.get("SUBJECTCODE") ?? "RIZLIFE",
    subjectName: metadata.get("SUBJECTNAME") ?? "Life and Works of Rizal",
    sectionCode,
    instructor: metadata.get("INSTRUCTOR") ?? "",
    students,
  };
}

export async function parseRosterFile(file: File): Promise<ParsedRoster> {
  if (!/\.xlsx$/i.test(file.name)) throw new Error("Upload the original .xlsx enrollment file.");
  const { readSheet } = await import("read-excel-file/browser");
  const rows = await readSheet(file);
  return parseRosterRows(rows, file.name);
}
