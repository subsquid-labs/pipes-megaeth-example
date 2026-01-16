# Simple MegaETH pipes

This repo houses two simple pipes that stream [MegaETH](https://www.megaeth.com) data on the [WETH token](https://megaeth.blockscout.com/token/0x4200000000000000000000000000000000000006) from an SQD portal.

The examples are built with Pipes SDK by [Subsquid](https://www.sqd.ai/). Pipes SDK is a highly extensible and flexible library built to make it easy to bring the SQD Network data into existing codebases. As of 2026-01-16 it is in beta, with stabilization expected by the end of Q1 2026.

## Quickstart

```bash
git clone https://github.com/subsquid-labs/pipes-megaeth-example
cd pipes-megaeth-example
npm run build
```
After this you can either just watch the transfers as they are retrieved:
```bash
npm run start
```
or start a [Clickhouse](https://clickhouse.com) instance and write the transfers there:
```bash
docker compose up -d
npm run start-with-clickhouse
```
To take a look at the data, go to [localhost:10123/play](http://localhost:10123/play), log in with login `default` and password `default` and run
```sql
select * from weth_transfers;
```

## Documentation

 * [`src/fetchTransfers.ts`](src/fetchTransfers.ts) that runs on `npm run start` is worth checking out - it's short!
 * [Full documentation](https://beta.docs.sqd.dev/en/sdk/pipes-sdk/) - WIP
 * [pipes-sdk-docs repo](https://github.com/subsquid-labs/pipes-sdk-docs/) - a collection of examples designed to teach Pipes SDK step by step