const user = await prisma.user.findUnique({
  where: { id: userId },
  select: {
    id: true,
    email: true,
    firstName: true,
    lastName: true,
    role: true,
    organizationId: true,
    organization: {
      select: {
        name: true,
      },
    },
  },
});