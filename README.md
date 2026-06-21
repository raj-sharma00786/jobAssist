# JobAssist

JobAssist is a placement preparation dashboard for Indian students. It helps track DSA problems, resume ATS checks, hackathons, and interview experience archives in one place.

## Getting Started

Install dependencies:

```bash
npm install
```

Apply database migrations and seed starter data:

```bash
npx prisma migrate dev
npx prisma db seed
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Environment

Create a local `.env` file with your database and auth secrets. Do not commit `.env` to GitHub.
