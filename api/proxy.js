export const config = {
  runtime: 'edge', 
};

const SEED_IPS = [
  "173.212.220.65",
  "161.97.97.41",
  "192.190.136.36",
  "192.190.136.38",
  "207.244.255.1",
  "192.190.136.28",
  "192.190.136.29",
  "173.212.203.145"
];

const RPC_PORT = 6000;

export default async function handler(request) {
  const body = {
    jsonrpc: "2.0",
    method: "get-pods-with-stats",
    id: 1
  };

  const queryNode = async (ip) => {
    try {
      const response = await fetch(`http://${ip}:${RPC_PORT}/rpc`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(4000)
      });
      
      if (!response.ok) throw new Error('Status ' + response.status);
      const data = await response.json();
      if (!data.result) throw new Error('No result');
      return data.result;
    } catch (e) {
      throw e;
    }
  };

  try {
    const promises = SEED_IPS.map(ip => queryNode(ip));
    const result = await Promise.any(promises);

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 's-maxage=5, stale-while-revalidate'
      },
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: "Network unreachable", details: error.message }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}