// @ts-nocheck
import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

const config = {
  DB_URL: process.env.DB_URL,
  DB_NAME: 'Todo-Tamers'
};

if (!config.DB_URL) {
  console.error('[Migration] DB_URL is required.');
  process.exit(1);
}

const todoContentSchema = new mongoose.Schema(
  {
    categoryId: { type: mongoose.Schema.Types.Mixed }
  },
  {
    strict: false,
    collection: 'todoContents'
  }
);

const TodoContent = mongoose.model(
  'TodoContentCategoryIdMigration',
  todoContentSchema
);

const migrate = async () => {
  await mongoose.connect(config.DB_URL, { dbName: config.DB_NAME });

  const docs = await TodoContent.find({ categoryId: { $type: 'string' } })
    .select({ _id: 1, categoryId: 1 })
    .lean();

  if (!docs.length) {
    console.log('[Migration] No string categoryId found.');
    await mongoose.connection.close();
    return;
  }

  const bulkOps = [];
  let skipped = 0;

  for (const doc of docs) {
    if (!mongoose.Types.ObjectId.isValid(doc.categoryId)) {
      skipped += 1;
      continue;
    }

    bulkOps.push({
      updateOne: {
        filter: { _id: doc._id },
        update: { $set: { categoryId: new mongoose.Types.ObjectId(doc.categoryId) } }
      }
    });
  }

  if (bulkOps.length > 0) {
    const result = await TodoContent.bulkWrite(bulkOps, { ordered: false });
    console.log('[Migration] converted:', result.modifiedCount);
  } else {
    console.log('[Migration] no valid string categoryId to convert.');
  }

  await TodoContent.collection.createIndex({ categoryId: 1, createdAt: 1 });
  console.log('[Migration] index ensured: { categoryId: 1, createdAt: 1 }');

  if (skipped > 0) {
    console.warn('[Migration] skipped invalid categoryId:', skipped);
  }

  await mongoose.connection.close();
};

migrate().catch(async (err) => {
  console.error('[Migration] failed:', err);
  await mongoose.connection.close();
  process.exit(1);
});
