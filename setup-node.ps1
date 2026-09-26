$url = "https://nodejs.org/dist/v20.11.0/node-v20.11.0-win-x64.zip"
$output = "node.zip"
Write-Host "Downloading Node.js..."
Invoke-WebRequest -Uri $url -OutFile $output
Write-Host "Extracting Node.js..."
Expand-Archive -Path $output -DestinationPath "." -Force
Rename-Item -Path "node-v20.11.0-win-x64" -NewName ".node"
Remove-Item $output
Write-Host "Node.js portable installed successfully!"
