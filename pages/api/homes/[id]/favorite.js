import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from 'pages/api/auth/[...nextauth]'

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions)

  if (!session) {
    return res.status(401).json({ message: 'Unauthorized.' })
  }

  // Retrieve the authenticated user
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, listedHomes: true }
  })

  // Check if authenticated user is the owner of this home
  const { id } = req.query

  if (!user?.listedHomes?.find((home) => home.id === id)) {
    return res.status(401).json({ message: 'Unauthorized.' })
  }

  if (req.method === 'PATCH') {
    try {
      const isFavoritedHome = await prisma.favorite.findFirst({
        where: { homeId: id, userId: user.id }
      })

      if (isFavoritedHome) {
        await prisma.favorite.delete({
          where: { id: isFavoritedHome.id }
        })

        return res.status(200).json(isFavoritedHome)
      }

      await prisma.favorite.create({
        data: {
          homeId: id,
          userId: user.id
        }
      })

      res.status(200).json(isFavoritedHome)
    } catch (e) {
      console.log(e)
      res.status(500).json({ message: 'Something went wrong' })
    }
  }
  // HTTP method not supported!
  else {
    res.setHeader('Allow', ['PATCH'])
    res
      .status(405)
      .json({ message: `HTTP method ${req.method} is not supported.` })
  }
}
