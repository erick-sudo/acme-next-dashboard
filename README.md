## Next.js App Router Course - Starter

This is the starter template for the Next.js App Router Course. It contains the starting code for the dashboard application.

For more information, see the [course curriculum](https://nextjs.org/learn) on the Next.js Website.

sql = `
  SELECT
    invoices.id,
    invoices.amount,
    invoices.date,
    invoices.status,
    customers.name,
    customers.email,
    customers.image_url
  FROM invoices
  JOIN customers ON invoices.customer_id = customers.id
  WHERE
    customers.name ILIKE ${`%${query}%`} OR
    customers.email ILIKE ${`%${query}%`} OR
    invoices.amount::text ILIKE ${`%${query}%`} OR
    invoices.date::text ILIKE ${`%${query}%`} OR
    invoices.status ILIKE ${`%${query}%`}
  ORDER BY invoices.date DESC
  LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset}
`;


class CreateCustomers < ActiveRecord::Migration[7.0]
  def change
    create_table :customers, id: :uuid do |t|
      t.string :name
      t.string :email
      t.string :image_url

      t.timestamps
    end
  end
end

class CreateInvoices < ActiveRecord::Migration[7.0]
  def change
    create_table :invoices, id: :uuid do |t|
      t.uuid :customer_id
      t.string :amount
      t.string :status
      t.string :date

      t.timestamps
    end
  end
end