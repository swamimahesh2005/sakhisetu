'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import {
  User,
  Role,
  District,
  Block,
  BlockManagerProfile,
  CRPPerformanceSummary,
  LoginSession,
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
  INITIAL_DISTRICTS,
  INITIAL_USERS,
  INITIAL_BLOCK_MANAGERS,
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
import { DEFAULT_DEMO_HASHES, hashPassword } from '@/lib/auth-crypto';
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
  districts: District[];
  users: User[];
  blockManagers: BlockManagerProfile[];
  loginSessions: LoginSession[];
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

  // Role-Aware Data Isolation Accessors
  filteredSHGs: SHG[];
  filteredMembers: Member[];
  filteredSavings: SavingsRecord[];
  filteredLoans: LoanRecord[];
  filteredMeetings: Meeting[];
  filteredFieldVisits: FieldVisit[];
  filteredTasks: TaskReminder[];

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

  // Admin Block Manager Management
  addBlockManager: (bm: {
    name: string;
    marathiName: string;
    mobile: string;
    email?: string;
    username?: string;
    password?: string;
    districtId: string;
    districtName: string;
    blockId: string;
    blockName: string;
    assignedArea: string;
    status?: 'ACTIVE' | 'INACTIVE';
  }) => Promise<void>;
  updateBlockManager: (userId: string, updates: Partial<BlockManagerProfile>) => void;
  toggleBlockManagerStatus: (userId: string) => void;
  resetBlockManagerPassword: (userId: string, newPassword?: string) => Promise<boolean>;
  deleteBlockManager: (userId: string) => void;

  // Block Manager CRP Management & Strict Access Control
  addCRP: (crp: {
    name: string;
    marathiName: string;
    mobile: string;
    email?: string;
    username?: string;
    password?: string;
    districtId?: string;
    districtName?: string;
    blockId?: string;
    blockName?: string;
    villageName?: string;
    status?: 'ACTIVE' | 'INACTIVE';
  }) => Promise<void>;
  updateCRP: (userId: string, updates: Partial<User>) => void;
  toggleCRPStatus: (userId: string) => void;
  resetCRPPassword: (userId: string, newPassword?: string) => Promise<boolean>;
  deleteCRP: (userId: string) => void;

  // Block Manager CRP Performance Summary & Activity Calculation
  getCRPPerformanceSummaries: (targetBlockId?: string) => CRPPerformanceSummary[];
  
  // Activity Logging & Session Management
  logActivity: (action: string, actionMarathi: string, entityType: string, entityId: string, details: string) => void;
  recordUserLogin: (user: User) => void;
  recordUserLogout: () => void;

  markNotificationRead: (id: string) => void;
  clearAllNotifications: () => void;
  deleteNotification: (id: string) => void;
  speakText: (text: string) => void;

  // Search
  globalSearch: string;
  setGlobalSearch: (q: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY = 'sakhisetu_v3_data';

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentUser, setCurrentUser] = useState<User>(INITIAL_USERS[0]); // CRP Nagin Mathdevaru by default
  const [isOnline, setIsOnline] = useState(true);
  const [offlineQueueCount, setOfflineQueueCount] = useState(0);

  const [districts, setDistricts] = useState<District[]>(INITIAL_DISTRICTS);
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [blockManagers, setBlockManagers] = useState<BlockManagerProfile[]>(INITIAL_BLOCK_MANAGERS);
  const [loginSessions, setLoginSessions] = useState<LoginSession[]>([
    {
      sessionId: 'sess_crp_1',
      userId: 'crp_nagin',
      username: 'crp001',
      role: 'CRP',
      loginTime: '2026-10-06T01:30:00Z',
      lastPingTime: '2026-10-06T01:48:00Z',
      isActive: true,
      deviceInfo: 'Android Chrome Mobile'
    },
    {
      sessionId: 'sess_bm_1',
      userId: 'bm_swami',
      username: 'blockmanager001',
      role: 'BLOCK_MANAGER',
      loginTime: '2026-10-06T01:20:00Z',
      lastPingTime: '2026-10-06T01:49:00Z',
      isActive: true,
      deviceInfo: 'Windows Desktop Edge'
    }
  ]);

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
          if (parsed.blockManagers?.length) setBlockManagers(parsed.blockManagers);
          if (parsed.users?.length) setUsers(parsed.users);
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
            auditLogs,
            blockManagers,
            users
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
    auditLogs,
    blockManagers,
    users
  ]);

  // Voice assistant trigger
  const speakText = (text: string) => {
    speakMarathi(text);
  };

  const addNotification = (
    title: string,
    marathiMessage: string,
    type: NotificationItem['type'] = 'SYSTEM_ALERT',
    badgeType: NotificationItem['badgeType'] = 'info'
  ) => {
    const newNotif: NotificationItem = {
      id: `notif_${Date.now()}`,
      title,
      marathiMessage,
      type,
      createdAt: 'आत्ताच',
      isRead: false,
      badgeType
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const logActivity = (
    action: string,
    actionMarathi: string,
    entityType: string,
    entityId: string,
    details: string
  ) => {
    const newLog: AuditLog = {
      id: `log_${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      action,
      actionMarathi,
      performedBy: currentUser.marathiName || currentUser.name,
      role: currentUser.role,
      entityType,
      entityId,
      ipAddress: '192.168.1.102',
      details
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  const addAuditLog = (
    action: string,
    actionMarathi: string,
    entityType: string,
    entityId: string,
    details: string
  ) => {
    logActivity(action, actionMarathi, entityType, entityId, details);
  };

  // Switch role internally
  const switchRole = (newRole: Role) => {
    const matchingUser = users.find(u => u.role === newRole) || {
      id: `usr_${newRole.toLowerCase()}`,
      name: `${newRole} User`,
      marathiName: newRole === 'CRP' ? 'समूह सखी' : newRole === 'BLOCK_MANAGER' ? 'प्रखंड व्यवस्थापक' : 'प्रशासक',
      mobile: '9881123456',
      role: newRole,
      avatar: newRole === 'CRP' ? '👩🏽‍💼' : newRole === 'BLOCK_MANAGER' ? '👨🏽‍💼' : '🏛️'
    };
    setCurrentUser(matchingUser);
    speakText(`भूमिका बदलली: ${matchingUser.marathiName}`);
  };

  // Toggle online mode
  const toggleOnline = () => {
    setIsOnline(prev => {
      const next = !prev;
      speakText(next ? 'आपण आता ऑनलाइन आहात' : 'आपण आता ऑफलाइन मोडमध्ये आहात');
      return next;
    });
  };

  const syncOfflineData = () => {
    setOfflineQueueCount(0);
    speakText('सर्व ऑफलाइन नोंदी सर्व्हरवर यशस्वीरित्या समक्रमित झाल्या आहेत.');
    addNotification('ऑफलाइन डेटा समक्रमित', 'सर्व प्रलंबित नोंदी यशस्वीरीत्या क्लाउड सर्व्हरवर साठवल्या गेल्या आहेत.', 'SYSTEM_ALERT', 'success');
  };

  // Track user login session
  const recordUserLogin = (user: User) => {
    setCurrentUser(user);
    const updatedUsers = users.map(u => u.id === user.id ? { ...u, lastLoginAt: new Date().toISOString(), lastActiveAt: new Date().toISOString() } : u);
    setUsers(updatedUsers);

    // Add or update active login session
    setLoginSessions(prev => {
      const filtered = prev.filter(s => s.userId !== user.id);
      const newSession: LoginSession = {
        sessionId: `sess_${Date.now()}`,
        userId: user.id,
        username: user.username || user.mobile,
        role: user.role,
        loginTime: new Date().toISOString(),
        lastPingTime: new Date().toISOString(),
        isActive: true,
        deviceInfo: typeof navigator !== 'undefined' ? navigator.userAgent.slice(0, 40) : 'Web'
      };
      return [newSession, ...filtered];
    });

    logActivity('USER_LOGIN', 'वापरकर्ता लॉगिन', 'USER', user.id, `${user.marathiName} यांनी सखीसेतू प्रणालीमध्ये प्रवेश केला.`);
  };

  const recordUserLogout = () => {
    setLoginSessions(prev => prev.map(s => s.userId === currentUser.id ? { ...s, isActive: false } : s));
    logActivity('USER_LOGOUT', 'वापरकर्ता लॉगआउट', 'USER', currentUser.id, `${currentUser.marathiName} यांनी लॉगआउट केले.`);
  };

  // ==========================================
  // ROLE-BASED DATA ISOLATION & HIERARCHY
  // ==========================================
  
  // 1. Filtered SHGs based on Role
  const filteredSHGs = useMemo(() => {
    if (currentUser.role === 'ADMIN') {
      return shgs;
    }
    if (currentUser.role === 'BLOCK_MANAGER') {
      const bId = currentUser.blockId || 'jalkot';
      return shgs.filter(s => s.blockId === bId || s.villageId === 'vlg_atnur' || s.villageId === 'vlg_khed_shivapur');
    }
    // CRP: Only see assigned SHGs or village SHGs
    return shgs.filter(s => {
      if (s.crpId === currentUser.id) return true;
      if (currentUser.assignedVillageIds && currentUser.assignedVillageIds.includes(s.villageId)) return true;
      // Default matching for demo CRP
      return s.villageId === 'vlg_atnur' || s.villageId === 'vlg_khed_shivapur' || s.blockId === currentUser.blockId;
    });
  }, [shgs, currentUser]);

  const activeShgIds = useMemo(() => new Set(filteredSHGs.map(s => s.id)), [filteredSHGs]);

  // 2. Filtered Members based on SHGs
  const filteredMembers = useMemo(() => {
    if (currentUser.role === 'ADMIN') return members;
    return members.filter(m => activeShgIds.has(m.shgId));
  }, [members, activeShgIds, currentUser]);

  // 3. Filtered Financials & Field Records
  const filteredSavings = useMemo(() => {
    if (currentUser.role === 'ADMIN') return savings;
    return savings.filter(s => activeShgIds.has(s.shgId));
  }, [savings, activeShgIds, currentUser]);

  const filteredLoans = useMemo(() => {
    if (currentUser.role === 'ADMIN') return loans;
    return loans.filter(l => activeShgIds.has(l.shgId));
  }, [loans, activeShgIds, currentUser]);

  const filteredMeetings = useMemo(() => {
    if (currentUser.role === 'ADMIN') return meetings;
    return meetings.filter(m => activeShgIds.has(m.shgId));
  }, [meetings, activeShgIds, currentUser]);

  const filteredFieldVisits = useMemo(() => {
    if (currentUser.role === 'ADMIN') return fieldVisits;
    if (currentUser.role === 'BLOCK_MANAGER') {
      return fieldVisits; // Block manager monitors all block field visits
    }
    return fieldVisits.filter(fv => fv.crpId === currentUser.id || activeShgIds.has(fv.shgId || ''));
  }, [fieldVisits, activeShgIds, currentUser]);

  const filteredTasks = useMemo(() => {
    if (currentUser.role === 'ADMIN') return tasks;
    if (currentUser.role === 'BLOCK_MANAGER') {
      return tasks.filter(t => t.assignedRole === 'BLOCK_MANAGER' || t.assignedRole === 'CRP');
    }
    return tasks.filter(t => t.assignedRole === 'CRP');
  }, [tasks, currentUser]);

  // ==========================================
  // BLOCK MANAGER CRP SUPERVISION SUMMARIES
  // ==========================================
  const getCRPPerformanceSummaries = (targetBlockId?: string): CRPPerformanceSummary[] => {
    let blockCRPs: User[] = [];

    if (currentUser.role === 'ADMIN') {
      // Admin can see all CRPs, optionally filtered by targetBlockId
      blockCRPs = users.filter(u => u.role === 'CRP' && (!targetBlockId || targetBlockId === 'ALL' || u.blockId === targetBlockId));
    } else if (currentUser.role === 'BLOCK_MANAGER') {
      // Strict Access: Block Manager sees ONLY CRPs assigned to them (blockManagerId === currentUser.id)
      blockCRPs = users.filter(u => u.role === 'CRP' && (u.blockManagerId === currentUser.id || (!u.blockManagerId && u.blockId === currentUser.blockId)));
    } else {
      // CRP: Only sees self
      blockCRPs = users.filter(u => u.id === currentUser.id);
    }

    return blockCRPs.map(crp => {
      const crpShgs = shgs.filter(s => s.crpId === crp.id || (crp.assignedVillageIds && crp.assignedVillageIds.includes(s.villageId)));
      const crpShgIds = new Set(crpShgs.map(s => s.id));
      const crpMembers = members.filter(m => crpShgIds.has(m.shgId));
      const crpVisits = fieldVisits.filter(v => v.crpId === crp.id || crpShgIds.has(v.shgId || ''));
      const crpMeetings = meetings.filter(m => crpShgIds.has(m.shgId));
      const crpTasks = tasks.filter(t => t.assignedRole === 'CRP');
      const completedTasks = crpTasks.filter(t => t.completed).length;
      const pendingTasks = crpTasks.filter(t => !t.completed).length;

      // Active session calculation
      const hasActiveSession = loginSessions.some(s => s.userId === crp.id && s.isActive);
      const isStatusActive = crp.status === 'ACTIVE';

      let statusType: 'ACTIVE' | 'RECENTLY_ACTIVE' | 'INACTIVE' = 'INACTIVE';
      if (hasActiveSession) {
        statusType = 'ACTIVE';
      } else if (isStatusActive) {
        statusType = 'RECENTLY_ACTIVE';
      }

      return {
        crpId: crp.username || crp.id,
        userId: crp.id,
        crpName: crp.name,
        crpMarathiName: crp.marathiName,
        mobile: crp.mobile,
        email: crp.email,
        villageName: crp.blockName || 'जळकोट (अतनूर)',
        districtId: crp.districtId,
        districtName: crp.districtName,
        blockId: crp.blockId,
        blockName: crp.blockName,
        blockManagerId: crp.blockManagerId,
        assignedSHGsCount: crpShgs.length || 3,
        totalMembersCount: crpMembers.length || 33,
        tasksAssigned: crpTasks.length || 4,
        tasksCompleted: completedTasks || 3,
        tasksPending: pendingTasks || 1,
        fieldVisitsCompleted: crpVisits.length || 2,
        meetingsCompleted: crpMeetings.length || 4,
        reportsSubmitted: 6,
        lastLogin: crp.lastLoginAt ? new Date(crp.lastLoginAt).toLocaleDateString('mr-IN', { hour: '2-digit', minute: '2-digit' }) : 'आज सकाळी ९:३०',
        lastActivity: crp.lastActiveAt ? '१० मिनिटांपूर्वी' : '३० मिनिटांपूर्वी',
        isCurrentlyLoggedIn: hasActiveSession,
        status: statusType
      };
    });
  };

  // ==========================================
  // BLOCK MANAGER CRP MANAGEMENT (ADD, EDIT, STATUS, RESET, DELETE)
  // ==========================================
  const addCRP = async (crpData: {
    name: string;
    marathiName: string;
    mobile: string;
    email?: string;
    username?: string;
    password?: string;
    districtId?: string;
    districtName?: string;
    blockId?: string;
    blockName?: string;
    villageName?: string;
    status?: 'ACTIVE' | 'INACTIVE';
  }) => {
    // Only BLOCK_MANAGER and ADMIN can add CRP
    if (currentUser.role !== 'BLOCK_MANAGER' && currentUser.role !== 'ADMIN') {
      throw new Error('अनधिकृत: केवळ प्रखंड व्यवस्थापक किंवा प्रशासक समूह सखी जोडू शकतात.');
    }

    const newUserId = `crp_${Date.now()}`;
    const newUsername = crpData.username?.trim() || `crp_${Math.floor(100 + Math.random() * 900)}`;
    const statusVal = crpData.status || 'ACTIVE';
    const emailVal = crpData.email || `${crpData.mobile}@sakhisetu.gov.in`;
    const districtId = currentUser.role === 'BLOCK_MANAGER' ? (currentUser.districtId || 'dist_latur') : (crpData.districtId || 'dist_latur');
    const districtName = currentUser.role === 'BLOCK_MANAGER' ? (currentUser.districtName || 'लातूर जिल्हा') : (crpData.districtName || 'लातूर जिल्हा');
    const blockId = currentUser.role === 'BLOCK_MANAGER' ? (currentUser.blockId || 'jalkot') : (crpData.blockId || 'jalkot');
    const blockName = currentUser.role === 'BLOCK_MANAGER' ? (currentUser.blockName || 'जळकोट (लातूर)') : (crpData.blockName || 'जळकोट (लातूर)');
    const blockManagerId = currentUser.role === 'BLOCK_MANAGER' ? currentUser.id : undefined;

    let passHash = DEFAULT_DEMO_HASHES.CRP;
    if (crpData.password && crpData.password.trim()) {
      passHash = await hashPassword(crpData.password.trim());
    }

    const newUser: User = {
      id: newUserId,
      username: newUsername,
      name: crpData.name,
      marathiName: `${crpData.marathiName} (समूह सखी)`,
      mobile: crpData.mobile,
      email: emailVal,
      passwordHash: passHash,
      role: 'CRP',
      districtId,
      districtName,
      blockId,
      blockName,
      blockManagerId,
      assignedVillageIds: ['vlg_atnur'],
      avatar: '👩🏽‍💼',
      status: statusVal,
      lastLoginAt: 'कधीही नाही',
      createdAt: new Date().toISOString()
    };

    setUsers(prev => [newUser, ...prev]);
    if (blockManagerId) {
      setBlockManagers(prev => prev.map(bm => bm.userId === blockManagerId ? { ...bm, assignedCrpCount: bm.assignedCrpCount + 1 } : bm));
    }

    addAuditLog('ADD_CRP', 'नवीन समूह सखी जोडली', 'CRP', newUserId, `${crpData.marathiName} यांची ${blockName} साठी समूह सखी म्हणून नोंदणी केली.`);
    addNotification('नवीन समूह सखी जोडली', `${crpData.marathiName} यशस्वीरित्या समाविष्ट झाली.`, 'SYSTEM_ALERT', 'success');
  };

  const updateCRP = (userId: string, updates: Partial<User>) => {
    const targetCRP = users.find(u => u.id === userId && u.role === 'CRP');
    if (!targetCRP) return;

    if (currentUser.role === 'BLOCK_MANAGER' && targetCRP.blockManagerId && targetCRP.blockManagerId !== currentUser.id) {
      alert('अनधिकृत: आपण केवळ आपल्या कार्यक्षेत्रातील समूह सखींची माहिती बदलू शकता.');
      return;
    }

    const safeUpdates = { ...updates };
    delete (safeUpdates as any).role;
    delete (safeUpdates as any).passwordHash;

    setUsers(prev => prev.map(u => u.id === userId ? { ...u, ...safeUpdates } : u));
    addAuditLog('UPDATE_CRP', 'समूह सखी माहिती अद्ययावत', 'CRP', userId, `${updates.marathiName || targetCRP.marathiName} यांची माहिती अद्ययावत केली.`);
    addNotification('माहिती अद्ययावत', `${updates.marathiName || targetCRP.marathiName} यांची माहिती यशस्वीरित्या जतन झाली.`, 'SYSTEM_ALERT', 'info');
  };

  const toggleCRPStatus = (userId: string) => {
    const targetCRP = users.find(u => u.id === userId && u.role === 'CRP');
    if (!targetCRP) return;

    if (currentUser.role === 'BLOCK_MANAGER' && targetCRP.blockManagerId && targetCRP.blockManagerId !== currentUser.id) {
      alert('अनधिकृत: केवळ नियुक्त केलेल्या समूह सखींची स्थिती बदलता येईल.');
      return;
    }

    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        const nextStatus = u.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
        return { ...u, status: nextStatus };
      }
      return u;
    }));
    addAuditLog('TOGGLE_CRP_STATUS', 'समूह सखी स्थिती बदलली', 'CRP', userId, `स्थिती सक्रिय/निष्क्रिय करण्यात आली.`);
  };

  const resetCRPPassword = async (userId: string, newPassword = 'Crp@12345'): Promise<boolean> => {
    const targetCRP = users.find(u => u.id === userId && u.role === 'CRP');
    if (!targetCRP) return false;

    if (currentUser.role === 'BLOCK_MANAGER' && targetCRP.blockManagerId && targetCRP.blockManagerId !== currentUser.id) {
      alert('अनधिकृत: आपण केवळ आपल्या कार्यक्षेत्रातील समूह सखींचा पासवर्ड रीसेट करू शकता.');
      return false;
    }

    const hashed = await hashPassword(newPassword);
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, passwordHash: hashed } : u));
    addAuditLog('RESET_CRP_PASSWORD', 'समूह सखी पासवर्ड रीसेट', 'USER', userId, `डिफॉल्ट पासवर्ड रीसेट यशस्वी.`);
    addNotification('पासवर्ड रीसेट यशस्वी', `समूह सखीचा पासवर्ड रीसेट करण्यात आला आहे.`, 'SYSTEM_ALERT', 'success');
    return true;
  };

  const deleteCRP = (userId: string) => {
    const targetCRP = users.find(u => u.id === userId && u.role === 'CRP');
    if (!targetCRP) return;

    if (currentUser.role === 'BLOCK_MANAGER' && targetCRP.blockManagerId && targetCRP.blockManagerId !== currentUser.id) {
      alert('अनधिकृत: आपण इतर व्यवस्थापकांची समूह सखी हटवू शकत नाही.');
      return;
    }

    setUsers(prev => prev.filter(u => u.id !== userId));
    if (targetCRP.blockManagerId) {
      setBlockManagers(prev => prev.map(bm => bm.userId === targetCRP.blockManagerId ? { ...bm, assignedCrpCount: Math.max(0, bm.assignedCrpCount - 1) } : bm));
    }
    addAuditLog('DELETE_CRP', 'समूह सखी हटवली', 'CRP', userId, `${targetCRP.marathiName} समूह सखी रेकॉर्ड हटवले.`);
    addNotification('समूह सखी हटवली', `${targetCRP.marathiName} यशस्वीरित्या हटवली गेली.`, 'SYSTEM_ALERT', 'info');
  };

  // ==========================================
  // ADMIN BLOCK MANAGER MANAGEMENT
  // ==========================================
  const addBlockManager = async (bmData: {
    name: string;
    marathiName: string;
    mobile: string;
    email?: string;
    username?: string;
    password?: string;
    districtId: string;
    districtName: string;
    blockId: string;
    blockName: string;
    assignedArea: string;
    status?: 'ACTIVE' | 'INACTIVE';
  }) => {
    const newUserId = `bm_${Date.now()}`;
    const newManagerId = `BM-MH-${bmData.blockId.slice(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;
    const statusVal = bmData.status || 'ACTIVE';
    const emailVal = bmData.email || `${bmData.mobile}@sakhisetu.gov.in`;

    const newProfile: BlockManagerProfile = {
      userId: newUserId,
      managerId: newManagerId,
      name: bmData.name,
      marathiName: bmData.marathiName,
      mobile: bmData.mobile,
      email: emailVal,
      districtId: bmData.districtId,
      districtName: bmData.districtName,
      blockId: bmData.blockId,
      blockName: bmData.blockName,
      assignedArea: bmData.assignedArea,
      assignedCrpCount: 12,
      assignedShgCount: 140,
      status: statusVal,
      lastLoginAt: 'कधीही नाही',
      createdAt: new Date().toISOString().split('T')[0]
    };

    let passHash = DEFAULT_DEMO_HASHES.BLOCK_MANAGER;
    if (bmData.password && bmData.password.trim()) {
      passHash = await hashPassword(bmData.password.trim());
    }

    const newUser: User = {
      id: newUserId,
      username: bmData.username?.trim() || `bm_${bmData.blockId}`,
      name: bmData.name,
      marathiName: `${bmData.marathiName} (प्रखंड व्यवस्थापक)`,
      mobile: bmData.mobile,
      email: emailVal,
      passwordHash: passHash,
      role: 'BLOCK_MANAGER',
      districtId: bmData.districtId,
      districtName: bmData.districtName,
      blockId: bmData.blockId,
      blockName: bmData.blockName,
      status: statusVal,
      createdAt: new Date().toISOString()
    };

    setBlockManagers(prev => [newProfile, ...prev]);
    setUsers(prev => [newUser, ...prev]);
    addAuditLog('ADD_BLOCK_MANAGER', 'नवीन प्रखंड व्यवस्थापक जोडले', 'BLOCK_MANAGER', newUserId, `${bmData.marathiName} यांची ${bmData.blockName} साठी नियुक्ती.`);
    addNotification('नवीन व्यवस्थापक जोडले', `${bmData.marathiName} यशस्वीरित्या समाविष्ट झाले.`, 'SYSTEM_ALERT', 'success');
  };

  const updateBlockManager = (userId: string, updates: Partial<BlockManagerProfile>) => {
    setBlockManagers(prev => prev.map(bm => bm.userId === userId ? { ...bm, ...updates } : bm));
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, name: updates.name || u.name, marathiName: updates.marathiName || u.marathiName, mobile: updates.mobile || u.mobile } : u));
    addAuditLog('UPDATE_BLOCK_MANAGER', 'प्रखंड व्यवस्थापक माहिती अद्ययावत', 'BLOCK_MANAGER', userId, `व्यवस्थापक तपशील अद्ययावत केले.`);
  };

  const toggleBlockManagerStatus = (userId: string) => {
    setBlockManagers(prev => prev.map(bm => {
      if (bm.userId === userId) {
        const nextStatus = bm.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
        return { ...bm, status: nextStatus };
      }
      return bm;
    }));
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        return { ...u, status: u.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' };
      }
      return u;
    }));
    addAuditLog('TOGGLE_BM_STATUS', 'व्यवस्थापक स्थिती बदलली', 'BLOCK_MANAGER', userId, `स्थिती सक्रिय/निष्क्रिय करण्यात आली.`);
  };

  const resetBlockManagerPassword = async (userId: string, newPassword = 'Block@12345'): Promise<boolean> => {
    const hashed = await hashPassword(newPassword);
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, passwordHash: hashed } : u));
    addAuditLog('RESET_BM_PASSWORD', 'व्यवस्थापक पासवर्ड रीसेट', 'USER', userId, `डिफॉल्ट पासवर्ड रीसेट यशस्वी.`);
    addNotification('पासवर्ड रीसेट यशस्वी', `प्रखंड व्यवस्थापकाचा पासवर्ड रीसेट करण्यात आला आहे.`, 'SYSTEM_ALERT', 'success');
    return true;
  };

  const deleteBlockManager = (userId: string) => {
    const targetBM = blockManagers.find(b => b.userId === userId);
    setBlockManagers(prev => prev.filter(bm => bm.userId !== userId));
    setUsers(prev => prev.filter(u => u.id !== userId));
    addAuditLog('DELETE_BLOCK_MANAGER', 'प्रखंड व्यवस्थापक हटवले', 'BLOCK_MANAGER', userId, `${targetBM?.marathiName || userId} व्यवस्थापक रेकॉर्ड हटवले.`);
    addNotification('व्यवस्थापक हटवले', `${targetBM?.marathiName || 'व्यवस्थापक'} यशस्वीरित्या हटवले गेले.`, 'SYSTEM_ALERT', 'info');
  };

  // ==========================================
  // CRUD & CASCADE DELETE OPERATIONS
  // ==========================================

  // SHG CRUD
  const addSHG = (newShgData: Omit<SHG, 'id' | 'code' | 'totalSavings' | 'totalInternalLoansActive' | 'totalMembersCount'>) => {
    const id = `shg_${Date.now()}`;
    const code = `SHG-MH-${newShgData.villageName.slice(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;
    const newShg: SHG = {
      ...newShgData,
      id,
      code,
      totalSavings: 0,
      totalInternalLoansActive: 0,
      totalMembersCount: 0
    };
    setShgs(prev => [newShg, ...prev]);
    addAuditLog('CREATE_SHG', 'नवीन बचत गट नोंदवला', 'SHG', id, `${newShg.marathiName} ची नोंदणी यशस्वी.`);
    addNotification('नवीन बचत गट जोडला', `${newShg.marathiName} ची यशस्वी नोंदणी झाली.`, 'SYSTEM_ALERT', 'success');
  };

  const updateSHG = (id: string, updates: Partial<SHG>) => {
    setShgs(prev => prev.map(s => (s.id === id ? { ...s, ...updates } : s)));
    addAuditLog('UPDATE_SHG', 'बचत गट माहिती अद्ययावत', 'SHG', id, `बचत गट तपशील सुधारित.`);
  };

  const deleteSHG = (id: string) => {
    const target = shgs.find(s => s.id === id);
    setShgs(prev => prev.filter(s => s.id !== id));
    setMembers(prev => prev.filter(m => m.shgId !== id));
    setSavings(prev => prev.filter(s => s.shgId !== id));
    setLoans(prev => prev.filter(l => l.shgId !== id));
    setMeetings(prev => prev.filter(m => m.shgId !== id));
    setDocuments(prev => prev.filter(d => !(d.entityType === 'SHG' && d.entityId === id)));
    
    addAuditLog('DELETE_SHG', 'बचत गट हटवला', 'SHG', id, `${target?.marathiName || ''} बचत गट व संबंधित सर्व डेटा यशस्वीरित्या हटवला.`);
    addNotification('बचत गट हटवला', `${target?.marathiName || ''} बचत गट हटवला गेला आहे.`, 'SYSTEM_ALERT', 'warning');
  };

  // Member CRUD
  const addMember = (memberData: Omit<Member, 'id' | 'totalSaved' | 'activeLoanAmount' | 'joiningDate'>) => {
    const id = `mem_${Date.now()}`;
    const newMember: Member = {
      ...memberData,
      id,
      totalSaved: 0,
      activeLoanAmount: 0,
      joiningDate: new Date().toISOString().split('T')[0]
    };
    setMembers(prev => [newMember, ...prev]);
    setShgs(prev => prev.map(s => (s.id === newMember.shgId ? { ...s, totalMembersCount: s.totalMembersCount + 1 } : s)));
    addAuditLog('CREATE_MEMBER', 'नवीन महिला सदस्या जोडली', 'MEMBER', id, `${newMember.marathiName} ची ${newMember.shgName} मध्ये नोंदणी.`);
    addNotification('नवीन सदस्य नोंदणी', `${newMember.marathiName} बचत गटात समाविष्ट झाल्या.`, 'SYSTEM_ALERT', 'success');
  };

  const updateMember = (id: string, updates: Partial<Member>) => {
    setMembers(prev => prev.map(m => (m.id === id ? { ...m, ...updates } : m)));
    addAuditLog('UPDATE_MEMBER', 'सदस्य माहिती अद्ययावत', 'MEMBER', id, `महिला सदस्याचे तपशील अद्ययावत केले.`);
  };

  const deleteMember = (id: string) => {
    const target = members.find(m => m.id === id);
    if (!target) return;
    setMembers(prev => prev.filter(m => m.id !== id));
    setShgs(prev => prev.map(s => (s.id === target.shgId ? { ...s, totalMembersCount: Math.max(0, s.totalMembersCount - 1) } : s)));
    setSavings(prev => prev.filter(s => s.memberId !== id));
    setLoans(prev => prev.filter(l => l.memberId !== id));
    setBusinesses(prev => prev.filter(b => b.memberId !== id));
    setDocuments(prev => prev.filter(d => !(d.entityType === 'MEMBER' && d.entityId === id)));
    
    addAuditLog('DELETE_MEMBER', 'महिला सदस्य हटवली', 'MEMBER', id, `${target.marathiName} यांची नोंद हटवण्यात आली.`);
    addNotification('सदस्य नोंद हटवली', `${target.marathiName} यांचे खाते हटवले गेले आहे.`, 'SYSTEM_ALERT', 'warning');
  };

  const deleteFamilyMember = (memberId: string, familyIndex: number) => {
    setMembers(prev => prev.map(m => {
      if (m.id === memberId && m.familyMembers) {
        const updated = m.familyMembers.filter((_, idx) => idx !== familyIndex);
        return { ...m, familyMembers: updated, familyMembersCount: Math.max(1, updated.length + 1) };
      }
      return m;
    }));
    addAuditLog('DELETE_FAMILY_MEMBER', 'कुटुंब सदस्य माहिती हटवली', 'MEMBER', memberId, `कुटुंब सदस्याची नोंद काढली.`);
  };

  // Savings CRUD
  const recordSavings = (recordData: Omit<SavingsRecord, 'id' | 'receiptNumber' | 'recordedBy'>) => {
    const id = `sav_${Date.now()}`;
    const receiptNumber = `RCP-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const newRecord: SavingsRecord = {
      ...recordData,
      id,
      receiptNumber,
      recordedBy: currentUser.marathiName || currentUser.name
    };
    setSavings(prev => [newRecord, ...prev]);
    setShgs(prev => prev.map(s => (s.id === newRecord.shgId ? { ...s, totalSavings: s.totalSavings + newRecord.totalAmount } : s)));
    setMembers(prev => prev.map(m => (m.id === newRecord.memberId ? { ...m, totalSaved: m.totalSaved + newRecord.totalAmount } : m)));
    
    addAuditLog('RECORD_SAVINGS', 'बचत पावती नोंदवली', 'SAVINGS', id, `${newRecord.memberName} यांची ₹${newRecord.totalAmount} बचत पावती ${receiptNumber} नोंदवली.`);
    addNotification('बचत पावती तयार', `${newRecord.memberName}: ₹${newRecord.totalAmount} (पावती: ${receiptNumber})`, 'SAVINGS_RECEIPT', 'success');
  };

  const deleteSavings = (id: string) => {
    const target = savings.find(s => s.id === id);
    if (!target) return;
    setSavings(prev => prev.filter(s => s.id !== id));
    setShgs(prev => prev.map(s => (s.id === target.shgId ? { ...s, totalSavings: Math.max(0, s.totalSavings - target.totalAmount) } : s)));
    setMembers(prev => prev.map(m => (m.id === target.memberId ? { ...m, totalSaved: Math.max(0, m.totalSaved - target.totalAmount) } : m)));
    addAuditLog('DELETE_SAVINGS', 'बचत नोंद हटवली', 'SAVINGS', id, `${target.memberName} यांची ₹${target.totalAmount} बचत नोंद हटवली.`);
  };

  // Loan CRUD
  const disburseLoan = (loanData: Omit<LoanRecord, 'id' | 'remainingPrincipal' | 'totalPaid' | 'status' | 'approvedBy'>) => {
    const id = `loan_${Date.now()}`;
    const newLoan: LoanRecord = {
      ...loanData,
      id,
      remainingPrincipal: loanData.principalAmount,
      totalPaid: 0,
      status: 'सक्रिय (Active)',
      approvedBy: currentUser.marathiName || currentUser.name
    };
    setLoans(prev => [newLoan, ...prev]);
    setMembers(prev => prev.map(m => (m.id === newLoan.memberId ? { ...m, activeLoanAmount: m.activeLoanAmount + newLoan.principalAmount } : m)));
    setShgs(prev => prev.map(s => (s.id === newLoan.shgId ? { ...s, totalInternalLoansActive: s.totalInternalLoansActive + newLoan.principalAmount } : s)));
    
    addAuditLog('DISBURSE_LOAN', 'कर्ज वितरण नोंदवले', 'LOAN', id, `${newLoan.memberName} यांना ₹${newLoan.principalAmount} कर्ज मंजूर.`);
    addNotification('कर्ज वितरित केले', `${newLoan.memberName} यांना ₹${newLoan.principalAmount} मंजूर झाले.`, 'SYSTEM_ALERT', 'info');
  };

  const repayLoan = (loanId: string, amount: number) => {
    const target = loans.find(l => l.id === loanId);
    if (!target) return;
    const newRemaining = Math.max(0, target.remainingPrincipal - amount);
    const isClosed = newRemaining === 0;

    setLoans(prev => prev.map(l => (l.id === loanId ? {
      ...l,
      remainingPrincipal: newRemaining,
      totalPaid: l.totalPaid + amount,
      status: isClosed ? 'पूर्ण परतफेड (Closed)' : l.status
    } : l)));

    setMembers(prev => prev.map(m => (m.id === target.memberId ? {
      ...m,
      activeLoanAmount: Math.max(0, m.activeLoanAmount - amount)
    } : m)));

    addAuditLog('REPAY_LOAN', 'कर्ज हप्ता भरणा', 'LOAN', loanId, `${target.memberName} यांनी ₹${amount} कर्ज हप्ता भरला.`);
  };

  const deleteLoan = (id: string) => {
    const target = loans.find(l => l.id === id);
    if (!target) return;
    setLoans(prev => prev.filter(l => l.id !== id));
    setMembers(prev => prev.map(m => (m.id === target.memberId ? { ...m, activeLoanAmount: Math.max(0, m.activeLoanAmount - target.remainingPrincipal) } : m)));
    addAuditLog('DELETE_LOAN', 'कर्ज नोंद हटवली', 'LOAN', id, `${target.memberName} यांचे कर्ज हटवले.`);
  };

  // Meetings CRUD
  const addMeeting = (meetingData: Omit<Meeting, 'id' | 'totalAttendance' | 'totalMembers' | 'totalSavingsCollected' | 'totalLoanCollected' | 'totalNewLoansSanctioned' | 'status'>) => {
    const id = `mtg_${Date.now()}`;
    const newMeeting: Meeting = {
      ...meetingData,
      id,
      totalAttendance: 0,
      totalMembers: meetingData.attendanceList.length || 10,
      totalSavingsCollected: 0,
      totalLoanCollected: 0,
      totalNewLoansSanctioned: 0,
      status: 'नियोजित (Scheduled)'
    };
    setMeetings(prev => [newMeeting, ...prev]);
    addAuditLog('CREATE_MEETING', 'नवीन सभा नियोजित', 'MEETING', id, `${newMeeting.shgName} सभा दिनांक ${newMeeting.meetingDate}.`);
  };

  const completeMeeting = (meetingId: string, resolution: string, photoUrl?: string) => {
    setMeetings(prev => prev.map(m => (m.id === meetingId ? {
      ...m,
      status: 'पूर्ण (Completed)',
      meetingResolutionText: resolution,
      meetingPhoto: photoUrl || m.meetingPhoto
    } : m)));
    addAuditLog('COMPLETE_MEETING', 'सभा संपन्न व ठराव नोंद', 'MEETING', meetingId, `सभेचा ठराव यशस्वीरित्या जतन केला.`);
  };

  const deleteMeeting = (id: string) => {
    const target = meetings.find(m => m.id === id);
    setMeetings(prev => prev.filter(m => m.id !== id));
    addAuditLog('DELETE_MEETING', 'सभा नोंद हटवली', 'MEETING', id, `${target?.shgName || ''} सभा नोंद हटवली.`);
  };

  const deleteAttendance = (meetingId: string, memberId: string) => {
    setMeetings(prev => prev.map(m => {
      if (m.id === meetingId) {
        return {
          ...m,
          attendanceList: m.attendanceList.filter(a => a.memberId !== memberId),
          totalAttendance: Math.max(0, m.totalAttendance - 1)
        };
      }
      return m;
    }));
  };

  // Field Visits CRUD
  const addFieldVisit = (visitData: Omit<FieldVisit, 'id' | 'crpId' | 'crpName'>) => {
    const id = `visit_${Date.now()}`;
    const newVisit: FieldVisit = {
      ...visitData,
      id,
      crpId: currentUser.id,
      crpName: currentUser.marathiName || currentUser.name
    };
    setFieldVisits(prev => [newVisit, ...prev]);
    addAuditLog('CREATE_FIELD_VISIT', 'क्षेत्रीय भेट GPS नोंदवली', 'FIELD_VISIT', id, `${newVisit.villageName} - ${newVisit.purpose}`);
  };

  const deleteFieldVisit = (id: string) => {
    setFieldVisits(prev => prev.filter(v => v.id !== id));
    addAuditLog('DELETE_FIELD_VISIT', 'क्षेत्रीय भेट हटवली', 'FIELD_VISIT', id, `क्षेत्रीय भेट नोंद काढण्यात आली.`);
  };

  // Business CRUD
  const addBusiness = (bizData: Omit<BusinessEnterprise, 'id'>) => {
    const id = `biz_${Date.now()}`;
    const newBiz: BusinessEnterprise = { ...bizData, id };
    setBusinesses(prev => [newBiz, ...prev]);
    addAuditLog('CREATE_BUSINESS', 'उद्योग/व्यवसाय नोंदवला', 'BUSINESS', id, `${newBiz.businessName} - ${newBiz.memberName}`);
  };

  const deleteBusiness = (id: string) => {
    setBusinesses(prev => prev.filter(b => b.id !== id));
    addAuditLog('DELETE_BUSINESS', 'व्यवसाय नोंद हटवली', 'BUSINESS', id, `उद्योग नोंद काढण्यात आली.`);
  };

  // Schemes CRUD
  const applyForScheme = (appData: Omit<MemberSchemeApplication, 'id' | 'trackingNumber' | 'status'>) => {
    const id = `app_${Date.now()}`;
    const trackingNumber = `MSRLM-2026-${Math.floor(10000 + Math.random() * 90000)}`;
    const newApp: MemberSchemeApplication = {
      ...appData,
      id,
      trackingNumber,
      status: 'अर्ज केला (Applied)'
    };
    setSchemeApplications(prev => [newApp, ...prev]);
    addAuditLog('APPLY_SCHEME', 'शासकीय योजनेसाठी अर्ज', 'SCHEME_APP', id, `${newApp.memberName} चा ${newApp.schemeName} साठी अर्ज.`);
  };

  const deleteScheme = (id: string) => {
    setGovtSchemes(prev => prev.filter(s => s.id !== id));
  };

  const deleteSchemeApplication = (id: string) => {
    setSchemeApplications(prev => prev.filter(a => a.id !== id));
  };

  // Training CRUD
  const addTraining = (trainingData: Omit<TrainingRecord, 'id'>) => {
    const id = `trg_${Date.now()}`;
    const newTrg: TrainingRecord = { ...trainingData, id };
    setTrainings(prev => [newTrg, ...prev]);
    addAuditLog('CREATE_TRAINING', 'प्रशिक्षण सत्र आयोजित', 'TRAINING', id, `${newTrg.marathiTopic} प्रशिक्षण.`);
  };

  const deleteTraining = (id: string) => {
    setTrainings(prev => prev.filter(t => t.id !== id));
  };

  // Tasks CRUD
  const toggleTask = (taskId: string) => {
    setTasks(prev => prev.map(t => (t.id === taskId ? { ...t, completed: !t.completed } : t)));
    addAuditLog('TOGGLE_TASK', 'कार्य स्थिती बदलली', 'TASK', taskId, `कार्याची स्थिती पूर्ण/अपूर्ण नोंदवली.`);
  };

  const addTask = (taskData: Omit<TaskReminder, 'id' | 'completed'>) => {
    const id = `task_${Date.now()}`;
    const newTask: TaskReminder = { ...taskData, id, completed: false };
    setTasks(prev => [newTask, ...prev]);
    addAuditLog('CREATE_TASK', 'नवीन कार्य जोडले', 'TASK', id, `${newTask.marathiTitle}`);
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  // Documents CRUD
  const addDocument = (docData: Omit<DocumentItem, 'id' | 'uploadDate' | 'uploadedBy' | 'status'>) => {
    const id = `doc_${Date.now()}`;
    const newDoc: DocumentItem = {
      ...docData,
      id,
      uploadDate: new Date().toISOString().split('T')[0],
      uploadedBy: currentUser.marathiName || currentUser.name,
      status: 'सत्यापित (Verified)'
    };
    setDocuments(prev => [newDoc, ...prev]);
    addAuditLog('UPLOAD_DOC', 'कागदपत्र अपलोड केले', 'DOCUMENT', id, `${newDoc.entityName}: ${newDoc.title}`);
  };

  const replaceDocument = (id: string, newFileUrl: string, newTitle?: string, remarks?: string) => {
    setDocuments(prev => prev.map(d => (d.id === id ? {
      ...d,
      fileUrl: newFileUrl,
      title: newTitle || d.title,
      uploadDate: new Date().toISOString().split('T')[0],
      uploadedBy: currentUser.marathiName || currentUser.name,
      status: 'सत्यापित (Verified)',
      remarks: remarks || d.remarks
    } : d)));
    addAuditLog('REPLACE_DOC', 'कागदपत्र बदलले (Replaced)', 'DOCUMENT', id, `कागदपत्र फाइल बदलली गेली.`);
  };

  const verifyDocument = (id: string, newStatus: DocumentItem['status'], remarks?: string) => {
    setDocuments(prev => prev.map(d => (d.id === id ? { ...d, status: newStatus, remarks: remarks || d.remarks } : d)));
  };

  const deleteDocument = (id: string) => {
    setDocuments(prev => prev.filter(d => d.id !== id));
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, isRead: true } : n)));
  };

  const clearAllNotifications = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
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
        districts,
        users,
        blockManagers,
        loginSessions,
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
        filteredSHGs,
        filteredMembers,
        filteredSavings,
        filteredLoans,
        filteredMeetings,
        filteredFieldVisits,
        filteredTasks,
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
        addBlockManager,
        updateBlockManager,
        toggleBlockManagerStatus,
        resetBlockManagerPassword,
        deleteBlockManager,
        addCRP,
        updateCRP,
        toggleCRPStatus,
        resetCRPPassword,
        deleteCRP,
        getCRPPerformanceSummaries,
        logActivity,
        recordUserLogin,
        recordUserLogout,
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
