import {
  DynamoDBClient,
  GetItemCommand,
  BatchGetItemCommand,
  PutItemCommand,
  UpdateItemCommand,
  ScanCommand,
} from "@aws-sdk/client-dynamodb";
import type { AttributeValue } from "@aws-sdk/client-dynamodb";
import { TEMPLATE_V1_NAME } from "../constants/templates";
import { MetaData, validateMetaData } from "../types/Auction";

export class DBClient {
  client: DynamoDBClient;
  tableName: string;

  private dynamoDBItemsToMetaData = (item: Record<string, AttributeValue>): MetaData => {
    const {
      AuctionId,
      ChainId,
      Title,
      Description,
      Terms,
      ProjectURL,
      LogoURL,
      OtherURL,
      TargetTotalRaised,
      MaximumTotalRaised,
      TemplateName,
    } = item;

    return {
      id: AuctionId?.S,
      chainId: ChainId?.N ? parseInt(ChainId.N, 10) : undefined,
      title: Title?.S,
      description: Description?.S,
      terms: Terms?.S,
      projectURL: ProjectURL?.S,
      logoURL: LogoURL?.S,
      otherURL: OtherURL?.S,
      targetTotalRaised: TargetTotalRaised?.N ? parseFloat(TargetTotalRaised.N) : undefined,
      maximumTotalRaised: MaximumTotalRaised?.N ? parseFloat(MaximumTotalRaised.N) : undefined,
      templateName: TemplateName?.S,
    } as MetaData;
  };

  async scanMetaData(
    chainId: number,
    lastEvaluatedKeyId?: string,
    lastEvaluatedKeyCreatedAt?: string,
  ): Promise<MetaData[] | undefined> {
    const command = new ScanCommand({
      TableName: this.tableName,
      Limit: 10,
      ExclusiveStartKey:
        lastEvaluatedKeyId && lastEvaluatedKeyCreatedAt
          ? {
              AuctionId: { S: lastEvaluatedKeyId },
              ChainId: { N: chainId.toString() },
            }
          : undefined,
    });
    const output = await this.client.send(command);
    return output.Items?.map(this.dynamoDBItemsToMetaData);
  }

  async fetchMetaData(auctionId: string, chainId: number): Promise<MetaData | undefined> {
    const command = new GetItemCommand({
      TableName: this.tableName,
      Key: { AuctionId: { S: auctionId }, ChainId: { N: chainId.toString() } },
    });
    const output = await this.client.send(command);
    const item = output.Item;
    if (item == undefined) return undefined;
    return this.dynamoDBItemsToMetaData(item);
  }

  async batchFetchMetaData(auctionIds: string[], chainId: number): Promise<MetaData[]> {
    const tableName = this.tableName;
    const command = new BatchGetItemCommand({
      RequestItems: {
        [tableName]: {
          Keys: auctionIds.map((id) => {
            return { AuctionId: { S: id }, ChainId: { N: chainId.toString() } };
          }),
        },
      },
    });
    const output = await this.client.send(command);
    if (output.Responses == undefined) return [];
    return output.Responses[tableName].map((item: any) => this.dynamoDBItemsToMetaData(item));
  }

  async addMetaData(auction: MetaData): Promise<MetaData | undefined> {
    // TODO Take Minimum total raised into account
    // validateMetaData(auction, minRaisedAmount)
    const errors = validateMetaData(auction);
    if (Object.keys(errors).length > 0) {
      const errorMessage = Object.entries(errors)
        .map((e) => e[1])
        .join(", ");
      throw new Error(errorMessage);
    }
    if (errors.chainId) return;
    const item = {
      AuctionId: { S: auction.id!.toLowerCase() },
      ChainId: { N: auction.chainId!.toString() },
      Title: { S: auction.title ?? "" },
      Description: { S: auction.description ?? "" },
      Terms: { S: auction.terms ?? "" },
      ProjectURL: { S: auction.projectURL ?? "" },
      LogoURL: { S: auction.logoURL ?? "" },
      OtherURL: { S: auction.otherURL ?? "" },
      TargetTotalRaised: {
        N: auction.targetTotalRaised ? auction.targetTotalRaised.toString() : "0",
      },
      MaximumTotalRaised: {
        N: auction.maximumTotalRaised ? auction.maximumTotalRaised.toString() : "0",
      },
      TemplateName: { S: TEMPLATE_V1_NAME },
    };
    const command = new PutItemCommand({
      TableName: this.tableName,
      Item: item,
    });
    const output = await this.client.send(command);
    return auction;
  }

  async updateAuction(auction: MetaData): Promise<MetaData | undefined> {
    const errors = validateMetaData(auction);
    if (Object.keys(errors).length > 0) {
      const errorMessage = Object.entries(errors)
        .map((e) => e[1])
        .join(", ");
      throw new Error(errorMessage);
    }

    const command = new UpdateItemCommand({
      TableName: this.tableName,
      Key: {
        AuctionId: { S: auction.id!.toLowerCase() },
        ChainId: { N: auction.chainId!.toString() },
      },
      UpdateExpression:
        "set Title = :Title, Description=:Description, Terms = :Terms, ProjectURL = :ProjectURL, LogoURL = :LogoURL, OtherURL = :OtherURL, TargetTotalRaised = :TargetTotalRaised, MaximumTotalRaised = :MaximumTotalRaised, TemplateName = :TemplateName",
      ExpressionAttributeValues: {
        ":Title": { S: auction.title ?? "" },
        ":Description": { S: auction.description ?? "" },
        ":Terms": { S: auction.terms ?? "" },
        ":ProjectURL": { S: auction.projectURL ?? "" },
        ":LogoURL": { S: auction.logoURL ?? "" },
        ":OtherURL": { S: auction.otherURL ?? "" },
        ":TargetTotalRaised": {
          N: auction.targetTotalRaised ? auction.targetTotalRaised.toString() : "0",
        },
        ":MaximumTotalRaised": {
          N: auction.maximumTotalRaised ? auction.maximumTotalRaised.toString() : "0",
        },
        ":TemplateName": { S: TEMPLATE_V1_NAME },
      },
    });
    const output = await this.client.send(command);
    return auction;
  }

  constructor({
    region,
    accessKey,
    secretKey,
    tableName,
  }: {
    region: string;
    accessKey: string;
    secretKey: string;
    tableName: string;
  }) {
    this.client = new DynamoDBClient({
      region: region,
      credentials: {
        accessKeyId: accessKey,
        secretAccessKey: secretKey,
      },
    });
    this.tableName = tableName;
  }
}
