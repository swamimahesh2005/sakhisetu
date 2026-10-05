export type Role = 'ADMIN' | 'BLOCK_MANAGER' | 'CRP';

export interface District {
  id: string;
  name: string;
  marathiName: string;
  state: string;
  totalBlocks: number;
  totalSHGs: number;
  totalMembers: number;
  activeCRPs: number;
}

export interface User {
  id: string;
  username?: string;
  name: string;
  marathiName: string;
  mobile: string;
  email?: string;
  passwordHash?: string;
  role: Role;
  districtId?: string;
  districtName?: string;
  blockId?: string;
  blockName?: string;
  blockManagerId?: string;
  assignedVillageIds?: string[];
  avatar?: string;
  status?: 'ACTIVE' | 'INACTIVE';
  lastLoginAt?: string;
  lastActiveAt?: string;
  createdAt?: string;
  updatedAt?: string;
  mustChangePassword?: boolean;
}

export interface CRPProfile {
  userId: string;
  crpId: string;
  assignedBlockId: string;
  assignedBlockName: string;
  assignedVillage: string;
  assignedVillageIds: string[];
  blockManagerId?: string;
  status: 'ACTIVE' | 'INACTIVE';
  lastActiveAt?: string;
  isCurrentlyLoggedIn?: boolean;
}

export interface BlockManagerProfile {
  userId: string;
  managerId: string;
  name: string;
  marathiName: string;
  mobile: string;
  email: string;
  districtId: string;
  districtName: string;
  blockId: string;
  blockName: string;
  assignedArea: string;
  assignedCrpCount: number;
  assignedShgCount: number;
  status: 'ACTIVE' | 'INACTIVE';
  lastLoginAt?: string;
  createdAt: string;
}

export interface CRPPerformanceSummary {
  crpId: string;
  userId?: string;
  crpName: string;
  crpMarathiName: string;
  mobile: string;
  email?: string;
  villageName: string;
  districtId?: string;
  districtName?: string;
  blockId?: string;
  blockName?: string;
  blockManagerId?: string;
  assignedSHGsCount: number;
  totalMembersCount: number;
  tasksAssigned: number;
  tasksCompleted: number;
  tasksPending: number;
  fieldVisitsCompleted: number;
  meetingsCompleted: number;
  reportsSubmitted: number;
  lastLogin: string;
  lastActivity: string;
  isCurrentlyLoggedIn: boolean;
  status: 'ACTIVE' | 'RECENTLY_ACTIVE' | 'INACTIVE';
}

export interface LoginSession {
  sessionId: string;
  userId: string;
  username: string;
  role: Role;
  loginTime: string;
  lastPingTime: string;
  isActive: boolean;
  deviceInfo?: string;
}

export interface Village {
  id: string;
  name: string;
  marathiName: string;
  gramPanchayat: string;
  blockId: string;
  blockName: string;
  district: string;
  population: number;
  totalSHGs: number;
  assignedCRPName: string;
  assignedCRPPhone: string;
  lat: number;
  lng: number;
}

export interface Block {
  id: string;
  name: string;
  marathiName: string;
  district: string;
  districtId?: string;
  totalVillages: number;
  totalSHGs: number;
  totalMembers: number;
  totalSavings: number;
  totalCCLLoan: number;
  activeCRPs: number;
}

export type SHGGrade = 'A' | 'B' | 'C';

export interface SHG {
  id: string;
  code: string;
  name: string;
  marathiName: string;
  villageId: string;
  villageName: string;
  blockId: string;
  formationDate: string;
  meetingDay: string; // e.g., 'प्रत्येक महिन्याची १० तारीख' or 'दर मंगळवारी'
  meetingFrequency: 'मासिक (Monthly)' | 'पाक्षिक (Fortnightly)' | 'साप्ताहिक (Weekly)';
  crpId: string;
  crpName: string;
  voClfName: string; // Village Organization / Cluster Level Federation
  grade: SHGGrade;
  bankName: string;
  bankAccountNo: string;
  bankIfsc: string;
  bankBranch: string;
  cclSanctionedLimit: number;
  cclOutstandingBalance: number;
  monthlyCompulsorySavingPerMember: number;
  totalSavings: number;
  totalInternalLoansActive: number;
  totalMembersCount: number;
  status: 'सक्रिय (Active)' | 'सुप्त (Dormant)';
}

export type Designation = 'अध्यक्षा (President)' | 'सचिव (Secretary)' | 'खजिनदार (Treasurer)' | 'सदस्य (Member)';
export type Education = 'निरक्षर (Illiterate)' | 'प्राथमिक (Primary)' | 'माध्यमिक (Secondary)' | 'उच्च माध्यमिक (Higher Sec)' | 'पदवीधर (Graduate)';
export type CasteCategory = 'अनुसूचित जाती (SC)' | 'अनुसूचित जमाती (ST)' | 'इतर मागासवर्गीय (OBC)' | 'खुला प्रवर्ग (General)' | 'अल्पसंख्याक (Minority)';
export type MaritalStatus = 'विवाहित (Married)' | 'विधवा (Widow)' | 'परित्यक्ता (Divorced/Deserted)' | 'अविवाहित (Unmarried)';

export interface FamilyMember {
  name?: string;
  marathiName: string;
  relationship: string;
  age: number;
  occupation: string;
}

export interface Member {
  id: string;
  shgId: string;
  shgName: string;
  name: string;
  marathiName: string;
  mobile: string;
  age: number;
  dob: string;
  aadharMasked: string; // XXXX-XXXX-1234
  designation: Designation;
  education: Education;
  maritalStatus: MaritalStatus;
  casteCategory: CasteCategory;
  address: string;
  villageId: string;
  photoUrl: string;
  
  // Family Information
  husbandOrFatherName: string;
  familyMembersCount: number;
  annualFamilyIncome: number;
  isBPL: boolean;
  familyMembers?: FamilyMember[];
  
  // Occupation / Livelihood
  primaryOccupation: string; // शेती, शेळीपालन, दुग्धव्यवसाय, शिवणकाम, इ.
  secondaryOccupation?: string;
  monthlyIncome: number;
  landHoldingAcres: number;
  livestockCount: number;
  
  // Bank Details
  bankName: string;
  accountNo: string;
  ifscCode: string;
  branchName: string;
  
  // Summary Stats
  totalSaved: number;
  activeLoanAmount: number;
  lakhpatiDidiStatus: 'लक्ष्य (Target)' | 'साध्य (Achieved)' | 'प्रगतीपथावर (In-Progress)';
  joiningDate: string;
  status: 'सक्रिय (Active)' | 'स्थलांतरित (Migrated)' | 'निष्क्रिय (Inactive)';
}

export interface DocumentItem {
  id: string;
  entityType: 'MEMBER' | 'SHG';
  entityId: string;
  entityName: string;
  docType: 'आधार कार्ड (Aadhar Card)' | 'रेशन कार्ड (Ration Card)' | 'बँक पासबुक (Passbook)' | 'बचत गट ठराव (SHG Resolution)' | 'पॅन कार्ड (PAN)' | 'इतर (Other)';
  title: string;
  fileUrl: string;
  uploadDate: string;
  uploadedBy: string;
  status: 'सत्यापित (Verified)' | 'प्रलंबित (Pending)' | 'त्रुटी (Rejected)';
  remarks?: string;
}

export interface SavingsRecord {
  id: string;
  shgId: string;
  memberId: string;
  memberName: string;
  meetingId?: string;
  date: string;
  mandatoryAmount: number;
  voluntaryAmount: number;
  penaltyAmount: number;
  totalAmount: number;
  receiptNumber: string;
  paymentMode: 'रोख (Cash)' | 'UPI / ऑनलाईन (Online)';
  recordedBy: string;
  notes?: string;
  syncedOffline?: boolean;
}

export interface LoanRecord {
  id: string;
  shgId: string;
  memberId: string;
  memberName: string;
  loanType: 'अंतर्गत कर्ज (Internal Loan)' | 'बँक CCL लिंकेज (Bank CCL Loan)';
  principalAmount: number;
  interestRateMonthlyPercent: number; // e.g., 1% or 2%
  tenureMonths: number;
  monthlyEmi: number;
  purpose: 'शेती व खते (Agriculture)' | 'शेळीपालन / पशुधन (Livestock)' | 'शिवणकाम व्यवसाय (Tailoring)' | 'दुकान / व्यवसाय (Micro Business)' | 'आरोग्य व उपचार (Medical)' | 'मुलांचे शिक्षण (Education)' | 'घरदुरुस्ती (Home Repair)';
  disbursedDate: string;
  totalInterestExpected: number;
  totalPaid: number;
  remainingPrincipal: number;
  status: 'सक्रिय (Active)' | 'पूर्ण परतफेड (Closed)' | 'थकीत (Overdue)';
  approvedBy: string;
}

export interface LoanRepayment {
  id: string;
  loanId: string;
  memberId: string;
  memberName: string;
  date: string;
  principalPaid: number;
  interestPaid: number;
  totalPaid: number;
  penaltyPaid: number;
  receiptNumber: string;
  recordedBy: string;
}

export interface AttendanceRecord {
  memberId: string;
  memberName: string;
  status: 'उपस्थित (Present)' | 'रजेवर (On Leave)' | 'अनुपस्थित (Absent)';
  savingsPaid: number;
  loanEmiPaid: number;
  newLoanApplied: number;
}

export interface Meeting {
  id: string;
  shgId: string;
  shgName: string;
  meetingDate: string;
  meetingTime: string;
  venue: string;
  chairpersonName: string;
  agenda: string[];
  totalAttendance: number;
  totalMembers: number;
  totalSavingsCollected: number;
  totalLoanCollected: number;
  totalNewLoansSanctioned: number;
  meetingResolutionText: string; // मराठी ठराव नोंद
  meetingPhoto?: string;
  status: 'पूर्ण (Completed)' | 'नियोजित (Scheduled)';
  attendanceList: AttendanceRecord[];
  crpName: string;
  syncedOffline?: boolean;
}

export interface FieldVisit {
  id: string;
  crpId: string;
  crpName: string;
  villageId: string;
  villageName: string;
  shgId?: string;
  shgName?: string;
  visitDate: string;
  purpose: 'नियमित मासिक सभा तपासणी' | 'बँक लिंकेज मार्गदर्शन' | 'नोंदवह्या व हिशोब तपासणी' | 'उपजीविका पाहणी (Livelihood Visit)' | 'वाद निवारण' | 'लखपती दीदी सर्वेक्षण';
  gpsLat: number;
  gpsLng: number;
  locationAddress: string;
  photoUrl: string;
  observations: string;
  actionItems: string;
  ratingGrade: 'उत्कृष्ट (Grade A)' | 'मध्यम (Grade B)' | 'सुधारणा हवी (Grade C)';
}

export interface BusinessEnterprise {
  id: string;
  memberId: string;
  memberName: string;
  shgName: string;
  villageName: string;
  businessName: string;
  category: 'शेतीपूरक / पशुपालन' | 'खाद्यपदार्थ व प्रक्रिया (Food Processing)' | 'हस्तकला व कापड (Textiles/Handicrafts)' | 'किराणा व व्यापार (Retail)' | 'सेवा व्यवसाय (Services)';
  monthlyRevenue: number;
  monthlyNetProfit: number;
  shgLoanAmountUsed: number;
  marketChannels: string; // उदा. स्थानिक आठवडी बाजार, बचत गट जत्रा, दुकाने
  annualIncome: number;
  isLakhpatiDidi: boolean;
}

export interface GovtScheme {
  id: string;
  code: string;
  nameMarathi: string;
  nameEnglish: string;
  department: string;
  maxBenefit: string;
  eligibleCategory: string;
  description: string;
  keyBenefits: string[];
  applicationCount: number;
  sanctionedCount: number;
}

export interface MemberSchemeApplication {
  id: string;
  schemeId: string;
  schemeName: string;
  memberId: string;
  memberName: string;
  shgName: string;
  appliedDate: string;
  sanctionedDate?: string;
  benefitAmount: number;
  status: 'अर्ज केला (Applied)' | 'मंजूर (Sanctioned)' | 'लाभ वितरित (Disbursed)' | 'प्रलंबित (In Review)';
  trackingNumber: string;
}

export interface TrainingRecord {
  id: string;
  topic: string;
  marathiTopic: string;
  category: 'वित्तीय साक्षरता व डिजिटल बँकिंग' | 'शेळीपालन व पशुधन व्यवस्थापन' | 'शिवणकाम व अगरबत्ती उद्योग' | 'हिशोब नोंदवह्या व नेतृत्व' | 'सेंद्रिय शेती व खत निर्मिती';
  date: string;
  trainerName: string;
  location: string;
  totalHours: number;
  participantCount: number;
  shgIds: string[];
  certificateIssued: boolean;
}

export interface TaskReminder {
  id: string;
  title: string;
  marathiTitle: string;
  description: string;
  dueDate: string;
  priority: 'उच्च (High)' | 'मध्यम (Medium)' | 'सामान्य (Normal)';
  targetSHG?: string;
  targetVillage?: string;
  assignedRole: Role;
  completed: boolean;
  category: 'सभा (Meeting)' | 'बचत (Savings)' | 'कर्ज हप्ता (EMI)' | 'शासकीय अहवाल (Report)';
}

export interface NotificationItem {
  id: string;
  title: string;
  marathiMessage: string;
  type: 'SAVINGS_RECEIPT' | 'LOAN_DUE' | 'MEETING_REMINDER' | 'SCHEME_SANCTION' | 'SYSTEM_ALERT';
  createdAt: string;
  isRead: boolean;
  badgeType: 'success' | 'warning' | 'info';
}

export interface AuditLog {
  id: string;
  timestamp: string;
  action: string;
  actionMarathi: string;
  performedBy: string;
  role: Role;
  entityType: string;
  entityId: string;
  ipAddress: string;
  details: string;
}
