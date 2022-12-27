
export async function sleep(t: number) {
  await new Promise(resolve => {
      setTimeout(resolve, t);
  });
}

export async function checkUntil<T>(async_fn: () => Promise<T>, timeout: number) {
    const t0 = new Date().getTime();
    while (true) {
        if (await async_fn()) {
            return;
        }
        const t = new Date().getTime();
        if (t - t0 >= timeout) {
            throw new Error('timeout');
        }
        await sleep(100);
    }
}

export async function checkUntilEq<T>(async_fn: () => Promise<T>, expected: T, timeout: number, verbose=true) {
  const t0 = new Date().getTime();
  let lastActual = undefined;
  while (true) {
      const actual = await async_fn();
      if (actual == expected) {
          return;
      }
      if (actual != lastActual && verbose) {
          console.debug(`Waiting... (current = ${actual}, expected = ${expected})`)
          lastActual = actual;
      }
      const t = new Date().getTime();
      if (t - t0 >= timeout) {
          throw new Error('timeout');
      }
      await sleep(100);
  }
}


export async function blockBarrier(api: unknown, prpc: unknown, finalized=false, timeout=4*6000) {
  const head = await (finalized
      // @ts-ignore
      ? api.rpc.chain.getFinalizedHead()
      // @ts-ignore
      : api.rpc.chain.getHeader()
  );
  let chainHeight = head.number.toNumber();
  await checkUntil(
      // @ts-ignore
      async() => (await prpc.getInfo({})).blocknum > chainHeight,
      timeout,
  );
}
