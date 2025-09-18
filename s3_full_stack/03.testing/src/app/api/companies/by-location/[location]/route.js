// app/api/companies/by-location/[location]/route.js
import clientPromise from '../../../../lib/mongodb'; 

export async function GET(req, { params }) {
  try {
    const { location } = params;

    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db("workshop"); // change if your DB name is different
    const collection = db.collection("companies");

    // Case-insensitive search for location
    const companies = await collection
      .find({ location: { $regex: location, $options: "i" } })
      .toArray();

    return new Response(JSON.stringify(companies), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in /api/companies/by-location:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
