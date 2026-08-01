#!/bin/bash

# Supabase Cloud Verification Script
# Run this after reactivating your Supabase cloud project

set -e

# Configuration - UPDATE THESE VALUES
PROJECT_REF="${VITE_SUPABASE_URL##*/}"
ANON_KEY="$VITE_SUPABASE_ANON_KEY"
API_URL="$VITE_SUPABASE_URL"

# NOTE (2026-07-30): the original cloud project (ref bfahqobxbuobifkfedzw) is
# permanently DELETED (NXDOMAIN). If API_URL points at it, this script will
# report connection failures. Point VITE_SUPABASE_URL at a live project (or the
# local Docker stack at http://localhost:8000) before running.

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "=== Supabase Cloud Verification Script ==="
echo ""
echo "Project URL: $API_URL"
echo "Project Ref: ${PROJECT_REF}"
echo ""

# Check if credentials are set
if [ "$API_URL" = "" ] || [ "$ANON_KEY" = "" ]; then
    echo -e "${RED}ERROR: Supabase credentials not found${NC}"
    echo "Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables"
    exit 1
fi

# Function to print test result
print_result() {
    if [ "$1" -eq 0 ]; then
        echo -e "${GREEN}✓ PASS${NC}: $2"
    else
        echo -e "${RED}✗ FAIL${NC}: $2"
    fi
}

# Test 1: API Health Check
echo "[1/6] Testing API Health..."
response=$(curl -s -o /dev/null -w "%{http_code}" "${API_URL}/rest/v1/")
if [ "$response" = "200" ] || [ "$response" = "404" ]; then
    print_result 0 "API is responding (HTTP $response)"
else
    print_result 1 "API returned unexpected status: $response"
fi
echo ""

# Test 2: Read Operation - Check if quizzes table is accessible
echo "[2/6] Testing Read Operation (quizzes table)..."
response=$(curl -s "${API_URL}/rest/v1/quizzes?is_published=eq.true&limit=1" \
  -H "apikey: ${ANON_KEY}" \
  -H "Authorization: Bearer ${ANON_KEY}")
if echo "$response" | grep -q "\["; then
    print_result 0 "Read operation successful - data received"
else
    print_result 1 "Read operation failed"
    echo "Response: $response"
fi
echo ""

# Test 3: Write Operation - Insert a verification page visit
echo "[3/6] Testing Write Operation (page_visits table)..."
response=$(curl -s -w "\n%{http_code}" "${API_URL}/rest/v1/page_visits" \
  -H "apikey: ${ANON_KEY}" \
  -H "Authorization: Bearer ${ANON_KEY}" \
  -H "Content-Type: application/json" \
  -d "{\"page\": \"/verification-test-$(date +%s)\", \"user_agent\": \"verify-script\"}")
http_code=$(echo "$response" | tail -n1)
if [ "$http_code" = "201" ]; then
    print_result 0 "Write operation successful - page visit tracked"
else
    print_result 1 "Write operation failed with HTTP $http_code"
fi
echo ""

# Test 4: RPC Function - get_total_visits
echo "[4/6] Testing RPC Function (get_total_visits)..."
response=$(curl -s "${API_URL}/rest/v1/rpc/get_total_visits" \
  -H "apikey: ${ANON_KEY}" \
  -H "Authorization: Bearer ${ANON_KEY}")
if [ "$response" != "" ] && [ "$response" != "null" ]; then
    print_result 0 "RPC function executed successfully"
    echo "     Total visits: $response"
else
    print_result 1 "RPC function failed or returned no data"
fi
echo ""

# Test 5: Storage Bucket Check
echo "[5/6] Testing Storage Bucket (documents)..."
response=$(curl -s "${API_URL}/storage/v1/bucket/documents" \
  -H "apikey: ${ANON_KEY}" \
  -H "Authorization: Bearer ${ANON_KEY}")
if echo "$response" | grep -q "documents"; then
    print_result 0 "Storage bucket is accessible"
else
    print_result 1 "Storage bucket check failed"
fi
echo ""

# Test 6: Application Configuration
echo "[6/6] Verifying Application Configuration..."
if [ -f ".env" ]; then
    print_result 0 ".env file exists"
else
    print_result 1 ".env file not found"
fi
echo ""

echo "=== Verification Summary ==="
echo ""
echo "For complete verification, please also:"
echo "1. Check Supabase dashboard to verify all tables exist"
echo "2. Run the SQL queries from docs/supabase-reactivation-verification.md"
echo "3. Verify auth users are preserved in Authentication section"
echo "4. Test the application at https://vngeo.netlify.app"
echo ""
echo -e "${YELLOW}Note: This script tests API connectivity only.${NC}"
echo -e "${YELLOW}Full verification requires manual dashboard checks.${NC}"
