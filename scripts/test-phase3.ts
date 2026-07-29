import { TenantService } from "../src/modules/tenants/tenant.service";
import { AuthService } from "../src/modules/iam/auth.service";
import { AppError } from "../lib/api-response";
import { TenantType, UserRole } from "../app/generated/prisma/client";

async function runPhase3Tests() {
  console.log("==========================================");
  console.log("🧪 Starting Phase 3 Verification Suite (US1: Org & IAM)");
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
  // Test 1: Tenant Validation Logic
  // ----------------------------------------------------
  console.log("\n1. Testing Tenant Registration Validations (src/modules/tenants/tenant.service.ts)");

  let threwNameError = false;
  try {
    await TenantService.registerTenant({ name: "", code: "KSU", type: TenantType.university });
  } catch (e) {
    if (e instanceof AppError && e.statusCode === 400) threwNameError = true;
  }
  assert(threwNameError, "registerTenant throws 400 if tenant name is missing");

  let threwCodeError = false;
  try {
    await TenantService.registerTenant({ name: "جامعة الملك سعود", code: "", type: TenantType.university });
  } catch (e) {
    if (e instanceof AppError && e.statusCode === 400) threwCodeError = true;
  }
  assert(threwCodeError, "registerTenant throws 400 if tenant code is missing");

  // ----------------------------------------------------
  // Test 2: User Registration Validations
  // ----------------------------------------------------
  console.log("\n2. Testing User Registration Validations (src/modules/iam/auth.service.ts)");

  let threwTenantReqError = false;
  try {
    await AuthService.registerUser({
      tenant_id: "",
      user_name: "admin",
      full_name: "مدير النظام",
      phone_number: "0500000000",
      password: "password123",
    });
  } catch (e) {
    if (e instanceof AppError && e.statusCode === 400) threwTenantReqError = true;
  }
  assert(threwTenantReqError, "registerUser throws 400 if tenant_id is missing");

  let threwPasswordShortError = false;
  try {
    await AuthService.registerUser({
      tenant_id: "tenant-123",
      user_name: "admin",
      full_name: "مدير النظام",
      phone_number: "0500000000",
      password: "123",
    });
  } catch (e) {
    if (e instanceof AppError && e.statusCode === 400) threwPasswordShortError = true;
  }
  assert(threwPasswordShortError, "registerUser throws 400 if password length < 6");

  // ----------------------------------------------------
  // Summary
  // ----------------------------------------------------
  console.log("\n==========================================");
  console.log(`📊 Phase 3 Verification Summary: ${passed}/${passed + failed} Tests Passed`);
  console.log("==========================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runPhase3Tests().catch((err) => {
  console.error("Test runner error:", err);
  process.exit(1);
});
