// app/api/companies/headcount-range/route.js
import clientPromise from '../../../lib/mongodb';
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);

    // Get min and max values from query params
    const min = parseInt(searchParams.get("min")) || 0;
    const maxParam = searchParams.get("max");
    const max = maxParam ? parseInt(maxParam) : null;

    const client = await clientPromise;
    const db = client.db("workshop"); // replace with your DB name
    const collection = db.collection("companies");

    // Build filter
    let filter = {};
    if (max !== null) {
      filter.employeeCount = { $gte: min, $lte: max }; // min <= employeeCount <= max
    } else {
      filter.employeeCount = { $gte: min }; // employeeCount >= min
    }

    // Fetch matching companies
    const companies = await collection.find(filter).toArray();

    return new Response(JSON.stringify(companies), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in /api/companies/headcount-range:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}



