import { createClient } from '@clickhouse/client'
import { commonAbis, evmDecoder, evmPortalSource } from '@subsquid/pipes/evm'
import { clickhouseTarget } from '@subsquid/pipes/targets/clickhouse'

async function main() {
  const client = createClient({
    username: 'default',
    password: 'default',
    url: 'http://localhost:10123',
  })

  client.command({ query: `
    CREATE TABLE IF NOT EXISTS weth_transfers (
      block_number          UInt32 CODEC (DoubleDelta, ZSTD),
      timestamp             DateTime CODEC (DoubleDelta, ZSTD),
      transaction_hash      String,
      log_index             UInt16,
      from                  LowCardinality(FixedString(42)), -- address
      to                    LowCardinality(FixedString(42)), -- address
      value                 UInt256,
      sign                  Int8 DEFAULT 1
    )
    ENGINE = CollapsingMergeTree(sign)
    ORDER BY (block_number, transaction_hash, log_index);
    `
  })

  await evmPortalSource({
    portal: 'https://portal.sqd.dev/datasets/megaeth-mainnet',
  })
  .pipe(
    evmDecoder({
      range: { from: 0 },
      contracts: [ '0x4200000000000000000000000000000000000006' ], // WETH
      events: {
        transfers: commonAbis.erc20.events.Transfer,
      },
    }),
  )
  .pipeTo(
    clickhouseTarget({
      client,
      onRollback: async ({type, store, cursor}) => {
        try {
          await store.removeAllRows({
            tables: ['weth_transfers'],
            where: `block_number > ${cursor.number}`,
          })
        }
        catch (err) {
          console.error('onRollback err:', err)
          throw err
        }
      },
      onData: async ({ store, data, ctx }) => {
        console.log(`inserting ${data.transfers.length} transfers`)
        store.insert({
          table: 'weth_transfers',
          values: data.transfers.map(t => ({
            block_number: t.block.number,
            timestamp: t.timestamp.valueOf() / 1000,
            transaction_hash: t.rawEvent.transactionHash,
            log_index: t.rawEvent.logIndex,
            from: t.event.from,
            to: t.event.to,
            value: t.event.value.toString()
          })),
          format: 'JSONEachRow'
        })
      },
    }),
  )
}

void main()