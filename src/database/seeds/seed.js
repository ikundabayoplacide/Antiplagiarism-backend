require('dotenv').config();
const bcrypt = require('bcryptjs');
const { sequelize } = require('../../../config/database');
const { User, Scan, Settings } = require('../modals/index');

const seed = async () => {
  await sequelize.authenticate();
  console.log('Seeding database...');

  const password = await bcrypt.hash('Password123!', 10);

  const usersData = [
    { fullName: 'Admin User',        email: 'admin@app.com',    role: 'admin',    phoneNumber: '+1234567890' },
    { fullName: 'Dr. Jane Lecturer', email: 'lecturer@app.com', role: 'lecturer', phoneNumber: '+1234567891' },
    { fullName: 'John Student',      email: 'student@app.com',  role: 'student',  phoneNumber: '+1234567892' },
  ];

  const users = [];
  for (const data of usersData) {
    const [user] = await User.findOrCreate({
      where: { email: data.email },
      defaults: { ...data, password },
    });
    users.push(user);

    const nameParts = data.fullName.split(' ');
    await Settings.findOrCreate({
      where: { userId: user.id },
      defaults: {
        userId: user.id,
        firstName: nameParts[0] || '',
        lastName: nameParts.slice(1).join(' ') || '',
        email: data.email,
      },
    });
  }

  console.log(`Seeded ${users.length} users with settings`);

  const student = users.find((u) => u.role === 'student');
  if (student) {
    await Scan.findOrCreate({
      where: { userId: student.id, fileName: 'essay_final.pdf' },
      defaults: {
        userId: student.id, fileName: 'essay_final.pdf', fileSize: 204800,
        fileType: 'pdf', plagiarismPercent: 12.50, originalPercent: 87.50,
        wordCount: 1500, status: 'original', matchedSections: [],
      },
    });

    await Scan.findOrCreate({
      where: { userId: student.id, fileName: 'research_paper.docx' },
      defaults: {
        userId: student.id, fileName: 'research_paper.docx', fileSize: 153600,
        fileType: 'docx', plagiarismPercent: 45.00, originalPercent: 55.00,
        wordCount: 3200, status: 'flagged', matchedSections: [{ source: 'wikipedia.org', similarity: 45 }],
      },
    });

    await Scan.findOrCreate({
      where: { userId: student.id, fileName: 'assignment_1.txt' },
      defaults: {
        userId: student.id, fileName: 'assignment_1.txt', fileSize: 51200,
        fileType: 'txt', plagiarismPercent: 5.00, originalPercent: 95.00,
        wordCount: 800, status: 'original', matchedSections: [],
      },
    });

    console.log('Seeded sample scans for student');
  }

  console.log('\nSeeding complete! Credentials:');
  console.log('------------------------------------------');
  console.log(' Role     | Email               | Password');
  console.log('------------------------------------------');
  console.log(' admin    | admin@app.com       | Password123!');
  console.log(' lecturer | lecturer@app.com    | Password123!');
  console.log(' student  | student@app.com     | Password123!');
  console.log('------------------------------------------');

  await sequelize.close();
};

seed().catch((err) => {
  console.error('Seeding failed:', err.message);
  process.exit(1);
});
