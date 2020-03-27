const { Pool } = require("pg");
const { loadTopics } = require("./config");
const topics = loadTopics();
const tables = [];
const initialDb = "postgres";

for (const topic of topics) {
  tables.push(
    topic
      .split(".")
      .join("_")
      .split("-")
      .join("_")
  );
}

const checkDatabase = async db => {
  const pool = new Pool({
    database: initialDb
  });

  const client = await pool.connect();

  try {
    const result = await client.query(
      `SELECT EXISTS (SELECT 1 FROM pg_database WHERE datname = '${db}');`
    );
    if (result.rows[0].exists === false) {
      console.log(`Database "${db}" does not exist.`);
      await createDatabase(db, client);
    } else {
      console.log(`Database "${db}" exists.`);
      client.release();
    }
  } catch (error) {
    console.log(error);
  } finally {
    await pool.end();
  }
};

const createDatabase = async (database, client) => {
  try {
    console.log("Creating database...");
    await client.query(`create database ${database}`);
    console.log(`Database "${database}" created.`);
  } catch (error) {
    console.log(error);
  } finally {
    await client.release();
  }
};

const checkTables = async tables => {
  const pool = new Pool();
  const client = await pool.connect();

  for (const table of tables) {
    try {
      const result = await client.query(
        `SELECT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = '${table}');`
      );
      if (result.rows[0].exists === false) {
        console.log(`Table "${table}" does not exist.`);
        await createTable(table, client);
      } else {
        console.log(`Table "${table}" exists.`);
      }
    } catch (error) {
      console.log(error);
    }
  }

  await client.release();
  await pool.end();
};

const createTable = async (table, client) => {
  try {
    console.log("Creating table...");
    await client.query(
      `create table public.${table} (id bigserial, timestamp text, topic text, data JSON);`
    );
    console.log(`Table "${table}" created.`);
  } catch (error) {
    console.log(error);
  }
};

const initDatabase = async (db, tables) => {
  let connected = false;
  while (connected !== true) {
    const pool = new Pool({ database: initialDb });
    try {
      const client = await pool.connect();
      connected = true;
      console.log("Connection succesful.");
      await client.release();
    } catch (error) {
      console.log("Connection failed.");
      connected = false;
    } finally {
      await pool.end();
    }
  }

  await checkDatabase(db);
  await checkTables(tables);
};

initDatabase(process.env.PGDATABASE, tables);
