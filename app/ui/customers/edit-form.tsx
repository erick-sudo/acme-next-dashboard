'use client';

import { CustomerForm } from '@/app/lib/definitions';
import {
  EnvelopeIcon,
  LinkIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { Button } from '@/app/ui/button';
import { updateCustomer } from '@/app/lib/actions';
import Image from 'next/image';
import { useFormState } from 'react-dom';
import { FormSubmissionState } from '../form-state';

export default function EditCustomerForm({
  customer,
}: {
  customer: CustomerForm;
}) {
  const initialState = {
    message: null,
    success: false,
    errors: { violations: {} },
  };
  const updateCustomerWithId = updateCustomer.bind(null, customer.id);
  const [state, dispatch] = useFormState(updateCustomerWithId, initialState);

  return (
    <form action={dispatch}>
      <FormSubmissionState state={state} />
      <div className="rounded-md bg-gray-50 p-4 md:p-6">
        {/* Image URL */}
        <div className="mb-4">
          <label
            htmlFor="customer"
            className="mb-2 block px-4 pb-4 text-sm font-medium"
          >
            <Image
              src={customer.image_url}
              className="rounded-xl ring-4 ring-blue-800"
              alt={`${customer.name}'s profile picture`}
              width={100}
              height={100}
            />
          </label>
          <div className="relative mt-2 rounded-md">
            <div className="relative">
              <input
                id="customer_image_url"
                name="image_url"
                type="text"
                step="0.01"
                defaultValue={customer.image_url}
                placeholder="Image Url"
                className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
                aria-describedby="image-url-error"
                aria-live="polite"
              />
              <LinkIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
            </div>
          </div>
          <div id="customer-error" aria-live="polite" aria-atomic="true">
            {state.errors?.violations.image_url &&
              state.errors.violations.image_url.map((error: string) => (
                <p className="mt-2 text-sm text-red-500" key={error}>
                  {error}
                </p>
              ))}
          </div>
        </div>

        {/* Customer Name */}
        <div className="mb-4">
          <label htmlFor="customer" className="mb-2 block text-sm font-medium">
            Customer Name
          </label>
          <div className="relative mt-2 rounded-md">
            <div className="relative">
              <input
                id="customer_name"
                name="name"
                type="text"
                step="0.01"
                defaultValue={customer.name}
                placeholder="Customer Name"
                className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
                aria-describedby="name-error"
                aria-live="polite"
              />
              <UserCircleIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
            </div>
          </div>
          <div id="name-error" aria-live="polite" aria-atomic="true">
            {state.errors?.violations.name &&
              state.errors.violations.name.map((error: string) => (
                <p className="mt-2 text-sm text-red-500" key={error}>
                  {error}
                </p>
              ))}
          </div>
        </div>

        {/* Customer Email */}
        <div className="mb-4">
          <label htmlFor="customer" className="mb-2 block text-sm font-medium">
            Customer Email
          </label>
          <div className="relative mt-2 rounded-md">
            <div className="relative">
              <input
                id="customer_email"
                name="email"
                type="email"
                step="0.01"
                defaultValue={customer.email}
                placeholder="Email Address"
                className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
                aria-describedby="email-error"
                aria-live="polite"
              />
              <EnvelopeIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
            </div>
          </div>
          <div id="email-error" aria-live="polite" aria-atomic="true">
            {state.errors?.violations.email &&
              state.errors.violations.email.map((error: string) => (
                <p className="mt-2 text-sm text-red-500" key={error}>
                  {error}
                </p>
              ))}
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-4">
        <Link
          href="/dashboard/customers"
          className="flex h-10 items-center rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200"
        >
          Cancel
        </Link>
        <Button type="submit">Save Changes</Button>
      </div>
    </form>
  );
}
