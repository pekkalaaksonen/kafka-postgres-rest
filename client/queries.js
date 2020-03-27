const Pool = require("pg").Pool;
const pool = new Pool();

const fetchTopic = (req, res) => {
  const { topic } = req.params;
  const fromDate = req.query.fromDate || "";
  const query = `SELECT * FROM ${topic.replace(
    /\./g,
    "_"
  )} WHERE "timestamp">='${fromDate}';`;
  console.log(`Execute query: ${query}`);
  pool.query(query, (err, result) => {
    if (err) {
      res.send("Something went wrong. Check your request!");
    } else {
      res.status(200).json(result.rows);
    }
  });
};

const fetchTables = (req, res) => {
  const query = `SELECT tablename FROM pg_catalog.pg_tables where schemaname='public';`;
  console.log(`Execute query: ${query}`);
  pool.query(query, (err, result) => {
    if (err) {
      res.send("Something went wrong. Check your request!");
    } else {
      const topics = {
        topics: []
      };

      result.rows.forEach(row => {
        if ("tablename" in row) {
          topics.topics.push(row.tablename);
        }
      });

      res.status(200).json(topics);
    }
  });
};

module.exports = {
  fetchTopic: fetchTopic,
  fetchTables: fetchTables
};
