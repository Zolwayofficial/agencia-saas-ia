$indexPath = "c:\Users\Billy\.gemini\antigravity\scratch\agencia-saas-ia\landing\index.html"
$ctaPath = "c:\Users\Billy\.gemini\antigravity\scratch\agencia-saas-ia\landing\components\cta-final.html"
$footerPath = "c:\Users\Billy\.gemini\antigravity\scratch\agencia-saas-ia\landing\components\footer.html"

Write-Host "Reading files..."
$indexContent = Get-Content -Path $indexPath -Raw -Encoding UTF8
$ctaContent = Get-Content -Path $ctaPath -Raw -Encoding UTF8
$footerContent = Get-Content -Path $footerPath -Raw -Encoding UTF8

if ($indexContent -match "Empieza a automatizar hoy") {
    Write-Warning "CTA/Footer components seem to be already present."
    exit
}

Write-Host "Injecting components..."
$combinedContent = "`n" + $ctaContent + "`n" + $footerContent + "`n"

# Insert before the closing body tag
# Regex to find insertion point before </body> but AFTER all scripts if possible, or just before body end
$newContent = $indexContent -replace "(?s)(.*)(<script>.*?</script>\s*)?(</body>)", "`$1`$2$combinedContent`$3"

if ($newContent.Length -eq $indexContent.Length) {
    Write-Error "Replacement failed. Could not find </body> or insertion point."
    $newContent = $indexContent.Replace("</body>", $combinedContent + "</body>")
}

Write-Host "Saving index.html..."
Set-Content -Path $indexPath -Value $newContent -Encoding UTF8

Write-Host "Done."
