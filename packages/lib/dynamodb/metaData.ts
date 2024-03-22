import {
  DynamoDBClient,
  GetItemCommand,
  BatchGetItemCommand,
  PutItemCommand,
  UpdateItemCommand,
  ScanCommand,
} from "@aws-sdk/client-dynamodb";
import { TEMPLATE_V1_NAME } from "../constants/templates";
import { MetaData, validateMetaData } from "../types/Auction";

const dbClient = new DynamoDBClient({
  region: process.env._AWS_REGION as string,
  credentials: {
    accessKeyId: process.env._AWS_ACCESS_KEY_ID as string,
    secretAccessKey: process.env._AWS_SECRET_ACCESS_KEY as string,
  },
});

const dynamoDBItemsToMetaData = (item: any) => {
  return {
    id: item.AuctionId.S,
    title: item.Title ? item.Title.S : undefined,
    description: item.Description ? item.Description.S : undefined,
    terms: item.Terms ? item.Terms.S : undefined,
    projectURL: item.ProjectURL ? item.ProjectURL.S : undefined,
    logoURL: item.LogoURL ? item.LogoURL.S : undefined,
    otherURL: item.OtherURL ? item.OtherURL.S : undefined,
    targetTotalRaised: item.TargetTotalRaised ? item.TargetTotalRaised.N : undefined,
    maximumTotalRaised: item.MaximumTotalRaised ? item.MaximumTotalRaised.N : undefined,
    templateName: item.TemplateName ? item.TemplateName.S : undefined,
  } as MetaData;
};

export async function scanMetaData(
  lastEvaluatedKeyId?: string,
  lastEvaluatedKeyCreatedAt?: string,
): Promise<MetaData[] | undefined> {
  const command = new ScanCommand({
    TableName: process.env._AWS_DYNAMO_TABLE_NAME,
    Limit: 10,
    ExclusiveStartKey:
      lastEvaluatedKeyId && lastEvaluatedKeyCreatedAt
        ? {
            AuctionId: { S: lastEvaluatedKeyId },
          }
        : undefined,
  });
  const output = await dbClient.send(command);
  return output.Items?.map(dynamoDBItemsToMetaData);
}

export async function fetchMetaData(auctionId: string): Promise<MetaData | undefined> {
  const command = new GetItemCommand({
    TableName: process.env._AWS_DYNAMO_TABLE_NAME,
    Key: { AuctionId: { S: auctionId } },
  });
  const output = await dbClient.send(command);
  const item = output.Item;
  if (item == undefined) return undefined;
  return dynamoDBItemsToMetaData(item);
}

export async function batchFetchMetaData(auctionIds: string[]): Promise<MetaData[]> {
  const tableName = process.env._AWS_DYNAMO_TABLE_NAME as string;
  const command = new BatchGetItemCommand({
    RequestItems: {
      [tableName]: {
        Keys: auctionIds.map((id) => {
          return { AuctionId: { S: id } };
        }),
      },
    },
  });
  const output = await dbClient.send(command);
  if (output.Responses == undefined) return [];
  return output.Responses[tableName].map((item: any) => dynamoDBItemsToMetaData(item));
}

export async function addMetaData(auction: MetaData): Promise<MetaData | undefined> {
  // TODO Take Minimum total raised into account
  // validateMetaData(auction, minRaisedAmount)
  const errors = validateMetaData(auction);
  if (Object.keys(errors).length > 0) {
    const errorMessage = Object.entries(errors)
      .map((e) => e[1])
      .join(", ");
    throw new Error(errorMessage);
  }
  const item = {
    AuctionId: { S: (auction.id as string).toLowerCase() },
    Title: { S: auction.title ? auction.title : "" },
    Description: { S: auction.description ? auction.description : "" },
    Terms: { S: auction.terms ? auction.terms : "" },
    ProjectURL: { S: auction.projectURL ? auction.projectURL : "" },
    LogoURL: { S: auction.logoURL ? auction.logoURL : "" },
    OtherURL: { S: auction.otherURL ? auction.otherURL : "" },
    TargetTotalRaised: {
      N: auction.targetTotalRaised ? auction.targetTotalRaised.toString() : "0",
    },
    MaximumTotalRaised: {
      N: auction.maximumTotalRaised ? auction.maximumTotalRaised.toString() : "0",
    },
    TemplateName: { S: TEMPLATE_V1_NAME },
  };
  const command = new PutItemCommand({
    TableName: process.env._AWS_DYNAMO_TABLE_NAME,
    Item: item,
  });
  const output = await dbClient.send(command);
  return auction;
}

export async function updateAuction(auction: MetaData): Promise<MetaData | undefined> {
  const errors = validateMetaData(auction);
  if (Object.keys(errors).length > 0) {
    const errorMessage = Object.entries(errors)
      .map((e) => e[1])
      .join(", ");
    throw new Error(errorMessage);
  }

  const command = new UpdateItemCommand({
    TableName: process.env._AWS_DYNAMO_TABLE_NAME,
    Key: { AuctionId: { S: (auction.id as string).toLowerCase() } },
    UpdateExpression:
      "set Title = :Title, Description=:Description, Terms = :Terms, ProjectURL = :ProjectURL, LogoURL = :LogoURL, OtherURL = :OtherURL, TargetTotalRaised = :TargetTotalRaised, MaximumTotalRaised = :MaximumTotalRaised, TemplateName = :TemplateName",
    ExpressionAttributeValues: {
      ":Title": { S: auction.title ? auction.title : "" },
      ":Description": { S: auction.description ? auction.description : "" },
      ":Terms": { S: auction.terms ? auction.terms : "" },
      ":ProjectURL": { S: auction.projectURL ? auction.projectURL : "" },
      ":LogoURL": { S: auction.logoURL ? auction.logoURL : "" },
      ":OtherURL": { S: auction.otherURL ? auction.otherURL : "" },
      ":TargetTotalRaised": {
        N: auction.targetTotalRaised ? auction.targetTotalRaised.toString() : "0",
      },
      ":MaximumTotalRaised": {
        N: auction.maximumTotalRaised ? auction.maximumTotalRaised.toString() : "0",
      },
      ":TemplateName": { S: TEMPLATE_V1_NAME },
    },
  });
  const output = await dbClient.send(command);
  return auction;
}
