import { createHash } from "node:crypto";
import { DynamoDBClient, PutItemCommand, UpdateItemCommand } from "@aws-sdk/client-dynamodb";

export const NONCE_TTL_SECONDS = 10 * 60;

// Reserve ChainId=0 for authentication records in the existing metadata table.
// Conditional updates enforce single use across processes and concurrent requests.
const client = new DynamoDBClient({
  region: process.env._AWS_REGION,
  ...(process.env._AWS_ACCESS_KEY_ID && process.env._AWS_SECRET_ACCESS_KEY
    ? {
        credentials: {
          accessKeyId: process.env._AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env._AWS_SECRET_ACCESS_KEY,
        },
      }
    : {}),
});

function key(nonce: string) {
  return {
    AuctionId: { S: `auth:nonce:${createHash("sha256").update(nonce).digest("hex")}` },
    ChainId: { N: "0" },
  };
}

function tableName() {
  if (!process.env._AWS_DYNAMO_TABLE_NAME) throw new Error("Nonce store is not configured");
  return process.env._AWS_DYNAMO_TABLE_NAME;
}

export async function saveNonce(nonce: string) {
  await client.send(
    new PutItemCommand({
      TableName: tableName(),
      Item: {
        ...key(nonce),
        ExpiresAt: { N: String(Math.floor(Date.now() / 1000) + NONCE_TTL_SECONDS) },
      },
      ConditionExpression: "attribute_not_exists(AuctionId)",
    }),
  );
}

export async function consumeNonce(nonce: string): Promise<boolean> {
  try {
    await client.send(
      new UpdateItemCommand({
        TableName: tableName(),
        Key: key(nonce),
        UpdateExpression: "SET ConsumedAt = :now",
        ConditionExpression:
          "attribute_exists(AuctionId) AND ExpiresAt > :now AND attribute_not_exists(ConsumedAt)",
        ExpressionAttributeValues: { ":now": { N: String(Math.floor(Date.now() / 1000)) } },
      }),
    );
    return true;
  } catch (error) {
    if (error instanceof Error && error.name === "ConditionalCheckFailedException") return false;
    throw error;
  }
}
