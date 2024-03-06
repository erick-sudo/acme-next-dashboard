'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/dist/server/api-utils';
import { z } from 'zod';

const FormSchema = z.object({
  id: z.string(),
  customerId: z.string(),
  amount: z.coerce.number(),
  status: z.enum(['pending', 'paid']),
});

const CreateInvoice = FormSchema.omit({ id: true });
const UpdateInvoice = FormSchema.omit({ id: true });

export async function createInvoice(formData: FormData) {
  const { customerId, amount, status } = CreateInvoice.parse({
    customerId: formData.get('customerId') || 'customer-id',
    amount: formData.get('amount') || 0,
    status: formData.get('status') || 'pending',
  });
  const amountInCents = amount * 100;

  // const date = new Date().toISOString().split('T')[0];

  try {
    await fetch('http://localhost:4000/invoices', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        customer_id: customerId,
        amount: amountInCents,
        status: status,
      }),
    })
      .then((response) => response.json())
      .then((dt) => dt);
  } catch (e) {
    return { message: 'Failed to Create Invoice.' };
  }

  revalidatePath('/dashboard/invoices');
  // redirect('/dashboard/invoices');
}

export async function updateInvoice(id: string, formData: FormData) {
  const { customerId, amount, status } = UpdateInvoice.parse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });

  const amountInCents = amount * 100;

  try {
    await fetch(`http://localhost:4000/invoices/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        customer_id: customerId,
        amount: amountInCents,
        status: status,
      }),
    })
      .then((response) => response.json())
      .then((dt) => dt);
  } catch (e) {
    return { message: 'Failed to Update Invoice.' };
  }

  revalidatePath('/dashboard/invoices');
  // redirect('/dashboard/invoices');
}

export async function deleteInvoice(id: string) {
  try {
    await fetch(`http://localhost:4000/invoices/${id}`, {
      method: 'DELETE',
    });
  } catch (e) {
    return { message: 'Failed to Delete Invoice.' };
  }

  revalidatePath('/dashboard/invoices');
}
