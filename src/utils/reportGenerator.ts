import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Student, Faculty, ClassEntity, AcademicYear } from '../types';
import { downloadFile } from './exportUtils';

export interface ReportGenerationOptions {
  title?: string;
  departmentFilter?: string; // 'ALL' or specific department
  includeCohortTrends?: boolean;
  includeCoordinatorAudit?: boolean;
  includeDepartmentMatrix?: boolean;
  activeAcademicYear?: AcademicYear;
}

export interface DepartmentAnalyticsData {
  department: string;
  fullName: string;
  students: number;
  faculties: number;
  classes: number;
  ratioValue: number;
  avgCgpa: number;
  avgAttendance: number;
  status: 'Ideal' | 'Moderate' | 'High Load';
}

export interface CohortTrendData {
  year: number;
  total: number;
  btech: number;
  bca: number;
  mca: number;
  mba: number;
  mtech: number;
}

/**
 * Compute aggregated analytics for the report
 */
export const computeReportAnalytics = (
  students: Student[],
  faculties: Faculty[],
  classes: ClassEntity[],
  departmentFilter = 'ALL'
) => {
  const filteredStudents =
    departmentFilter === 'ALL'
      ? students
      : students.filter((s) => s.department === departmentFilter);

  const filteredFaculties =
    departmentFilter === 'ALL'
      ? faculties
      : faculties.filter((f) => f.department === departmentFilter);

  const filteredClasses =
    departmentFilter === 'ALL'
      ? classes
      : classes.filter((c) => c.department === departmentFilter);

  // Shorten department helper
  const getShortDept = (dept: string) => {
    return dept
      .replace('Computer Science & Engineering', 'CSE')
      .replace('Information Technology', 'IT')
      .replace('Electronics & Communication', 'ECE')
      .replace('Mechanical Engineering', 'MECH')
      .replace('Artificial Intelligence & Data Science', 'AI & DS')
      .replace('Management Studies (MBA)', 'MBA')
      .replace('Computer Applications (BCA/MCA)', 'BCA');
  };

  // Department analytics map
  const deptMap: {
    [dept: string]: {
      department: string;
      fullName: string;
      students: number;
      faculties: number;
      classes: number;
      cgpaSum: number;
      attendanceSum: number;
    };
  } = {};

  // Initialize departments
  const allDepts = Array.from(
    new Set([
      ...students.map((s) => s.department),
      ...faculties.map((f) => f.department),
      ...classes.map((c) => c.department),
    ])
  );

  allDepts.forEach((dept) => {
    if (departmentFilter !== 'ALL' && dept !== departmentFilter) return;
    const short = getShortDept(dept);
    deptMap[short] = {
      department: short,
      fullName: dept,
      students: 0,
      faculties: 0,
      classes: 0,
      cgpaSum: 0,
      attendanceSum: 0,
    };
  });

  filteredStudents.forEach((s) => {
    const short = getShortDept(s.department);
    if (deptMap[short]) {
      deptMap[short].students += 1;
      deptMap[short].cgpaSum += s.cgpa || 0;
      deptMap[short].attendanceSum += s.attendancePercent || 0;
    }
  });

  filteredFaculties.forEach((f) => {
    const short = getShortDept(f.department);
    if (deptMap[short]) {
      deptMap[short].faculties += 1;
    }
  });

  filteredClasses.forEach((c) => {
    const short = getShortDept(c.department);
    if (deptMap[short]) {
      deptMap[short].classes += 1;
    }
  });

  const departmentAnalytics: DepartmentAnalyticsData[] = Object.values(deptMap).map((item) => {
    const facCount = item.faculties || 1;
    const ratioValue = Number((item.students / facCount).toFixed(1));
    const avgCgpa = item.students > 0 ? Number((item.cgpaSum / item.students).toFixed(2)) : 0;
    const avgAttendance =
      item.students > 0 ? Number((item.attendanceSum / item.students).toFixed(1)) : 0;

    let status: 'Ideal' | 'Moderate' | 'High Load' = 'Ideal';
    if (ratioValue > 20) status = 'High Load';
    else if (ratioValue > 15) status = 'Moderate';

    return {
      department: item.department,
      fullName: item.fullName,
      students: item.students,
      faculties: item.faculties,
      classes: item.classes,
      ratioValue,
      avgCgpa,
      avgAttendance,
      status,
    };
  });

  // Cohort trends
  const yearMap: { [year: number]: CohortTrendData } = {};
  [2021, 2022, 2023, 2024, 2025].forEach((y) => {
    yearMap[y] = { year: y, total: 0, btech: 0, bca: 0, mca: 0, mba: 0, mtech: 0 };
  });

  filteredStudents.forEach((s) => {
    const yr = s.admissionYear || 2024;
    if (!yearMap[yr]) {
      yearMap[yr] = { year: yr, total: 0, btech: 0, bca: 0, mca: 0, mba: 0, mtech: 0 };
    }
    yearMap[yr].total += 1;
    const deg = (s.degree || '').toUpperCase();
    if (deg.includes('B.TECH') || deg.includes('BTECH')) yearMap[yr].btech += 1;
    else if (deg.includes('BCA')) yearMap[yr].bca += 1;
    else if (deg.includes('MCA')) yearMap[yr].mca += 1;
    else if (deg.includes('MBA')) yearMap[yr].mba += 1;
    else if (deg.includes('M.TECH') || deg.includes('MTECH')) yearMap[yr].mtech += 1;
    else yearMap[yr].btech += 1;
  });

  const cohortTrends = Object.values(yearMap).sort((a, b) => a.year - b.year);

  // Overall Global Ratio & Coordinator Stats
  const totalStudents = filteredStudents.length;
  const totalFaculties = filteredFaculties.length;
  const overallRatio = (totalStudents / (totalFaculties || 1)).toFixed(1);
  const assignedClassesCount = filteredClasses.filter((c) => !!c.coordinatorId).length;
  const unassignedClassesCount = filteredClasses.length - assignedClassesCount;
  const coordinatorCoveragePct =
    filteredClasses.length > 0
      ? Math.round((assignedClassesCount / filteredClasses.length) * 100)
      : 100;

  const avgCgpaOverall =
    totalStudents > 0
      ? (
          filteredStudents.reduce((acc, s) => acc + (s.cgpa || 0), 0) / totalStudents
        ).toFixed(2)
      : '0.00';

  const avgAttendanceOverall =
    totalStudents > 0
      ? (
          filteredStudents.reduce((acc, s) => acc + (s.attendancePercent || 0), 0) /
          totalStudents
        ).toFixed(1)
      : '0.0';

  return {
    totalStudents,
    totalFaculties,
    totalClasses: filteredClasses.length,
    overallRatio,
    assignedClassesCount,
    unassignedClassesCount,
    coordinatorCoveragePct,
    avgCgpaOverall,
    avgAttendanceOverall,
    departmentAnalytics,
    cohortTrends,
    filteredStudents,
    filteredFaculties,
    filteredClasses,
  };
};

/**
 * Generate and Download PDF Report
 */
export const exportDashboardReportPDF = (
  students: Student[],
  faculties: Faculty[],
  classes: ClassEntity[],
  options: ReportGenerationOptions = {}
) => {
  const {
    title = 'MYCAGS Academic Enrollment & Faculty Analytics Executive Report',
    departmentFilter = 'ALL',
    includeCohortTrends = true,
    includeCoordinatorAudit = true,
    includeDepartmentMatrix = true,
    activeAcademicYear,
  } = options;

  const data = computeReportAnalytics(students, faculties, classes, departmentFilter);
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const primaryColor: [number, number, number] = [79, 70, 229]; // Indigo #4f46e5
  const secondaryColor: [number, number, number] = [16, 185, 129]; // Emerald #10b981
  const darkTextColor: [number, number, number] = [30, 41, 59]; // Slate 800
  const lightMutedColor: [number, number, number] = [100, 116, 139]; // Slate 500

  // 1. Header Banner
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(0, 0, 210, 28, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.text('MYCAGS - CLASS COORDINATOR & ACADEMIC GOVERNANCE SYSTEM', 14, 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('Institutional Performance, Enrollment Intelligence & Faculty-Student Ratios', 14, 19);

  doc.setFontSize(8);
  doc.text(
    `Academic Year: ${activeAcademicYear?.name || '2024-2025'} | Generated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}`,
    210 - 14,
    19,
    { align: 'right' }
  );

  let currentY = 36;

  // Title section
  doc.setTextColor(darkTextColor[0], darkTextColor[1], darkTextColor[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text(title, 14, currentY);

  currentY += 5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(lightMutedColor[0], lightMutedColor[1], lightMutedColor[2]);
  const deptScopeText =
    departmentFilter === 'ALL'
      ? 'Scope: Entire Institution (All Departments)'
      : `Scope: Filtered Department - ${departmentFilter}`;
  doc.text(`${deptScopeText} | UGC / AICTE Accreditation Benchmark Assessment`, 14, currentY);

  currentY += 8;

  // 2. KPI Summary Boxes (Grid of 4)
  const boxWidth = 43;
  const boxHeight = 18;
  const boxSpacing = 4;
  let startX = 14;

  const kpis = [
    { label: 'Total Enrolled Students', value: `${data.totalStudents}`, sub: 'Active Registry' },
    { label: 'Faculty Strength', value: `${data.totalFaculties}`, sub: 'Teaching Mentors' },
    { label: 'Faculty-Student Ratio', value: `1 : ${data.overallRatio}`, sub: 'UGC Benchmark 1:15' },
    { label: 'Coordinator Coverage', value: `${data.coordinatorCoveragePct}%`, sub: `${data.assignedClassesCount}/${data.totalClasses} Classes` },
  ];

  kpis.forEach((kpi, idx) => {
    const x = startX + idx * (boxWidth + boxSpacing);
    doc.setFillColor(248, 250, 252); // slate-50
    doc.setDrawColor(226, 232, 240); // slate-200
    doc.roundedRect(x, currentY, boxWidth, boxHeight, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text(kpi.value, x + 3, currentY + 7);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(darkTextColor[0], darkTextColor[1], darkTextColor[2]);
    doc.text(kpi.label, x + 3, currentY + 12);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(lightMutedColor[0], lightMutedColor[1], lightMutedColor[2]);
    doc.text(kpi.sub, x + 3, currentY + 16);
  });

  currentY += boxHeight + 8;

  // 3. Department Matrix Table
  if (includeDepartmentMatrix) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(darkTextColor[0], darkTextColor[1], darkTextColor[2]);
    doc.text('1. Departmental Resource & Faculty-to-Student Ratio Matrix', 14, currentY);

    currentY += 2;

    const deptTableBody = data.departmentAnalytics.map((d) => [
      d.department,
      d.fullName,
      d.students.toString(),
      d.faculties.toString(),
      d.classes.toString(),
      `1 : ${d.ratioValue}`,
      d.avgCgpa > 0 ? d.avgCgpa.toString() : 'N/A',
      d.avgAttendance > 0 ? `${d.avgAttendance}%` : 'N/A',
      d.status,
    ]);

    autoTable(doc, {
      startY: currentY,
      head: [
        [
          'Code',
          'Department Name',
          'Students',
          'Faculty',
          'Classes',
          'FSR (1:N)',
          'Avg CGPA',
          'Avg Attend.',
          'FSR Status',
        ],
      ],
      body: deptTableBody,
      theme: 'grid',
      styles: {
        fontSize: 7.5,
        cellPadding: 2,
        textColor: darkTextColor,
        lineColor: [226, 232, 240],
      },
      headStyles: {
        fillColor: primaryColor,
        textColor: [255, 255, 255],
        fontStyle: 'bold',
      },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 15 },
        1: { cellWidth: 50 },
        2: { halign: 'center', cellWidth: 15 },
        3: { halign: 'center', cellWidth: 15 },
        4: { halign: 'center', cellWidth: 14 },
        5: { halign: 'center', fontStyle: 'bold', cellWidth: 18 },
        6: { halign: 'center', cellWidth: 16 },
        7: { halign: 'center', cellWidth: 18 },
        8: { halign: 'center', fontStyle: 'bold', cellWidth: 20 },
      },
      didParseCell: (hookData) => {
        if (hookData.section === 'body' && hookData.column.index === 8) {
          const val = hookData.cell.raw;
          if (val === 'Ideal') {
            hookData.cell.styles.textColor = [16, 185, 129];
          } else if (val === 'Moderate') {
            hookData.cell.styles.textColor = [245, 158, 11];
          } else if (val === 'High Load') {
            hookData.cell.styles.textColor = [239, 68, 68];
          }
        }
      },
    });

    currentY = (doc as any).lastAutoTable.finalY + 8;
  }

  // 4. Cohort Enrollment Breakdown Table
  if (includeCohortTrends) {
    // Check if we need a new page
    if (currentY > 230) {
      doc.addPage();
      currentY = 20;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(darkTextColor[0], darkTextColor[1], darkTextColor[2]);
    doc.text('2. Longitudinal Student Enrollment & Program Intake History', 14, currentY);

    currentY += 2;

    const cohortTableBody = data.cohortTrends.map((c) => [
      `Batch ${c.year}`,
      c.btech.toString(),
      c.bca.toString(),
      c.mca.toString(),
      c.mba.toString(),
      c.mtech.toString(),
      c.total.toString(),
    ]);

    autoTable(doc, {
      startY: currentY,
      head: [['Admission Year', 'B.Tech Intake', 'BCA Intake', 'MCA Intake', 'MBA Intake', 'M.Tech Intake', 'Total Cohort']],
      body: cohortTableBody,
      theme: 'grid',
      styles: {
        fontSize: 7.5,
        cellPadding: 2,
        textColor: darkTextColor,
        lineColor: [226, 232, 240],
      },
      headStyles: {
        fillColor: [59, 130, 246], // Blue #3b82f6
        textColor: [255, 255, 255],
        fontStyle: 'bold',
      },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 35 },
        1: { halign: 'center', cellWidth: 25 },
        2: { halign: 'center', cellWidth: 25 },
        3: { halign: 'center', cellWidth: 25 },
        4: { halign: 'center', cellWidth: 25 },
        5: { halign: 'center', cellWidth: 25 },
        6: { halign: 'center', fontStyle: 'bold', cellWidth: 26 },
      },
    });

    currentY = (doc as any).lastAutoTable.finalY + 8;
  }

  // 5. Governance & Coordinator Summary
  if (includeCoordinatorAudit) {
    if (currentY > 235) {
      doc.addPage();
      currentY = 20;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(darkTextColor[0], darkTextColor[1], darkTextColor[2]);
    doc.text('3. Academic Governance & Coordinator Allocation Summary', 14, currentY);

    currentY += 5;

    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(14, currentY, 182, 26, 2, 2, 'FD');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(darkTextColor[0], darkTextColor[1], darkTextColor[2]);

    const auditLines = [
      `• Total Configured Class Sections: ${data.totalClasses} Sections | Total Students Monitored: ${data.totalStudents}`,
      `• Assigned Class Coordinators: ${data.assignedClassesCount} (${data.coordinatorCoveragePct}% Coverage) | Unassigned Sections: ${data.unassignedClassesCount}`,
      `• Institutional Faculty-to-Student Ratio: 1 : ${data.overallRatio} (Accreditation Benchmark: 1 : 15.0)`,
      `• Overall Student Performance: Average CGPA = ${data.avgCgpaOverall} / 10.0 | Overall Attendance = ${data.avgAttendanceOverall}%`,
    ];

    auditLines.forEach((line, lIdx) => {
      doc.text(line, 18, currentY + 6 + lIdx * 5);
    });

    currentY += 32;
  }

  // Footer on all pages
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(lightMutedColor[0], lightMutedColor[1], lightMutedColor[2]);
    doc.text(
      `MYCAGS System Generated Analytical Document • Page ${i} of ${pageCount} • Confidential Academic Record`,
      105,
      290,
      { align: 'center' }
    );
  }

  const timestamp = new Date().toISOString().slice(0, 10);
  const cleanFilename = `MYCAGS_Academic_Analytics_Report_${timestamp}.pdf`;
  doc.save(cleanFilename);
};

/**
 * Generate and Download CSV Analytical Summary Report
 */
export const exportDashboardReportCSV = (
  students: Student[],
  faculties: Faculty[],
  classes: ClassEntity[],
  options: ReportGenerationOptions = {}
) => {
  const { departmentFilter = 'ALL', activeAcademicYear } = options;
  const data = computeReportAnalytics(students, faculties, classes, departmentFilter);
  const timestamp = new Date().toISOString().slice(0, 10);
  const filename = `MYCAGS_Academic_Analytics_Summary_${timestamp}.csv`;

  const lines: string[] = [];

  // Title & Metadata
  lines.push(`"MYCAGS - ACADEMIC ENROLLMENT & FACULTY ANALYTICS REPORT"`);
  lines.push(`"Academic Year","${activeAcademicYear?.name || '2024-2025'}"`);
  lines.push(`"Generated Date","${new Date().toLocaleString()}"`);
  lines.push(`"Department Filter","${departmentFilter}"`);
  lines.push('');

  // Institutional KPI Summary
  lines.push(`"INSTITUTIONAL PERFORMANCE INDICATORS"`);
  lines.push(`"Metric","Value","Benchmark / Target"`);
  lines.push(`"Total Enrolled Students","${data.totalStudents}","N/A"`);
  lines.push(`"Total Teaching Faculty","${data.totalFaculties}","N/A"`);
  lines.push(`"Total Class Sections","${data.totalClasses}","N/A"`);
  lines.push(`"Institutional Faculty-to-Student Ratio (FSR)","1 : ${data.overallRatio}","1 : 15.0 (AICTE/UGC Standard)"`);
  lines.push(`"Class Coordinator Coverage","${data.coordinatorCoveragePct}%","100% Target"`);
  lines.push(`"Assigned Class Coordinators","${data.assignedClassesCount} Classes","${data.totalClasses} Total"`);
  lines.push(`"Unassigned Classes","${data.unassignedClassesCount} Classes","0 Target"`);
  lines.push(`"Institutional Average CGPA","${data.avgCgpaOverall}","10.0 Scale"`);
  lines.push(`"Institutional Average Attendance","${data.avgAttendanceOverall}%","75% Minimum Mandatory"`);
  lines.push('');

  // Department Breakdown
  lines.push(`"DEPARTMENTAL RESOURCE & RATIO BREAKDOWN"`);
  lines.push(
    `"Department Code","Department Name","Enrolled Students","Faculty Strength","Class Sections","FSR (1:N)","Average CGPA","Average Attendance (%)","Ratio Health Status"`
  );
  data.departmentAnalytics.forEach((d) => {
    lines.push(
      `"${d.department}","${d.fullName}","${d.students}","${d.faculties}","${d.classes}","1 : ${d.ratioValue}","${d.avgCgpa}","${d.avgAttendance}%","${d.status}"`
    );
  });
  lines.push('');

  // Cohort Intake Trends
  lines.push(`"LONGITUDINAL COHORT ENROLLMENT HISTORY (ADMISSIONS)"`);
  lines.push(`"Admission Batch Year","B.Tech Intake","BCA Intake","MCA Intake","MBA Intake","M.Tech Intake","Total Cohort Intake"`);
  data.cohortTrends.forEach((c) => {
    lines.push(`"Batch ${c.year}","${c.btech}","${c.bca}","${c.mca}","${c.mba}","${c.mtech}","${c.total}"`);
  });

  const csvContent = '\uFEFF' + lines.join('\r\n');
  downloadFile(csvContent, filename, 'text/csv;charset=utf-8;');
};
