import prisma from '../lib/prisma.js';
import { decrypt } from '../utils/crypto.js';

let isWorkerRunning = false;

export const startAutomationWorker = async () => {
  if (isWorkerRunning) return;
  isWorkerRunning = true;

  console.log('🚀 Automation Worker started...');

  while (true) {
    try {
      // 1. Find the next PENDING interaction
      const interaction = await prisma.interaction.findFirst({
        where: { status: 'PENDING' },
        orderBy: { createdAt: 'asc' },
        include: { 
          campaign: {
            include: { user: true }
          }
        }
      });

      if (!interaction) {
        // No pending tasks, sleep for 5 seconds
        await new Promise(resolve => setTimeout(resolve, 5000));
        continue;
      }

      // 2. Mark as PROCESSING immediately to prevent duplicate work
      await prisma.interaction.update({
        where: { id: interaction.id },
        data: { status: 'PROCESSING' }
      });

      console.log(`🤖 Processing Campaign "${interaction.campaign.name}" | Link: ${interaction.link}`);

      const user = interaction.campaign.user;
      if (!user.instaCookies) {
        console.error('❌ No cookies found for user');
        await prisma.interaction.update({
          where: { id: interaction.id },
          data: { status: 'FAILURE' }
        });
        continue;
      }

      // 3. Prepare Cookies
      let cookies;
      try {
        cookies = JSON.parse(decrypt(user.instaCookies));
      } catch (e) {
        console.log('⚠️ Using legacy plain-text cookies');
        try {
          cookies = JSON.parse(user.instaCookies);
        } catch (jsonErr) {
          console.error('❌ Invalid cookie format');
          await prisma.interaction.update({
            where: { id: interaction.id },
            data: { status: 'FAILURE' }
          });
          continue;
        }
      }

      // 4. Call Apify API
      const API_KEY = process.env.APIFY_API_KEY;
      const ACTOR_ID = process.env.APIFY_ACTOR_ID;
      const API_URL = `https://api.apify.com/v2/acts/${ACTOR_ID}/run-sync-get-dataset-items?token=${API_KEY}`;

      let success = false;
      try {
        const response = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            comments: [interaction.comment],
            cookies: cookies,
            post_urls: [interaction.link],
          }),
        });

        const result: any = await response.json();
        success = Array.isArray(result) && result[0]?.status === 'success';
      } catch (apiErr) {
        console.error('❌ Apify API Error:', apiErr);
      }

      // 5. Update status
      await prisma.interaction.update({
        where: { id: interaction.id },
        data: { status: success ? 'SUCCESS' : 'FAILURE' }
      });

      console.log(`✅ Result: ${success ? 'SUCCESS' : 'FAILURE'}`);

      // 6. Wait for user-defined delay
      console.log(`⏳ Waiting ${interaction.campaign.delay}s...`);
      await new Promise(resolve => setTimeout(resolve, interaction.campaign.delay * 1000));

    } catch (error) {
      console.error('🔥 Worker Loop Error:', error);
      await new Promise(resolve => setTimeout(resolve, 10000)); // Wait 10s on error
    }
  }
};
