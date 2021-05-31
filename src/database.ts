import { DB } from "../deps.ts";
import { config } from "../deps.ts";
import { dbPath } from "./config.ts";

export type CritsDBFields = "userid" | "guildid" | "crit1s" | "crit20s";
export type CritsDBRow = Record<CritsDBFields, unknown>;

const db = new DB(dbPath);

export const getAllUserCrits = async (
  guildID: string
): Promise<CritsDBRow[]> => {
  const res = db
    .query(`SELECT * FROM Crits WHERE guildID='${guildID}'`)
    .asObjects();
  return [...res] as CritsDBRow[];
};

export const getUserCrits = async (
  guildID: string,
  userID: string
): Promise<CritsDBRow[]> => {
  const res = db
    .query(
      `SELECT * FROM Crits WHERE guildID='${guildID}' AND userID='${userID}'`
    )
    .asObjects();
  return [...res] as CritsDBRow[];
};

export const setCrits = (field: string) => async (
  guildID: string,
  userID: string,
  amount: number
) => {
  return db.query(
    `INSERT INTO Crits (guildID, userID, ${field}) VALUES ('${guildID}', '${userID}', ${amount}) ON CONFLICT (guildID, userID) DO UPDATE SET ${field} = '${amount}'`
  );
};

export const addCrit = (field: string) => async (
  guildID: string,
  userID: string
) => {
  return db.query(
    `INSERT INTO Crits (guildID, userID, ${field}) VALUES ('${guildID}', '${userID}', 1) ON CONFLICT (guildID, userID) DO UPDATE SET ${field} = Crits.${field} + 1`
  );
};

export const addCrit1 = addCrit("crit1s");
export const addCrit20 = addCrit("crit20s");
export const setCrits1 = setCrits("crit1s");
export const setCrits20 = setCrits("crit20s");
