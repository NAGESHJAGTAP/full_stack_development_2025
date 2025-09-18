// app/api/companies/benefit/[benefit]/route.js
import clientPromise from '../../../../lib/mongodb';

export async function GET(req, context) {
  try {
    // Correct way: get params from context
    const { params } = context;
    const benefit = params?.benefit;

    if (!benefit) {
      return new Response(
        JSON.stringify({ error: "Benefit parameter is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const client = await clientPromise;
    const db = client.db("workshop"); // replace with your DB name
    const collection = db.collection("companies");

    // Match benefit inside array (case-insensitive substring match)
    const filter = {
      benefits: { $elemMatch: { $regex: benefit, $options: "i" } }
    };

    const companies = await collection.find(filter).toArray();

    return new Response(
      JSON.stringify({
        count: companies.length,
        items: companies
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in /api/companies/benefit/:benefit:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}



