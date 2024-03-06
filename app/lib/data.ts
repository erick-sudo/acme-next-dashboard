import { sql } from '@vercel/postgres';
import {
  CustomerField,
  CustomersTableType,
  InvoiceForm,
  InvoicesTable,
  LatestInvoiceRaw,
  User,
  Revenue,
  LatestInvoice,
} from './definitions';
import { formatCurrency } from './utils';

const ITEMS_PER_PAGE = 10;

export async function fetchRevenue() {
  // Add noStore() here to prevent the response from being cached.
  // This is equivalent to in fetch(..., {cache: 'no-store'}).

  try {
    const data = await fetch(`http://localhost:4000/revenues`, {
      method: 'GET',
      cache: 'no-cache',
      headers: {
        Accept: 'application/json',
      },
    })
      .then((response) => response.json())
      .then((dt) => dt);
    let revenue: Revenue[] = [];
    if (Array.isArray(data)) {
      revenue = data.map((rev) => ({ month: rev.month, revenue: rev.revenue }));
    }

    return revenue;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch revenue data.');
  }
}

export async function fetchLatestInvoices() {
  try {
    // const data = await sql<LatestInvoiceRaw>`
    //   SELECT invoices.amount, customers.name, customers.image_url, customers.email, invoices.id
    //   FROM invoices
    //   JOIN customers ON invoices.customer_id = customers.id
    //   ORDER BY invoices.date DESC
    //   LIMIT 5`;

    const data = await fetch(
      `http://localhost:4000/invoices/paged/latest_invoices`,
      {
        method: 'GET',
        cache: 'no-cache',
        headers: {
          Accept: 'application/json',
        },
      },
    )
      .then((response) => response.json())
      .then((dt) => dt);

    let invoices: LatestInvoice[] = [];

    if (Array.isArray(data)) {
      invoices = data.map((inv) => ({
        id: inv.id,
        name: inv.name,
        image_url: inv.image_url,
        email: inv.email,
        amount: formatCurrency(parseInt(inv.amount)),
      }));
    }

    return invoices;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch the latest invoices.');
  }
}

export async function fetchCardData() {
  try {
    // You can probably combine these into a single SQL query
    // However, we are intentionally splitting them to demonstrate
    // how to initialize multiple queries in parallel with JS.
    // const invoiceCountPromise = sql`SELECT COUNT(*) FROM invoices`;
    // const customerCountPromise = sql`SELECT COUNT(*) FROM customers`;
    // const invoiceStatusPromise = sql`SELECT
    //      SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) AS "paid",
    //      SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END) AS "pending"
    //      FROM invoices`;

    // const data = await Promise.all([
    //   invoiceCountPromise,
    //   customerCountPromise,
    //   invoiceStatusPromise,
    // ]);

    // const numberOfInvoices = Number(data[0].rows[0].count ?? '0');
    // const numberOfCustomers = Number(data[1].rows[0].count ?? '0');
    // const totalPaidInvoices = formatCurrency(data[2].rows[0].paid ?? '0');
    // const totalPendingInvoices = formatCurrency(data[2].rows[0].pending ?? '0');

    const result = await fetch('http://localhost:4000/dashboard/counts', {
      method: 'GET',
      cache: 'no-cache',
      headers: {
        Accept: 'application/json',
      },
    })
      .then((response) => response.json())
      .then((dt) => dt);

    return {
      numberOfCustomers: Number(result.numberOfCustomers || 0),
      numberOfInvoices: Number(result.numberOfInvoices || 0),
      totalPaidInvoices: formatCurrency(result.totalPaidInvoices || 0),
      totalPendingInvoices: formatCurrency(result.totalPendingInvoices || 0),
    };
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch card data.');
  }
}

export async function fetchFilteredInvoices(
  query: string,
  currentPage: number,
) {
  try {
    // const invoices = await sql<InvoicesTable>`
    //   SELECT
    //     invoices.id,
    //     invoices.amount,
    //     invoices.date,
    //     invoices.status,
    //     customers.name,
    //     customers.email,
    //     customers.image_url
    //   FROM invoices
    //   JOIN customers ON invoices.customer_id = customers.id
    //   WHERE
    //     customers.name ILIKE ${`%${query}%`} OR
    //     customers.email ILIKE ${`%${query}%`} OR
    //     invoices.amount::text ILIKE ${`%${query}%`} OR
    //     invoices.date::text ILIKE ${`%${query}%`} OR
    //     invoices.status ILIKE ${`%${query}%`}
    //   ORDER BY invoices.date DESC
    //   LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset}
    // `;

    // Join table
    const data = await fetch(
      `http://localhost:4000/invoices/paged/search_invoices?query=${query}&page=${currentPage}&size=${ITEMS_PER_PAGE}`,
      {
        method: 'GET',
        cache: 'no-cache',
        headers: {
          Accept: 'application/json',
        },
      },
    )
      .then((response) => response.json())
      .then((dt) => dt);

    let invoices_customers: InvoicesTable[] = [];

    if (Array.isArray(data)) {
      invoices_customers = data.map((inv_c) => ({
        id: inv_c.id,
        customer_id: inv_c.customer_id,
        name: inv_c.name,
        email: inv_c.email,
        image_url: inv_c.image_url,
        date: inv_c.created_at,
        amount: inv_c.amount,
        status: inv_c.status === 'paid' ? 'paid' : 'pending',
      }));
    }

    return invoices_customers;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch invoices.');
  }
}

export async function fetchInvoicesPages(query: string) {
  try {
    //   const count = await sql`SELECT COUNT(*)
    //   FROM invoices
    //   JOIN customers ON invoices.customer_id = customers.id
    //   WHERE
    //     customers.name ILIKE ${`%${query}%`} OR
    //     customers.email ILIKE ${`%${query}%`} OR
    //     invoices.amount::text ILIKE ${`%${query}%`} OR
    //     invoices.date::text ILIKE ${`%${query}%`} OR
    //     invoices.status ILIKE ${`%${query}%`}
    // `;

    const data = await fetch(
      `http://localhost:4000/invoices/paged/search_count?query=${query}`,
      {
        method: 'GET',
        cache: 'no-cache',
        headers: {
          Accept: 'application/json',
        },
      },
    )
      .then((response) => response.json())
      .then((dt) => dt);

    const totalPages = Math.ceil(Number(data.count || 0) / ITEMS_PER_PAGE);
    return totalPages;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch total number of invoices.');
  }
}

export async function fetchInvoiceById(id: string) {
  try {
    // const data = await sql<InvoiceForm>`
    //   SELECT
    //     invoices.id,
    //     invoices.customer_id,
    //     invoices.amount,
    //     invoices.status
    //   FROM invoices
    //   WHERE invoices.id = ${id};
    // `;

    const data = await fetch(`http://localhost:4000/invoices/${id}`, {
      method: 'GET',
      cache: 'no-cache',
      headers: {
        Accept: 'application/json',
      },
    })
      .then((response) => response.json())
      .then((dt) => dt);

    const invoice: InvoiceForm = {
      id: data.id,
      customer_id: data.customer_id,
      status: data.status,
      amount: Number(data.amount) / 100,
    };

    return invoice;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch invoice.');
  }
}

export async function fetchCustomers() {
  try {
    // const data = await sql<CustomerField>`
    //   SELECT
    //     id,
    //     name
    //   FROM customers
    //   ORDER BY name ASC
    // `;

    const data = await fetch(`http://localhost:4000/customers`, {
      method: 'GET',
      cache: 'no-cache',
      headers: {
        Accept: 'application/json',
      },
    })
      .then((response) => response.json())
      .then((dt) => dt);

    let customers: CustomerField[] = [];

    if (Array.isArray(data)) {
      customers = data
        .map((c) => ({ id: c.id, name: c.name }))
        .sort((a, b) => (a.name > b.name ? 1 : a.name < b.name ? -1 : 0));
    }

    return data;
  } catch (err) {
    console.error('Database Error:', err);
    throw new Error('Failed to fetch all customers.');
  }
}

export async function fetchFilteredCustomers(query: string) {
  try {
    // const data = await sql<CustomersTableType>`
    // SELECT
    //   customers.id,
    //   customers.name,
    //   customers.email,
    //   customers.image_url,
    //   COUNT(invoices.id) AS total_invoices,
    //   SUM(CASE WHEN invoices.status = 'pending' THEN invoices.amount ELSE 0 END) AS total_pending,
    //   SUM(CASE WHEN invoices.status = 'paid' THEN invoices.amount ELSE 0 END) AS total_paid
    // FROM customers
    // LEFT JOIN invoices ON customers.id = invoices.customer_id
    // WHERE
    //   customers.name ILIKE ${`%${query}%`} OR
    //     customers.email ILIKE ${`%${query}%`}
    // GROUP BY customers.id, customers.name, customers.email, customers.image_url
    // ORDER BY customers.name ASC
    // `;

    const data = await fetch(
      `http://localhost:4000/customers/paged/search_customers?query=${query}`,
      {
        method: 'GET',
        cache: 'no-cache',
        headers: {
          Accept: 'application/json',
        },
      },
    )
      .then((response) => response.json())
      .then((dt) => dt);

    let customers: CustomersTableType[] = [];

    if (Array.isArray(data)) {
      customers = data.map((customer) => ({
        ...customer,
        total_pending: formatCurrency(customer.total_pending),
        total_paid: formatCurrency(customer.total_paid),
      }));
    }

    return customers;
  } catch (err) {
    console.error('Database Error:', err);
    throw new Error('Failed to fetch customer table.');
  }
}

export async function getUser(email: string) {
  try {
    //const user = await sql`SELECT * FROM users WHERE email=${email}`;
    const data = await fetch(`http://localhost:4000/users/by/email`, {
      method: 'POST',
      cache: 'no-cache',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: email }),
    })
      .then((response) => response.json())
      .then((dt) => dt);

    const user: User = {
      id: data.id,
      name: data.name,
      email: data.email,
      password: data.password,
    };
    return user;
  } catch (error) {
    console.error('Failed to fetch user:', error);
    throw new Error('Failed to fetch user.');
  }
}
