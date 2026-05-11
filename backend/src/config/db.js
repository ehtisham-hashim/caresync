import prismaPkg from '@prisma/client';
const { PrismaClient } = prismaPkg;

import pgPkg from 'pg';
const { Pool } = pgPkg;
import { PrismaPg } from '@prisma/adapter-pg';
import { withAccelerate } from '@prisma/extension-accelerate';

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter }).$extends(withAccelerate());

export default prisma;
