import * as cdk from '@aws-cdk/core';
import lambda = require('@aws-cdk/aws-lambda-nodejs');
import sqs = require('@aws-cdk/aws-sqs');
import dynamodb = require('@aws-cdk/aws-dynamodb');
import { ApiEventSource, SqsEventSource } from '@aws-cdk/aws-lambda-event-sources';
import { Runtime } from '@aws-cdk/aws-lambda';

export class CdkStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // define our DynamoDB table
    const dynamoTable = new dynamodb.Table(this, 'cdk-todonts-table', {
      tableName: 'cdk-todonts-table',
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
    });

    // define our SQS buffer queue
    const sqsBuffer = new sqs.Queue(this, 'cdk-todonts-queue', {
      queueName: 'cdk-todonts-queue',
    });
    
    // define our processing lambda
    const processLambda = new lambda.NodejsFunction(this, 'cdk-todonts-process', {
      runtime: Runtime.NODEJS_14_X,
      handler: 'handler',
      entry: 'src/process.js',
      events: [new SqsEventSource(sqsBuffer)],
      environment: {
        TABLE_NAME: dynamoTable.tableName
      }
    });

    // grant write access for the processing lambda to our dynamo table
    dynamoTable.grantWriteData(processLambda);

    // define the lambda backing our API
    const postLambda = new lambda.NodejsFunction(this, 'cdk-todonts-post', {
      runtime: Runtime.NODEJS_14_X,
      entry: 'src/post.js',
      handler: 'handler',
      events: [new ApiEventSource('POST', '/todonts')],
      environment: {
        QUEUE_URL: sqsBuffer.queueUrl,
      }
    });

    // grant write access to the SQS buffer queue for our API lambda
    sqsBuffer.grantSendMessages(postLambda);
  }
}
