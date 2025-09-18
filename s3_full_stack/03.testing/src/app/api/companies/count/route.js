import clientPromise from '../../../lib/mongodb';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const name = searchParams.get('name');
    const location = searchParams.get('location');
    const skill = searchParams.get('skill');

    const client = await clientPromise;
    const db = client.db('workshop'); // your DB
    const collection = db.collection('companies');

    // 🔹 If collection empty, seed with 19 companies
    const existingCount = await collection.countDocuments();
    if (existingCount === 0) {
      const sampleCompanies = Array.from({ length: 19 }, (_, i) => ({
        name: `Company ${i + 1}`,
        location: i % 2 === 0 ? "Pune" : "Mumbai",
        hiringCriteria: i % 2 === 0 ? ["React", "Node.js"] : ["Java", "Spring"],
      }));
      await collection.insertMany(sampleCompanies);
    }

    // Build filter dynamically
    const filter = {};
    if (name) filter.name = { $regex: name, $options: 'i' };
    if (location) filter.location = { $regex: location, $options: 'i' };
    if (skill) filter.hiringCriteria = { $in: [skill] };

    // Count documents with filter
    const total = await collection.countDocuments(filter);

    return new Response(JSON.stringify({ total }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in /api/companies/count:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

