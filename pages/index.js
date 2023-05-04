import Layout from '@/components/Layout'
import Grid from '@/components/Grid'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from './api/auth/[...nextauth]'

export async function getServerSideProps(context) {
  const session = await getServerSession(context.req, context.res, authOptions)
  let homesFormatted = []
  // Get all homes
  const allHomes = await prisma.home.findMany()

  if (session) {
    const favorites = await prisma.favorite.findMany({
      where: { user: { id: session.user.id } },
      select: {
        home: true
      }
    })

    homesFormatted = allHomes.map((home) => ({
      ...home,
      favorite: favorites.find((favorite) => favorite.home.id === home.id)
        ? true
        : false
    }))
  } else {
    homesFormatted = allHomes.map((home) => ({
      ...home,
      favorite: false
    }))
  }

  return {
    props: {
      homes: JSON.parse(JSON.stringify(homesFormatted))
    }
  }
}

export default function Home({ homes = [] }) {
  return (
    <Layout>
      <h1 className="text-xl font-medium text-gray-800">
        Top-rated places to stay
      </h1>
      <p className="text-gray-500">
        Explore some of the best places in the world
      </p>
      <div className="mt-8">
        <Grid homes={homes} />
      </div>
    </Layout>
  )
}
