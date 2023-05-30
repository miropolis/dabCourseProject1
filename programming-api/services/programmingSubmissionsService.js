import { sql } from "../database/database.js";

const findAll = async () => {
  return await sql`SELECT * FROM programming_assignment_submissions;`;
};

const findByUuid = async (uuid) => {
    return await sql`SELECT * FROM programming_assignment_submissions WHERE user_uuid = ${uuid};`;
  };

const writeAssignment = async (programming_assignment_id, code, user_uuid) => {
    //Does this return anything?
    return await sql`INSERT INTO programming_assignment_submissions (programming_assignment_id, code, user_uuid) VALUES (${programming_assignment_id}, ${code}, ${user_uuid})`;
}

export { findAll, writeAssignment, findByUuid };
