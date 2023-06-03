import { sql } from "../database/database.js";

const findAll = async () => {
  return await sql`SELECT * FROM programming_assignment_submissions;`;
};

const findByUuid = async (uuid) => {
  return await sql`SELECT * FROM programming_assignment_submissions WHERE user_uuid = ${uuid};`;
};

const findByUuidAndAssignmentID = async (uuid, assignmentID) => {
  return await sql`SELECT * FROM programming_assignment_submissions WHERE user_uuid = ${uuid} AND programming_assignment_id = ${assignmentID};`;
};

const writeSubmission = async (programming_assignment_id, code, user_uuid) => {
  await sql`INSERT INTO programming_assignment_submissions (programming_assignment_id, code, user_uuid) VALUES (${programming_assignment_id}, ${code}, ${user_uuid})`;
};

const gradeSubmission = async (programming_assignment_id, code, user_uuid, status, grader_feedback, correct) => {
  await sql`UPDATE programming_assignment_submissions SET status = ${status}, grader_feedback = ${grader_feedback}, correct = ${correct} WHERE programming_assignment_id = ${programming_assignment_id} AND code = ${code} AND user_uuid = ${user_uuid}`;
};

const findByUuidAndPending = async (uuid) => {
  return await sql`SELECT * FROM programming_assignment_submissions WHERE user_uuid = ${uuid} AND status = 'pending'`;
};

export { findAll, writeSubmission, findByUuid, findByUuidAndAssignmentID, gradeSubmission, findByUuidAndPending };
