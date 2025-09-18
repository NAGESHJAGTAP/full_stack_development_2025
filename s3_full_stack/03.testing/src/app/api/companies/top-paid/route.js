import clientPromise from '../../../lib/mongodb';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    let limit = parseInt(searchParams.get('limit')) || 5;
    if (limit > 50) limit = 50;

    const client = await clientPromise;
    const db = client.db('workshop');
    const collection = db.collection('companies');

    // fetch companies with salary, fallback if missing
    const companies = await collection
      .aggregate([
        {
          $addFields: {
            "salaryBand.base": {
              $ifNull: ["$salaryBand.base", 0] 
            }
          }
        },
        { $sort: { "salaryBand.base": -1 } },
        { $limit: limit },
        {
          $project: {
            name: 1,
            location: 1,
            "salaryBand.base": 1
          }
        }
      ])
      .toArray();

    return new Response(JSON.stringify(companies), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in /api/companies/top-paid:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
