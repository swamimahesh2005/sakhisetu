import { NextResponse } from 'next/server';
import { INITIAL_USERS } from '@/lib/seed-data';
import { hashPassword } from '@/lib/auth-crypto';
import { User } from '@/types';

// Helper to authenticate request from headers or bearer token
function authenticateRequest(request: Request): { user: User | null; errorResponse?: NextResponse } {
  const userId = request.headers.get('x-user-id') || request.headers.get('authorization')?.replace('Bearer ', '');
  const userRole = request.headers.get('x-user-role');

  if (!userId) {
    return {
      user: null,
      errorResponse: NextResponse.json(
        { error: 'अनधिकृत: प्रमाणीकरण आवश्यक आहे (Unauthorized: Authentication required)' },
        { status: 401 }
      )
    };
  }

  // Find user in system records
  const user = INITIAL_USERS.find(u => u.id === userId || u.username === userId);
  if (!user) {
    // If not found in seed, create simulated user from headers if valid
    if (userRole) {
      return {
        user: {
          id: userId,
          name: userId,
          marathiName: userId,
          mobile: '',
          role: userRole as any
        }
      };
    }
    return {
      user: null,
      errorResponse: NextResponse.json(
        { error: 'वापरकर्ता आढळला नाही (User not found)' },
        { status: 401 }
      )
    };
  }

  return { user };
}

// Sanitize user object to never leak passwords
function sanitizeCRP(user: User) {
  const { passwordHash, ...rest } = user;
  return rest;
}

// GET /api/crp - List CRPs with strict role-based isolation
export async function GET(request: Request) {
  const { user, errorResponse } = authenticateRequest(request);
  if (errorResponse) return errorResponse;

  if (user?.role === 'ADMIN') {
    // Admin can see all CRPs across all blocks
    const allCRPs = INITIAL_USERS.filter(u => u.role === 'CRP').map(sanitizeCRP);
    return NextResponse.json({ success: true, count: allCRPs.length, crps: allCRPs });
  }

  if (user?.role === 'BLOCK_MANAGER') {
    // Strict Access Control: Block Manager can access ONLY their assigned CRPs
    const assignedCRPs = INITIAL_USERS.filter(
      u => u.role === 'CRP' && (u.blockManagerId === user.id || (!u.blockManagerId && u.blockId === user.blockId))
    ).map(sanitizeCRP);

    return NextResponse.json({
      success: true,
      blockManagerId: user.id,
      count: assignedCRPs.length,
      crps: assignedCRPs
    });
  }

  if (user?.role === 'CRP') {
    // CRP can only access own profile
    const self = INITIAL_USERS.filter(u => u.id === user.id).map(sanitizeCRP);
    return NextResponse.json({ success: true, crps: self });
  }

  return NextResponse.json(
    { error: 'अनधिकृत भूमिका (Forbidden: Invalid Role)' },
    { status: 403 }
  );
}

// POST /api/crp - Block Manager / Admin creates a new CRP
export async function POST(request: Request) {
  const { user, errorResponse } = authenticateRequest(request);
  if (errorResponse) return errorResponse;

  // Only BLOCK_MANAGER and ADMIN can create a CRP
  if (user?.role !== 'BLOCK_MANAGER' && user?.role !== 'ADMIN') {
    return NextResponse.json(
      { error: 'प्रतिबंधित: केवळ प्रखंड व्यवस्थापक किंवा प्रशासक नवीन समूह सखी जोडू शकतात (Forbidden: Only Block Managers can create CRP)' },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const { name, marathiName, mobile, email, username, password, villageName, status } = body;

    if (!name || !marathiName || !mobile) {
      return NextResponse.json(
        { error: 'कृपया नाव आणि मोबाईल नंबर भरा (Name and Mobile are required)' },
        { status: 400 }
      );
    }

    const newUserId = `crp_${Date.now()}`;
    const newUsername = username?.trim() || `crp_${Math.floor(100 + Math.random() * 900)}`;
    const passHash = await hashPassword(password?.trim() || 'Crp@12345');

    // Automatically bind to logged-in Block Manager
    const newCRP: User = {
      id: newUserId,
      username: newUsername,
      name,
      marathiName: `${marathiName} (समूह सखी)`,
      mobile,
      email: email || `${mobile}@sakhisetu.gov.in`,
      passwordHash: passHash,
      role: 'CRP',
      districtId: user.districtId || 'dist_latur',
      districtName: user.districtName || 'लातूर जिल्हा (Latur)',
      blockId: user.blockId || 'jalkot',
      blockName: user.blockName || 'जळकोट (लातूर)',
      blockManagerId: user.role === 'BLOCK_MANAGER' ? user.id : undefined,
      assignedVillageIds: ['vlg_atnur'],
      avatar: '👩🏽‍💼',
      status: status || 'ACTIVE',
      createdAt: new Date().toISOString()
    };

    return NextResponse.json(
      {
        success: true,
        message: `${marathiName} यशस्वीरित्या समाविष्ट झाली.`,
        crp: sanitizeCRP(newCRP)
      },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'सर्व्हर त्रुटी' },
      { status: 500 }
    );
  }
}
