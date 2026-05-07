import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('Cleaning up duplicate campaigns...');
  const campaigns = await prisma.campaign.findMany();
  const seen = new Set();
  for (const campaign of campaigns) {
    const key = `${campaign.name}-${campaign.userId}`;
    if (seen.has(key)) {
      console.log(`Deleting duplicate: ${campaign.name} for user ${campaign.userId}`);
      await prisma.interaction.deleteMany({ where: { campaignId: campaign.id } });
      await prisma.campaign.delete({ where: { id: campaign.id } });
    } else {
      seen.add(key);
    }
  }
  console.log('Cleanup finished.');
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
