# Development

This guide provides instructions on how to set up and run the project locally.

## Prerequisites

Ensure you have the following installed:

- [Node.js](https://nodejs.org/) (Latest LTS version recommended)
- [pnpm](https://pnpm.io/)
- [Git](https://git-scm.com/)

## Setup

### 1. Clone the repository

```bash
git clone https://github.com/Yash-Timbadiya/Yash14.com.git minimal-dev-portfolio
cd minimal-dev-portfolio
```

### 2. Install Portless

Documentation: [port1355.dev](https://port1355.dev)

```bash
npm install -g portless
```

### 3. Install dependencies

```bash
pnpm i
```

### 4. Configure Environment Variables

Create a `.env.local` file based on `.env.example`:

```bash
cp .env.example .env.local
```

Then, update the necessary environment variables inside `.env.local`.

### 5. Run the development server

```bash
pnpm dev
```

The application should now be available at http://localhost:3000

## Building for Production

```bash
pnpm build
```

After building, start the application with:

```bash
NODE_ENV=production pnpm start
```
