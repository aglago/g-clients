import connectMongoDB from './mongodb';
import { Track } from './models';

// Helper function to create slug from name
const createSlug = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .trim()
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
};

// Migration script to add slugs to existing tracks
export async function migrateSlugs() {
  try {
    await connectMongoDB();
    
    // Find tracks without slugs
    const tracksWithoutSlugs = await Track.find({ 
      $or: [
        { slug: { $exists: false } },
        { slug: null },
        { slug: '' }
      ]
    });

    console.log(`Found ${tracksWithoutSlugs.length} tracks without slugs`);

    for (const track of tracksWithoutSlugs) {
      const slug = createSlug(track.name);
      
      // Check if slug already exists
      let finalSlug = slug;
      let counter = 1;
      
      while (await Track.findOne({ slug: finalSlug, _id: { $ne: track._id } })) {
        finalSlug = `${slug}-${counter}`;
        counter++;
      }
      
      await Track.updateOne(
        { _id: track._id },
        { $set: { slug: finalSlug } }
      );
      
      console.log(`Updated track "${track.name}" with slug: "${finalSlug}"`);
    }

    console.log('Slug migration completed successfully');
  } catch (error) {
    console.error('Error migrating slugs:', error);
    throw error;
  }
}

// Auto-run migration if this file is executed directly
if (require.main === module) {
  migrateSlugs()
    .then(() => {
      console.log('Migration completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}