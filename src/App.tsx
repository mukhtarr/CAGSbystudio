import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AcademicProvider, useAcademic } from './context/AcademicContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { ToastContainer } from './components/layout/ToastContainer';
import { ActivityDrawer } from './components/layout/ActivityDrawer';
import { GlobalSearchModal } from './components/common/GlobalSearchModal';

// Views
import { DashboardView } from './components/dashboard/DashboardView';
import { StudentsView } from './components/students/StudentsView';
import { FacultiesView } from './components/faculties/FacultiesView';
import { SubjectsView } from './components/subjects/SubjectsView';
import { AcademicYearsView } from './components/academic-years/AcademicYearsView';
import { ClassesView } from './components/classes/ClassesView';
import { ClassCoordinatorsView } from './components/coordinator/ClassCoordinatorsView';
import { DatabaseView } from './components/database/DatabaseView';
import { SettingsView } from './components/settings/SettingsView';
import { CourseTrackerView } from './components/course-tracker/CourseTrackerView';
import { LoginView } from './components/auth/LoginView';

// Quick Modals for quick-action shortcuts
import { StudentModal } from './components/students/StudentModal';
import { FacultyModal } from './components/faculties/FacultyModal';
import { SubjectModal } from './components/subjects/SubjectModal';
import { ClassModal } from './components/classes/ClassModal';
import { AcademicYearModal } from './components/academic-years/AcademicYearModal';
import { AssignCoordinatorModal } from './components/coordinator/AssignCoordinatorModal';
import { StudentProfileModal } from './components/students/StudentProfileModal';
import { FacultyDetailsModal } from './components/faculties/FacultyDetailsModal';
import { Student, Faculty, Subject } from './types';
import { getAllowedTabsForRole } from './utils/rolePermissions';

const MainAppContent: React.FC = () => {
  const { activeTab, setActiveTab, currentUser } = useAcademic();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isActivityOpen, setIsActivityOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Automatically keep activeTab within the allowed tabs for the current role
  useEffect(() => {
    if (currentUser) {
      const allowed = getAllowedTabsForRole(currentUser.role);
      if (!allowed.includes(activeTab)) {
        setActiveTab(allowed[0]);
      }
    }
  }, [currentUser?.role, activeTab, setActiveTab]);

  // Quick Action Modal states triggered from Global Search or Dashboard
  const [quickStudentModal, setQuickStudentModal] = useState(false);
  const [quickFacultyModal, setQuickFacultyModal] = useState(false);
  const [quickClassModal, setQuickClassModal] = useState(false);
  const [quickAYModal, setQuickAYModal] = useState(false);
  const [quickAssignModal, setQuickAssignModal] = useState(false);

  // Profile modal views from global search
  const [inspectedStudent, setInspectedStudent] = useState<Student | null>(null);
  const [inspectedFaculty, setInspectedFaculty] = useState<Faculty | null>(null);
  const [studentToEditFromProfile, setStudentToEditFromProfile] = useState<Student | null>(null);
  const [facultyToEditFromProfile, setFacultyToEditFromProfile] = useState<Faculty | null>(null);

  // Keyboard shortcut for Global Search (⌘K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <DashboardView
            onNavigate={(tab) => setActiveTab(tab)}
            onOpenAddStudent={() => setQuickStudentModal(true)}
            onOpenAddFaculty={() => setQuickFacultyModal(true)}
            onOpenAddClass={() => setQuickClassModal(true)}
            onOpenAddYear={() => setQuickAYModal(true)}
            onOpenAssignCoordinator={() => setQuickAssignModal(true)}
          />
        );
      case 'students':
        return <StudentsView />;
      case 'faculties':
        return <FacultiesView />;
      case 'subjects':
        return <SubjectsView />;
      case 'academic-years':
        return <AcademicYearsView />;
      case 'classes':
        return <ClassesView onNavigateToCoordinator={() => setActiveTab('coordinators')} />;
      case 'coordinators':
        return <ClassCoordinatorsView />;
      case 'course-tracker':
        return <CourseTrackerView />;
      case 'database':
        return <DatabaseView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView onNavigate={(tab) => setActiveTab(tab)} />;
    }
  };

  if (!currentUser) {
    return (
      <>
        <LoginView />
        <ToastContainer />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white transition-colors duration-200">
      {/* Sidebar Navigation */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Main App Container */}
      <div className="lg:pl-72 flex-1 flex flex-col min-w-0">
        {/* Sticky Top Header */}
        <Navbar
          onOpenSearch={() => setIsSearchOpen(true)}
          onOpenActivity={() => setIsActivityOpen(true)}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />

        {/* Dynamic Main Body Content with Motion Fade Transition */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 w-full min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
            >
              {renderActiveView()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Toast Notification Container */}
      <ToastContainer />

      {/* Audit Log / Activity Drawer */}
      <ActivityDrawer isOpen={isActivityOpen} onClose={() => setIsActivityOpen(false)} />

      {/* Global Search Modal (⌘K) */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onNavigate={(tab) => setActiveTab(tab)}
        onViewStudent={(student) => setInspectedStudent(student)}
        onViewFaculty={(faculty) => setInspectedFaculty(faculty)}
      />

      {/* Quick Action Modals */}
      <StudentModal
        isOpen={quickStudentModal || Boolean(studentToEditFromProfile)}
        studentToEdit={studentToEditFromProfile}
        onClose={() => {
          setQuickStudentModal(false);
          setStudentToEditFromProfile(null);
        }}
      />

      <FacultyModal
        isOpen={quickFacultyModal || Boolean(facultyToEditFromProfile)}
        facultyToEdit={facultyToEditFromProfile}
        onClose={() => {
          setQuickFacultyModal(false);
          setFacultyToEditFromProfile(null);
        }}
      />

      <ClassModal
        isOpen={quickClassModal}
        onClose={() => setQuickClassModal(false)}
      />

      <AcademicYearModal
        isOpen={quickAYModal}
        onClose={() => setQuickAYModal(false)}
      />

      <AssignCoordinatorModal
        isOpen={quickAssignModal}
        onClose={() => setQuickAssignModal(false)}
      />

      <StudentProfileModal
        student={inspectedStudent}
        onClose={() => setInspectedStudent(null)}
        onEdit={(st) => {
          setInspectedStudent(null);
          setStudentToEditFromProfile(st);
        }}
      />

      <FacultyDetailsModal
        faculty={inspectedFaculty}
        onClose={() => setInspectedFaculty(null)}
        onEdit={(fac) => {
          setInspectedFaculty(null);
          setFacultyToEditFromProfile(fac);
        }}
      />
    </div>
  );
};

export default function App() {
  return (
    <AcademicProvider>
      <MainAppContent />
    </AcademicProvider>
  );
}
