import express from 'express';
import {
	auditLogsController,
	adminSummaryController,
	adminPostsController,
	adminUsersController,
	bannersController,
	createPurchaseGroupController,
	createCommunityPostController,
	createBannerController,
	createBroadcastController,
	purchaseGroupsController,
	updateAdminPostController,
	updateAdminUserController,
	updateBannerController,
	updatePurchaseGroupController,
	updateVotingWindowController,
} from '../controllers/adminController.js';

const router = express.Router();

router.get('/summary', adminSummaryController);
router.get('/audit-logs', auditLogsController);
router.get('/users', adminUsersController);
router.patch('/users/:userId', updateAdminUserController);
router.patch('/voting-window', updateVotingWindowController);
router.get('/posts', adminPostsController);
router.post('/posts', createCommunityPostController);
router.patch('/posts/:postId', updateAdminPostController);
router.get('/purchase-groups', purchaseGroupsController);
router.post('/purchase-groups', createPurchaseGroupController);
router.patch('/purchase-groups/:groupId', updatePurchaseGroupController);
router.get('/banners', bannersController);
router.post('/banners', createBannerController);
router.patch('/banners/:bannerId', updateBannerController);
router.post('/broadcasts', createBroadcastController);

export default router;
