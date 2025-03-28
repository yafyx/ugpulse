# UG Pulse

## Overview

UG Pulse is a web application designed to help manage university-related information, including student data, class schedules, and academic timelines. Built with Next.js and NextUI, it provides a modern, responsive interface.

## Features

- **Timeline View**: Track important academic events and deadlines
  - Redis-backed storage for improved performance and data persistence
  - Automatic fetching from BAAK API when data is not available
  - Version history tracking to monitor changes
- **Student Management**: View and manage student information, including class assignments
- **Schedule Management**: Access and organize class schedules
- **Responsive Design**: Works on desktop and mobile devices
- **Dark/Light Mode**: Choose your preferred theme

## Tech Stack

- [Next.js](https://nextjs.org/) - React framework
- [NextUI](https://nextui.org/) - UI component library
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [TypeScript](https://www.typescriptlang.org/) - Type-safe JavaScript
- [SWR](https://swr.vercel.app/) - React Hooks for data fetching
- [Upstash Redis](https://upstash.com/) - Serverless Redis for data storage

## Getting Started

### Prerequisites

- Node.js 18.x or later
- npm or bun package manager
- Upstash Redis account for timeline data storage

### Installation

1. Clone the repository

   ```bash
   git clone https://github.com/yourusername/ugcnn.git
   cd ugcnn
   ```

2. Install dependencies

   ```bash
   npm install
   # or
   bun install
   ```

3. Set up environment variables

   Create a `.env` file in the root directory with your Upstash Redis credentials:

   ```
   UPSTASH_REDIS_REST_URL=your_redis_url
   UPSTASH_REDIS_REST_TOKEN=your_redis_token
   ```

4. Run the development server

   ```bash
   npm run dev
   # or
   bun dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application

### Building for Production

```bash
npm run build
# or
bun run build
```

## Project Structure

```
ugcnn/
├── app/                # Next.js app directory
│   ├── page.tsx        # Main page component
│   ├── layout.tsx      # Root layout component
│   ├── timeline/       # Timeline page
│   └── api/            # API routes
│       └── timeline/   # Timeline data API
├── components/         # Reusable UI components
├── lib/                # Utility functions
│   └── db/             # Database interactions
├── public/             # Static assets
└── styles/             # Global styles
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [NextUI](https://nextui.org/) for the UI components
- [Next.js](https://nextjs.org/) for the React framework
- [Upstash](https://upstash.com/) for the serverless Redis database
