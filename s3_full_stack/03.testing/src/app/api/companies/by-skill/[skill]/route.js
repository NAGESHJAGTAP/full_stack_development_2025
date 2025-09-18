import clientPromise from '../../../../lib/mongodb';     
export async function GET(request, { params }) {
  try {
    const { skill } = params;

    const client = await clientPromise;
    const db = client.db('workshop'); // use your DB name
    const collection = db.collection('companies');

    // Match companies where skill exists in either schema
    const companies = await collection
      .find({
        $or: [
          { "hiringCriteria.skills": { $regex: `^${skill}$`, $options: "i" } },
          { hiringCriteria: { $regex: `^${skill}$`, $options: "i" } }
        ]
      })
      .toArray();

    return new Response(JSON.stringify(companies), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in /api/companies/by-skill/:skill:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
