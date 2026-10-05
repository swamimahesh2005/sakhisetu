'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  User,
  Role,
  Block,
  Village,
  SHG,
  Member,
  DocumentItem,
  SavingsRecord,
  LoanRecord,
  Meeting,
  FieldVisit,
  BusinessEnterprise,
  GovtScheme,
  MemberSchemeApplication,
  TrainingRecord,
  TaskReminder,
  NotificationItem,
  AuditLog
} from '@/types';
import {
  INITIAL_USERS,
  INITIAL_BLOCKS,
  INITIAL_VILLAGES,
  INITIAL_SHGS,
  INITIAL_MEMBERS,
  INITIAL_DOCUMENTS,
  INITIAL_SAVINGS,
  INITIAL_LOANS,
  INITIAL_MEETINGS,
  INITIAL_FIELD_VISITS,
  INITIAL_BUSINESSES,
  INITIAL_GOVT_SCHEMES,
  INITIAL_MEMBER_APPLICATIONS,
  INITIAL_TRAININGS,
  INITIAL_TASKS,
  INITIAL_NOTIFICATIONS,
  INITIAL_AUDIT_LOGS
} from '@/lib/seed-data';
import { speakMarathi } from '@/lib/voice-assistant';

interface AppContextType {
  // Current User & RBAC
  currentUser: User;
  setCurrentUser: (user: User) => void;
  switchRole: (role: Role) => void;
  isOnline: boolean;
  toggleOnline: () => void;
  offlineQueueCount: number;
  syncOfflineData: () => void;

  // Data Collections
  users: User[];
  blocks: Block[];
  villages: Village[];
  shgs: SHG[];
  members: Member[];
  documents: DocumentItem[];
  savings: SavingsRecord[];
  loans: LoanRecord[];
  meetings: Meeting[];
  fieldVisits: FieldVisit[];
  businesses: BusinessEnterprise[];
  govtSchemes: GovtScheme[];
  schemeApplications: MemberSchemeApplication[];
  trainings: TrainingRecord[];
  tasks: TaskReminder[];
  notifications: NotificationItem[];
  auditLogs: AuditLog[];

  // Active Selected Entity for detail views
  selectedShgId: string | null;
  setSelectedShgId: (id: string | null) => void;
  selectedMemberId: string | null;
  setSelectedMemberId: (id: string | null) => void;

  // CRUD & Delete Operations
  addSHG: (shg: Omit<SHG, 'id' | 'code' | 'totalSavings' | 'totalInternalLoansActive' | 'totalMembersCount'>) => void;
  updateSHG: (id: string, updates: Partial<SHG>) => void;
  deleteSHG: (id: string) => void;

  addMember: (member: Omit<Member, 'id' | 'totalSaved' | 'activeLoanAmount' | 'joiningDate'>) => void;
  updateMember: (id: string, updates: Partial<Member>) => void;
  deleteMember: (id: string) => void;
  deleteFamilyMember: (memberId: string, familyIndex: number) => void;

  recordSavings: (record: Omit<SavingsRecord, 'id' | 'receiptNumber' | 'recordedBy'>) => void;
  deleteSavings: (id: string) => void;

  disburseLoan: (loan: Omit<LoanRecord, 'id' | 'remainingPrincipal' | 'totalPaid' | 'status' | 'approvedBy'>) => void;
  repayLoan: (loanId: string, amount: number, notes?: string) => void;
  deleteLoan: (id: string) => void;

  addMeeting: (meeting: Omit<Meeting, 'id' | 'totalAttendance' | 'totalMembers' | 'totalSavingsCollected' | 'totalLoanCollected' | 'totalNewLoansSanctioned' | 'status'>) => void;
  completeMeeting: (meetingId: string, resolution: string, photoUrl?: string) => void;
  deleteMeeting: (id: string) => void;
  deleteAttendance: (meetingId: string, memberId: string) => void;

  addFieldVisit: (visit: Omit<FieldVisit, 'id' | 'crpId' | 'crpName'>) => void;
  deleteFieldVisit: (id: string) => void;

  addBusiness: (biz: Omit<BusinessEnterprise, 'id'>) => void;
  deleteBusiness: (id: string) => void;

  applyForScheme: (app: Omit<MemberSchemeApplication, 'id' | 'trackingNumber' | 'status'>) => void;
  deleteScheme: (id: string) => void;
  deleteSchemeApplication: (id: string) => void;

  addTraining: (training: Omit<TrainingRecord, 'id'>) => void;
  deleteTraining: (id: string) => void;

  toggleTask: (taskId: string) => void;
  addTask: (task: Omit<TaskReminder, 'id' | 'completed'>) => void;
  deleteTask: (id: string) => void;

  // Documents: Upload, Replace, Verify & Delete
  addDocument: (doc: Omit<DocumentItem, 'id' | 'uploadDate' | 'uploadedBy' | 'status'>) => void;
  replaceDocument: (id: string, newFileUrl: string, newTitle?: string, remarks?: string) => void;
  verifyDocument: (id: string, newStatus: DocumentItem['status'], remarks?: string) => void;
  deleteDocument: (id: string) => void;

  markNotificationRead: (id: string) => void;
  clearAllNotifications: () => void;
  deleteNotification: (id: string) => void;
  speakText: (text: string) => void;

  // Search
  globalSearch: string;
  setGlobalSearch: (q: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY = 'sakhisetu_v2_data';

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentUser, setCurrentUser] = useState<User>(INITIAL_USERS[0]); // CRP Sumitra Pawar by default
  const [isOnline, setIsOnline] = useState(true);
  const [offlineQueueCount, setOfflineQueueCount] = useState(0);

  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [blocks, setBlocks] = useState<Block[]>(INITIAL_BLOCKS);
  const [villages, setVillages] = useState<Village[]>(INITIAL_VILLAGES);
  const [shgs, setShgs] = useState<SHG[]>(INITIAL_SHGS);
  const [members, setMembers] = useState<Member[]>(INITIAL_MEMBERS);
  const [documents, setDocuments] = useState<DocumentItem[]>(INITIAL_DOCUMENTS);
  const [savings, setSavings] = useState<SavingsRecord[]>(INITIAL_SAVINGS);
  const [loans, setLoans] = useState<LoanRecord[]>(INITIAL_LOANS);
  const [meetings, setMeetings] = useState<Meeting[]>(INITIAL_MEETINGS);
  const [fieldVisits, setFieldVisits] = useState<FieldVisit[]>(INITIAL_FIELD_VISITS);
  const [businesses, setBusinesses] = useState<BusinessEnterprise[]>(INITIAL_BUSINESSES);
  const [govtSchemes, setGovtSchemes] = useState<GovtScheme[]>(INITIAL_GOVT_SCHEMES);
  const [schemeApplications, setSchemeApplications] = useState<MemberSchemeApplication[]>(INITIAL_MEMBER_APPLICATIONS);
  const [trainings, setTrainings] = useState<TrainingRecord[]>(INITIAL_TRAININGS);
  const [tasks, setTasks] = useState<TaskReminder[]>(INITIAL_TASKS);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(INITIAL_AUDIT_LOGS);

  const [selectedShgId, setSelectedShgId] = useState<string | null>(null);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [globalSearch, setGlobalSearch] = useState('');

  // Load from local storage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed.shgs?.length) setShgs(parsed.shgs);
          if (parsed.members?.length) setMembers(parsed.members);
          if (parsed.savings?.length) setSavings(parsed.savings);
          if (parsed.loans?.length) setLoans(parsed.loans);
          if (parsed.meetings?.length) setMeetings(parsed.meetings);
          if (parsed.fieldVisits?.length) setFieldVisits(parsed.fieldVisits);
          if (parsed.businesses?.length) setBusinesses(parsed.businesses);
          if (parsed.tasks?.length) setTasks(parsed.tasks);
          if (parsed.documents?.length) setDocuments(parsed.documents);
          if (parsed.schemeApplications?.length) setSchemeApplications(parsed.schemeApplications);
          if (parsed.notifications?.length) setNotifications(parsed.notifications);
          if (parsed.auditLogs?.length) setAuditLogs(parsed.auditLogs);
        }
      } catch (err) {
        console.error('Failed to load local storage state:', err);
      }
      setIsLoaded(true);
    }
  }, []);

  // Save to local storage on changes
  useEffect(() => {
    if (isLoaded && typeof window !== 'undefined') {
      try {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            shgs,
            members,
            savings,
            loans,
            meetings,
            fieldVisits,
            businesses,
            tasks,
            documents,
            schemeApplications,
            notifications,
            auditLogs
          })
        );
      } catch (err) {
        console.error('Failed to save to local storage:', err);
      }
    }
  }, [
    isLoaded,
    shgs,
    members,
    savings,
    loans,
    meetings,
    fieldVisits,
    businesses,
    tasks,
    documents,
    schemeApplications,
    notifications,
    auditLogs
  ]);

  const addAuditLog = (action: string, actionMarathi: string, entityType: string, entityId: string, details: string) => {
    const newLog: AuditLog = {
      id: 'log_' + Date.now(),
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      action,
      actionMarathi,
      performedBy: currentUser.marathiName,
      role: currentUser.role,
      entityType,
      entityId,
      ipAddress: '192.168.1.' + Math.floor(Math.random() * 80 + 10),
      details
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  const addNotification = (title: string, marathiMessage: string, type: NotificationItem['type'], badgeType: NotificationItem['badgeType'] = 'info') => {
    const newNotif: NotificationItem = {
      id: 'notif_' + Date.now(),
      title,
      marathiMessage,
      type,
      createdAt: 'आत्ताच (Just now)',
      isRead: false,
      badgeType
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const switchRole = (role: Role) => {
    const user = users.find(u => u.role === role) || users[0];
    setCurrentUser(user);
    speakMarathi(`${user.marathiName} खात्यावर स्विच केले.`);
    addAuditLog('ROLE_SWITCH', 'भूमिका बदल (Role Switch)', 'USER', user.id, `युझरने ${role} भूमिकेत प्रवेश केला.`);
  };

  const toggleOnline = () => {
    setIsOnline(prev => {
      const next = !prev;
      if (!next) {
        speakMarathi('आपण ऑफलाइन मोडमध्ये आहात. डेटा सुरक्षित राहील.');
      } else {
        speakMarathi('आपण ऑनलाइन आला आहात. ऑफलाइन डेटा सिंक होत आहे.');
        syncOfflineData();
      }
      return next;
    });
  };

  const syncOfflineData = () => {
    setOfflineQueueCount(0);
    addNotification('ऑफलाइन डेटा सिंक पूर्ण', 'सर्व ऑफलाइन नोंदी मुख्य सर्व्हरवर सिंक झाल्या आहेत.', 'SYSTEM_ALERT', 'success');
  };

  const speakText = (text: string) => {
    speakMarathi(text);
  };

  // SHG CRUD (NO DELETE)
  const addSHG = (shgData: Omit<SHG, 'id' | 'code' | 'totalSavings' | 'totalInternalLoansActive' | 'totalMembersCount'>) => {
    const newId = 'shg_' + Date.now();
    const code = `SHG-MH-${Math.floor(100 + Math.random() * 900)}`;
    const newSHG: SHG = {
      ...shgData,
      id: newId,
      code,
      totalSavings: 0,
      totalInternalLoansActive: 0,
      totalMembersCount: 0
    };
    setShgs(prev => [newSHG, ...prev]);
    addAuditLog('CREATE_SHG', 'नवीन बचत गट नोंदणी', 'SHG', newId, `नवीन गट: ${newSHG.marathiName} (${code}) जोडण्यात आला.`);
    addNotification('नवीन बचत गट जोडला', `${newSHG.marathiName} ची यशस्वी नोंदणी झाली.`, 'SYSTEM_ALERT', 'success');
    speakMarathi(`नवीन बचत गट ${newSHG.marathiName} यशस्वीरित्या तयार करण्यात आला.`);
  };

  const updateSHG = (id: string, updates: Partial<SHG>) => {
    setShgs(prev => prev.map(s => (s.id === id ? { ...s, ...updates } : s)));
    addAuditLog('UPDATE_SHG', 'बचत गट माहिती अद्ययावत', 'SHG', id, `बचत गट तपशील अपडेट केला.`);
  };

  // Member CRUD (NO DELETE)
  const addMember = (memberData: Omit<Member, 'id' | 'totalSaved' | 'activeLoanAmount' | 'joiningDate'>) => {
    const newId = 'mem_' + Date.now();
    const newMember: Member = {
      ...memberData,
      id: newId,
      totalSaved: 0,
      activeLoanAmount: 0,
      joiningDate: new Date().toISOString().split('T')[0]
    };
    setMembers(prev => [newMember, ...prev]);

    // Update SHG member count
    setShgs(prev =>
      prev.map(s => (s.id === memberData.shgId ? { ...s, totalMembersCount: s.totalMembersCount + 1 } : s))
    );

    addAuditLog('CREATE_MEMBER', 'नवीन महिला सदस्य नोंदणी', 'MEMBER', newId, `${newMember.marathiName} यांची ${newMember.shgName} मध्ये नोंदणी.`);
    addNotification('नवीन सदस्य नोंदणी', `${newMember.marathiName} यांची नोंदणी पूर्ण झाली.`, 'SYSTEM_ALERT', 'success');
    speakMarathi(`${newMember.marathiName} यांची नोंदणी यशस्वी झाली.`);
  };

  const updateMember = (id: string, updates: Partial<Member>) => {
    setMembers(prev => prev.map(m => (m.id === id ? { ...m, ...updates } : m)));
    addAuditLog('UPDATE_MEMBER', 'सदस्य माहिती अद्ययावत', 'MEMBER', id, `सदस्य तपशील अपडेट केला.`);
  };

  // Savings
  const recordSavings = (recordData: Omit<SavingsRecord, 'id' | 'receiptNumber' | 'recordedBy'>) => {
    const newId = 'sav_' + Date.now();
    const receiptNumber = `REC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const newRecord: SavingsRecord = {
      ...recordData,
      id: newId,
      receiptNumber,
      recordedBy: currentUser.marathiName,
      syncedOffline: !isOnline
    };

    setSavings(prev => [newRecord, ...prev]);

    // Update Member totalSaved
    setMembers(prev =>
      prev.map(m => (m.id === recordData.memberId ? { ...m, totalSaved: m.totalSaved + recordData.totalAmount } : m))
    );

    // Update SHG totalSavings
    setShgs(prev =>
      prev.map(s => (s.id === recordData.shgId ? { ...s, totalSavings: s.totalSavings + recordData.totalAmount } : s))
    );

    if (!isOnline) {
      setOfflineQueueCount(prev => prev + 1);
    }

    addAuditLog('RECORD_SAVINGS', 'बचत पावती नोंद', 'SAVINGS', newId, `${recordData.memberName} यांची ₹${recordData.totalAmount} बचत पावती (${receiptNumber}) नोंदवली.`);
    addNotification('बचत पावती तयार', `${recordData.memberName} यांची ₹${recordData.totalAmount} बचत जमा झाली.`, 'SAVINGS_RECEIPT', 'success');
    speakMarathi(`${recordData.memberName} यांची ₹${recordData.totalAmount} बचत पावती यशस्वीरित्या नोंदवली गेली.`);
  };

  // Loans
  const disburseLoan = (loanData: Omit<LoanRecord, 'id' | 'remainingPrincipal' | 'totalPaid' | 'status' | 'approvedBy'>) => {
    const newId = 'loan_' + Date.now();
    const newLoan: LoanRecord = {
      ...loanData,
      id: newId,
      remainingPrincipal: loanData.principalAmount,
      totalPaid: 0,
      status: 'सक्रिय (Active)',
      approvedBy: 'बचत गट मासिक सभा ठराव'
    };

    setLoans(prev => [newLoan, ...prev]);

    // Update Member active loan
    setMembers(prev =>
      prev.map(m => (m.id === loanData.memberId ? { ...m, activeLoanAmount: m.activeLoanAmount + loanData.principalAmount } : m))
    );

    // Update SHG internal loans if internal
    if (loanData.loanType.includes('अंतर्गत')) {
      setShgs(prev =>
        prev.map(s => (s.id === loanData.shgId ? { ...s, totalInternalLoansActive: s.totalInternalLoansActive + loanData.principalAmount } : s))
      );
    }

    addAuditLog('DISBURSE_LOAN', 'कर्ज वाटप नोंद', 'LOAN', newId, `${loanData.memberName} यांना ₹${loanData.principalAmount} चे कर्ज मंजूर व वितरित.`);
    addNotification('कर्ज वाटप झाले', `${loanData.memberName} यांना ₹${loanData.principalAmount} कर्ज वितरित केले.`, 'LOAN_DUE', 'info');
    speakMarathi(`${loanData.memberName} यांना ₹${loanData.principalAmount} कर्ज यशस्वीरित्या वाटप करण्यात आले.`);
  };

  const repayLoan = (loanId: string, amount: number, notes?: string) => {
    const targetLoan = loans.find(l => l.id === loanId);
    if (!targetLoan) return;

    const remaining = Math.max(0, targetLoan.remainingPrincipal - amount);
    const newStatus = remaining === 0 ? 'पूर्ण परतफेड (Closed)' : 'सक्रिय (Active)';

    setLoans(prev =>
      prev.map(l =>
        l.id === loanId
          ? {
              ...l,
              remainingPrincipal: remaining,
              totalPaid: l.totalPaid + amount,
              status: newStatus
            }
          : l
      )
    );

    // Update Member loan balance
    setMembers(prev =>
      prev.map(m =>
        m.id === targetLoan.memberId
          ? { ...m, activeLoanAmount: Math.max(0, m.activeLoanAmount - amount) }
          : m
      )
    );

    addAuditLog('REPAY_LOAN', 'कर्ज परतफेड नोंद', 'LOAN', loanId, `${targetLoan.memberName} यांनी ₹${amount} हप्ता जमा केला. शिल्लक: ₹${remaining}`);
    addNotification('कर्ज परतफेड पावती', `${targetLoan.memberName} यांचा ₹${amount} हप्ता जमा झाला.`, 'LOAN_DUE', 'success');
    speakMarathi(`${targetLoan.memberName} यांचा ₹${amount} हप्ता जमा झाला. शिल्लक मुद्दल ₹${remaining} आहे.`);
  };

  // Meetings
  const addMeeting = (mtgData: Omit<Meeting, 'id' | 'totalAttendance' | 'totalMembers' | 'totalSavingsCollected' | 'totalLoanCollected' | 'totalNewLoansSanctioned' | 'status'>) => {
    const newId = 'mtg_' + Date.now();
    const targetSHG = shgs.find(s => s.id === mtgData.shgId);
    const totalMembers = targetSHG ? targetSHG.totalMembersCount : 10;
    const presentCount = mtgData.attendanceList.filter(a => a.status.includes('उपस्थित')).length;
    const totalSavings = mtgData.attendanceList.reduce((acc, cur) => acc + (cur.savingsPaid || 0), 0);
    const totalLoan = mtgData.attendanceList.reduce((acc, cur) => acc + (cur.loanEmiPaid || 0), 0);
    const totalNewLoans = mtgData.attendanceList.reduce((acc, cur) => acc + (cur.newLoanApplied || 0), 0);

    const newMeeting: Meeting = {
      ...mtgData,
      id: newId,
      totalAttendance: presentCount,
      totalMembers,
      totalSavingsCollected: totalSavings,
      totalLoanCollected: totalLoan,
      totalNewLoansSanctioned: totalNewLoans,
      status: 'पूर्ण (Completed)',
      syncedOffline: !isOnline
    };

    setMeetings(prev => [newMeeting, ...prev]);

    // Update SHG savings accordingly
    if (totalSavings > 0) {
      setShgs(prev =>
        prev.map(s => (s.id === mtgData.shgId ? { ...s, totalSavings: s.totalSavings + totalSavings } : s))
      );
    }

    addAuditLog('MEETING_COMPLETED', 'मासिक सभा नोंदणी', 'MEETING', newId, `${mtgData.shgName} ची सभा संपन्न. उपस्थिती: ${presentCount}/${totalMembers}, एकूण संकलन: ₹${totalSavings + totalLoan}`);
    addNotification('मासिक सभा संपन्न', `${mtgData.shgName} ची मासिक सभा यशस्वीरित्या नोंदवली.`, 'MEETING_REMINDER', 'success');
    speakMarathi(`${mtgData.shgName} ची मासिक सभा नोंदणी पूर्ण झाली. एकूण ₹${totalSavings + totalLoan} संकलन झाले.`);
  };

  const completeMeeting = (meetingId: string, resolution: string, photoUrl?: string) => {
    setMeetings(prev =>
      prev.map(m =>
        m.id === meetingId
          ? {
              ...m,
              meetingResolutionText: resolution,
              meetingPhoto: photoUrl || m.meetingPhoto,
              status: 'पूर्ण (Completed)'
            }
          : m
      )
    );
  };

  // Field Visits
  const addFieldVisit = (visitData: Omit<FieldVisit, 'id' | 'crpId' | 'crpName'>) => {
    const newId = 'fld_' + Date.now();
    const newVisit: FieldVisit = {
      ...visitData,
      id: newId,
      crpId: currentUser.id,
      crpName: currentUser.name
    };
    setFieldVisits(prev => [newVisit, ...prev]);
    addAuditLog('FIELD_VISIT', 'क्षेत्रीय भेट नोंद (GPS)', 'FIELD_VISIT', newId, `${visitData.villageName} येथे ${visitData.purpose} अंतर्गत भेट नोंदवली.`);
    addNotification('क्षेत्रीय भेट नोंदवली', `${visitData.villageName} ची भेट यशस्वीरित्या जतन केली.`, 'SYSTEM_ALERT', 'success');
    speakMarathi(`${visitData.villageName} ची क्षेत्रीय भेट यशस्वीरित्या नोंदवली.`);
  };

  // Business / Livelihood
  const addBusiness = (bizData: Omit<BusinessEnterprise, 'id'>) => {
    const newId = 'biz_' + Date.now();
    const newBiz: BusinessEnterprise = {
      ...bizData,
      id: newId
    };
    setBusinesses(prev => [newBiz, ...prev]);
    addAuditLog('ADD_BUSINESS', 'महिला उपजीविका उद्योग नोंद', 'BUSINESS', newId, `${bizData.memberName} यांचा ${bizData.businessName} उद्योग जोडला.`);
    addNotification('उपजीविका नोंदणी', `${bizData.memberName} यांचा व्यवसाय यशस्वी नोंदवला.`, 'SYSTEM_ALERT', 'success');
  };

  // Govt Scheme
  const applyForScheme = (appData: Omit<MemberSchemeApplication, 'id' | 'trackingNumber' | 'status'>) => {
    const newId = 'app_' + Date.now();
    const trackingNumber = `SCH-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const newApp: MemberSchemeApplication = {
      ...appData,
      id: newId,
      trackingNumber,
      status: 'अर्ज केला (Applied)'
    };
    setSchemeApplications(prev => [newApp, ...prev]);
    addAuditLog('APPLY_SCHEME', 'शासकीय योजना अर्ज', 'SCHEME_APP', newId, `${appData.memberName} यांनी ${appData.schemeName} साठी अर्ज दाखल केला.`);
    addNotification('योजना अर्ज दाखल', `${appData.memberName} यांचा अर्ज (${trackingNumber}) नोंदवला.`, 'SCHEME_SANCTION', 'info');
    speakMarathi(`${appData.memberName} यांचा ${appData.schemeName} साठी अर्ज यशस्वीरित्या दाखल झाला.`);
  };

  // Training
  const addTraining = (trnData: Omit<TrainingRecord, 'id'>) => {
    const newId = 'trn_' + Date.now();
    const newTrn: TrainingRecord = { ...trnData, id: newId };
    setTrainings(prev => [newTrn, ...prev]);
    addAuditLog('ADD_TRAINING', 'प्रशिक्षण सत्र नोंद', 'TRAINING', newId, `${trnData.marathiTopic} प्रशिक्षण नोंदवले.`);
  };

  // Tasks
  const toggleTask = (taskId: string) => {
    setTasks(prev => prev.map(t => (t.id === taskId ? { ...t, completed: !t.completed } : t)));
  };

  const addTask = (taskData: Omit<TaskReminder, 'id' | 'completed'>) => {
    const newId = 'tsk_' + Date.now();
    const newTask: TaskReminder = { ...taskData, id: newId, completed: false };
    setTasks(prev => [newTask, ...prev]);
    addNotification('नवीन कार्य जोडले', `${newTask.marathiTitle}`, 'SYSTEM_ALERT', 'info');
  };

  // Documents: Upload, Replace, Verify
  const addDocument = (docData: Omit<DocumentItem, 'id' | 'uploadDate' | 'uploadedBy' | 'status'>) => {
    const newId = 'doc_' + Date.now();
    const newDoc: DocumentItem = {
      ...docData,
      id: newId,
      uploadDate: new Date().toISOString().split('T')[0],
      uploadedBy: currentUser.marathiName,
      status: 'सत्यापित (Verified)'
    };
    setDocuments(prev => [newDoc, ...prev]);
    addAuditLog('UPLOAD_DOC', 'कागदपत्र अपलोड', 'DOCUMENT', newId, `${docData.entityName} चे ${docData.docType} कागदपत्र सुरक्षित जोडले.`);
    addNotification('कागदपत्र अपलोड झाले', `${docData.title} सुरक्षित साठवले आहे.`, 'SYSTEM_ALERT', 'success');
    speakMarathi(`${docData.entityName} यांचे कागदपत्र यशस्वीरित्या सुरक्षित अपलोड झाले.`);
  };

  const replaceDocument = (id: string, newFileUrl: string, newTitle?: string, remarks?: string) => {
    setDocuments(prev =>
      prev.map(d =>
        d.id === id
          ? {
              ...d,
              fileUrl: newFileUrl,
              title: newTitle || d.title,
              uploadDate: new Date().toISOString().split('T')[0],
              uploadedBy: currentUser.marathiName,
              remarks: remarks || d.remarks,
              status: 'सत्यापित (Verified)'
            }
          : d
      )
    );
    addAuditLog('REPLACE_DOC', 'कागदपत्र बदलले (Replace)', 'DOCUMENT', id, `कागदपत्र नवीन फाईलसह अद्ययावत केले.`);
    addNotification('कागदपत्र अद्ययावत झाले', `कागदपत्र नवीन फाईलसह यशस्वीरित्या बदलले आहे.`, 'SYSTEM_ALERT', 'success');
    speakMarathi(`कागदपत्र यशस्वीरित्या नवीन फाईलसह बदलले गेले.`);
  };

  const verifyDocument = (id: string, newStatus: DocumentItem['status'], remarks?: string) => {
    setDocuments(prev =>
      prev.map(d =>
        d.id === id
          ? { ...d, status: newStatus, remarks: remarks || d.remarks }
          : d
      )
    );
    addAuditLog('VERIFY_DOC', 'कागदपत्र पडताळणी', 'DOCUMENT', id, `कागदपत्र स्थिती: ${newStatus}`);
  };

  // Delete SHG (Cascades/Cleans related members and records)
  const deleteSHG = (id: string) => {
    const target = shgs.find(s => s.id === id);
    const shgName = target?.marathiName || 'बचत गट';
    setShgs(prev => prev.filter(s => s.id !== id));
    if (selectedShgId === id) setSelectedShgId(null);
    addAuditLog('DELETE_SHG', 'बचत गट हटवला (Delete SHG)', 'SHG', id, `${shgName} हा बचत गट सिस्टीममधून हटवण्यात आला.`);
    addNotification('बचत गट हटवला', `${shgName} यशस्वीरित्या हटवला गेला आहे.`, 'SYSTEM_ALERT', 'warning');
    speakMarathi(`${shgName} यशस्वीरित्या हटवण्यात आला.`);
  };

  // Delete Member
  const deleteMember = (id: string) => {
    const target = members.find(m => m.id === id);
    const memberName = target?.marathiName || 'सदस्य';
    setMembers(prev => prev.filter(m => m.id !== id));
    if (target?.shgId) {
      setShgs(prev =>
        prev.map(s => (s.id === target.shgId ? { ...s, totalMembersCount: Math.max(0, s.totalMembersCount - 1) } : s))
      );
    }
    if (selectedMemberId === id) setSelectedMemberId(null);
    addAuditLog('DELETE_MEMBER', 'सदस्य नोंद हटवली (Delete Member)', 'MEMBER', id, `${memberName} यांची नोंद हटवण्यात आली.`);
    addNotification('सदस्य नोंद हटवली', `${memberName} यांची नोंद यशस्वीरित्या हटवली आहे.`, 'SYSTEM_ALERT', 'warning');
    speakMarathi(`${memberName} यांची नोंद हटवण्यात आली आहे.`);
  };

  // Delete Family Member
  const deleteFamilyMember = (memberId: string, familyIndex: number) => {
    setMembers(prev =>
      prev.map(m => {
        if (m.id === memberId) {
          const updatedFamily = m.familyMembers ? [...m.familyMembers] : [];
          const removed = updatedFamily.splice(familyIndex, 1);
          addAuditLog('DELETE_FAMILY_MEMBER', 'कुटुंब सदस्य हटवला', 'MEMBER_FAMILY', memberId, `${removed[0]?.marathiName || 'कुटुंब सदस्य'} ची नोंद काढण्यात आली.`);
          return { ...m, familyMembers: updatedFamily };
        }
        return m;
      })
    );
    addNotification('कुटुंब सदस्य नोंद हटवली', `कुटुंब सदस्याची नोंद काढण्यात आली.`, 'SYSTEM_ALERT', 'info');
  };

  // Delete Document
  const deleteDocument = (id: string) => {
    const target = documents.find(d => d.id === id);
    const docTitle = target?.title || 'कागदपत्र';
    setDocuments(prev => prev.filter(d => d.id !== id));
    addAuditLog('DELETE_DOCUMENT', 'कागदपत्र हटवले (Delete Document)', 'DOCUMENT', id, `${docTitle} कागदपत्र सिस्टीममधून हटवले.`);
    addNotification('कागदपत्र हटवले', `${docTitle} सुरक्षितरीत्या हटवले गेले आहे.`, 'SYSTEM_ALERT', 'warning');
    speakMarathi(`${docTitle} यशस्वीरित्या हटवण्यात आले.`);
  };

  // Delete Savings Record
  const deleteSavings = (id: string) => {
    const target = savings.find(s => s.id === id);
    if (!target) return;
    setSavings(prev => prev.filter(s => s.id !== id));
    // Rollback member and SHG balance
    setMembers(prev =>
      prev.map(m => (m.id === target.memberId ? { ...m, totalSaved: Math.max(0, m.totalSaved - target.totalAmount) } : m))
    );
    setShgs(prev =>
      prev.map(s => (s.id === target.shgId ? { ...s, totalSavings: Math.max(0, s.totalSavings - target.totalAmount) } : s))
    );
    addAuditLog('DELETE_SAVINGS', 'बचत पावती हटवली (Delete Savings)', 'SAVINGS', id, `${target.memberName} यांची ₹${target.totalAmount} ची पावती हटवली.`);
    addNotification('बचत पावती हटवली', `पावती क्रमांक ${target.receiptNumber} हटवण्यात आली.`, 'SAVINGS_RECEIPT', 'warning');
    speakMarathi(`बचत पावती यशस्वीरित्या हटवण्यात आली.`);
  };

  // Delete Loan Record
  const deleteLoan = (id: string) => {
    const target = loans.find(l => l.id === id);
    if (!target) return;
    setLoans(prev => prev.filter(l => l.id !== id));
    // Rollback active loan on member
    setMembers(prev =>
      prev.map(m => (m.id === target.memberId ? { ...m, activeLoanAmount: Math.max(0, m.activeLoanAmount - target.remainingPrincipal) } : m))
    );
    if (target.loanType.includes('अंतर्गत')) {
      setShgs(prev =>
        prev.map(s => (s.id === target.shgId ? { ...s, totalInternalLoansActive: Math.max(0, s.totalInternalLoansActive - target.remainingPrincipal) } : s))
      );
    }
    addAuditLog('DELETE_LOAN', 'कर्ज नोंद हटवली (Delete Loan)', 'LOAN', id, `${target.memberName} यांचे कर्ज खाते हटवण्यात आले.`);
    addNotification('कर्ज नोंद हटवली', `${target.memberName} यांचे कर्ज खाते हटवले गेले.`, 'LOAN_DUE', 'warning');
    speakMarathi(`कर्ज नोंद यशस्वीरित्या हटवण्यात आली.`);
  };

  // Delete Meeting
  const deleteMeeting = (id: string) => {
    const target = meetings.find(m => m.id === id);
    const shgName = target?.shgName || 'मासिक सभा';
    setMeetings(prev => prev.filter(m => m.id !== id));
    addAuditLog('DELETE_MEETING', 'मासिक सभा नोंद हटवली (Delete Meeting)', 'MEETING', id, `${shgName} ची सभा नोंद काढण्यात आली.`);
    addNotification('सभा नोंद हटवली', `${shgName} ची सभा नोंद हटवली.`, 'MEETING_REMINDER', 'warning');
    speakMarathi(`मासिक सभा नोंद यशस्वीरित्या हटवण्यात आली.`);
  };

  // Delete Attendance Record from a meeting
  const deleteAttendance = (meetingId: string, memberId: string) => {
    setMeetings(prev =>
      prev.map(m => {
        if (m.id === meetingId) {
          const updatedList = m.attendanceList.filter(a => a.memberId !== memberId);
          const presentCount = updatedList.filter(a => a.status.includes('उपस्थित')).length;
          return {
            ...m,
            attendanceList: updatedList,
            totalAttendance: presentCount
          };
        }
        return m;
      })
    );
    addAuditLog('DELETE_ATTENDANCE', 'उपस्थिती नोंद हटवली', 'ATTENDANCE', meetingId, `सदस्य उपस्थिती नोंद काढण्यात आली.`);
    addNotification('उपस्थिती नोंद काढली', `सभेतील उपस्थिती नोंद अपडेट केली.`, 'SYSTEM_ALERT', 'info');
  };

  // Delete Field Visit
  const deleteFieldVisit = (id: string) => {
    const target = fieldVisits.find(v => v.id === id);
    setFieldVisits(prev => prev.filter(v => v.id !== id));
    addAuditLog('DELETE_FIELD_VISIT', 'क्षेत्रीय भेट नोंद हटवली', 'FIELD_VISIT', id, `${target?.villageName || ''} ची भेट नोंद काढली.`);
    addNotification('क्षेत्रीय भेट हटवली', `भेट नोंद यशस्वीरित्या हटवली.`, 'SYSTEM_ALERT', 'warning');
    speakMarathi(`क्षेत्रीय भेट नोंद हटवण्यात आली.`);
  };

  // Delete Business
  const deleteBusiness = (id: string) => {
    const target = businesses.find(b => b.id === id);
    setBusinesses(prev => prev.filter(b => b.id !== id));
    addAuditLog('DELETE_BUSINESS', 'उपजीविका उद्योग हटवला', 'BUSINESS', id, `${target?.businessName || ''} उद्योग नोंद काढली.`);
    addNotification('उपजीविका नोंद हटवली', `${target?.businessName || ''} ची नोंद हटवली.`, 'SYSTEM_ALERT', 'warning');
  };

  // Delete Scheme
  const deleteScheme = (id: string) => {
    const target = govtSchemes.find(s => s.id === id);
    setGovtSchemes(prev => prev.filter(s => s.id !== id));
    addAuditLog('DELETE_SCHEME', 'शासकीय योजना हटवली', 'SCHEME', id, `${target?.nameMarathi || ''} योजना काढण्यात आली.`);
    addNotification('योजना हटवली', `${target?.nameMarathi || ''} योजना हटवली गेली.`, 'SYSTEM_ALERT', 'warning');
  };

  // Delete Scheme Application
  const deleteSchemeApplication = (id: string) => {
    const target = schemeApplications.find(a => a.id === id);
    setSchemeApplications(prev => prev.filter(a => a.id !== id));
    addAuditLog('DELETE_SCHEME_APP', 'योजना अर्ज हटवला', 'SCHEME_APP', id, `${target?.memberName || ''} चा ${target?.schemeName || ''} अर्ज हटवला.`);
    addNotification('योजना अर्ज हटवला', `अर्ज नोंद हटवण्यात आली.`, 'SYSTEM_ALERT', 'warning');
  };

  // Delete Training
  const deleteTraining = (id: string) => {
    const target = trainings.find(t => t.id === id);
    setTrainings(prev => prev.filter(t => t.id !== id));
    addAuditLog('DELETE_TRAINING', 'प्रशिक्षण नोंद हटवली', 'TRAINING', id, `${target?.marathiTopic || ''} सत्र हटवले.`);
    addNotification('प्रशिक्षण नोंद हटवली', `प्रशिक्षण सत्र काढण्यात आले.`, 'SYSTEM_ALERT', 'warning');
  };

  // Delete Task
  const deleteTask = (id: string) => {
    const target = tasks.find(t => t.id === id);
    setTasks(prev => prev.filter(t => t.id !== id));
    addAuditLog('DELETE_TASK', 'कार्य हटवले', 'TASK', id, `${target?.marathiTitle || ''} कार्य काढण्यात आले.`);
    addNotification('कार्य हटवले', `कार्य यशस्वीरित्या हटवले.`, 'SYSTEM_ALERT', 'info');
  };

  // Delete Notification
  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, isRead: true } : n)));
  };

  const clearAllNotifications = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        switchRole,
        isOnline,
        toggleOnline,
        offlineQueueCount,
        syncOfflineData,
        users,
        blocks,
        villages,
        shgs,
        members,
        documents,
        savings,
        loans,
        meetings,
        fieldVisits,
        businesses,
        govtSchemes,
        schemeApplications,
        trainings,
        tasks,
        notifications,
        auditLogs,
        selectedShgId,
        setSelectedShgId,
        selectedMemberId,
        setSelectedMemberId,
        addSHG,
        updateSHG,
        deleteSHG,
        addMember,
        updateMember,
        deleteMember,
        deleteFamilyMember,
        recordSavings,
        deleteSavings,
        disburseLoan,
        repayLoan,
        deleteLoan,
        addMeeting,
        completeMeeting,
        deleteMeeting,
        deleteAttendance,
        addFieldVisit,
        deleteFieldVisit,
        addBusiness,
        deleteBusiness,
        applyForScheme,
        deleteScheme,
        deleteSchemeApplication,
        addTraining,
        deleteTraining,
        toggleTask,
        addTask,
        deleteTask,
        addDocument,
        replaceDocument,
        verifyDocument,
        deleteDocument,
        markNotificationRead,
        clearAllNotifications,
        deleteNotification,
        speakText,
        globalSearch,
        setGlobalSearch
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

