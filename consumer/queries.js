const Pool = require("pg").Pool;
const pool = new Pool();

const buildStatement = messages => {
  const dataToInsert = [];
  const params = [];
  messages.forEach(message => {
    const messageParams = [];
    Object.keys(message).forEach(value => {
      dataToInsert.push(message[value]);
      messageParams.push(`$${dataToInsert.length}`);
    });
    params.push(`(${messageParams})`);
  });
  return { params: params.join(", "), data: dataToInsert };
};

const insertRows = async (topic, data) => {
  const statement = buildStatement(data);

  const client = await pool.connect();
  try {
    const res = await client.query(
      `INSERT INTO ${topic.replace(
        /\.|-/g,
        "_"
      )} (topic, timestamp, data) VALUES ${statement.params}`,
      statement.data
    );
    console.log(
      `${res.rowCount}${
        res.rowCount > 1 ? " rows" : " row"
      } written to table ${topic.replace(/\.|-/g, "_")}.`
    );
  } catch (err) {
    console.log(err);
  } finally {
    await client.release();
  }
};

const writeRow = async (topic, timestamp, data) => {
  const client = await pool
    .connect()
    .then(console.log("Connected to database."));
  try {
    const res = await client.query(
      `INSERT INTO ${topic.replace(
        /\./g,
        "_"
      )}(topic, timestamp, data) VALUES('${topic}', '${timestamp}', '${JSON.stringify(
        data
      )}')`
    );
    console.log(`${res.rowCount} row written to database.`);
  } catch (err) {
    console.log(err);
  } finally {
    await client.release();
    console.log("Client released.");
  }
};

module.exports = {
  writeRow: writeRow,
  insertRows: insertRows
};
