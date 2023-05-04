import { getServerSession } from 'next-auth/next'
import { authOptions } from './api/auth/[...nextauth]'
import { prisma } from '@/lib/prisma'
import Layout from '@/components/Layout'
import Grid from '@/components/Grid'

export async function getServerSideProps(context) {
  // Check if user is authenticated
  const session = await getServerSession(context.req, context.res, authOptions)

  // If not, redirect to the homepage
  if (!session) {
    return {
      redirect: {
        destination: '/',
        permanent: false
      }
    }
  }

  // Get all favorited homes from the authenticated user
  const homes = await prisma.favorite.findMany({
    where: { user: { id: session.user.id } },
    select: {
      home: true
    }
  })

  const newhomes = homes.map((home) => ({
    ...home.home,
    favorite: true
  }))

  return {
    props: {
      session,
      homes: JSON.parse(JSON.stringify(newhomes))
    }
  }
}

const Favorites = ({ homes = [] }) => {
  return (
    <Layout>
      <h1 className="text-xl font-medium text-gray-800">Your favorites</h1>
      <p className="text-gray-500">See your favorites homes</p>
      <div className="mt-8">
        <Grid homes={homes} />
      </div>
    </Layout>
  )
}

export default Favorites
