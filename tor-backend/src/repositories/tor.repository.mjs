import { getDatabase } from '../config/database.mjs';
import { toObjectId } from '../utils/object-id.mjs';
import { assertActiveTagIds } from './tag.repository.mjs';
import { buildDiscoveryQuery, METHOD_VALUE } from './tor-query.mjs';

function tors() {
  return getDatabase().collection('tor_announcements');
}

export async function findTorByProjectId(projectId) {
  return tors().findOne({ projectId });
}

export async function updateTor(torId, changes, updatedByUserId) {
  const now = new Date();
  return tors().findOneAndUpdate(
    { projectId: torId },
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
  departmentId = null,
  stage = null,
  stageScope = 'latest',
  procurementMethod = null,
  fromDate = null,
  toDate = null,
  sort = null,
  status = null,
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
  const discovery = buildDiscoveryQuery({ search, departmentId, stage, stageScope, procurementMethod, fromDate, toDate, sort });
  const filter = discovery.filter;

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
    filter.sourceId = sourceId;
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

  const cursor = tors().aggregate([
    { $match: filter },
    ...(discovery.ranking ? [{ $set: { _searchRank: discovery.ranking } }] : []),
    { $sort: discovery.sort },
    { $skip: (safePage - 1) * safeLimit }, { $limit: safeLimit },
    { $unset: '_searchRank' }
  ]);
  const [items, total, metadata] = await Promise.all([
    cursor.toArray(),
    tors().countDocuments(filter),
    tors().aggregate([{ $facet: {
      departments: [
        { $group: { _id: { $ifNull: ['$departmentId', ''] }, name: { $max: '$departmentName' }, count: { $sum: 1 } } },
        { $project: { _id: 0, value: { $cond: [{ $eq: ['$_id', ''] }, '__unknown__', '$_id'] }, name: 1, count: 1 } }
      ],
      methods: [
        { $group: { _id: { $ifNull: [METHOD_VALUE, ''] }, count: { $sum: 1 } } },
        { $project: { _id: 0, value: { $cond: [{ $eq: ['$_id', ''] }, '__unknown__', '$_id'] }, count: 1 } }
      ],
      total: [{ $count: 'count' }]
    } }]).next()
  ]);

  return {
    items,
    facets: { departments: metadata.departments, methods: metadata.methods },
    totalAllProjects: metadata.total[0]?.count ?? 0,
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
    { projectId: torId },
    { $set: { tagAssignments, updatedAt: now } },
    { returnDocument: 'after' }
  );
}

