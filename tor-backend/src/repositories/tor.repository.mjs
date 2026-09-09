import { getDatabase } from '../config/database.mjs';
import { toObjectId } from '../utils/object-id.mjs';
import { assertActiveTagIds } from './tag.repository.mjs';

function tors() {
  return getDatabase().collection('tor_announcements');
}

export async function findTorById(torId) {
  return tors().findOne({ _id: toObjectId(torId, 'torId') });
}

export async function updateTor(torId, changes, updatedByUserId) {
  const now = new Date();
  return tors().findOneAndUpdate(
    { _id: toObjectId(torId, 'torId') },
    {
      $set: {
        ...changes,
        updatedAt: now,
        updatedByUserId: toObjectId(updatedByUserId, 'updatedByUserId')
      }
    },
    { returnDocument: 'after' }
  );
}

export async function listTors({
  search = null,
  status = 'open',
  category = null,
  tagIds = [],
  sourceId = null,
  organizationId = null,
  minBudget = null,
  maxBudget = null,
  deadlineAfter = null,
  page = 1,
  limit = 20
} = {}) {
  const safePage = Math.max(1, Number.parseInt(page, 10) || 1);
  const safeLimit = Math.min(100, Math.max(1, Number.parseInt(limit, 10) || 20));
  const filter = {};

  if (search?.trim()) {
    filter.$text = { $search: search.trim() };
  }

  if (status) {
    filter.status = status;
  }

  if (category) {
    filter.category = category;
  }

  if (tagIds.length > 0) {
    filter.tagAssignments = {
      $all: tagIds.map((tagId) => ({
        $elemMatch: {
          tagId: toObjectId(tagId, 'tagId'),
          reviewStatus: 'approved'
        }
      }))
    };
  }

  if (sourceId) {
    filter.sourceId = toObjectId(sourceId, 'sourceId');
  }

  if (organizationId) {
    filter['organization.organizationId'] = toObjectId(organizationId, 'organizationId');
  }

  if (minBudget !== null) {
    filter['budget.maxAmount'] = { ...(filter['budget.maxAmount'] || {}), $gte: Number(minBudget) };
  }

  if (maxBudget !== null) {
    filter['budget.minAmount'] = { ...(filter['budget.minAmount'] || {}), $lte: Number(maxBudget) };
  }

  if (deadlineAfter) {
    filter.submissionDeadline = { $gte: new Date(deadlineAfter) };
  }

  const projection = search?.trim() ? { score: { $meta: 'textScore' } } : {};
  const sort = search?.trim()
    ? { score: { $meta: 'textScore' }, submissionDeadline: 1 }
    : { submissionDeadline: 1, publishedAt: -1 };
  const cursor = tors()
    .find(filter, { projection })
    .sort(sort)
    .skip((safePage - 1) * safeLimit)
    .limit(safeLimit);
  const [items, total] = await Promise.all([
    cursor.toArray(),
    tors().countDocuments(filter)
  ]);

  return {
    items,
    pagination: {
      page: safePage,
      limit: safeLimit,
      total,
      totalPages: Math.ceil(total / safeLimit)
    }
  };
}

export async function replaceTorTagAssignments(torId, assignments, reviewedByUserId) {
  const objectIds = await assertActiveTagIds(assignments.map(({ tagId }) => tagId));
  const now = new Date();
  const tagAssignments = assignments.map((assignment, index) => ({
    tagId: objectIds[index],
    requirementLevel: assignment.requirementLevel,
    source: 'manual',
    confidence: 1,
    reviewStatus: 'approved',
    evidence: assignment.evidence,
    reviewedByUserId: toObjectId(reviewedByUserId, 'reviewedByUserId'),
    reviewedAt: now,
    assignedAt: now
  }));

  return tors().findOneAndUpdate(
    { _id: toObjectId(torId, 'torId') },
    { $set: { tagAssignments, updatedAt: now } },
    { returnDocument: 'after' }
  );
}

