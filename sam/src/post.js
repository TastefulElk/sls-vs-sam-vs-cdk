const { SQS } = require('@aws-sdk/client-sqs');

const sqs = new SQS();

const handler = async (event) => {
  console.log('event', event);
  const { id, title } = JSON.parse(event.body);
  
  await sqs.sendMessage({
    QueueUrl: process.env.QUEUE_URL,
    MessageBody: JSON.stringify({
      id,
      title,
    })
  });

  return {
    statusCode: '200',
  };
};

module.exports = { handler };
