import {
  AppError,
  successResponse,
  errorResponse,
  unauthorizedResponse,
  forbiddenResponse,
  notFoundResponse,
  handleApiError,
} from "../lib/api-response";
import {
  getTenantIdFromRequest,
  requireTenantId,
  withTenant,
} from "../lib/tenant";
import { authOptions } from "../lib/auth";

async function runTests() {
  console.log("==========================================");
  console.log("🧪 Starting Phase 2 Verification Suite");
  console.log("==========================================");

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`  ✓ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ [FAIL] ${testName}`);
      failed++;
    }
  }

  // ----------------------------------------------------
  // Test 1: API Response Utilities
  // ----------------------------------------------------
  console.log("\n1. Testing Global API Response Utilities (lib/api-response.ts)");
  
  const res1 = successResponse({ id: "123" }, "Success", 200);
  const json1 = await res1.json();
  assert(res1.status === 200 && json1.success === true && json1.data.id === "123", "successResponse creates valid 200 JSON");

  const err1 = new AppError("خطأ تجريبي", 422, "VALIDATION_ERROR");
  const resErr = handleApiError(err1);
  const jsonErr = await resErr.json();
  assert(resErr.status === 422 && jsonErr.success === false && jsonErr.error.code === "VALIDATION_ERROR", "handleApiError handles AppError correctly");

  const unauthRes = unauthorizedResponse();
  assert(unauthRes.status === 401, "unauthorizedResponse returns 401 status");

  const forbiddenRes = forbiddenResponse();
  assert(forbiddenRes.status === 403, "forbiddenResponse returns 403 status");

  const notFoundRes = notFoundResponse();
  assert(notFoundRes.status === 404, "notFoundResponse returns 404 status");

  // ----------------------------------------------------
  // Test 2: Tenant Isolation Helpers
  // ----------------------------------------------------
  console.log("\n2. Testing Tenant Isolation Helpers (lib/tenant.ts)");

  const headers = new Headers();
  headers.set("x-tenant-id", "tenant-uuid-1234");
  const extractedTenant = getTenantIdFromRequest(headers);
  assert(extractedTenant === "tenant-uuid-1234", "getTenantIdFromRequest extracts header accurately");

  const requiredTenant = requireTenantId(headers);
  assert(requiredTenant === "tenant-uuid-1234", "requireTenantId succeeds when header is present");

  let threwError = false;
  try {
    requireTenantId(new Headers());
  } catch (e) {
    if (e instanceof AppError && e.statusCode === 400) {
      threwError = true;
    }
  }
  assert(threwError, "requireTenantId throws AppError 400 when x-tenant-id header is missing");

  const scopedData = withTenant("tenant-uuid-1234", { name: "Test Object" });
  assert(scopedData.tenant_id === "tenant-uuid-1234" && scopedData.name === "Test Object", "withTenant scopes object with tenant_id");

  // ----------------------------------------------------
  // Test 3: NextAuth Options Configuration
  // ----------------------------------------------------
  console.log("\n3. Testing NextAuth Configuration (lib/auth.ts)");

  assert(authOptions.session?.strategy === "jwt", "NextAuth session strategy is set to 'jwt'");
  assert(Array.isArray(authOptions.providers) && authOptions.providers.length > 0, "NextAuth credentials provider configured");
  assert(typeof authOptions.callbacks?.jwt === "function", "NextAuth jwt callback is defined");
  assert(typeof authOptions.callbacks?.session === "function", "NextAuth session callback is defined");

  // ----------------------------------------------------
  // Summary
  // ----------------------------------------------------
  console.log("\n==========================================");
  console.log(`📊 Verification Summary: ${passed}/${passed + failed} Tests Passed`);
  console.log("==========================================");
}

runTests().catch((err) => {
  console.error("Test runner error:", err);
  process.exit(1);
});
