import { CreateCustomer } from '@/app/ui/customers/buttons';
import { lusitana } from '@/app/ui/fonts';
import { Suspense } from 'react';
import Table from '@/app/ui/customers/table';
import {
  fetchCustomerPages,
} from '@/app/lib/data';
import { CustomersTableSkeleton } from '@/app/ui/skeletons';
import Search from '@/app/ui/search';
import Pagination from '@/app/ui/pagination';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Customers',
};

export default async function Page({
  searchParams,
}: {
  searchParams?: {
    query?: string;
    page?: string;
  };
}) {
  const query = searchParams?.query || '';
  const currentPage = Number(searchParams?.page) || 1;

  const totalPages = await fetchCustomerPages(query);

  return (
    <div className="flex w-full flex-col">
      <h1 className={`${lusitana.className} mb-8 text-xl md:text-2xl`}>
        Customers
      </h1>

      <div className="mt-4 flex items-center justify-between gap-4">
        <Search placeholder="Search customers..." />
        <CreateCustomer />
      </div>
      <div className="flex-grow">
        <Suspense
          key={query + currentPage}
          fallback={<CustomersTableSkeleton />}
        >
          <Table query={query} currentPage={currentPage} />
        </Suspense>
      </div>
      <div className="mt-5 flex w-full justify-center">
        <Pagination totalPages={totalPages} />
      </div>
    </div>
  );
}
