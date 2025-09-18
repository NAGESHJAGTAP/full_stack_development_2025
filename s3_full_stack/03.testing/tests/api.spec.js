// tests/api.spec.js
const { test, expect } = require('@playwright/test');

test.describe('Next.js (App Router) workbook API', () => {
  test('GET /api/companies returns a list', async ({ request }) => {
    const res = await request.get('/api/companies');
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty('count');
    expect(body).toHaveProperty('items');
    expect(Array.isArray(body.items)).toBeTruthy();
    expect(body.count).toBeGreaterThan(0);
  });

  test('GET /api/companies/search?name=Microsoft returns Microsoft', async ({ request }) => {
    const res = await request.get('/api/companies/search?name=Microsoft');
    expect(res.status()).toBe(200);
    const { count, items } = await res.json();
    expect(count).toBeGreaterThan(0);
    const found = items.find(it => it.name && it.name.toLowerCase().includes('microsoft'));
    expect(found).toBeTruthy();
  });

  test('GET /api/companies/:id returns the company document', async ({ request }) => {
    const listRes = await request.get('/api/companies?limit=1');
    expect(listRes.status()).toBe(200);
    const listBody = await listRes.json();
    expect(listBody.items.length).toBeGreaterThan(0);

    const id = listBody.items[0]._id;
    const singleRes = await request.get(`/api/companies/${id}`);
    expect(singleRes.status()).toBe(200);
    const doc = await singleRes.json();
    expect(doc).toHaveProperty('_id');
    expect(doc._id).toBe(id);
    expect(doc).toHaveProperty('name');
  });

  // optional negative tests (invalid id / not found)
  test('GET /api/companies/:id with invalid id returns 400', async ({ request }) => {
    const r = await request.get('/api/companies/invalid-id-123');
    expect(r.status()).toBe(400);
    const body = await r.json();
    expect(body).toHaveProperty('error');
  });

    test('GET /api/companies/search?location=Hyderabad', async ({ request }) => {
    const res = await request.get('/api/companies/search?location=Hyderabad');
    expect(res.status()).toBe(200);
    const { count, items } = await res.json();
    expect(count).toBeGreaterThan(0);
    const found = items.find(it => it.location && it.location.toLowerCase().includes('hyderabad'));
    expect(found).toBeTruthy();
  });


test('GET /api/companies/count returns total companies (with optional filters)', async ({ request }) => {
  const res = await request.get('/api/companies/count');
  expect(res.status()).toBe(200);

  const { total } = await res.json();
  expect(typeof total).toBe('number');
  expect(total).toBeGreaterThan(0);
});



test('GET /api/companies/top-paid returns companies sorted by salary desc', async ({ request }) => {
  const res = await request.get('/api/companies/top-paid?limit=5');
  expect(res.status()).toBe(200);

  const companies = await res.json();
  expect(Array.isArray(companies)).toBe(true);
  expect(companies.length).toBeGreaterThan(0);

  // salaries should be in descending order
  const salaries = companies.map(c => c.salaryBand.base);
  const sorted = [...salaries].sort((a, b) => b - a);
  expect(salaries).toEqual(sorted);
});





test('GET /api/companies/by-skill/:skill returns companies with given skill', async ({ request }) => {
  const res = await request.get('/api/companies/by-skill/React');
  expect(res.status()).toBe(200);

  const companies = await res.json();
  expect(Array.isArray(companies)).toBe(true);
  expect(companies.length).toBeGreaterThan(0);

  // check each company has the skill
  companies.forEach(company => {
    const skillsArray = Array.isArray(company.hiringCriteria)
      ? company.hiringCriteria.map(s => s.toLowerCase())
      : company.hiringCriteria?.skills?.map(s => s.toLowerCase()) || [];

    expect(skillsArray).toContain("react".toLowerCase());
  });
});






test('GET /api/companies/by-location/:location returns companies in given location', async ({ request }) => {
  const res = await request.get('/api/companies/by-location/Pune'); 
  expect(res.status()).toBe(200);

  const companies = await res.json();
  expect(Array.isArray(companies)).toBe(true);
  expect(companies.length).toBeGreaterThan(0);

  companies.forEach(company => {
    expect(company.location.toLowerCase()).toContain("pune");
  });
});




test('GET /api/companies/headcount-range returns companies within employeeCount range', async ({ request }) => {
  const res = await request.get('/api/companies/headcount-range?min=1000&max=5000');
  expect(res.status()).toBe(200);

  const companies = await res.json();
  expect(Array.isArray(companies)).toBe(true);

  if (companies.length > 0) {
    companies.forEach(company => {
      expect(company.employeeCount).toBeGreaterThanOrEqual(1000);
      expect(company.employeeCount).toBeLessThanOrEqual(5000);
    });
  }
});



test('GET /api/companies/benefit/:benefit returns companies with the given benefit', async ({ request }) => {
  const benefitName = 'Relocation'; // example benefit to test

  // Make API request
  const res = await request.get(`/api/companies/benefit/${benefitName}`);
  expect(res.status()).toBe(200);

  const data = await res.json();

  // Check response shape
  expect(data).toHaveProperty('count');
  expect(typeof data.count).toBe('number');
  expect(data).toHaveProperty('items');
  expect(Array.isArray(data.items)).toBe(true);

  // If there are items, each company should have the benefit (case-insensitive)
  if (data.items.length > 0) {
    data.items.forEach(company => {
      const benefits = company.benefits?.map(b => b.toLowerCase()) || [];
      expect(benefits).toContain(benefitName.toLowerCase());
    });
  }
});



});
