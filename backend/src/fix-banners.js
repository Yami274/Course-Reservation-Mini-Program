require('dotenv').config();
const { Banner } = require('./models');

async function run() {
  const updated = await Banner.update(
    { image: '' },
    { where: {} }
  );
  console.log(`Updated ${updated[0]} banner records.`);
  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
