# Passenger Cinema - local preview server
#
# The site loads its content from the JSON files in data/, and browsers block
# that when a page is opened straight off the disk. This serves the folder over
# http instead, which is all it needs.
#
# Run preview.cmd (double-click) or:  powershell -File preview.ps1

$Root = $PSScriptRoot
$Port = 5199

$mime = @{
  ".html"="text/html; charset=utf-8"; ".css"="text/css; charset=utf-8"
  ".js"="application/javascript; charset=utf-8"; ".json"="application/json; charset=utf-8"
  ".jpg"="image/jpeg"; ".jpeg"="image/jpeg"; ".png"="image/png"; ".webp"="image/webp"
  ".svg"="image/svg+xml"; ".ico"="image/x-icon"; ".txt"="text/plain; charset=utf-8"
  ".woff2"="font/woff2"; ".md"="text/markdown; charset=utf-8"
}

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$Port/")
try { $listener.Start() }
catch {
  Write-Host "Could not start on port $Port. Is a preview already running?" -ForegroundColor Red
  exit 1
}

Write-Host ""
Write-Host "  Passenger Cinema is running at " -NoNewline
Write-Host "http://localhost:$Port/" -ForegroundColor Cyan
Write-Host "  Press Ctrl+C to stop."
Write-Host ""
Start-Process "http://localhost:$Port/"

while ($listener.IsListening) {
  try {
    $ctx  = $listener.GetContext()
    $path = [System.Uri]::UnescapeDataString($ctx.Request.Url.AbsolutePath)
    if ($path -eq "/") { $path = "/index.html" }
    $file = Join-Path $Root ($path.TrimStart("/") -replace "/", "\")
    $full = [System.IO.Path]::GetFullPath($file)

    if (-not $full.StartsWith([System.IO.Path]::GetFullPath($Root))) {
      $ctx.Response.StatusCode = 403; $ctx.Response.Close(); continue
    }
    if (Test-Path $full -PathType Leaf) {
      $bytes = [System.IO.File]::ReadAllBytes($full)
      $ext = [System.IO.Path]::GetExtension($full).ToLower()
      $ctx.Response.ContentType = $(if ($mime.ContainsKey($ext)) { $mime[$ext] } else { "application/octet-stream" })
      $ctx.Response.Headers.Add("Cache-Control", "no-store")
      $ctx.Response.ContentLength64 = $bytes.Length
      $ctx.Response.OutputStream.Write($bytes, 0, $bytes.Length)
    } else {
      $ctx.Response.StatusCode = 404
      $b = [System.Text.Encoding]::UTF8.GetBytes("404 not found: $path")
      $ctx.Response.OutputStream.Write($b, 0, $b.Length)
    }
    $ctx.Response.Close()
  } catch { }
}
