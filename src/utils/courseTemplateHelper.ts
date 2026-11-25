import { AttendanceControlItem, SyllabusSessionItem, UnitTestAnalysis, LabCIAAnalysis, AttendanceStatusInfo } from '../types';

export const DEFAULT_ATTENDANCE_CONTROL_ITEMS: AttendanceControlItem[] = [
  {
    srNo: 1,
    title: 'Attendance Recording',
    sheetLink: 'Institutional Attendance Portal Sync',
    link: 'Institutional Attendance Portal Sync',
    columnRef: 'Direct Sheet Sync',
    column: 'Direct Sheet Sync',
  },
  {
    srNo: 2,
    title: 'Attendance Tracker',
    sheetLink: 'Attendance Tracker Workbook (Even/Odd Sem)',
    link: 'Attendance Tracker Workbook (Even/Odd Sem)',
    columnRef: 'J',
    column: 'J',
  },
  {
    srNo: 3,
    title: 'SL Attendance Recording',
    sheetLink: 'https://docs.google.com/spreadsheets/d/sl-att',
    link: 'https://docs.google.com/spreadsheets/d/sl-att',
    columnRef: 'D',
    column: 'D',
  },
  {
    srNo: 4,
    title: 'SL Attendance Tracker',
    sheetLink: 'https://docs.google.com/spreadsheets/d/sl-tracker',
    link: 'https://docs.google.com/spreadsheets/d/sl-tracker',
    columnRef: 'E',
    column: 'E',
  },
  {
    srNo: 5,
    title: 'AL Attendance Recording',
    sheetLink: 'https://docs.google.com/spreadsheets/d/al-att',
    link: 'https://docs.google.com/spreadsheets/d/al-att',
    columnRef: 'F',
    column: 'F',
  },
  {
    srNo: 6,
    title: 'AL Attendance Tracker',
    sheetLink: 'https://docs.google.com/spreadsheets/d/al-tracker',
    link: 'https://docs.google.com/spreadsheets/d/al-tracker',
    columnRef: 'G',
    column: 'G',
  },
];

export function generateTheorySyllabusSessions(courseName: string, startDate?: string): SyllabusSessionItem[] {
  const baseDate = startDate ? new Date(startDate) : new Date();
  const sessions: SyllabusSessionItem[] = [];

  const syllabusPlan = [
    {
      unit: 'Unit 1: Fundamentals & Conceptual Architecture',
      topics: [
        `Course orientation, outcome assessment rubric, and scope of ${courseName}`,
        'Core architectural principles, system constraints, and lifecycle models',
        'Standard abstractions, interface design, and foundational mathematical models',
        'Taxonomy, system criteria, and industry standard benchmarks',
      ],
    },
    {
      unit: 'Unit 2: Core Protocols, Algorithms & Structures',
      topics: [
        'Detailed algorithmic procedures, operational mechanisms, and logic flow',
        'Data representation, protocol message exchange, and state transitions',
        'Resource management algorithms, concurrency paradigms, and synchronization',
        'Performance complexity analysis and algorithmic boundary conditions',
        'Comparative review of standardized designs vs legacy alternatives',
      ],
    },
    {
      unit: 'Unit 3: System Modeling & Component Operations',
      topics: [
        'Modular architectural decomposing and sub-system interaction models',
        'Execution flow, pipeline dispatching, and dynamic buffering',
        'Distributed coordination, message queue semantics, and transactions',
        'Intermediate unit test evaluation and analytical problem solving',
        'System boundary constraints and failure mode diagnostics',
      ],
    },
    {
      unit: 'Unit 4: Advanced Protocols & Interoperability',
      topics: [
        'Advanced implementation standards, heterogeneous environment support',
        'Cross-layer optimizations, tunneling, and protocol bridging',
        'Continuous integration patterns, scalability, and load mitigation',
        'Middleware interfaces and event-driven architectural triggers',
        'Case study: High-availability operational deployments',
      ],
    },
    {
      unit: 'Unit 5: Reliability, Security & Performance Engineering',
      topics: [
        'Cryptographic safety measures, authentication schemes, and integrity checks',
        'Fault isolation mechanisms, failover protocols, and disaster recovery',
        'Latency reduction, throughput profiling, and bandwidth optimization',
        'Automated metric logging, alerting telemetry, and audit monitoring',
        'Mid-Semester Examination review and formative assessment debrief',
      ],
    },
    {
      unit: 'Unit 6: Industrial Applications & Emerging Trends',
      topics: [
        'Modern trends, cloud-native deployments, and container orchestration',
        'Integration with machine intelligence and automated controller systems',
        'Enterprise scale applications, best design patterns, and case studies',
        'Final syllabus closure, university exam pattern discussion, and revision',
      ],
    },
  ];

  let sessionNo = 1;
  const curr = new Date(baseDate);

  syllabusPlan.forEach((group) => {
    group.topics.forEach((topic) => {
      curr.setDate(curr.getDate() + (curr.getDay() === 5 ? 3 : 2));
      const dateStr = curr.toISOString().split('T')[0];

      sessions.push({
        id: `sess-th-${Date.now().toString(36)}-${sessionNo}`,
        sessionNo,
        unit: group.unit,
        unitName: group.unit,
        topic,
        plannedDate: dateStr,
        conductedDate: sessionNo <= 4 ? dateStr : undefined,
        status: sessionNo <= 4 ? 'Conducted' : 'Scheduled',
        pedagogy: sessionNo % 2 === 0 ? 'Interactive PPT Presentation & Class Discussion' : 'Chalk & Board + Exemplary Problem Solving',
      });
      sessionNo++;
    });
  });

  return sessions;
}

export function generateLabSyllabusSessions(courseName: string, startDate?: string): SyllabusSessionItem[] {
  const baseDate = startDate ? new Date(startDate) : new Date();
  const sessions: SyllabusSessionItem[] = [];

  const labExperiments = [
    {
      unit: 'Experiment 01: Lab Safety & Environment Toolchain',
      topic: `Laboratory orientation, safety protocol briefing, and IDE/toolchain configuration for ${courseName}`,
      pedagogy: 'Toolchain Demonstration & Individual Workstation Setup',
    },
    {
      unit: 'Experiment 02: Baseline Syntactic Implementation',
      topic: 'Implementation of fundamental control logic, data structures, and baseline validation scripts',
      pedagogy: 'Live Coding Exercise & Interactive Terminal Trace',
    },
    {
      unit: 'Experiment 03: Input Processing & Validation',
      topic: 'Configuring stream input processors, input sanitizer modules, and exception interceptors',
      pedagogy: 'Hands-on Programming with Boundary Testing',
    },
    {
      unit: 'Experiment 04: Core Functional Module Verification',
      topic: 'Modular program partitioning, function pointers/callbacks, and automated unit assertion harnesses',
      pedagogy: 'Test-Driven Code Development in Sandbox',
    },
    {
      unit: 'Experiment 05: Algorithmic Simulation & Trace',
      topic: 'Simulating algorithmic execution cycles with step-by-step diagnostic watches and state logs',
      pedagogy: 'Debugger Walkthrough & Variable Inspection',
    },
    {
      unit: 'Experiment 06: Data Serialization & Storage Integration',
      topic: 'Serialization/deserialization into binary and JSON payloads, file I/O operations and integrity checks',
      pedagogy: 'Data Format Mapping & Storage Verification',
    },
    {
      unit: 'Experiment 07: Inter-Process Communication & Sockets',
      topic: 'Constructing TCP/UDP network communication endpoints, client-server socket pairing, and packet capture',
      pedagogy: 'Network Packet Analysis & Live Terminal Sniffing',
    },
    {
      unit: 'Experiment 08: Concurrency & Thread Synchronization',
      topic: 'Multithreaded execution, mutex lock primitives, condition variables, and race condition prevention',
      pedagogy: 'Concurrent Task Profiling & Thread Race Debugging',
    },
    {
      unit: 'Experiment 09: Component Interface & Middleware Hooks',
      topic: 'Building microservice style REST/RPC interfaces and binding middleware authentication hooks',
      pedagogy: 'API Testing using Postman / cURL Tooling',
    },
    {
      unit: 'Experiment 10: Performance Profiling & Optimization',
      topic: 'CPU cycles profiling, heap allocation leak inspection, and bottleneck latency identification',
      pedagogy: 'Profiler Output Analysis & Optimization Refactoring',
    },
    {
      unit: 'Experiment 11: Security Hardening & Access Control',
      topic: 'Validating payload checksums, symmetric encryption wrappers, and credential authorization barriers',
      pedagogy: 'Security Vulnerability Simulation & Defense',
    },
    {
      unit: 'Experiment 12: Integrated Real-World Case Simulation',
      topic: 'End-to-end multi-component pipeline execution integrating all previous experimental layers',
      pedagogy: 'Integrated System Run & Performance Benchmarking',
    },
    {
      unit: 'Experiment 13: Capstone Mini-Project Demonstration',
      topic: 'Demonstration of student-developed autonomous feature module with live peer review',
      pedagogy: 'Student Technical Presentation & Code Walkthrough',
    },
    {
      unit: 'Experiment 14: Mock Practical Assessment',
      topic: 'Timed problem-solving challenge simulating university practical examination questions',
      pedagogy: 'Individual Timed Evaluation with Rubric Scoring',
    },
    {
      unit: 'Experiment 15: Continuous Evaluation & Oral Viva-Voce',
      topic: 'Comprehensive lab journal verification, final rubric assessment, and individual oral viva-voce',
      pedagogy: 'One-on-One Viva Voce & Laboratory Journal Signoff',
    },
  ];

  const curr = new Date(baseDate);

  labExperiments.forEach((exp, idx) => {
    curr.setDate(curr.getDate() + 7);
    const dateStr = curr.toISOString().split('T')[0];
    const sessionNo = idx + 1;

    sessions.push({
      id: `sess-lb-${Date.now().toString(36)}-${sessionNo}`,
      sessionNo,
      unit: exp.unit,
      unitName: exp.unit,
      topic: exp.topic,
      plannedDate: dateStr,
      conductedDate: sessionNo <= 3 ? dateStr : undefined,
      status: sessionNo <= 3 ? 'Conducted' : 'Scheduled',
      pedagogy: exp.pedagogy,
    });
  });

  return sessions;
}

export const DEFAULT_THEORY_ANALYSIS: UnitTestAnalysis = {
  cia: {
    averageMarks: 16.4,
    thresholdAbove15Count: 45,
    thresholdBelow8Count: 3,
    passedPercentage: 92.5,
    totalEvaluated: 68,
  },
  mse: {
    averageMarks: 14.8,
    thresholdAbove12Count: 42,
    thresholdBelow10Count: 5,
    passedPercentage: 89.2,
    totalEvaluated: 68,
  },
};

export const DEFAULT_LAB_ANALYSIS: LabCIAAnalysis = {
  averageMarks: 18.6,
  passedPercentage: 96.0,
  thresholdAbove15Count: 62,
  thresholdBelow15Count: 2,
  totalEvaluated: 68,
};

export const DEFAULT_ATTENDANCE_STATUS = (isLab: boolean): AttendanceStatusInfo => {
  return {
    totalSessions: isLab ? 15 : 27,
    averageAttendancePct: 88.5,
    totalStudents: 68,
    below50Count: 2,
    above60Count: 61,
    below10Count: 1,
    above99Count: 2,
    between50And75Count: 5,
    above75Count: 61,
  };
};
