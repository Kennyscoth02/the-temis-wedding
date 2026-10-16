const { closeStorage, importLegacyJson, initializeStorage } = require('./storage')

async function main() {
  try {
    await initializeStorage()
    const imported = await importLegacyJson()
    console.log(`Imported ${imported.rsvps} RSVP(s) and ${imported.wishes} guestbook message(s).`)
  } catch (error) {
    console.error('Could not import the local JSON data into PostgreSQL.', error)
    process.exitCode = 1
  } finally {
    await closeStorage()
  }
}

main()
