import neo4j from 'neo4j-driver'

const driver = neo4j.driver(
  process.env.GRAPH_URI || 'bolt://localhost:7687',
  neo4j.auth.basic(process.env.GRAPH_USER || 'neo4j', process.env.GRAPH_PASSWORD || 'neo4j'),
)

export async function registerLeadRelationship(leadId: string, company: string, market: string) {
  const session = driver.session()

  try {
    await session.run(
      `
      MERGE (l:Lead {id:$leadId})
      MERGE (c:Company {name:$company})
      MERGE (m:Market {name:$market})

      MERGE (l)-[:INTERESTED_IN]->(m)
      MERGE (l)-[:CONNECTED_TO]->(c)
      `,
      {
        leadId,
        company,
        market,
      },
    )
  } finally {
    await session.close()
  }
}

export async function closeRevenueGraph() {
  await driver.close()
}
