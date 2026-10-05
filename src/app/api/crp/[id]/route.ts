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

  const user = INITIAL_USERS.find(u => u.id === userId || u.username === userId);
  if (!user) {
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

function sanitizeCRP(user: User) {
  const { passwordHash, ...rest } = user;
  return rest;
}

// GET /api/crp/[id] - Access single CRP details with strict 403 check
export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { user, errorResponse } = authenticateRequest(request);
  if (errorResponse) return errorResponse;

  const { id: crpId } = await context.params;
  const targetCRP = INITIAL_USERS.find(u => u.id === crpId || u.username === crpId);

  if (!targetCRP) {
    return NextResponse.json(
      { error: 'समूह सखी नोंद आढळली नाही (CRP not found)' },
      { status: 404 }
    );
  }

  // Admin has universal access
  if (user?.role === 'ADMIN') {
    return NextResponse.json({ success: true, crp: sanitizeCRP(targetCRP) });
  }

  // Block Manager can access ONLY assigned CRPs
  if (user?.role === 'BLOCK_MANAGER') {
    const isAssigned = targetCRP.blockManagerId === user.id || (!targetCRP.blockManagerId && targetCRP.blockId === user.blockId);
    if (!isAssigned) {
      return NextResponse.json(
        {
          error: 'प्रतिबंधित: आपणास या समूह सखीची माहिती पाहण्याची परवानगी नाही (Forbidden: You do not have access to this CRP)'
        },
        { status: 403 }
      );
    }
    return NextResponse.json({ success: true, crp: sanitizeCRP(targetCRP) });
  }

  // CRP can only access own profile
  if (user?.role === 'CRP') {
    if (targetCRP.id !== user.id && targetCRP.username !== user.username) {
      return NextResponse.json(
        {
          error: 'प्रतिबंधित: इतर समूह सखीची माहिती पाहण्याची परवानगी नाही (Forbidden: Unauthorized)'
        },
        { status: 403 }
      );
    }
    return NextResponse.json({ success: true, crp: sanitizeCRP(targetCRP) });
  }

  return NextResponse.json({ error: 'अनधिकृत प्रवेश' }, { status: 403 });
}

// PUT /api/crp/[id] - Update CRP details
export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { user, errorResponse } = authenticateRequest(request);
  if (errorResponse) return errorResponse;

  const { id: crpId } = await context.params;
  const targetCRP = INITIAL_USERS.find(u => u.id === crpId || u.username === crpId);

  if (!targetCRP) {
    return NextResponse.json({ error: 'समूह सखी आढळली नाही' }, { status: 404 });
  }

  // Ownership Check for Block Manager
  if (user?.role === 'BLOCK_MANAGER') {
    const isAssigned = targetCRP.blockManagerId === user.id || (!targetCRP.blockManagerId && targetCRP.blockId === user.blockId);
    if (!isAssigned) {
      return NextResponse.json(
        {
          error: 'प्रतिबंधित: केवळ नियुक्त केलेल्या समूह सखींमध्ये बदल करता येईल (Forbidden: You cannot modify this CRP)'
        },
        { status: 403 }
      );
    }
  } else if (user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'प्रतिबंधित' }, { status: 403 });
  }

  const updates = await request.json();
  delete updates.role; // Prevent role escalation
  delete updates.passwordHash;

  return NextResponse.json({
    success: true,
    message: 'माहिती अद्ययावत झाली.',
    crp: { ...sanitizeCRP(targetCRP), ...updates }
  });
}

// DELETE /api/crp/[id] - Delete CRP
export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { user, errorResponse } = authenticateRequest(request);
  if (errorResponse) return errorResponse;

  const { id: crpId } = await context.params;
  const targetCRP = INITIAL_USERS.find(u => u.id === crpId || u.username === crpId);

  if (!targetCRP) {
    return NextResponse.json({ error: 'समूह सखी आढळली नाही' }, { status: 404 });
  }

  if (user?.role === 'BLOCK_MANAGER') {
    const isAssigned = targetCRP.blockManagerId === user.id || (!targetCRP.blockManagerId && targetCRP.blockId === user.blockId);
    if (!isAssigned) {
      return NextResponse.json(
        {
          error: 'प्रतिबंधित: इतर व्यवस्थापकांची समूह सखी हटवता येत नाही (Forbidden: You cannot delete this CRP)'
        },
        { status: 403 }
      );
    }
  } else if (user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'प्रतिबंधित' }, { status: 403 });
  }

  return NextResponse.json({
    success: true,
    message: `${targetCRP.marathiName} समूह सखी रेकॉर्ड हटवले.`
  });
}
