# ─── Elexsiya 26 Course PDF Generator ───────────────────────────────────────
# Uses Chrome or Edge headless to print course_final.html → PDF

$htmlFile = Join-Path $PSScriptRoot "course_final.html"
$pdfFile  = Join-Path $PSScriptRoot "course_ELEXSIYA26.pdf"
$fileUri  = "file:///" + ($htmlFile -replace '\\', '/')

Write-Host ""
Write-Host "═══════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  ELEXSIYA 26 — Course PDF Generator" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Input : $htmlFile" -ForegroundColor Gray
Write-Host "  Output: $pdfFile"  -ForegroundColor Yellow
Write-Host ""

# ─── Find browser executable ────────────────────────────────────────────────
$browserPaths = @(
    "C:\Program Files\Google\Chrome\Application\chrome.exe",
    "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe",
    "$env:LOCALAPPDATA\Google\Chrome\Application\chrome.exe",
    "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
    "C:\Program Files\Microsoft\Edge\Application\msedge.exe"
)

$browser = $null
foreach ($p in $browserPaths) {
    if (Test-Path $p) { $browser = $p; break }
}

if (-not $browser) {
    # Try where.exe as fallback
    try {
        $browser = (where.exe chrome 2>$null) | Select-Object -First 1
        if (-not $browser) { $browser = (where.exe msedge 2>$null) | Select-Object -First 1 }
    } catch {}
}

if (-not $browser) {
    Write-Host "❌ Could not find Chrome or Edge." -ForegroundColor Red
    Write-Host "   Please open course_final.html in your browser," -ForegroundColor Yellow
    Write-Host "   then press Ctrl+P → Save as PDF → A4 → Save." -ForegroundColor Yellow
    exit 1
}

$browserName = if ($browser -like "*chrome*") { "Chrome" } else { "Edge" }
Write-Host "  Browser: $browserName" -ForegroundColor Green
Write-Host "  Path   : $browser" -ForegroundColor Gray
Write-Host ""

# ─── Create a temp user-data dir to avoid conflicts ─────────────────────────
$tmpProfile = Join-Path $env:TEMP "elx_pdf_profile_$(Get-Random)"
New-Item -ItemType Directory -Path $tmpProfile -Force | Out-Null

# ─── Run headless print-to-PDF ───────────────────────────────────────────────
$args = @(
    "--headless=new",
    "--disable-gpu",
    "--no-sandbox",
    "--print-to-pdf=`"$pdfFile`"",
    "--print-to-pdf-no-header",
    "--no-pdf-header-footer",
    "--user-data-dir=`"$tmpProfile`"",
    "--run-all-compositor-stages-before-draw",
    "--virtual-time-budget=5000",
    "`"$fileUri`""
)

Write-Host "  Generating PDF (this takes ~10 seconds)..." -ForegroundColor Cyan

try {
    $proc = Start-Process -FilePath $browser -ArgumentList $args -Wait -PassThru -NoNewWindow
    Start-Sleep -Seconds 2
} catch {
    Write-Host "❌ Browser process error: $_" -ForegroundColor Red
}

# ─── Cleanup temp profile ────────────────────────────────────────────────────
try { Remove-Item $tmpProfile -Recurse -Force -ErrorAction SilentlyContinue } catch {}

# ─── Verify output ──────────────────────────────────────────────────────────
if (Test-Path $pdfFile) {
    $size = [math]::Round((Get-Item $pdfFile).Length / 1MB, 2)
    Write-Host ""
    Write-Host "  ✅ SUCCESS! PDF created." -ForegroundColor Green
    Write-Host "  📄 File : $pdfFile" -ForegroundColor Yellow
    Write-Host "  📦 Size : ${size} MB" -ForegroundColor Gray
    Write-Host ""
    # Open the PDF  
    Start-Process $pdfFile
} else {
    Write-Host ""
    Write-Host "  ⚠️  PDF file not found at expected path." -ForegroundColor Yellow
    Write-Host "  Chrome sometimes saves it to the current directory." -ForegroundColor Gray
    $fallback = Join-Path $PSScriptRoot "course_final.pdf"
    if (Test-Path $fallback) {
        Rename-Item $fallback $pdfFile -Force
        Write-Host "  ✅ Found and moved to: $pdfFile" -ForegroundColor Green
        Start-Process $pdfFile
    } else {
        Write-Host ""
        Write-Host "  MANUAL STEPS:" -ForegroundColor Yellow
        Write-Host "  1. Open: $htmlFile" -ForegroundColor White
        Write-Host "  2. Press Ctrl+P" -ForegroundColor White
        Write-Host "  3. Destination → Save as PDF" -ForegroundColor White
        Write-Host "  4. Paper: A4, Margins: None" -ForegroundColor White
        Write-Host "  5. Enable: Background graphics" -ForegroundColor White
        Write-Host "  6. Save as: course_ELEXSIYA26.pdf" -ForegroundColor White
    }
}

Write-Host ""
Write-Host "═══════════════════════════════════════════════" -ForegroundColor Cyan
