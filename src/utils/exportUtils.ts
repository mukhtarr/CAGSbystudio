import { Student, Faculty, ClassEntity, Subject } from '../types';

/**
 * Utility helper to trigger client-side file download using Blob
 */
export const downloadFile = (content: string, filename: string, mimeType: string) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
};

/**
 * Clean and escape strings for RFC 4180 CSV compliance
 */
const escapeCSV = (value: string | number | boolean | null | undefined): string => {
  if (value === null || value === undefined) return '""';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return `"${str}"`;
};

/**
 * Format date nicely for exports
 */
export const formatExportDate = (dateStr?: string): string => {
  if (!dateStr) return 'N/A';
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
};

/* =========================================================================
   STUDENT EXPORT UTILITIES
   ========================================================================= */

export interface StudentExportRow {
  student: Student;
  assignedClass?: ClassEntity;
  coordinator?: Faculty;
}

export const prepareStudentRows = (
  students: Student[],
  classes: ClassEntity[],
  faculties: Faculty[]
): StudentExportRow[] => {
  const classMap = new Map<string, ClassEntity>(classes.map((c) => [c.id, c]));
  const facultyMap = new Map<string, Faculty>(faculties.map((f) => [f.id, f]));

  return students.map((student) => {
    const assignedClass = student.classId ? classMap.get(student.classId) : undefined;
    const coordinator =
      assignedClass && assignedClass.coordinatorId
        ? facultyMap.get(assignedClass.coordinatorId)
        : undefined;

    return {
      student,
      assignedClass,
      coordinator,
    };
  });
};

/**
 * Export Students to CSV
 */
export const exportStudentsToCSV = (
  students: Student[],
  classes: ClassEntity[],
  faculties: Faculty[],
  filenamePrefix = 'MYCAGS_Students_Roster'
) => {
  const rows = prepareStudentRows(students, classes, faculties);
  const timestamp = new Date().toISOString().slice(0, 10);
  const filename = `${filenamePrefix}_${timestamp}.csv`;

  const headers = [
    'Roll Number',
    'PRN Number',
    'First Name',
    'Last Name',
    'Full Name',
    'Email Address',
    'Mobile Phone',
    'Gender',
    'Date of Birth',
    'Department',
    'Degree',
    'Semester',
    'Section',
    'Assigned Class Section',
    'Classroom & Shift',
    'Designated Class Coordinator',
    'Coordinator Email',
    'Admission Year',
    'Current CGPA',
    'Attendance %',
    'Academic Status',
    'Blood Group',
    'Guardian Name',
    'Guardian Phone',
    'Residential Address',
    'Enrollment Date',
  ];

  const csvRows = rows.map(({ student, assignedClass, coordinator }) => [
    escapeCSV(student.rollNo),
    escapeCSV(student.prnNo),
    escapeCSV(student.firstName),
    escapeCSV(student.lastName),
    escapeCSV(`${student.firstName} ${student.lastName}`),
    escapeCSV(student.email),
    escapeCSV(student.phone),
    escapeCSV(student.gender),
    escapeCSV(student.dob),
    escapeCSV(student.department),
    escapeCSV(student.degree),
    escapeCSV(`Sem ${student.semester}`),
    escapeCSV(student.section),
    escapeCSV(assignedClass ? assignedClass.name : 'Unassigned'),
    escapeCSV(
      assignedClass ? `Room: ${assignedClass.roomNumber} (${assignedClass.shift})` : 'N/A'
    ),
    escapeCSV(coordinator ? `${coordinator.firstName} ${coordinator.lastName} (${coordinator.designation})` : 'None Assigned'),
    escapeCSV(coordinator ? coordinator.email : 'N/A'),
    escapeCSV(student.admissionYear),
    escapeCSV(student.cgpa.toFixed(2)),
    escapeCSV(`${student.attendancePercent}%`),
    escapeCSV(student.status),
    escapeCSV(student.bloodGroup || 'N/A'),
    escapeCSV(student.guardianName || 'N/A'),
    escapeCSV(student.guardianPhone || 'N/A'),
    escapeCSV(student.address || 'N/A'),
    escapeCSV(formatExportDate(student.createdAt)),
  ]);

  // Include UTF-8 BOM for Microsoft Excel compatibility
  const csvContent = '\uFEFF' + [headers.map(escapeCSV).join(','), ...csvRows.map((r) => r.join(','))].join('\r\n');

  downloadFile(csvContent, filename, 'text/csv;charset=utf-8;');
};

/**
 * Export Students to Excel-Compatible Spreadsheet (XML Spreadsheet 2003)
 */
export const exportStudentsToExcel = (
  students: Student[],
  classes: ClassEntity[],
  faculties: Faculty[],
  filenamePrefix = 'MYCAGS_Students_Records'
) => {
  const rows = prepareStudentRows(students, classes, faculties);
  const timestamp = new Date().toISOString().slice(0, 10);
  const filename = `${filenamePrefix}_${timestamp}.xls`;

  const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
 <Styles>
  <Style ss:ID="Default" ss:Name="Normal">
   <Alignment ss:Vertical="Center"/>
   <Borders/>
   <Font ss:FontName="Segoe UI" x:Family="Swiss" ss:Size="10" ss:Color="#1E293B"/>
   <Interior/>
   <NumberFormat/>
   <Protection/>
  </Style>
  <Style ss:ID="TitleStyle">
   <Font ss:FontName="Segoe UI" x:Family="Swiss" ss:Size="14" ss:Color="#1E1B4B" ss:Bold="1"/>
   <Interior ss:Color="#EEF2FF" ss:Pattern="Solid"/>
   <Alignment ss:Vertical="Center" ss:Horizontal="Left"/>
  </Style>
  <Style ss:ID="SubTitleStyle">
   <Font ss:FontName="Segoe UI" x:Family="Swiss" ss:Size="9" ss:Color="#475569" ss:Italic="1"/>
   <Alignment ss:Vertical="Center" ss:Horizontal="Left"/>
  </Style>
  <Style ss:ID="HeaderStyle">
   <Font ss:FontName="Segoe UI" x:Family="Swiss" ss:Size="10" ss:Color="#FFFFFF" ss:Bold="1"/>
   <Interior ss:Color="#4F46E5" ss:Pattern="Solid"/>
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#3730A3"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#3730A3"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#3730A3"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#3730A3"/>
   </Borders>
  </Style>
  <Style ss:ID="DataCell">
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
   </Borders>
   <Alignment ss:Vertical="Center"/>
  </Style>
  <Style ss:ID="CenterDataCell">
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
   </Borders>
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
  </Style>
  <Style ss:ID="NumberCell">
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
   </Borders>
   <Alignment ss:Horizontal="Right" ss:Vertical="Center"/>
   <NumberFormat ss:Format="0.00"/>
  </Style>
  <Style ss:ID="PercentCell">
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
   </Borders>
   <Alignment ss:Horizontal="Right" ss:Vertical="Center"/>
   <NumberFormat ss:Format="0%"/>
  </Style>
 </Styles>
 <Worksheet ss:Name="Students Roster">
  <Table ss:ExpandedColumnCount="20" x:FullColumns="1" x:FullRows="1" ss:DefaultRowHeight="20">
   <Column ss:Width="85"/>
   <Column ss:Width="110"/>
   <Column ss:Width="130"/>
   <Column ss:Width="160"/>
   <Column ss:Width="100"/>
   <Column ss:Width="180"/>
   <Column ss:Width="65"/>
   <Column ss:Width="60"/>
   <Column ss:Width="50"/>
   <Column ss:Width="160"/>
   <Column ss:Width="140"/>
   <Column ss:Width="160"/>
   <Column ss:Width="65"/>
   <Column ss:Width="70"/>
   <Column ss:Width="75"/>
   <Column ss:Width="120"/>
   <Column ss:Width="100"/>
   <Column ss:Width="180"/>
   <Column ss:Width="90"/>
   <Row ss:Height="30">
    <Cell ss:MergeAcross="18" ss:StyleID="TitleStyle"><Data ss:Type="String">MYCAGS - Official Student Academic Roster &amp; Profile Directory</Data></Cell>
   </Row>
   <Row ss:Height="20">
    <Cell ss:MergeAcross="18" ss:StyleID="SubTitleStyle"><Data ss:Type="String">Generated on ${new Date().toLocaleString()} | Total Records: ${students.length}</Data></Cell>
   </Row>
   <Row ss:Height="24">
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Roll No</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">PRN Number</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Student Name</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Email Address</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Phone</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Department</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Degree</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Semester</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Section</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Assigned Class Section</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Room &amp; Shift</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Class Coordinator</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Admission</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">CGPA</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Attendance</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Status</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Guardian Contact</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Address</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Enrolled Date</Data></Cell>
   </Row>
   ${rows
     .map(({ student, assignedClass, coordinator }) => {
       const escapeXml = (unsafe: string | number | undefined | null) => {
         if (unsafe === undefined || unsafe === null) return '';
         return String(unsafe)
           .replace(/&/g, '&amp;')
           .replace(/</g, '&lt;')
           .replace(/>/g, '&gt;')
           .replace(/"/g, '&quot;')
           .replace(/'/g, '&apos;');
       };

       return `<Row ss:Height="20">
    <Cell ss:StyleID="CenterDataCell"><Data ss:Type="String">${escapeXml(student.rollNo)}</Data></Cell>
    <Cell ss:StyleID="CenterDataCell"><Data ss:Type="String">${escapeXml(student.prnNo)}</Data></Cell>
    <Cell ss:StyleID="DataCell"><Data ss:Type="String">${escapeXml(`${student.firstName} ${student.lastName}`)}</Data></Cell>
    <Cell ss:StyleID="DataCell"><Data ss:Type="String">${escapeXml(student.email)}</Data></Cell>
    <Cell ss:StyleID="CenterDataCell"><Data ss:Type="String">${escapeXml(student.phone)}</Data></Cell>
    <Cell ss:StyleID="DataCell"><Data ss:Type="String">${escapeXml(student.department)}</Data></Cell>
    <Cell ss:StyleID="CenterDataCell"><Data ss:Type="String">${escapeXml(student.degree)}</Data></Cell>
    <Cell ss:StyleID="CenterDataCell"><Data ss:Type="String">Sem ${student.semester}</Data></Cell>
    <Cell ss:StyleID="CenterDataCell"><Data ss:Type="String">${escapeXml(student.section)}</Data></Cell>
    <Cell ss:StyleID="DataCell"><Data ss:Type="String">${escapeXml(assignedClass ? assignedClass.name : 'Unassigned')}</Data></Cell>
    <Cell ss:StyleID="CenterDataCell"><Data ss:Type="String">${escapeXml(assignedClass ? `Room ${assignedClass.roomNumber} (${assignedClass.shift})` : 'N/A')}</Data></Cell>
    <Cell ss:StyleID="DataCell"><Data ss:Type="String">${escapeXml(coordinator ? `${coordinator.firstName} ${coordinator.lastName}` : 'None Assigned')}</Data></Cell>
    <Cell ss:StyleID="CenterDataCell"><Data ss:Type="Number">${student.admissionYear}</Data></Cell>
    <Cell ss:StyleID="NumberCell"><Data ss:Type="Number">${student.cgpa.toFixed(2)}</Data></Cell>
    <Cell ss:StyleID="CenterDataCell"><Data ss:Type="String">${student.attendancePercent}%</Data></Cell>
    <Cell ss:StyleID="CenterDataCell"><Data ss:Type="String">${escapeXml(student.status)}</Data></Cell>
    <Cell ss:StyleID="DataCell"><Data ss:Type="String">${escapeXml(student.guardianPhone ? `${student.guardianName || 'Guardian'}: ${student.guardianPhone}` : 'N/A')}</Data></Cell>
    <Cell ss:StyleID="DataCell"><Data ss:Type="String">${escapeXml(student.address || 'N/A')}</Data></Cell>
    <Cell ss:StyleID="CenterDataCell"><Data ss:Type="String">${formatExportDate(student.createdAt)}</Data></Cell>
   </Row>`;
     })
     .join('\n   ')}
  </Table>
 </Worksheet>
</Workbook>`;

  downloadFile(xmlContent, filename, 'application/vnd.ms-excel;charset=utf-8;');
};

/* =========================================================================
   FACULTY EXPORT UTILITIES
   ========================================================================= */

export interface FacultyExportRow {
  faculty: Faculty;
  assignedClasses: ClassEntity[];
}

export const prepareFacultyRows = (
  faculties: Faculty[],
  classes: ClassEntity[]
): FacultyExportRow[] => {
  return faculties.map((faculty) => {
    const assignedClasses = classes.filter((c) => c.coordinatorId === faculty.id);
    return {
      faculty,
      assignedClasses,
    };
  });
};

/**
 * Export Faculties to CSV
 */
export const exportFacultiesToCSV = (
  faculties: Faculty[],
  classes: ClassEntity[],
  filenamePrefix = 'MYCAGS_Faculty_Directory'
) => {
  const rows = prepareFacultyRows(faculties, classes);
  const timestamp = new Date().toISOString().slice(0, 10);
  const filename = `${filenamePrefix}_${timestamp}.csv`;

  const headers = [
    'Employee Code',
    'First Name',
    'Last Name',
    'Full Name',
    'Email Address',
    'Phone Number',
    'Office Room',
    'Department',
    'Designation',
    'Highest Qualification',
    'Experience (Years)',
    'Research Specialization',
    'Assigned Teaching Subjects',
    'Coordinator Duty Eligibility',
    'Currently Coordinated Classes',
    'Total Assigned Classes',
    'Employment Status',
    'Date of Joining',
  ];

  const csvRows = rows.map(({ faculty, assignedClasses }) => [
    escapeCSV(faculty.employeeCode),
    escapeCSV(faculty.firstName),
    escapeCSV(faculty.lastName),
    escapeCSV(`${faculty.firstName} ${faculty.lastName}`),
    escapeCSV(faculty.email),
    escapeCSV(faculty.phone),
    escapeCSV(faculty.officeRoom || 'N/A'),
    escapeCSV(faculty.department),
    escapeCSV(faculty.designation),
    escapeCSV(faculty.qualification),
    escapeCSV(faculty.experienceYears),
    escapeCSV(faculty.specialization || 'N/A'),
    escapeCSV(faculty.assignedSubjects.join('; ')),
    escapeCSV(faculty.isCoordinatorEligible ? 'Eligible' : 'Ineligible'),
    escapeCSV(assignedClasses.map((c) => c.name).join('; ') || 'None'),
    escapeCSV(assignedClasses.length),
    escapeCSV(faculty.status),
    escapeCSV(formatExportDate(faculty.dateOfJoining)),
  ]);

  const csvContent = '\uFEFF' + [headers.map(escapeCSV).join(','), ...csvRows.map((r) => r.join(','))].join('\r\n');

  downloadFile(csvContent, filename, 'text/csv;charset=utf-8;');
};

/**
 * Export Faculties to Excel-Compatible Spreadsheet (XML Spreadsheet 2003)
 */
export const exportFacultiesToExcel = (
  faculties: Faculty[],
  classes: ClassEntity[],
  filenamePrefix = 'MYCAGS_Faculty_Directory'
) => {
  const rows = prepareFacultyRows(faculties, classes);
  const timestamp = new Date().toISOString().slice(0, 10);
  const filename = `${filenamePrefix}_${timestamp}.xls`;

  const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
 <Styles>
  <Style ss:ID="Default" ss:Name="Normal">
   <Alignment ss:Vertical="Center"/>
   <Borders/>
   <Font ss:FontName="Segoe UI" x:Family="Swiss" ss:Size="10" ss:Color="#1E293B"/>
   <Interior/>
   <NumberFormat/>
   <Protection/>
  </Style>
  <Style ss:ID="TitleStyle">
   <Font ss:FontName="Segoe UI" x:Family="Swiss" ss:Size="14" ss:Color="#064E3B" ss:Bold="1"/>
   <Interior ss:Color="#ECFDF5" ss:Pattern="Solid"/>
   <Alignment ss:Vertical="Center" ss:Horizontal="Left"/>
  </Style>
  <Style ss:ID="SubTitleStyle">
   <Font ss:FontName="Segoe UI" x:Family="Swiss" ss:Size="9" ss:Color="#475569" ss:Italic="1"/>
   <Alignment ss:Vertical="Center" ss:Horizontal="Left"/>
  </Style>
  <Style ss:ID="HeaderStyle">
   <Font ss:FontName="Segoe UI" x:Family="Swiss" ss:Size="10" ss:Color="#FFFFFF" ss:Bold="1"/>
   <Interior ss:Color="#059669" ss:Pattern="Solid"/>
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#047857"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#047857"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#047857"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#047857"/>
   </Borders>
  </Style>
  <Style ss:ID="DataCell">
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
   </Borders>
   <Alignment ss:Vertical="Center"/>
  </Style>
  <Style ss:ID="CenterDataCell">
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
   </Borders>
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
  </Style>
 </Styles>
 <Worksheet ss:Name="Faculty Directory">
  <Table ss:ExpandedColumnCount="18" x:FullColumns="1" x:FullRows="1" ss:DefaultRowHeight="20">
   <Column ss:Width="95"/>
   <Column ss:Width="140"/>
   <Column ss:Width="170"/>
   <Column ss:Width="105"/>
   <Column ss:Width="85"/>
   <Column ss:Width="180"/>
   <Column ss:Width="140"/>
   <Column ss:Width="180"/>
   <Column ss:Width="70"/>
   <Column ss:Width="190"/>
   <Column ss:Width="200"/>
   <Column ss:Width="100"/>
   <Column ss:Width="180"/>
   <Column ss:Width="80"/>
   <Column ss:Width="80"/>
   <Column ss:Width="90"/>
   <Row ss:Height="30">
    <Cell ss:MergeAcross="15" ss:StyleID="TitleStyle"><Data ss:Type="String">MYCAGS - Faculty Directory &amp; Governance Records</Data></Cell>
   </Row>
   <Row ss:Height="20">
    <Cell ss:MergeAcross="15" ss:StyleID="SubTitleStyle"><Data ss:Type="String">Generated on ${new Date().toLocaleString()} | Total Faculty: ${faculties.length}</Data></Cell>
   </Row>
   <Row ss:Height="24">
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Employee Code</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Faculty Name</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Email Address</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Phone Number</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Office Room</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Department</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Designation</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Highest Qualification</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Experience</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Research Specialization</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Assigned Teaching Subjects</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Coordinator Status</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Assigned Classes</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Class Count</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Status</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Date of Joining</Data></Cell>
   </Row>
   ${rows
     .map(({ faculty, assignedClasses }) => {
       const escapeXml = (unsafe: string | number | undefined | null) => {
         if (unsafe === undefined || unsafe === null) return '';
         return String(unsafe)
           .replace(/&/g, '&amp;')
           .replace(/</g, '&lt;')
           .replace(/>/g, '&gt;')
           .replace(/"/g, '&quot;')
           .replace(/'/g, '&apos;');
       };

       return `<Row ss:Height="20">
    <Cell ss:StyleID="CenterDataCell"><Data ss:Type="String">${escapeXml(faculty.employeeCode)}</Data></Cell>
    <Cell ss:StyleID="DataCell"><Data ss:Type="String">${escapeXml(`${faculty.firstName} ${faculty.lastName}`)}</Data></Cell>
    <Cell ss:StyleID="DataCell"><Data ss:Type="String">${escapeXml(faculty.email)}</Data></Cell>
    <Cell ss:StyleID="CenterDataCell"><Data ss:Type="String">${escapeXml(faculty.phone)}</Data></Cell>
    <Cell ss:StyleID="CenterDataCell"><Data ss:Type="String">${escapeXml(faculty.officeRoom || 'N/A')}</Data></Cell>
    <Cell ss:StyleID="DataCell"><Data ss:Type="String">${escapeXml(faculty.department)}</Data></Cell>
    <Cell ss:StyleID="DataCell"><Data ss:Type="String">${escapeXml(faculty.designation)}</Data></Cell>
    <Cell ss:StyleID="DataCell"><Data ss:Type="String">${escapeXml(faculty.qualification)}</Data></Cell>
    <Cell ss:StyleID="CenterDataCell"><Data ss:Type="String">${faculty.experienceYears} Years</Data></Cell>
    <Cell ss:StyleID="DataCell"><Data ss:Type="String">${escapeXml(faculty.specialization || 'N/A')}</Data></Cell>
    <Cell ss:StyleID="DataCell"><Data ss:Type="String">${escapeXml(faculty.assignedSubjects.join(', ') || 'N/A')}</Data></Cell>
    <Cell ss:StyleID="CenterDataCell"><Data ss:Type="String">${faculty.isCoordinatorEligible ? 'Eligible' : 'Ineligible'}</Data></Cell>
    <Cell ss:StyleID="DataCell"><Data ss:Type="String">${escapeXml(assignedClasses.map((c) => c.name).join(', ') || 'None')}</Data></Cell>
    <Cell ss:StyleID="CenterDataCell"><Data ss:Type="Number">${assignedClasses.length}</Data></Cell>
    <Cell ss:StyleID="CenterDataCell"><Data ss:Type="String">${escapeXml(faculty.status)}</Data></Cell>
    <Cell ss:StyleID="CenterDataCell"><Data ss:Type="String">${formatExportDate(faculty.dateOfJoining)}</Data></Cell>
   </Row>`;
     })
     .join('\n   ')}
  </Table>
 </Worksheet>
</Workbook>`;

  downloadFile(xmlContent, filename, 'application/vnd.ms-excel;charset=utf-8;');
};

/* =========================================================================
   SUBJECT EXPORT UTILITIES
   ========================================================================= */

export const exportSubjectsToCSV = (
  subjects: Subject[],
  faculties: Faculty[],
  filenamePrefix = 'MYCAGS_Academic_Subjects'
) => {
  const facultyMap = new Map<string, Faculty>(faculties.map((f) => [f.id, f]));
  const timestamp = new Date().toISOString().slice(0, 10);
  const filename = `${filenamePrefix}_${timestamp}.csv`;

  const headers = [
    'Subject Code',
    'Subject Name',
    'Department',
    'Degree',
    'Semester',
    'Type',
    'Credits',
    'Lecture Hours (L)',
    'Practical Hours (P)',
    'Total Hours/Week',
    'Assigned Faculty Names',
    'Assigned Faculty Count',
    'Status',
    'Description',
    'Created At',
  ];

  const rows = subjects.map((sub) => {
    const assignedFacs = (sub.assignedFacultyIds || [])
      .map((id) => {
        const fac = facultyMap.get(id);
        return fac ? `${fac.firstName} ${fac.lastName} (${fac.employeeCode})` : null;
      })
      .filter(Boolean);

    return [
      escapeCSV(sub.code),
      escapeCSV(sub.name),
      escapeCSV(sub.department),
      escapeCSV(sub.degree),
      escapeCSV(`Semester ${sub.semester}`),
      escapeCSV(sub.type),
      escapeCSV(sub.credits),
      escapeCSV(sub.lectureHoursPerWeek),
      escapeCSV(sub.practicalHoursPerWeek),
      escapeCSV(sub.lectureHoursPerWeek + sub.practicalHoursPerWeek),
      escapeCSV(assignedFacs.join('; ') || 'Unassigned'),
      escapeCSV(assignedFacs.length),
      escapeCSV(sub.status),
      escapeCSV(sub.description || 'N/A'),
      escapeCSV(formatExportDate(sub.createdAt)),
    ].join(',');
  });

  const csvContent = [headers.join(','), ...rows].join('\r\n');
  downloadFile(csvContent, filename, 'text/csv;charset=utf-8;');
};

export const exportSubjectsToExcel = (
  subjects: Subject[],
  faculties: Faculty[],
  filenamePrefix = 'MYCAGS_Academic_Subjects'
) => {
  const facultyMap = new Map<string, Faculty>(faculties.map((f) => [f.id, f]));
  const timestamp = new Date().toISOString().slice(0, 10);
  const filename = `${filenamePrefix}_${timestamp}.xls`;

  const escapeXml = (unsafe: string | number | undefined | null) => {
    if (unsafe === undefined || unsafe === null) return '';
    return String(unsafe)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  };

  const xmlContent = `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
 <Styles>
  <Style ss:ID="Default" ss:Name="Normal">
   <Alignment ss:Vertical="Center"/>
   <Borders/>
   <Font ss:FontName="Calibri" x:Family="Swiss" ss:Size="11" ss:Color="#1E293B"/>
   <Interior/>
   <NumberFormat/>
   <Protection/>
  </Style>
  <Style ss:ID="HeaderStyle">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="2" ss:Color="#4338CA"/>
   </Borders>
   <Font ss:FontName="Calibri" ss:Size="11" ss:Color="#FFFFFF" ss:Bold="1"/>
   <Interior ss:Color="#4F46E5" ss:Pattern="Solid"/>
  </Style>
  <Style ss:ID="TitleStyle">
   <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
   <Font ss:FontName="Calibri" ss:Size="16" ss:Color="#1E1B4B" ss:Bold="1"/>
  </Style>
  <Style ss:ID="DataCell">
   <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
   </Borders>
   <Font ss:FontName="Calibri" ss:Size="10" ss:Color="#334155"/>
  </Style>
  <Style ss:ID="CenterDataCell">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
   </Borders>
   <Font ss:FontName="Calibri" ss:Size="10" ss:Color="#334155"/>
  </Style>
 </Styles>
 <Worksheet ss:Name="Academic Subjects">
  <Table ss:ExpandedColumnCount="12" x:FullColumns="1" x:FullRows="1" ss:DefaultRowHeight="18">
   <Column ss:Width="80"/>
   <Column ss:Width="200"/>
   <Column ss:Width="150"/>
   <Column ss:Width="70"/>
   <Column ss:Width="70"/>
   <Column ss:Width="100"/>
   <Column ss:Width="60"/>
   <Column ss:Width="60"/>
   <Column ss:Width="60"/>
   <Column ss:Width="180"/>
   <Column ss:Width="70"/>
   <Column ss:Width="80"/>
   <Row ss:Height="30">
    <Cell ss:MergeAcross="11" ss:StyleID="TitleStyle"><Data ss:Type="String">MYCAGS - Academic Subjects &amp; Faculty Allocation</Data></Cell>
   </Row>
   <Row ss:Height="24">
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Code</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Subject Name</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Department</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Degree</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Semester</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Type</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Credits</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Lectures (L)</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Practical (P)</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Assigned Faculty</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Status</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Created Date</Data></Cell>
   </Row>
   ${subjects
     .map((sub) => {
       const assignedFacs = (sub.assignedFacultyIds || [])
         .map((id) => {
           const fac = facultyMap.get(id);
           return fac ? `${fac.firstName} ${fac.lastName}` : null;
         })
         .filter(Boolean);

       return `<Row ss:Height="20">
    <Cell ss:StyleID="CenterDataCell"><Data ss:Type="String">${escapeXml(sub.code)}</Data></Cell>
    <Cell ss:StyleID="DataCell"><Data ss:Type="String">${escapeXml(sub.name)}</Data></Cell>
    <Cell ss:StyleID="DataCell"><Data ss:Type="String">${escapeXml(sub.department)}</Data></Cell>
    <Cell ss:StyleID="CenterDataCell"><Data ss:Type="String">${escapeXml(sub.degree)}</Data></Cell>
    <Cell ss:StyleID="CenterDataCell"><Data ss:Type="String">Sem ${sub.semester}</Data></Cell>
    <Cell ss:StyleID="DataCell"><Data ss:Type="String">${escapeXml(sub.type)}</Data></Cell>
    <Cell ss:StyleID="CenterDataCell"><Data ss:Type="Number">${sub.credits}</Data></Cell>
    <Cell ss:StyleID="CenterDataCell"><Data ss:Type="Number">${sub.lectureHoursPerWeek}</Data></Cell>
    <Cell ss:StyleID="CenterDataCell"><Data ss:Type="Number">${sub.practicalHoursPerWeek}</Data></Cell>
    <Cell ss:StyleID="DataCell"><Data ss:Type="String">${escapeXml(assignedFacs.join(', ') || 'Unassigned')}</Data></Cell>
    <Cell ss:StyleID="CenterDataCell"><Data ss:Type="String">${escapeXml(sub.status)}</Data></Cell>
    <Cell ss:StyleID="CenterDataCell"><Data ss:Type="String">${formatExportDate(sub.createdAt)}</Data></Cell>
   </Row>`;
     })
     .join('\n   ')}
  </Table>
 </Worksheet>
</Workbook>`;

  downloadFile(xmlContent, filename, 'application/vnd.ms-excel;charset=utf-8;');
};
