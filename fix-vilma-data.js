import Database from 'better-sqlite3';

const db = new Database('gangetabell.db');

try {
  // Check current data
  const currentData = db.prepare('SELECT * FROM users WHERE username = ?').get('vilma');
  console.log('Current Vilma data:', currentData);

  // Update Vilma's birth year and grade
  const updateStmt = db.prepare(`
    UPDATE users
    SET birth_year = ?, grade = ?
    WHERE username = ?
  `);

  const result = updateStmt.run(2016, 4, 'vilma');
  console.log('Update result:', result);

  // Verify the update
  const updatedData = db.prepare('SELECT * FROM users WHERE username = ?').get('vilma');
  console.log('Updated Vilma data:', updatedData);

  console.log('\n✅ Vilma\'s data has been updated successfully!');
} catch (error) {
  console.error('Error updating Vilma\'s data:', error);
} finally {
  db.close();
}
