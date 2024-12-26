# ChatHub

A modern real-time chat platform built with Next.js and Supabase.

## Features

- Real-time global chat
- Voice messages
- User profiles with avatars
- Theme customization
- Message reactions and pinning
- Dark/Light mode support
- OAuth authentication (Google, GitHub)
- Responsive design

## Tech Stack

- Next.js 14
- TypeScript
- Supabase (Auth, Database, Storage)
- Tailwind CSS
- React Icons
- React Hot Toast

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/ABDOBINGO/chathub
cd chathub
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file in the root directory with your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Setup

1. Create a new project in Supabase
2. Run the SQL commands from `supabase/schema.sql` in the SQL editor
3. Set up storage buckets for avatars and voice messages
4. Configure authentication providers (Email, Google, GitHub)

## Deployment

### Netlify

1. Push your code to GitHub
2. Create a new site in Netlify
3. Connect to your GitHub repository
4. Add environment variables in Netlify:
   - NEXT_PUBLIC_SUPABASE_URL
   - NEXT_PUBLIC_SUPABASE_ANON_KEY
5. Deploy!

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 