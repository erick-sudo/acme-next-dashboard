import { sql } from '@vercel/postgres';
import {
  CustomerField,
  InvoiceForm,
  InvoicesTable,
  User,
  Revenue,
  LatestInvoice,
  FormattedCustomersTable,
  CustomerForm,
} from './definitions';
import { formatCurrency } from './utils';

const ITEMS_PER_PAGE = 6;

export async function fetchRevenue() {
  return await fetch(`http://localhost:4000/revenues`, {
    method: 'GET',
    cache: 'no-cache',
    headers: {
      Accept: 'application/json',
    },
  })
    .then((response) => response.json())
    .then((data) => {
      let revenue: Revenue[] = [];
      if (Array.isArray(data)) {
        revenue = data.map((rev) => ({
          month: rev.month,
          revenue: rev.revenue,
        }));
      }

      return revenue;
    })
    .catch(() => {
      throw new Error('Failed to fetch revenue data.');
    });
}

export async function fetchLatestInvoices() {
  return await fetch(`http://localhost:4000/invoices/paged/latest_invoices`, {
    method: 'GET',
    cache: 'no-cache',
    headers: {
      Accept: 'application/json',
    },
  })
    .then((response) => response.json())
    .then((data) => {
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
    })
    .catch(() => {
      throw new Error('Failed to fetch the latest invoices.');
    });
}

export async function fetchCardData() {
  return await fetch('http://localhost:4000/dashboard/counts', {
    method: 'GET',
    cache: 'no-cache',
    headers: {
      Accept: 'application/json',
    },
  })
    .then((response) => response.json())
    .then((result) => {
      return {
        numberOfCustomers: Number(result.numberOfCustomers || 0),
        numberOfInvoices: Number(result.numberOfInvoices || 0),
        totalPaidInvoices: formatCurrency(result.totalPaidInvoices || 0),
        totalPendingInvoices: formatCurrency(result.totalPendingInvoices || 0),
      };
    })
    .catch(() => {
      throw new Error('Failed to fetch card data.');
    });
}

export async function fetchFilteredInvoices(
  query: string,
  currentPage: number,
) {
  return await fetch(
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
    .then((data) => {
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

        return invoices_customers;
      }
    })
    .catch((error) => {
      throw new Error('Failed to fetch invoices.');
    });
}

export async function fetchInvoicesPages(query: string) {
  return await fetch(
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
    .then((data) => Math.ceil(Number(data.count || 0) / ITEMS_PER_PAGE))
    .catch(() => {
      throw new Error('Failed to fetch total number of invoices.');
    });
}

export async function fetchCustomerPages(query: string) {
  return await fetch(
    `http://localhost:4000/customers/paged/search_count?query=${query}`,
    {
      method: 'GET',
      cache: 'no-cache',
      headers: {
        Accept: 'application/json',
      },
    },
  )
    .then((response) => response.json())
    .then((data) => Math.ceil(Number(data.count || 0) / ITEMS_PER_PAGE))
    .catch(() => {
      throw new Error('Failed to fetch total number of invoices.');
    });
}

export async function fetchInvoiceById(id: string) {
  return await fetch(`http://localhost:4000/invoices/${id}`, {
    method: 'GET',
    cache: 'no-cache',
    headers: {
      Accept: 'application/json',
    },
  }).then((response) => {
    if (response.status < 400) {
      return response.json().then((data) => {
        const invoice: InvoiceForm = {
          id: data.id,
          customer_id: data.customer_id,
          status: data.status,
          amount: Number(data.amount) / 100,
        };

        return invoice;
      });
    } else if (response.status === 404) {
      response.json().then((error) => {
        throw new Error(error.error || error.message);
      });
    } else if (response.status === 422) {
    } else {
    }
  });
}

export async function fetchCustomers() {
  return await fetch(`http://localhost:4000/customers?page=1&size=50`, {
    method: 'GET',
    cache: 'no-cache',
    headers: {
      Accept: 'application/json',
    },
  })
    .then((response) => response.json())
    .then((data) => {
      let customers: CustomerField[] = [];

      if (Array.isArray(data)) {
        customers = data
          .map((c) => ({ id: c.id, name: c.name }))
          .sort((a, b) => (a.name > b.name ? 1 : a.name < b.name ? -1 : 0));
      }

      return customers;
    })
    .catch(() => {
      throw new Error('Failed to fetch all customers.');
    });
}

export async function fetchFilteredCustomers(
  query: string,
  currentPage: number,
) {
  return await fetch(
    `http://localhost:4000/customers/paged/search_customers?query=${query}&page=${currentPage}&size=${ITEMS_PER_PAGE}`,
    {
      method: 'GET',
      cache: 'no-cache',
      headers: {
        Accept: 'application/json',
      },
    },
  )
    .then((response) => response.json())
    .then((data) => {
      let customers: FormattedCustomersTable[] = [];

      if (Array.isArray(data)) {
        customers = data.map((customer) => ({
          ...customer,
          total_pending: formatCurrency(customer.total_pending),
          total_paid: formatCurrency(customer.total_paid),
        }));
      }

      return customers;
    })
    .catch((err) => {
      throw new Error('Failed to fetch customers');
    });
}

export async function fetchCustomerById(id: string) {
  return await fetch(`http://localhost:4000/customers/${id}`, {
    method: 'GET',
    cache: 'no-cache',
    headers: {
      Accept: 'application/json',
    },
  }).then((response) => {
    if (response.status < 400) {
      return response.json().then((data) => {
        const invoice: CustomerForm = {
          id: data.id,
          name: data.name,
          email: data.email,
          image_url: data.image_url,
        };

        return invoice;
      });
    } else if (response.status === 404) {
      response.json().then((error) => {
        throw new Error(error.error || error.message);
      });
    } else if (response.status === 422) {
    } else {
    }
  });
}

export async function fetchUser(email: string) {
  return await fetch(`http://localhost:4000/users/by/email`, {
    method: 'POST',
    cache: 'no-cache',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email: email }),
  })
    .then(async (response) => {
      if (response.status < 400) {
        return await response.json().then((data) => {
          const user: User = {
            id: data.id,
            name: data.name,
            email: data.email,
            password: data.password,
          };
          return user;
        });
      } else {
        throw new Error('User not found');
      }
    })
    .catch(() => {
      throw new Error('Failed to fetch user.');
    });
}
