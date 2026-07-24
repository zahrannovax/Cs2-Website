$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:8140/")
$listener.Start()
$root = "C:\Users\zahra\Desktop\cs2 latest"
Write-Host "Serving $root on http://localhost:8140/"
while ($listener.IsListening) {
    $context = $listener.GetContext()
    $request = $context.Request
    $response = $context.Response
    $path = $request.Url.LocalPath
    if ($path -eq "/") { $path = "/index.html" }
    $filePath = Join-Path $root ($path.TrimStart("/"))
    if (Test-Path $filePath -PathType Leaf) {
        $ext = [System.IO.Path]::GetExtension($filePath)
        $contentType = switch ($ext) {
            ".html" { "text/html" }
            ".css" { "text/css" }
            ".js" { "application/javascript" }
            ".jpg" { "image/jpeg" }
            ".png" { "image/png" }
            ".webp" { "image/webp" }
            ".svg" { "image/svg+xml" }
            ".mp4" { "video/mp4" }
            ".xml" { "application/xml" }
            ".txt" { "text/plain" }
            default { "application/octet-stream" }
        }
        $bytes = [System.IO.File]::ReadAllBytes($filePath)
        $response.ContentType = $contentType
        $response.ContentLength64 = $bytes.Length
        $response.OutputStream.Write($bytes, 0, $bytes.Length)
    } else {
        $response.StatusCode = 404
    }
    $response.OutputStream.Close()
}
