import {
  createAuditLog,
  createBanner,
  createBroadcast,
  createCommunityPost,
  createPurchaseGroup,
  creditUser,
  getAdminSummary,
  getAuditLogs,
  getAllUsers,
  getBanners,
  getBroadcastRecipients,
  getCommunityPosts,
  getPurchaseGroups,
  sanitizeBroadcastRecipients,
  setVotingWindow,
  updateCommunityPostStatus,
  updateBannerStatus,
  updatePurchaseGroup,
  updateUserStatus,
} from '../services/userService.js';
import { sendBulkBroadcast } from '../services/emailService.js';

export function adminSummaryController(req, res) {
  res.json(getAdminSummary());
}

export function adminUsersController(req, res) {
  res.json({ users: getAllUsers() });
}

export function updateAdminUserController(req, res) {
  try {
    const { userId } = req.params;
    const { status, creditAmount } = req.body;

    if (typeof creditAmount === 'number') {
      const user = creditUser(Number(userId), creditAmount);
      createAuditLog({
        actorEmail: req.headers['x-user-email'],
        action: 'USER_CREDIT',
        entityType: 'user',
        entityId: userId,
        details: { creditAmount, nextBalance: user?.balance },
      });
      return res.json({ user });
    }

    if (status) {
      const user = updateUserStatus(Number(userId), status);
      createAuditLog({
        actorEmail: req.headers['x-user-email'],
        action: 'USER_STATUS_UPDATE',
        entityType: 'user',
        entityId: userId,
        details: { status },
      });
      return res.json({ user });
    }

    return res.status(400).json({ error: 'לא התקבל עדכון חוקי' });
  } catch (error) {
    res.status(error.statusCode || 500).json({ error: error.message || 'שגיאה בעדכון משתמש' });
  }
}

export function updateVotingWindowController(req, res) {
  const { votingOpen } = req.body;
  const result = setVotingWindow(Boolean(votingOpen));
  createAuditLog({
    actorEmail: req.headers['x-user-email'],
    action: 'VOTING_WINDOW_UPDATE',
    entityType: 'admin_settings',
    entityId: 'votingOpen',
    details: { votingOpen: Boolean(votingOpen) },
  });
  res.json(result);
}

export function bannersController(req, res) {
  res.json({ banners: getBanners() });
}

export function createBannerController(req, res) {
  try {
    const banner = createBanner(req.body);
    createAuditLog({
      actorEmail: req.headers['x-user-email'],
      action: 'BANNER_CREATE',
      entityType: 'banner',
      entityId: banner.id,
      details: { title: banner.title, placement: banner.placement, status: banner.status },
    });
    res.status(201).json({ banner });
  } catch (error) {
    res.status(error.statusCode || 500).json({ error: error.message || 'שגיאה ביצירת באנר' });
  }
}

export function updateBannerController(req, res) {
  try {
    const { bannerId } = req.params;
    const banner = updateBannerStatus(Number(bannerId), req.body.status);
    createAuditLog({
      actorEmail: req.headers['x-user-email'],
      action: 'BANNER_STATUS_UPDATE',
      entityType: 'banner',
      entityId: bannerId,
      details: { status: req.body.status },
    });
    res.json({ banner });
  } catch (error) {
    res.status(error.statusCode || 500).json({ error: error.message || 'שגיאה בעדכון באנר' });
  }
}

export function createBroadcastController(req, res) {
  Promise.resolve()
    .then(async () => {
      const message = createBroadcast(req.body);
      const recipients = getBroadcastRecipients();
      const { accepted, invalid } = sanitizeBroadcastRecipients(recipients);
      const delivery = await sendBulkBroadcast({
        recipients: accepted,
        subject: req.body.subject,
        body: req.body.body,
      });
      createAuditLog({
        actorEmail: req.headers['x-user-email'],
        action: 'BROADCAST_SEND',
        entityType: 'broadcast',
        entityId: message.id,
        details: {
          requestedRecipients: recipients.length,
          acceptedRecipients: accepted.length,
          invalidRecipients: invalid.length,
          subject: req.body.subject,
        },
      });
      res.status(201).json({
        message,
        delivery: {
          ...delivery,
          requestedRecipients: recipients.length,
          acceptedRecipients: accepted.length,
          invalidRecipients: invalid.length,
        },
      });
    })
    .catch((error) => {
      res.status(error.statusCode || 500).json({ error: error.message || 'שגיאה בשליחת הודעה' });
    });
}

export function adminPostsController(req, res) {
  res.json({ posts: getCommunityPosts() });
}

export function updateAdminPostController(req, res) {
  try {
    const { postId } = req.params;
    const post = updateCommunityPostStatus(Number(postId), req.body.status);
    createAuditLog({
      actorEmail: req.headers['x-user-email'],
      action: 'POST_STATUS_UPDATE',
      entityType: 'community_post',
      entityId: postId,
      details: { status: req.body.status },
    });
    res.json({ post });
  } catch (error) {
    res.status(error.statusCode || 500).json({ error: error.message || 'שגיאה בעדכון פוסט' });
  }
}

export function createCommunityPostController(req, res) {
  try {
    const post = createCommunityPost(req.body);
    res.status(201).json({ post });
  } catch (error) {
    res.status(error.statusCode || 500).json({ error: error.message || 'שגיאה ביצירת פוסט' });
  }
}

export function purchaseGroupsController(req, res) {
  res.json({ groups: getPurchaseGroups() });
}

export function createPurchaseGroupController(req, res) {
  try {
    const group = createPurchaseGroup(req.body);
    createAuditLog({
      actorEmail: req.headers['x-user-email'],
      action: 'PURCHASE_GROUP_CREATE',
      entityType: 'purchase_group',
      entityId: group.id,
      details: {
        title: group.title,
        category: group.category,
        region: group.region,
        targetPrice: group.targetPrice,
      },
    });
    res.status(201).json({ group });
  } catch (error) {
    res.status(error.statusCode || 500).json({ error: error.message || 'שגיאה ביצירת קבוצת רכישה' });
  }
}

export function updatePurchaseGroupController(req, res) {
  try {
    const { groupId } = req.params;
    const group = updatePurchaseGroup(Number(groupId), req.body);
    createAuditLog({
      actorEmail: req.headers['x-user-email'],
      action: 'PURCHASE_GROUP_UPDATE',
      entityType: 'purchase_group',
      entityId: groupId,
      details: req.body,
    });
    res.json({ group });
  } catch (error) {
    res.status(error.statusCode || 500).json({ error: error.message || 'שגיאה בעדכון קבוצת רכישה' });
  }
}

export function auditLogsController(req, res) {
  const limit = req.query.limit;
  res.json({ logs: getAuditLogs(limit) });
}
