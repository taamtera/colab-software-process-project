import { closeDatabase, connectDatabase } from '../src/config/database.mjs';
import { findCompanyById, findUserByEmail, listTors } from '../src/repositories/index.mjs';

try {
  await connectDatabase();
  const user = await findUserByEmail('somchai@example.com');

  if (!user) {
    throw new Error('The demonstration user could not be read through the repository.');
  }

  const company = await findCompanyById(user.companyId);

  if (!company) {
    throw new Error('The demonstration company could not be read through the repository.');
  }

  const torResult = await listTors({ limit: 1 });

  if (torResult.items.length !== 1) {
    throw new Error('The demonstration TOR could not be read through the repository.');
  }

  console.log('Repository verification passed for users, companies, and TOR discovery.');
} finally {
  await closeDatabase();
}
