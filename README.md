This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Plasmic Code Components

This repo registers three Plasmic code components:

- BookingWidget (`@/components/BookingWidget`): Full multi-step booking flow
- ServiceListWidget (`@/components/ServiceListWidget`): Standalone services grid
  - Props: `departmentId` (string, default `all`), `initialSelectedServiceId` (string), `showMeta` (boolean)
- StaffListWidget (`@/components/StaffListWidget`): Standalone staff grid for a service
  - Props: `serviceId` (string, required), `includeAnyOption` (boolean, default true), `initialSelectedStaffId` (string)

After `npm run dev`, open Plasmic Studio using the host page at `/plasmic-host`. These components will be available in the Studio under Code Components.
