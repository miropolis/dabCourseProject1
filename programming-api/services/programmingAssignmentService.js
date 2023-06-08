import { sql } from "../database/database.js";

const findAll = async () => {
  return await sql`SELECT * FROM programming_assignments;`;
};

const findHighestAssignment = async () => {
  return await sql`SELECT COUNT(*) FROM programming_assignments;`;
};

export { findAll, findHighestAssignment };
