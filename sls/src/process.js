const { DynamoDB } = require('@aws-sdk/client-dynamodb');
const { marshall } = require("@aws-sdk/util-dynamodb");

const ddb = new DynamoDB();

const handler = async (event) => {
  console.log('event', event);

  const tasks = event.Records.map((record) => {
    console.log(`record`, record);
    const { id, title } = JSON.parse(record.body);
    console.log(`id, title`, { id, title });
    console.log(`process.env.TABLE_NAME`, process.env.TABLE_NAME);
    return ddb.putItem({
      TableName: process.env.TABLE_NAME,
      Item: marshall({
        title,
        id,
      }),
    });
  });

  return Promise.all(tasks);
};

module.exports = { handler };
