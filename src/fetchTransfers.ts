import { commonAbis, evmDecoder, evmPortalSource } from '@subsquid/pipes/evm'

async function main() {
  const source = evmPortalSource({
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

  for await (let { data, ctx } of source) {
    console.log(`Got ${data.transfers.length} transfers, here is the latest one:`)
    console.log(data.transfers[data.transfers.length-1])
  }
}

void main()