import { CourseTrackerRecord, StudentCoursePerformance } from '../types';
import { downloadFile } from './exportUtils';

/**
 * Clean string for XML Spreadsheet cells
 */
const xmlEscape = (str: string | number | null | undefined): string => {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
};

/**
 * Exports a comprehensive, multi-worksheet Excel workbook matching the institutional Course Tracker format
 */
export function exportCourseTrackerToExcel(
  tracker: CourseTrackerRecord,
  students: StudentCoursePerformance[]
) {
  const isTheory = tracker.courseType === 'Theory';
  const fileName = `${tracker.courseCode}_${tracker.courseType}_Tracker_${tracker.classAndSem.replace(/[^a-zA-Z0-9]/g, '_')}.xls`;

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
 <DocumentProperties xmlns="urn:schemas-microsoft-com:office:office">
  <Title>${xmlEscape(tracker.courseName)} - ${tracker.courseType} Course Tracker</Title>
  <Subject>Academic Course Delivery &amp; Assessment Report</Subject>
  <Author>${xmlEscape(tracker.courseOwner)}</Author>
  <Created>${new Date().toISOString()}</Created>
 </DocumentProperties>
 <Styles>
  <Style ss:ID="Default" ss:Name="Normal">
   <Alignment ss:Vertical="Center"/>
   <Borders/>
   <Font ss:FontName="Calibri" x:Family="Swiss" ss:Size="11" ss:Color="#1E293B"/>
   <Interior/>
   <NumberFormat/>
   <Protection/>
  </Style>
  <Style ss:ID="HeaderTitle">
   <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
   <Font ss:FontName="Calibri" x:Family="Swiss" ss:Size="14" ss:Color="#FFFFFF" ss:Bold="1"/>
   <Interior ss:Color="#1E1B4B" ss:Pattern="Solid"/>
  </Style>
  <Style ss:ID="SubHeader">
   <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
   <Font ss:FontName="Calibri" x:Family="Swiss" ss:Size="10" ss:Color="#E2E8F0" ss:Italic="1"/>
   <Interior ss:Color="#312E81" ss:Pattern="Solid"/>
  </Style>
  <Style ss:ID="ColHeader">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center" ss:WrapText="1"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="2" ss:Color="#4338CA"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
   </Borders>
   <Font ss:FontName="Calibri" x:Family="Swiss" ss:Size="11" ss:Color="#FFFFFF" ss:Bold="1"/>
   <Interior ss:Color="#4F46E5" ss:Pattern="Solid"/>
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
   <NumberFormat ss:Format="0.0"/>
  </Style>
  <Style ss:ID="StatusPassed">
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
   </Borders>
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Font ss:FontName="Calibri" x:Family="Swiss" ss:Size="10" ss:Color="#15803D" ss:Bold="1"/>
   <Interior ss:Color="#DCFCE7" ss:Pattern="Solid"/>
  </Style>
  <Style ss:ID="StatusFailed">
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
   </Borders>
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Font ss:FontName="Calibri" x:Family="Swiss" ss:Size="10" ss:Color="#B91C1C" ss:Bold="1"/>
   <Interior ss:Color="#FEE2E2" ss:Pattern="Solid"/>
  </Style>
 </Styles>`;

  // --------------------------------------------------------------------------
  // WORKSHEET 1: Syllabus Delivery Log
  // --------------------------------------------------------------------------
  xml += `
 <Worksheet ss:Name="Syllabus Delivery">
  <Table ss:ExpandedColumnCount="8" x:FullColumns="1" x:FullRows="1" ss:DefaultRowHeight="20">
   <Column ss:Width="50"/>
   <Column ss:Width="160"/>
   <Column ss:Width="260"/>
   <Column ss:Width="90"/>
   <Column ss:Width="90"/>
   <Column ss:Width="90"/>
   <Column ss:Width="160"/>
   <Column ss:Width="60"/>
   
   <Row ss:Height="30">
    <Cell ss:MergeAcross="7" ss:StyleID="HeaderTitle">
     <Data ss:Type="String"> ${xmlEscape(tracker.courseName)} (${tracker.courseCode}) - ${tracker.courseType} Course Delivery Tracker</Data>
    </Cell>
   </Row>
   <Row ss:Height="22">
    <Cell ss:MergeAcross="7" ss:StyleID="SubHeader">
     <Data ss:Type="String"> Department: ${xmlEscape(tracker.department)} | Class &amp; Sem: ${xmlEscape(tracker.classAndSem)} | Owner: ${xmlEscape(tracker.courseOwner)} | Progress: ${tracker.conductedSessions}/${tracker.totalSessions} Sessions (${tracker.completionPercentage}%)</Data>
    </Cell>
   </Row>
   <Row ss:Height="25">
    <Cell ss:StyleID="ColHeader"><Data ss:Type="String">#</Data></Cell>
    <Cell ss:StyleID="ColHeader"><Data ss:Type="String">Unit / Module</Data></Cell>
    <Cell ss:StyleID="ColHeader"><Data ss:Type="String">Topics Covered</Data></Cell>
    <Cell ss:StyleID="ColHeader"><Data ss:Type="String">Planned Date</Data></Cell>
    <Cell ss:StyleID="ColHeader"><Data ss:Type="String">Conducted Date</Data></Cell>
    <Cell ss:StyleID="ColHeader"><Data ss:Type="String">Status</Data></Cell>
    <Cell ss:StyleID="ColHeader"><Data ss:Type="String">Pedagogy / Aid</Data></Cell>
    <Cell ss:StyleID="ColHeader"><Data ss:Type="String">Batch</Data></Cell>
   </Row>`;

  tracker.syllabusSessions.forEach((session) => {
    xml += `
   <Row ss:Height="20">
    <Cell ss:StyleID="CenterDataCell"><Data ss:Type="Number">${session.sessionNo}</Data></Cell>
    <Cell ss:StyleID="DataCell"><Data ss:Type="String">${xmlEscape(session.unitName)}</Data></Cell>
    <Cell ss:StyleID="DataCell"><Data ss:Type="String">${xmlEscape(session.topic)}</Data></Cell>
    <Cell ss:StyleID="CenterDataCell"><Data ss:Type="String">${session.plannedDate}</Data></Cell>
    <Cell ss:StyleID="CenterDataCell"><Data ss:Type="String">${session.conductedDate}</Data></Cell>
    <Cell ss:StyleID="${session.status === 'Conducted' ? 'StatusPassed' : 'StatusFailed'}"><Data ss:Type="String">${session.status}</Data></Cell>
    <Cell ss:StyleID="DataCell"><Data ss:Type="String">${xmlEscape(session.pedagogy || 'ICT, Demonstration')}</Data></Cell>
    <Cell ss:StyleID="CenterDataCell"><Data ss:Type="String">${xmlEscape(session.batch || 'All')}</Data></Cell>
   </Row>`;
  });

  xml += `
  </Table>
 </Worksheet>`;

  // --------------------------------------------------------------------------
  // WORKSHEET 2: Attendance Control Sheet Links
  // --------------------------------------------------------------------------
  xml += `
 <Worksheet ss:Name="Attendance Controls">
  <Table ss:ExpandedColumnCount="4" x:FullColumns="1" x:FullRows="1" ss:DefaultRowHeight="22">
   <Column ss:Width="50"/>
   <Column ss:Width="260"/>
   <Column ss:Width="360"/>
   <Column ss:Width="120"/>
   
   <Row ss:Height="30">
    <Cell ss:MergeAcross="3" ss:StyleID="HeaderTitle">
     <Data ss:Type="String"> Attendance Control Info &amp; Master Spreadsheets</Data>
    </Cell>
   </Row>
   <Row ss:Height="25">
    <Cell ss:StyleID="ColHeader"><Data ss:Type="String">Sr No</Data></Cell>
    <Cell ss:StyleID="ColHeader"><Data ss:Type="String">Parameter Title</Data></Cell>
    <Cell ss:StyleID="ColHeader"><Data ss:Type="String">Master Spreadsheet URL</Data></Cell>
    <Cell ss:StyleID="ColHeader"><Data ss:Type="String">Excel Column</Data></Cell>
   </Row>`;

  tracker.attendanceControlItems.forEach((item) => {
    xml += `
   <Row ss:Height="22">
    <Cell ss:StyleID="CenterDataCell"><Data ss:Type="Number">${item.srNo}</Data></Cell>
    <Cell ss:StyleID="DataCell"><Data ss:Type="String">${xmlEscape(item.title)}</Data></Cell>
    <Cell ss:StyleID="DataCell"><Data ss:Type="String">${xmlEscape(item.sheetLink)}</Data></Cell>
    <Cell ss:StyleID="CenterDataCell"><Data ss:Type="String">${xmlEscape(item.columnRef || '-')}</Data></Cell>
   </Row>`;
  });

  xml += `
  </Table>
 </Worksheet>`;

  // --------------------------------------------------------------------------
  // WORKSHEET 3: Internal Assessment & Marks (CIA / MSE / Practical)
  // --------------------------------------------------------------------------
  xml += `
 <Worksheet ss:Name="Student Assessments">
  <Table ss:ExpandedColumnCount="12" x:FullColumns="1" x:FullRows="1" ss:DefaultRowHeight="20">
   <Column ss:Width="70"/>
   <Column ss:Width="160"/>
   <Column ss:Width="70"/>
   <Column ss:Width="70"/>
   <Column ss:Width="70"/>
   <Column ss:Width="70"/>
   <Column ss:Width="80"/>
   <Column ss:Width="70"/>
   <Column ss:Width="70"/>
   <Column ss:Width="70"/>
   <Column ss:Width="70"/>
   <Column ss:Width="60"/>
   
   <Row ss:Height="30">
    <Cell ss:MergeAcross="11" ss:StyleID="HeaderTitle">
     <Data ss:Type="String"> Continuous Internal Assessment (CIA) &amp; Exam Records</Data>
    </Cell>
   </Row>
   <Row ss:Height="25">
    <Cell ss:StyleID="ColHeader"><Data ss:Type="String">Roll No</Data></Cell>
    <Cell ss:StyleID="ColHeader"><Data ss:Type="String">Student Name</Data></Cell>
    <Cell ss:StyleID="ColHeader"><Data ss:Type="String">Theory CIA 1 (20)</Data></Cell>
    <Cell ss:StyleID="ColHeader"><Data ss:Type="String">CIA 1 Pass</Data></Cell>
    <Cell ss:StyleID="ColHeader"><Data ss:Type="String">Theory CIA 2 (20)</Data></Cell>
    <Cell ss:StyleID="ColHeader"><Data ss:Type="String">CIA 2 Pass</Data></Cell>
    <Cell ss:StyleID="ColHeader"><Data ss:Type="String">MSE Exam (30)</Data></Cell>
    <Cell ss:StyleID="ColHeader"><Data ss:Type="String">Lab CIA 1 (20)</Data></Cell>
    <Cell ss:StyleID="ColHeader"><Data ss:Type="String">Lab CIA 2 (20)</Data></Cell>
    <Cell ss:StyleID="ColHeader"><Data ss:Type="String">Theory Att %</Data></Cell>
    <Cell ss:StyleID="ColHeader"><Data ss:Type="String">Lab Att %</Data></Cell>
    <Cell ss:StyleID="ColHeader"><Data ss:Type="String">Grade</Data></Cell>
   </Row>`;

  students.forEach((s) => {
    xml += `
   <Row ss:Height="20">
    <Cell ss:StyleID="CenterDataCell"><Data ss:Type="String">${xmlEscape(s.rollNo)}</Data></Cell>
    <Cell ss:StyleID="DataCell"><Data ss:Type="String">${xmlEscape(s.studentName)}</Data></Cell>
    <Cell ss:StyleID="NumberCell"><Data ss:Type="Number">${s.theoryMarks.cia1Marks}</Data></Cell>
    <Cell ss:StyleID="${s.theoryMarks.cia1Passed ? 'StatusPassed' : 'StatusFailed'}"><Data ss:Type="String">${s.theoryMarks.cia1Passed ? 'PASS' : 'FAIL'}</Data></Cell>
    <Cell ss:StyleID="NumberCell"><Data ss:Type="Number">${s.theoryMarks.cia2Marks}</Data></Cell>
    <Cell ss:StyleID="${s.theoryMarks.cia2Passed ? 'StatusPassed' : 'StatusFailed'}"><Data ss:Type="String">${s.theoryMarks.cia2Passed ? 'PASS' : 'FAIL'}</Data></Cell>
    <Cell ss:StyleID="NumberCell"><Data ss:Type="Number">${s.theoryMarks.mseMarks}</Data></Cell>
    <Cell ss:StyleID="NumberCell"><Data ss:Type="Number">${s.labMarks.cia1Marks}</Data></Cell>
    <Cell ss:StyleID="NumberCell"><Data ss:Type="Number">${s.labMarks.cia2Marks}</Data></Cell>
    <Cell ss:StyleID="NumberCell"><Data ss:Type="Number">${s.theoryAttendance.percentage}</Data></Cell>
    <Cell ss:StyleID="NumberCell"><Data ss:Type="Number">${s.labAttendance.percentage}</Data></Cell>
    <Cell ss:StyleID="CenterDataCell"><Data ss:Type="String">${xmlEscape(s.overallGrade)}</Data></Cell>
   </Row>`;
  });

  xml += `
  </Table>
 </Worksheet>`;

  // --------------------------------------------------------------------------
  // WORKSHEET 4: Defaulters & Risk Analysis
  // --------------------------------------------------------------------------
  const defaulters = students.filter(
    (s) =>
      s.theoryAttendance.category === 'Critical (<50%)' ||
      s.theoryAttendance.category === 'Severe (<10%)' ||
      s.labAttendance.category === 'Critical (<50%)' ||
      s.labAttendance.category === 'Severe (<10%)'
  );

  xml += `
 <Worksheet ss:Name="Attendance Defaulters">
  <Table ss:ExpandedColumnCount="7" x:FullColumns="1" x:FullRows="1" ss:DefaultRowHeight="20">
   <Column ss:Width="70"/>
   <Column ss:Width="160"/>
   <Column ss:Width="90"/>
   <Column ss:Width="140"/>
   <Column ss:Width="90"/>
   <Column ss:Width="140"/>
   <Column ss:Width="120"/>
   
   <Row ss:Height="30">
    <Cell ss:MergeAcross="6" ss:StyleID="HeaderTitle">
     <Data ss:Type="String"> Attendance Defaulters List (&lt;50% &amp; &lt;10% Categories)</Data>
    </Cell>
   </Row>
   <Row ss:Height="25">
    <Cell ss:StyleID="ColHeader"><Data ss:Type="String">Roll No</Data></Cell>
    <Cell ss:StyleID="ColHeader"><Data ss:Type="String">Student Name</Data></Cell>
    <Cell ss:StyleID="ColHeader"><Data ss:Type="String">Theory Att %</Data></Cell>
    <Cell ss:StyleID="ColHeader"><Data ss:Type="String">Theory Category</Data></Cell>
    <Cell ss:StyleID="ColHeader"><Data ss:Type="String">Lab Att %</Data></Cell>
    <Cell ss:StyleID="ColHeader"><Data ss:Type="String">Lab Category</Data></Cell>
    <Cell ss:StyleID="ColHeader"><Data ss:Type="String">Action Required</Data></Cell>
   </Row>`;

  defaulters.forEach((d) => {
    xml += `
   <Row ss:Height="20">
    <Cell ss:StyleID="CenterDataCell"><Data ss:Type="String">${xmlEscape(d.rollNo)}</Data></Cell>
    <Cell ss:StyleID="DataCell"><Data ss:Type="String">${xmlEscape(d.studentName)}</Data></Cell>
    <Cell ss:StyleID="NumberCell"><Data ss:Type="Number">${d.theoryAttendance.percentage}</Data></Cell>
    <Cell ss:StyleID="StatusFailed"><Data ss:Type="String">${xmlEscape(d.theoryAttendance.category)}</Data></Cell>
    <Cell ss:StyleID="NumberCell"><Data ss:Type="Number">${d.labAttendance.percentage}</Data></Cell>
    <Cell ss:StyleID="StatusFailed"><Data ss:Type="String">${xmlEscape(d.labAttendance.category)}</Data></Cell>
    <Cell ss:StyleID="DataCell"><Data ss:Type="String">Parent Notice / Remedial</Data></Cell>
   </Row>`;
  });

  xml += `
  </Table>
 </Worksheet>
</Workbook>`;

  downloadFile(xml, fileName, 'application/vnd.ms-excel');
}

/**
 * Exports CSV of Course Tracker student marks & attendance matrix
 */
export function exportCourseTrackerToCSV(
  tracker: CourseTrackerRecord,
  students: StudentCoursePerformance[]
) {
  const fileName = `${tracker.courseCode}_${tracker.courseType}_Marks_Matrix.csv`;
  const headers = [
    'Roll No',
    'Student Name',
    'Batch',
    'Theory Att Conducted',
    'Theory Att Attended',
    'Theory Att %',
    'Theory Defaulter Status',
    'Lab Att Conducted',
    'Lab Att Attended',
    'Lab Att %',
    'CIA 1 Marks (20)',
    'CIA 1 Pass',
    'CIA 2 Marks (20)',
    'CIA 2 Pass',
    'Mid Sem MSE (30)',
    'Lab CIA 1 (20)',
    'Lab CIA 2 (20)',
    'Overall Grade',
  ];

  const rows = students.map((s) => [
    `"${s.rollNo}"`,
    `"${s.studentName}"`,
    `"${s.batch}"`,
    s.theoryAttendance.totalConducted,
    s.theoryAttendance.attended,
    `${s.theoryAttendance.percentage}%`,
    `"${s.theoryAttendance.category}"`,
    s.labAttendance.totalConducted,
    s.labAttendance.attended,
    `${s.labAttendance.percentage}%`,
    s.theoryMarks.cia1Marks,
    s.theoryMarks.cia1Passed ? 'PASS' : 'FAIL',
    s.theoryMarks.cia2Marks,
    s.theoryMarks.cia2Passed ? 'PASS' : 'FAIL',
    s.theoryMarks.mseMarks,
    s.labMarks.cia1Marks,
    s.labMarks.cia2Marks,
    `"${s.overallGrade}"`,
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  downloadFile(csvContent, fileName, 'text/csv;charset=utf-8;');
}
