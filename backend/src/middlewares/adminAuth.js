import { validateAdminCredentials } from '../controllers/adminController.js';

const adminAuth = (req, res, next) => {
  const email = req.body?.adminEmail || req.query?.adminEmail || req.body?.email || req.query?.email || req.header('ADMIN_EMAIL') || req.header('email');
  const password = req.body?.adminPassword || req.query?.adminPassword || req.body?.password || req.query?.password || req.header('ADMIN_PASSWORD') || req.header('password');

  validateAdminCredentials({ email, password });
  next();
};

export default adminAuth;
