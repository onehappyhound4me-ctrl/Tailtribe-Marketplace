// Test script to check if API works with session
const fetch = require('node-fetch')

async function testPetAPI() {
  try {
    console.log('🔍 Testing Pet API with session...')
    
    // Try to get the pet data
    const response = await fetch('http://localhost:3000/api/pets/cmguuzz49000r5sy6z9lejd43', {
      headers: {
        'Cookie': 'next-auth.session-token=test'
      }
    })
    
    console.log('📡 Response status:', response.status)
    
    if (response.ok) {
      const data = await response.json()
      console.log('✅ API response successful')
      console.log('📋 Pet data from API:')
      console.log('- color:', data.pet.color)
      console.log('- microchipNumber:', data.pet.microchipNumber)
      console.log('- veterinarianName:', data.pet.veterinarianName)
      console.log('- emergencyContact:', data.pet.emergencyContact)
    } else {
      const error = await response.text()
      console.log('❌ API error:', error)
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

testPetAPI()














