'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/dist/server/api-utils';
import { z } from 'zod';
import { ValidationErrorsContainer } from './definitions';
import { signIn } from '@/auth';
import { AuthError } from 'next-auth';

export type State = {
  message?: string | null;
  success: boolean;
};

export type InvState = {
  errors?: ValidationErrorsContainer<{
    customer_id?: string[];
    amount?: string[];
    status?: string[];
  }>;
  message?: string | null;
  success: boolean;
};

export type CustomerState = {
  errors?: ValidationErrorsContainer<{
    name?: string[];
    email?: string[];
    image_url?: string[];
  }>;
  message?: string | null;
  success: boolean;
};

const FormSchema = z.object({
  id: z.string(),
  customer_id: z.string({ invalid_type_error: 'Please select a customer' }),
  amount: z.coerce
    .number()
    .gt(0, { message: 'Please enter an amount greater than $0.' }),
  status: z.enum(['pending', 'paid'], {
    invalid_type_error: 'Please select an invoice status.',
  }),
});

const CustomerFormSchema = z.object({
  id: z.string(),
  name: z
    .string()
    .refine((name) => name.trim() !== '', { message: 'Name cannot be empty' }),
  email: z
    .string({ required_error: 'Email cannot be empty' })
    .refine((name) => name.trim() !== '', { message: 'Email cannot be empty' }),
  image_url: z
    .string()
    .refine((name) => name.trim() !== '', {
      message: 'Image url must be a valid url',
    }),
});

const CreateInvoice = FormSchema.omit({ id: true });
const UpdateInvoice = FormSchema.omit({ id: true });

const CreateCustomer = CustomerFormSchema.omit({ id: true });

export async function createInvoice(state: InvState, formData: FormData) {
  const validatedFields = CreateInvoice.safeParse({
    customer_id: formData.get('customer_id'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });

  if (!validatedFields.success) {
    return {
      success: false,
      errors: { violations: validatedFields.error.flatten().fieldErrors },
      message: 'Missing Fields. Failed to Create Invoice.',
    };
  }

  const { customer_id, amount, status } = validatedFields.data;

  const amountInCents = amount * 100;
  try {
    await fetch('http://localhost:4000/invoices', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        customer_id: customer_id,
        amount: amountInCents,
        status: status,
      }),
    })
      .then((response) => response.json())
      .then((dt) => dt);

    const successState: InvState = {
      success: true,
      message: 'Invoice created successfully',
    };

    return successState;
  } catch (e) {
    return {
      success: true,
      message: 'Failed to create invoice.',
    };
  } finally {
    revalidatePath('/dashboard/invoices');
    // redirect('/dashboard/invoices');
  }
}

export async function updateInvoice(
  id: string,
  state: InvState,
  formData: FormData,
) {
  const validatedFields = UpdateInvoice.safeParse({
    customer_id: formData.get('customer_id'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });

  if (!validatedFields.success) {
    return {
      errors: { violations: validatedFields.error.flatten().fieldErrors },
      success: false,
      message: 'Missing Fields. Failed to Update Invoice.',
    };
  }

  const { customer_id, amount, status } = validatedFields.data;

  const amountInCents = amount * 100;

  try {
    await fetch(`http://localhost:4000/invoices/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        customer_id: customer_id,
        amount: amountInCents,
        status: status,
      }),
    })
      .then((response) => response.json())
      .then((dt) => dt);

    const successState: InvState = {
      success: true,
      message: 'Invoice updated successfully',
    };

    return successState;
  } catch (e) {
    return {
      success: false,
      message: 'Failed to update invoice.',
    };
  } finally {
    revalidatePath('/dashboard/invoices');
    // redirect('/dashboard/invoices');
  }
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

export async function createCustomer(state: CustomerState, formData: FormData) {
  const validatedFields = CreateCustomer.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    image_url: formData.get('image_url'),
  });

  if (!validatedFields.success) {
    return {
      errors: { violations: validatedFields.error.flatten().fieldErrors },
      message: 'Missing Fields. Failed to Create Customer.',
      success: false,
    };
  }

  const { name, email, image_url } = validatedFields.data;

  try {
    await fetch('http://localhost:4000/customers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ name, email, image_url }),
    })
      .then((response) => response.json())
      .then((dt) => dt);

    const successState: CustomerState = {
      success: true,
      message: 'Customer created successfully',
    };

    return successState;
  } catch (e) {
    return {
      success: true,
      message: 'Failed to create customer.',
    };
  }
}

export async function updateCustomer(
  id: string,
  state: CustomerState,
  formData: FormData,
) {
  const validatedFields = CreateCustomer.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    image_url: formData.get('image_url'),
  });

  if (!validatedFields.success) {
    return {
      errors: { violations: validatedFields.error.flatten().fieldErrors },
      message: 'Missing Fields. Failed to Update Customer.',
      success: false,
    };
  }

  const { name, email, image_url } = validatedFields.data;

  try {
    await fetch(`http://localhost:4000/customers/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        name,
        email,
        image_url,
      }),
    })
      .then((response) => response.json())
      .then((dt) => dt);
    const successState: CustomerState = {
      success: true,
      message: 'Customer updated successfully',
    };

    return successState;
  } catch (e) {
    return {
      success: true,
      message: 'Failed to update customer.',
    };
  } finally {
    revalidatePath('/dashboard/customers');
  }
}

export async function deleteCustomer(id: string) {
  try {
    await fetch(`http://localhost:4000/customers/${id}`, {
      method: 'DELETE',
    });
  } catch (e) {
    return { message: 'Failed to Delete Invoice.' };
  }

  revalidatePath('/dashboard/customers');
}

export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
) {
  try {
    await signIn('credentials', formData);
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return 'Invalid credentials.';
        default:
          return 'Something went wrong.';
      }
    }
    throw error;
  }
}
