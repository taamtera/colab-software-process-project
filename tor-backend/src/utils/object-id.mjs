import { ObjectId } from 'mongodb';

export function toObjectId(value, fieldName = 'id') {
  if (value instanceof ObjectId) {
    return value;
  }

  if (!ObjectId.isValid(value)) {
    const error = new Error(`${fieldName} is invalid.`);
    error.status = 400;
    error.code = 'INVALID_OBJECT_ID';
    throw error;
  }

  return new ObjectId(value);
}

