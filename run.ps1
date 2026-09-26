param(
    [Parameter(Mandatory=$true, ValueFromRemainingArguments=$true)]
    [string[]]
    $Command
)
$env:Path = "$PSScriptRoot\.node;$env:Path"
& "$PSScriptRoot\.node\npm.cmd" @args
