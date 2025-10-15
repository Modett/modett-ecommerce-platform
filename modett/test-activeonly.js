// Simple test script to verify activeOnly functionality
const axios = require("axios");

const BASE_URL = "http://localhost:3000/api/v1/inventory/reservations";

async function testActiveOnlyFilter() {
  console.log("Testing activeOnly filter functionality...\n");

  try {
    // Test 1: Default behavior (should show only active)
    console.log("1. Testing default behavior (no activeOnly parameter):");
    const defaultResponse = await axios.get(BASE_URL);
    console.log(
      `   Found ${defaultResponse.data.data?.length || 0} reservations`
    );
    console.log(`   Response:`, JSON.stringify(defaultResponse.data, null, 2));

    // Test 2: Explicitly set activeOnly=true
    console.log("\n2. Testing activeOnly=true:");
    const activeOnlyTrueResponse = await axios.get(
      `${BASE_URL}?activeOnly=true`
    );
    console.log(
      `   Found ${activeOnlyTrueResponse.data.data?.length || 0} reservations`
    );
    console.log(
      `   Response:`,
      JSON.stringify(activeOnlyTrueResponse.data, null, 2)
    );

    // Test 3: Set activeOnly=false (should show all)
    console.log("\n3. Testing activeOnly=false:");
    const activeOnlyFalseResponse = await axios.get(
      `${BASE_URL}?activeOnly=false`
    );
    console.log(
      `   Found ${activeOnlyFalseResponse.data.data?.length || 0} reservations`
    );
    console.log(
      `   Response:`,
      JSON.stringify(activeOnlyFalseResponse.data, null, 2)
    );

    // Test 4: Compare results
    console.log("\n4. Analysis:");
    const defaultCount = defaultResponse.data.data?.length || 0;
    const activeTrueCount = activeOnlyTrueResponse.data.data?.length || 0;
    const activeFalseCount = activeOnlyFalseResponse.data.data?.length || 0;

    console.log(`   Default (no param): ${defaultCount} reservations`);
    console.log(`   activeOnly=true: ${activeTrueCount} reservations`);
    console.log(`   activeOnly=false: ${activeFalseCount} reservations`);

    if (defaultCount === activeTrueCount) {
      console.log("   ✅ Default behavior matches activeOnly=true");
    } else {
      console.log("   ❌ Default behavior does NOT match activeOnly=true");
    }

    if (activeFalseCount >= activeTrueCount) {
      console.log(
        "   ✅ activeOnly=false shows same or more reservations than activeOnly=true"
      );
    } else {
      console.log(
        "   ❌ activeOnly=false shows fewer reservations than activeOnly=true (unexpected)"
      );
    }
  } catch (error) {
    console.error("Error testing activeOnly filter:", error.message);
    if (error.response) {
      console.error("Response data:", error.response.data);
    }
  }
}

testActiveOnlyFilter();
