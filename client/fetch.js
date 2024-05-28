export async function fetcher(path, options) {
  const call = await fetch(path, {
    headers: {
      'Content-Type': 'application/json'
    },
    ...(options.json && {
      body: JSON.stringify(options.json)
    }),
    ...options
  });

  return await call.json();
}
