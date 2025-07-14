import connectMongoDB from './mongodb';
import { User, Course, Track } from './models';
import { hashPassword } from './auth';

export async function seedDatabase() {
  try {
    await connectMongoDB();

    // Clear existing data
    await User.deleteMany({});
    await Course.deleteMany({});
    await Track.deleteMany({});

    console.log('Creating admin user...');
    const adminPassword = await hashPassword('password123');
    const adminUser = await User.create({
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@example.com',
      password: adminPassword,
      role: 'admin',
      contact: '+1234567890',
      isVerified: true,
    });

    console.log('Creating learner user...');
    const learnerPassword = await hashPassword('password123');
    const learnerUser = await User.create({
      firstName: 'John',
      lastName: 'Doe',
      email: 'learner@example.com',
      password: learnerPassword,
      role: 'learner',
      contact: '+1234567891',
      isVerified: true,
    });

    console.log('Creating sample courses...');
    const course1 = await Course.create({
      title: 'Introduction to Programming',
      description: 'Learn the basics of programming with Python',
      instructor: 'Jane Smith',
      duration: 40,
      price: 299.99,
    });

    const course2 = await Course.create({
      title: 'Web Development Fundamentals',
      description: 'HTML, CSS, and JavaScript basics',
      instructor: 'Bob Johnson',
      duration: 60,
      price: 399.99,
    });

    const course3 = await Course.create({
      title: 'Advanced React Development',
      description: 'Learn advanced React patterns and best practices',
      instructor: 'Alice Brown',
      duration: 80,
      price: 599.99,
    });

    console.log('Creating sample track...');
    const track1 = await Track.create({
      name: 'Full Stack Developer',
      description: 'Complete full stack development track',
      courses: [course1._id, course2._id, course3._id],
    });

    console.log('Database seeded successfully!');
    console.log(`Admin: admin@example.com / password123`);
    console.log(`Learner: learner@example.com / password123`);
    
    return {
      adminUser,
      learnerUser,
      courses: [course1, course2, course3],
      tracks: [track1],
    };
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
}

// Run this function when the file is executed directly
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log('Seeding completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Seeding failed:', error);
      process.exit(1);
    });
}