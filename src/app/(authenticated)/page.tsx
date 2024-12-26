import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Redirecting...',
}

export const dynamic = 'force-static'
export const revalidate = 0

export default async function AuthenticatedPage() {
  return (
    <>
      <meta httpEquiv="refresh" content="0;url=/chat" />
      <script
        dangerouslySetInnerHTML={{
          __html: `window.location.href = "/chat"`
        }}
      />
    </>
  )
} 