import Layout from '@/components/Layout'
import Grid from '@/components/Grid'
import { getServerSession } from 'next-auth/next'
import { authOptions } from './api/auth/[...nextauth]'
import { prisma } from '@/lib/prisma'

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

  // Get all homes from the authenticated user
  const homes = await prisma.home.findMany({
    where: { owner: { email: session.user.email } },
    orderBy: { createdAt: 'desc' }
  })

  const favorites = await prisma.favorite.findMany({
    where: { user: { id: session.user.id } },
    select: {
      home: true
    }
  })

  const newhomes = homes.map((home) => ({
    ...home,
    favorite: favorites.find((favorite) => favorite.home.id === home.id)
      ? true
      : false
  }))

  return {
    props: {
      session,
      homes: JSON.parse(JSON.stringify(newhomes))
    }
  }
}

const Homes = ({ homes = [] }) => {
  return (
    <Layout>
      <h1 className="text-xl font-medium text-gray-800">Your listings</h1>
      <p className="text-gray-500">
        Manage your homes and update your listings
      </p>
      <div className="mt-8">
        <Grid homes={homes} />
      </div>
    </Layout>
  )
}

export default Homes
